/**
 * @fileoverview Định tuyến (Routes) cho API quản lý chi phí.
 * @module ExpenseRoutes
 */
const express = require("express");
const router = express.Router();
const ExpenseController = require("./expense.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");

// Chỉ Admin và Sale được quản lý chi phí
router.use(protect, authorize("admin", "sale"));

router.get("/", ExpenseController.getAll);
router.get("/trash", ExpenseController.getTrash);
router.get("/:id", ExpenseController.getById);
router.post("/", ExpenseController.create);
router.put("/:id", ExpenseController.update);
router.delete("/:id", ExpenseController.delete);
router.post("/:id/restore", ExpenseController.restore);

module.exports = router;
