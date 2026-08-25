import { prisma } from "./prisma";
import { signToken } from "../utils/jwt";
import { serverConfig } from "../config";
import { BadRequestError } from "../utils/errors/app.error";

export interface OAuthProfile {
  provider: "google" | "github";
  email: string;
  name: string;
  avatar: string;
}

const STATE_TTL_MS = 10 * 60 * 1000;
const stateStore = new Map<string, number>();

export function createOAuthState(): string {
  const state = crypto.randomUUID();
  stateStore.set(state, Date.now() + STATE_TTL_MS);
  return state;
}

export function validateOAuthState(state: string): void {
  const expiresAt = stateStore.get(state);
  if (!expiresAt || expiresAt < Date.now()) {
    throw new BadRequestError("Invalid or expired OAuth state");
  }
  stateStore.delete(state);
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: serverConfig.GOOGLE_CLIENT_ID,
    redirect_uri: serverConfig.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGithubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: serverConfig.GITHUB_CLIENT_ID,
    redirect_uri: serverConfig.GITHUB_REDIRECT_URI,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: serverConfig.GOOGLE_CLIENT_ID,
      client_secret: serverConfig.GOOGLE_CLIENT_SECRET,
      redirect_uri: serverConfig.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const token = await tokenRes.json();
  if (!tokenRes.ok || !token.access_token) {
    throw new BadRequestError("Failed to exchange Google OAuth code");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const info = await userRes.json();
  if (!userRes.ok || !info.email) {
    throw new BadRequestError("Failed to fetch Google profile");
  }

  return {
    provider: "google",
    email: info.email,
    name: info.name || info.email.split("@")[0],
    avatar: info.picture || "",
  };
}

export async function exchangeGithubCode(code: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: serverConfig.GITHUB_CLIENT_ID,
      client_secret: serverConfig.GITHUB_CLIENT_SECRET,
      redirect_uri: serverConfig.GITHUB_REDIRECT_URI,
    }),
  });

  const token = await tokenRes.json();
  if (!tokenRes.ok || !token.access_token) {
    throw new BadRequestError("Failed to exchange GitHub OAuth code");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "snip.dev",
    },
  });
  const info = await userRes.json();
  if (!userRes.ok || !info.id) {
    throw new BadRequestError("Failed to fetch GitHub profile");
  }

  let email = info.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "snip.dev",
      },
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[];
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email || emails[0]?.email;
    }
  }

  if (!email) {
    throw new BadRequestError("No verified email found on GitHub account");
  }

  return {
    provider: "github",
    email,
    name: info.name || info.login || email.split("@")[0],
    avatar: info.avatar_url || "",
  };
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      name: profile.name,
      email: profile.email,
      passwordHash: "",
      avatar: profile.avatar,
    },
  });
}

export function buildAuthCallbackUrl(token: string, error?: string): string {
  const url = new URL("/auth/callback", serverConfig.FRONTEND_URL);
  if (token) url.searchParams.set("token", token);
  if (error) url.searchParams.set("error", error);
  return url.toString();
}

export function issueOAuthToken(userId: string, email: string): string {
  return signToken({ userId, email });
}