import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const dbPath = path.resolve(process.cwd(), "lendsphere.db");

export const db = new Database(dbPath);

export function initDb() {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      country TEXT,
      role TEXT NOT NULL CHECK(role IN ('borrower', 'lender', 'admin')),
      status TEXT DEFAULT 'active',
      wallet_balance REAL DEFAULT 0,
      reset_token TEXT,
      reset_token_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      borrower_id TEXT NOT NULL,
      amount REAL NOT NULL,
      purpose TEXT NOT NULL,
      term_months INTEGER NOT NULL,
      interest_rate REAL NOT NULL,
      risk_grade TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'under review', 'funding', 'active', 'completed', 'defaulted')),
      funded_amount REAL DEFAULT 0,
      monthly_payment REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (borrower_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      lender_id TEXT NOT NULL,
      loan_id TEXT NOT NULL,
      amount_invested REAL NOT NULL,
      returns_earned REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lender_id) REFERENCES users(id),
      FOREIGN KEY (loan_id) REFERENCES loans(id)
    );

    CREATE TABLE IF NOT EXISTS repayments (
      id TEXT PRIMARY KEY,
      loan_id TEXT NOT NULL,
      borrower_id TEXT NOT NULL,
      amount REAL NOT NULL,
      principal_portion REAL NOT NULL,
      interest_portion REAL NOT NULL,
      due_date TEXT NOT NULL,
      paid_date TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'late')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loan_id) REFERENCES loans(id),
      FOREIGN KEY (borrower_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'investment', 'disbursement', 'repayment', 'fee')),
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error')),
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  try {
    db.exec(`ALTER TABLE users ADD COLUMN reset_token TEXT;`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;`);
  } catch (e) {}

  // Seed if empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    console.log("Database is empty. Seeding...");
    
    const adminHash = bcrypt.hashSync("password123", 12);
    const userHash = bcrypt.hashSync("password123", 12);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, wallet_balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(crypto.randomUUID(), "admin@lendsphere.com", adminHash, "Admin User", "admin", 0);
    insertUser.run(crypto.randomUUID(), "borrower@lendsphere.com", userHash, "John Borrower", "borrower", 0);
    insertUser.run(crypto.randomUUID(), "lender@lendsphere.com", userHash, "Jane Lender", "lender", 50000);
  }
}
