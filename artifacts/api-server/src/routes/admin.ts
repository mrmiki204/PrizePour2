import { Router, type IRouter } from "express";
import { requireAdmin } from "../middleware/adminAuth.js";

const router: IRouter = Router();

router.post("/admin/login", (req, res): void => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminPassword) {
    res.status(500).json({ error: "Admin password not configured on server" });
    return;
  }

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  req.session.isAdmin = true;
  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "Session save failed" });
      return;
    }
    res.json({ ok: true });
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

router.get("/admin/me", (req, res): void => {
  if (req.session?.isAdmin === true) {
    res.json({ isAdmin: true });
  } else {
    res.status(401).json({ isAdmin: false });
  }
});

export default router;
