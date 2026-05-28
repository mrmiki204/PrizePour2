import { Router, type IRouter } from "express";
import { requireAdmin, issueAdminToken } from "../middleware/adminAuth.js";

const router: IRouter = Router();

router.post("/admin/login", (req, res): void => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminPassword) {
    req.log.error("Login attempted but ADMIN_PASSWORD not configured");
    res.status(500).json({ error: "Admin password not configured on server" });
    return;
  }

  if (!password || password !== adminPassword) {
    req.log.warn("Admin login failed: invalid password");
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = issueAdminToken();
  req.session.isAdmin = true;
  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save failed; returning token-only auth");
      // Token still works even if cookie save failed — that's the whole point.
      res.json({ ok: true, token });
      return;
    }
    res.json({ ok: true, token });
  });
});

router.post("/admin/logout", requireAdmin, (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("pp.sid");
    res.json({ ok: true });
  });
});

router.get("/admin/me", requireAdmin, (_req, res): void => {
  res.json({ isAdmin: true });
});

export default router;
