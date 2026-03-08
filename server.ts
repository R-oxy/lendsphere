import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import { initDb } from "./server/db/index.js";
import authRoutes from "./server/routes/auth.js";
import loanRoutes from "./server/routes/loans.js";
import userRoutes from "./server/routes/users.js";
import transactionRoutes from "./server/routes/transactions.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  initDb();

  app.use(express.json());
  app.use(cookieParser());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/loans", loanRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/transactions", transactionRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
