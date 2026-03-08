import { Router } from "express";
import { db } from "../db/index.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

// Get user transactions
router.get("/", authenticate, (req: AuthRequest, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user?.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Deposit funds
router.post("/deposit", authenticate, (req: AuthRequest, res) => {
  const { amount } = req.body;
  const userId = req.user?.id;

  try {
    db.exec('BEGIN TRANSACTION');

    const user = db.prepare("SELECT wallet_balance FROM users WHERE id = ?").get(userId) as any;
    const newBalance = user.wallet_balance + amount;

    db.prepare("UPDATE users SET wallet_balance = ? WHERE id = ?").run(newBalance, userId);

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
      VALUES (?, ?, 'deposit', ?, ?, 'Bank Deposit')
    `).run(id, userId, amount, newBalance);

    db.exec('COMMIT');
    res.json({ message: "Deposit successful", balance: newBalance });
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: "Internal server error" });
  }
});

// Withdraw funds
router.post("/withdraw", authenticate, (req: AuthRequest, res) => {
  const { amount } = req.body;
  const userId = req.user?.id;

  try {
    db.exec('BEGIN TRANSACTION');

    const user = db.prepare("SELECT wallet_balance FROM users WHERE id = ?").get(userId) as any;
    if (user.wallet_balance < amount) {
      db.exec('ROLLBACK');
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const newBalance = user.wallet_balance - amount;

    db.prepare("UPDATE users SET wallet_balance = ? WHERE id = ?").run(newBalance, userId);

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
      VALUES (?, ?, 'withdrawal', ?, ?, 'Bank Withdrawal')
    `).run(id, userId, amount, newBalance);

    db.exec('COMMIT');
    res.json({ message: "Withdrawal successful", balance: newBalance });
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
