import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const parseNumericValue = (value: unknown): number | null => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const parseDateValue = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") {
    return new Date();
  }

  const parsedDate = new Date(String(value));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, amount, type, category, date } = req.body as {
      title?: string;
      amount?: unknown;
      type?: string;
      category?: string;
      date?: unknown;
    };

    if (!title || amount === undefined || !type || !category) {
      res.status(400).json({ message: "Title, amount, type, and category are required" });
      return;
    }

    const numericAmount = parseNumericValue(amount);

    if (numericAmount === null) {
      res.status(400).json({ message: "Amount must be a valid number" });
      return;
    }

    const transactionDate = parseDateValue(date);

    if (transactionDate === null) {
      res.status(400).json({ message: "Date must be valid" });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: numericAmount,
        type,
        category,
        date: transactionDate,
        userId,
      },
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
};

export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

export const updateTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const transactionId = req.params.id as string;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    const { title, amount, type, category, date } = req.body as {
      title?: string;
      amount?: unknown;
      type?: string;
      category?: string;
      date?: unknown;
    };

    const updateData: {
      title?: string;
      amount?: number;
      type?: string;
      category?: string;
      date?: Date;
    } = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (amount !== undefined) {
      const numericAmount = parseNumericValue(amount);

      if (numericAmount === null) {
        res.status(400).json({ message: "Amount must be a valid number" });
        return;
      }

      updateData.amount = numericAmount;
    }

    if (type !== undefined) {
      updateData.type = type;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (date !== undefined) {
      const parsedDate = parseDateValue(date);

      if (parsedDate === null) {
        res.status(400).json({ message: "Date must be valid" });
        return;
      }

      updateData.date = parsedDate;
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const transactionId = req.params.id as string;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    await prisma.transaction.delete({ where: { id: transactionId } });

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

