import { Response } from "express";
import type { Request } from "express";
import { serverConfig } from "../config";
import {
  buildAuthCallbackUrl,
  createOAuthState,
  exchangeGithubCode,
  exchangeGoogleCode,
  findOrCreateOAuthUser,
  getGithubAuthUrl,
  getGoogleAuthUrl,
  issueOAuthToken,
  validateOAuthState,
  OAuthProfile,
} from "../lib/oauth";

export async function googleLogin(req: Request, res: Response) {
  if (!serverConfig.GOOGLE_CLIENT_ID || !serverConfig.GOOGLE_CLIENT_SECRET) {
    return res.redirect(buildAuthCallbackUrl("", "Google OAuth is not configured"));
  }
  res.redirect(getGoogleAuthUrl(createOAuthState()));
}

export async function githubLogin(req: Request, res: Response) {
  if (!serverConfig.GITHUB_CLIENT_ID || !serverConfig.GITHUB_CLIENT_SECRET) {
    return res.redirect(buildAuthCallbackUrl("", "GitHub OAuth is not configured"));
  }
  res.redirect(getGithubAuthUrl(createOAuthState()));
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      return res.redirect(buildAuthCallbackUrl("", "Missing OAuth parameters"));
    }
    validateOAuthState(state);
    const profile = await exchangeGoogleCode(code);
    await completeOAuth(res, profile);
  } catch (err) {
    res.redirect(buildAuthCallbackUrl("", err instanceof Error ? err.message : "Google OAuth failed"));
  }
}

export async function githubCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      return res.redirect(buildAuthCallbackUrl("", "Missing OAuth parameters"));
    }
    validateOAuthState(state);
    const profile = await exchangeGithubCode(code);
    await completeOAuth(res, profile);
  } catch (err) {
    res.redirect(buildAuthCallbackUrl("", err instanceof Error ? err.message : "GitHub OAuth failed"));
  }
}

async function completeOAuth(res: Response, profile: OAuthProfile) {
  const user = await findOrCreateOAuthUser(profile);
  res.redirect(buildAuthCallbackUrl(issueOAuthToken(user.id, user.email)));
}