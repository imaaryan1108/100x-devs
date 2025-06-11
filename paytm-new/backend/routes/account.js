import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Account } from "../configs/db";
import mongoose from "mongoose";
const accountRouter = Router();

accountRouter.get("/balance", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const account = Account.findById(userId);
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }
  return res.status(200).json({ balance: account.balance });
});

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { amount, to } = req?.body;
  const userId = req.userId;

  try {
    const sendersAccount = await Account.findById(userId).session(session);
    if (!sendersAccount || sendersAccount?.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const recipientAccount = await Account.findById(to).session(session);
    if (!recipientAccount) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Recipient account not found" });
    }

    const debitSendersAccount = await Account.findByIdAndUpdate(userId, {
      $inc: { balance: -amount },
    }).session(session);
    const creditRecipientAccount = await Account.findByIdAndUpdate(to, {
      $inc: { balance: amount },
    }).session(session);
    await session.commitTransaction();

    res.json({
      message: "Transfer successful",
    });
  } catch (e) {
    await session.abortTransaction();
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default accountRouter;
