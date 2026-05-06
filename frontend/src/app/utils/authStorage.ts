import bcrypt from "bcryptjs";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: string;
};

type AuthDb = {
  nextUserId: number;
  users: StoredUser[];
};

const AUTH_DB_KEY = "fastfood.auth.db.v1";
const AUTH_SESSION_KEY = "fastfood.auth.session.v1";

function readDb(): AuthDb {
  const raw = localStorage.getItem(AUTH_DB_KEY);
  if (!raw) return { nextUserId: 1, users: [] };
  try {
    const parsed = JSON.parse(raw) as AuthDb;
    if (!parsed || !Array.isArray(parsed.users) || !Number.isFinite(parsed.nextUserId)) {
      return { nextUserId: 1, users: [] };
    }
    return parsed;
  } catch {
    return { nextUserId: 1, users: [] };
  }
}

function writeDb(db: AuthDb) {
  localStorage.setItem(AUTH_DB_KEY, JSON.stringify(db));
}

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type Session = {
  token: string;
  user: PublicUser;
};

export function getSession(): Session | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.token || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function toPublicUser(u: StoredUser): PublicUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

function createFakeJwtLikeToken(payload: unknown) {
  // FE-only placeholder. Backend sẽ thay bằng JWT thật.
  const base64 = (obj: unknown) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "");

  const header = base64({ alg: "none", typ: "JWT" });
  const body = base64(payload);
  return `${header}.${body}.`;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const db = readDb();
  const email = input.email.trim().toLowerCase();

  const exists = db.users.some((u) => u.email.toLowerCase() === email);
  if (exists) {
    const err = new Error("Email đã tồn tại");
    (err as any).code = "EMAIL_EXISTS";
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: StoredUser = {
    id: db.nextUserId,
    name: input.name.trim(),
    email,
    passwordHash,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  db.nextUserId += 1;
  db.users.push(user);
  writeDb(db);

  return toPublicUser(user);
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<Session> {
  const db = readDb();
  const email = input.email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    const err = new Error("Email không tồn tại");
    (err as any).code = "EMAIL_NOT_FOUND";
    throw err;
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const err = new Error("Mật khẩu không đúng");
    (err as any).code = "INVALID_PASSWORD";
    throw err;
  }

  const publicUser = toPublicUser(user);
  const token = createFakeJwtLikeToken({
    sub: publicUser.id,
    email: publicUser.email,
    role: publicUser.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h placeholder
  });

  const session: Session = { token, user: publicUser };
  setSession(session);
  return session;
}

