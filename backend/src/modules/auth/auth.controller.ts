import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema";
import { env } from "../../config/env";

const REFRESH_COOKIE = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in ms
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(data);

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    const { accessToken, newRefreshToken } = await authService.refresh(rawToken);

    res.cookie(REFRESH_COOKIE, newRefreshToken, refreshCookieOptions);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (rawToken) {
      await authService.logout(rawToken);
    }
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(email);
    // Always return 200 to avoid user enumeration
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(token, password);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    await authService.verifyEmail(token);
    // Redirect to frontend success page
    res.redirect(`${env.CLIENT_URL}/email-verified`);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const user = await authService.getMe(userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
