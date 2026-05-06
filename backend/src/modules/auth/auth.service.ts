import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { mailer, senderInfo } from "../../config/mailer";
import { AppError } from "../../middlewares/error.middleware";

// ── Token helpers ─────────────────────────────────────────────────────────────

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function createAccessToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

async function createRefreshToken(userId: string): Promise<string> {
  const raw = generateRawToken();
  const hashed = hashToken(raw);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
  await prisma.refreshToken.create({ data: { userId, token: hashed, expiresAt } });
  return raw;
}

// ── Auth service functions ────────────────────────────────────────────────────

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, phone: data.phone },
    select: { id: true, name: true, email: true, role: true, isEmailVerified: true, createdAt: true, avatarUrl: true },
  });

  // Email verification token (24h)
  const verifyToken = generateRawToken();
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: verifyToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${env.API_URL}/api/auth/verify-email/${verifyToken}`;
  await mailer.sendMail({
    from: `"${senderInfo.name}" <${senderInfo.email}>`,
    to: user.email,
    subject: "Xác nhận địa chỉ email",
    html: `<p>Xin chào <strong>${user.name}</strong>,</p>
           <p>Nhấn <a href="${verifyUrl}">đây</a> để xác nhận email của bạn.</p>
           <p>Link hết hạn sau 24 giờ.</p>`,
  }).catch((err) => console.error("Email send failed:", err));

  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, "Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, "Invalid email or password");

  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(rawToken: string) {
  const hashed = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: hashed } });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(401, "User not found");

  // Rotation: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const accessToken = createAccessToken(user.id, user.role);
  const newRefreshToken = await createRefreshToken(user.id);

  return { accessToken, newRefreshToken };
}

export async function logout(rawToken: string) {
  const hashed = hashToken(rawToken);
  await prisma.refreshToken.deleteMany({ where: { token: hashed } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to avoid user enumeration
  if (!user) return;

  // Invalidate previous reset tokens
  await prisma.passwordReset.deleteMany({ where: { userId: user.id, used: false } });

  const token = generateRawToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    },
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await mailer.sendMail({
    from: `"${senderInfo.name}" <${senderInfo.email}>`,
    to: user.email,
    subject: "Đặt lại mật khẩu",
    html: `<p>Xin chào <strong>${user.name}</strong>,</p>
           <p>Nhấn <a href="${resetUrl}">đây</a> để đặt lại mật khẩu của bạn.</p>
           <p>Link hết hạn sau 1 giờ.</p>
           <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
  }).catch((err) => console.error("Email send failed:", err));
}

export async function resetPassword(token: string, newPassword: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { token } });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
    // Invalidate all existing refresh tokens for security
    prisma.refreshToken.deleteMany({ where: { userId: reset.userId } }),
  ]);
}

export async function verifyEmail(token: string) {
  const verification = await prisma.emailVerification.findUnique({ where: { token } });

  if (!verification || verification.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired verification token");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: verification.userId }, data: { isEmailVerified: true } }),
    prisma.emailVerification.delete({ where: { id: verification.id } }),
  ]);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
}
