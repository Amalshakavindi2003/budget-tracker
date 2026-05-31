import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import budgetRoutes from "./routes/budget.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: "*",
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});