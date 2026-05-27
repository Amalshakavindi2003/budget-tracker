import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const parseNumericValue = (value: unknown): number | null => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const createBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { category, amount, month, year } = req.body as {
      category?: string;
      amount?: unknown;
      month?: unknown;
      year?: unknown;
    };

    if (!category || amount === undefined || month === undefined || year === undefined) {
      res.status(400).json({ message: "Category, amount, month, and year are required" });
      return;
    }

    const numericAmount = parseNumericValue(amount);
    const numericMonth = Number(month);
    const numericYear = Number(year);

    if (numericAmount === null || !Number.isInteger(numericMonth) || !Number.isInteger(numericYear)) {
      res.status(400).json({ message: "Amount, month, and year must be valid numbers" });
      return;
    }

    if (numericMonth < 1 || numericMonth > 12) {
      res.status(400).json({ message: "Month must be between 1 and 12" });
      return;
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: numericAmount,
        month: numericMonth,
        year: numericYear,
        userId,
      },
    });

    res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);
    res.status(500).json({ message: "Failed to create budget" });
  }
};

export const getBudgets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    res.json({ budgets });
  } catch (error) {
    console.error("Get budgets error:", error);
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
};