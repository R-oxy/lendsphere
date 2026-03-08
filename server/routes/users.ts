import { Router } from "express";
import { db } from "../db/index.js";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/profile", authenticate, (req: AuthRequest, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user?.id) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authenticate, (req: AuthRequest, res) => {
  const { full_name, phone, address, date_of_birth } = req.body;
  try {
    db.prepare(`
      UPDATE users SET full_name = ?, phone = ?, date_of_birth = ? WHERE id = ?
    `).run(full_name, phone, date_of_birth, req.user?.id);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/password", authenticate, (req: AuthRequest, res) => {
  const { current_password, new_password } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user?.id) as any;
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ error: "Incorrect current password" });
    }
    const new_hash = bcrypt.hashSync(new_password, 12);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(new_hash, req.user?.id);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
router.get("/", authenticate, requireRole("admin"), (req, res) => {
  try {
    const users = db.prepare("SELECT id, email, full_name, role, status, created_at FROM users").all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
