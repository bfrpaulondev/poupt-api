const Transaction = require('../models/Transaction');

// Process recurring transactions that are due
const processRecurringTransactions = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurring = await Transaction.find({
    isRecurring: true,
    nextOccurrence: { $lte: today },
    status: 'active'
  });

  let processed = 0;
  for (const txn of recurring) {
    // Create a new transaction for this occurrence
    await Transaction.create({
      userId: txn.userId,
      type: txn.type,
      category: txn.category,
      description: txn.description,
      amount: txn.amount,
      jar: txn.jar,
      date: today,
      isRecurring: false
    });

    // Calculate next occurrence
    const next = new Date(txn.nextOccurrence);
    switch (txn.recurringFrequency) {
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'biweekly': next.setDate(next.getDate() + 14); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    }

    txn.nextOccurrence = next;
    await txn.save();
    processed++;
  }

  return processed;
};

module.exports = { processRecurringTransactions };
