import { Router } from "express";
import { createBudget, getBudgets } from "../controllers/budget.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", getBudgets);
router.post("/", createBudget);

export default router;
