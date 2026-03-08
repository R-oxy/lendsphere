import { db, initDb } from "./index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function seed() {
  initDb();

  console.log("Seeding database...");

  // Clear existing data
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM transactions;
    DELETE FROM repayments;
    DELETE FROM investments;
    DELETE FROM loans;
    DELETE FROM users;
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, wallet_balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertLoan = db.prepare(`
    INSERT INTO loans (id, borrower_id, amount, purpose, term_months, interest_rate, risk_grade, status, funded_amount, monthly_payment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInvestment = db.prepare(`
    INSERT INTO investments (id, lender_id, loan_id, amount_invested)
    VALUES (?, ?, ?, ?)
  `);

  const adminHash = bcrypt.hashSync("password123", 12);
  const userHash = bcrypt.hashSync("password123", 12);

  // 1 Admin
  const adminId = crypto.randomUUID();
  insertUser.run(adminId, "admin@lendsphere.com", adminHash, "Admin User", "admin", 0);

  // 1 Borrower
  const borrowerId = crypto.randomUUID();
  insertUser.run(borrowerId, "borrower@lendsphere.com", userHash, "Borrower User", "borrower", 10000);
  
  // 1 Lender
  const lenderId = crypto.randomUUID();
  insertUser.run(lenderId, "lender@lendsphere.com", userHash, "Lender User", "lender", 10000);

  // 10 Borrowers
  const borrowerIds: string[] = [borrowerId];
  for (let i = 1; i <= 10; i++) {
    const id = crypto.randomUUID();
    borrowerIds.push(id);
    insertUser.run(id, `borrower${i}@test.com`, userHash, `Borrower ${i}`, "borrower", 10000);
  }

  // 5 Lenders
  const lenderIds: string[] = [lenderId];
  for (let i = 1; i <= 5; i++) {
    const id = crypto.randomUUID();
    lenderIds.push(id);
    insertUser.run(id, `lender${i}@test.com`, userHash, `Lender ${i}`, "lender", 10000);
  }

  // 20 Loans
  const purposes = ["Debt Consolidation", "Home Improvement", "Business", "Education", "Medical", "Auto", "Other"];
  const grades = ["A", "B", "C", "D", "E"];
  const statuses = ["pending", "funding", "active", "completed"];
  
  for (let i = 1; i <= 20; i++) {
    const loanId = crypto.randomUUID();
    const borrowerId = borrowerIds[i % borrowerIds.length];
    const amount = Math.floor(Math.random() * 38000) + 2000; // $2,000 - $40,000
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    const term = [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    
    let interestRate = 0;
    if (grade === "A") interestRate = 7.5;
    else if (grade === "B") interestRate = 12.5;
    else if (grade === "C") interestRate = 17.5;
    else if (grade === "D") interestRate = 22.5;
    else interestRate = 30.0;

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    let fundedAmount = 0;
    
    if (status === "funding") {
      fundedAmount = Math.floor(Math.random() * amount);
    } else if (status === "active" || status === "completed") {
      fundedAmount = amount;
    }

    // P[r(1+r)^n] / [(1+r)^n-1]
    const r = (interestRate / 100) / 12;
    const n = term;
    const monthlyPayment = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    insertLoan.run(loanId, borrowerId, amount, purpose, term, interestRate, grade, status, fundedAmount, monthlyPayment);

    if (fundedAmount > 0) {
      const lenderId = lenderIds[Math.floor(Math.random() * lenderIds.length)];
      insertInvestment.run(crypto.randomUUID(), lenderId, loanId, fundedAmount);
    }
  }

  console.log("Database seeded successfully!");
}

seed();
