import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import crypto from "crypto";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

router.post("/register", (req, res) => {
  const { email, password, full_name, phone, date_of_birth, country, role } = req.body;

  try {
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const id = crypto.randomUUID();
    const password_hash = bcrypt.hashSync(password, 12);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, date_of_birth, country, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, email, password_hash, full_name, phone, date_of_birth, country, role);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "Account is not active" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id) as any;
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.json({ message: "If this email exists, you'll receive a reset link" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(resetToken, resetTokenExpires, user.id);

    // In a real app, send an email here
    console.log(`Password reset link: /reset-password/${resetToken}`);

    res.json({ message: "If this email exists, you'll receive a reset link" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", (req, res) => {
  const { token, password } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?").get(token, new Date().toISOString()) as any;
    
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const password_hash = bcrypt.hashSync(password, 12);
    db.prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?").run(password_hash, user.id);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
