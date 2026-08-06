const mongoose = require('mongoose');
const User = require('../models/User');
const Ledger = require('../models/Ledger');

/**
 * Credit wallet and write a ledger entry.
 * Must be called inside an existing transaction session.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId} params.userId - The user to credit
 * @param {number} params.amount - Amount to credit (must be positive)
 * @param {string} params.type - Ledger type
 * @param {mongoose.Types.ObjectId} params.reference - Reference document ID
 * @param {string} params.referenceModel - Reference model name
 * @param {mongoose.ClientSession} params.session - MongoDB session
 * @returns {Object} Updated user document
 */
const creditWallet = async ({ userId, amount, type, reference, referenceModel, session }) => {
  if (amount <= 0) throw new Error('Credit amount must be positive');

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: amount } },
    { new: true, session }
  );

  if (!user) throw new Error('User not found for wallet credit');

  await Ledger.create(
    [
      {
        user: userId,
        type,
        amount,
        balanceAfter: user.walletBalance,
        reference,
        referenceModel,
      },
    ],
    { session }
  );

  return user;
};

/**
 * Debit wallet and write a ledger entry.
 * Must be called inside an existing transaction session.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId} params.userId - The user to debit
 * @param {number} params.amount - Amount to debit (must be positive)
 * @param {string} params.type - Ledger type
 * @param {mongoose.Types.ObjectId} params.reference - Reference document ID
 * @param {string} params.referenceModel - Reference model name
 * @param {mongoose.ClientSession} params.session - MongoDB session
 * @returns {Object} Updated user document
 */
const debitWallet = async ({ userId, amount, type, reference, referenceModel, session }) => {
  if (amount <= 0) throw new Error('Debit amount must be positive');

  const user = await User.findById(userId).session(session);
  if (!user) throw new Error('User not found for wallet debit');
  if (user.walletBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: -amount } },
    { new: true, session }
  );

  await Ledger.create(
    [
      {
        user: userId,
        type,
        amount: -amount,
        balanceAfter: updatedUser.walletBalance,
        reference,
        referenceModel,
      },
    ],
    { session }
  );

  return updatedUser;
};

module.exports = { creditWallet, debitWallet };
