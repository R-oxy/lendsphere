import { Router } from "express";
import { db } from "../db/index.js";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

// Get all loans (Marketplace)
router.get("/", (req, res) => {
  try {
    const loans = db.prepare(`
      SELECT l.*, u.full_name as borrower_name
      FROM loans l
      JOIN users u ON l.borrower_id = u.id
      WHERE l.status IN ('funding', 'active', 'completed')
      ORDER BY l.created_at DESC
    `).all();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single loan details
router.get("/:id", (req, res) => {
  try {
    const loan = db.prepare(`
      SELECT l.*, u.full_name as borrower_name
      FROM loans l
      JOIN users u ON l.borrower_id = u.id
      WHERE l.id = ?
    `).get(req.params.id) as any;

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const investments = db.prepare(`
      SELECT i.*, u.full_name as lender_name
      FROM investments i
      JOIN users u ON i.lender_id = u.id
      WHERE i.loan_id = ?
    `).all(req.params.id);

    res.json({ ...loan, investments });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Apply for a loan (Borrower)
router.post("/apply", authenticate, requireRole("borrower"), (req: AuthRequest, res) => {
  const { amount, purpose, term_months } = req.body;
  
  try {
    // Simulate credit check and risk grading
    const grades = ["A", "B", "C", "D", "E"];
    const risk_grade = grades[Math.floor(Math.random() * grades.length)];
    
    let interest_rate = 0;
    if (risk_grade === "A") interest_rate = 7.5;
    else if (risk_grade === "B") interest_rate = 12.5;
    else if (risk_grade === "C") interest_rate = 17.5;
    else if (risk_grade === "D") interest_rate = 22.5;
    else interest_rate = 30.0;

    const r = (interest_rate / 100) / 12;
    const n = term_months;
    const monthly_payment = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO loans (id, borrower_id, amount, purpose, term_months, interest_rate, risk_grade, status, monthly_payment)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, req.user?.id, amount, purpose, term_months, interest_rate, risk_grade, monthly_payment);

    // Simulate auto-approval after 10 seconds
    setTimeout(() => {
      db.prepare("UPDATE loans SET status = 'funding' WHERE id = ?").run(id);
    }, 10000);

    res.status(201).json({ message: "Loan application submitted successfully", loanId: id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get my loans (Borrower)
router.get("/my/borrowed", authenticate, requireRole("borrower"), (req: AuthRequest, res) => {
  try {
    const loans = db.prepare(`
      SELECT * FROM loans WHERE borrower_id = ? ORDER BY created_at DESC
    `).all(req.user?.id);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get my investments (Lender)
router.get("/my/invested", authenticate, requireRole("lender"), (req: AuthRequest, res) => {
  try {
    const investments = db.prepare(`
      SELECT i.*, l.amount as loan_amount, l.purpose, l.interest_rate, l.risk_grade, l.status as loan_status
      FROM investments i
      JOIN loans l ON i.loan_id = l.id
      WHERE i.lender_id = ?
      ORDER BY i.created_at DESC
    `).all(req.user?.id);
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Invest in a loan (Lender)
router.post("/:id/invest", authenticate, requireRole("lender"), (req: AuthRequest, res) => {
  const { amount } = req.body;
  const loanId = req.params.id;
  const lenderId = req.user?.id;

  try {
    db.exec('BEGIN TRANSACTION');

    const loan = db.prepare("SELECT * FROM loans WHERE id = ?").get(loanId) as any;
    if (!loan || loan.status !== 'funding') {
      db.exec('ROLLBACK');
      return res.status(400).json({ error: "Loan is not available for funding" });
    }

    const remaining = loan.amount - loan.funded_amount;
    if (amount > remaining) {
      db.exec('ROLLBACK');
      return res.status(400).json({ error: "Investment amount exceeds remaining loan amount" });
    }

    const user = db.prepare("SELECT wallet_balance FROM users WHERE id = ?").get(lenderId) as any;
    if (user.wallet_balance < amount) {
      db.exec('ROLLBACK');
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // Deduct from wallet
    db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(amount, lenderId);

    // Create transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
      VALUES (?, ?, 'investment', ?, ?, ?)
    `).run(crypto.randomUUID(), lenderId, amount, user.wallet_balance - amount, `Investment in loan ${loanId}`);

    // Create investment
    db.prepare(`
      INSERT INTO investments (id, lender_id, loan_id, amount_invested)
      VALUES (?, ?, ?, ?)
    `).run(crypto.randomUUID(), lenderId, loanId, amount);

    // Update loan funded amount
    const newFundedAmount = loan.funded_amount + amount;
    let newStatus = loan.status;
    if (newFundedAmount >= loan.amount) {
      newStatus = 'active';
      // Disburse to borrower
      const borrower = db.prepare("SELECT wallet_balance FROM users WHERE id = ?").get(loan.borrower_id) as any;
      db.prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?").run(loan.amount, loan.borrower_id);
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
        VALUES (?, ?, 'disbursement', ?, ?, ?)
      `).run(crypto.randomUUID(), loan.borrower_id, loan.amount, borrower.wallet_balance + loan.amount, `Disbursement for loan ${loanId}`);
    }

    db.prepare("UPDATE loans SET funded_amount = ?, status = ? WHERE id = ?").run(newFundedAmount, newStatus, loanId);

    db.exec('COMMIT');
    res.json({ message: "Investment successful" });
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
