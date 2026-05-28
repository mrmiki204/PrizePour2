import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function getSecret(): string {
  return (
    process.env["SESSION_SECRET"] ??
    process.env["ADMIN_PASSWORD"] ??
    "prizepour-dev-secret"
  );
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function issueAdminToken(): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(12).toString("base64url");
  const payload = `${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

type TokenStatus = "valid" | "missing" | "malformed" | "bad-signature" | "expired";

function verifyToken(token: string | undefined): TokenStatus {
  if (!token) return "missing";
  const parts = token.split(".");
  if (parts.length !== 3) return "malformed";
  const [expStr, nonce, sig] = parts as [string, string, string];
  const expected = sign(`${expStr}.${nonce}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "bad-signature";
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return "malformed";
  if (Date.now() > exp) return "expired";
  return "valid";
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.isAdmin === true) {
    next();
    return;
  }

  const header = req.header("x-admin-token") ?? undefined;
  const status = verifyToken(header);
  if (status === "valid") {
    next();
    return;
  }

  if (!process.env["ADMIN_PASSWORD"]) {
    req.log.error("Admin auth failed: ADMIN_PASSWORD not configured");
    res.status(500).json({ error: "Admin password not configured on server" });
    return;
  }

  req.log.warn(
    { tokenStatus: status, hasSession: !!req.session?.isAdmin },
    "Admin auth rejected",
  );
  res.status(401).json({ error: "Unauthorized — admin login required" });
}
