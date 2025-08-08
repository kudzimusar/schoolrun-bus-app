import { ErrCode } from "encore.dev/api";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

// Secrets/config
const ClerkJWKSUrl = secret("ClerkJWKSUrl"); // e.g. https://clerk.your-domain/.well-known/jwks.json
const Auth0Domain = secret("Auth0Domain");   // e.g. your-tenant.us.auth0.com

export interface AuthData {
  provider: "clerk" | "auth0";
  email?: string;
  name?: string;
  picture?: string;
  roles?: string[];
}

function getAuth0JWKSUrl(domain?: string): string | undefined {
  if (!domain) return undefined;
  const d = domain.replace(/^https?:\/\//, "");
  return `https://${d}/.well-known/jwks.json`;
}

async function verifyWithJWKS(token: string, jwksUrl: string, audience?: string, issuer?: string) {
  const JWKS = createRemoteJWKSet(new URL(jwksUrl));
  const { payload } = await jwtVerify(token, JWKS, {
    audience,
    issuer,
  });
  return payload;
}

function toAuthData(provider: "clerk" | "auth0", payload: JWTPayload): { uid: string; data: AuthData } {
  const sub = String(payload.sub || "");
  const email = (payload["email"] as string) || undefined;
  const name = (payload["name"] as string) || undefined;
  const picture = (payload["picture"] as string) || undefined;
  const roles = (payload["roles"] as string[]) || undefined;
  return { uid: sub, data: { provider, email, name, picture, roles } };
}

//encore:authhandler
export async function AuthHandler(token: string): Promise<[string, AuthData] | [string, AuthData, Error]> {
  try {
    // Try Clerk first if configured
    const clerkJWKS = ClerkJWKSUrl();
    if (clerkJWKS) {
      const payload = await verifyWithJWKS(token, clerkJWKS);
      const { uid, data } = toAuthData("clerk", payload);
      return [uid, data];
    }

    // Fallback to Auth0 if configured
    const auth0Domain = Auth0Domain();
    const auth0JWKS = getAuth0JWKSUrl(auth0Domain);
    if (auth0JWKS) {
      const payload = await verifyWithJWKS(token, auth0JWKS, undefined, `https://${auth0Domain}/`);
      const { uid, data } = toAuthData("auth0", payload);
      return [uid, data];
    }

    throw Object.assign(new Error("no auth provider configured"), { code: ErrCode.Unauthenticated });
  } catch (err: any) {
    log.warn("Auth verification failed", { err: String(err) });
    const e: any = new Error("invalid token");
    e.code = ErrCode.Unauthenticated;
    return ["", { provider: "auth0" }, e];
  }
}