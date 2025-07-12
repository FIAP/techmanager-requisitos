const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(userId, assetId, type, quantity, price) {
    this.id = uuidv4();
    this.userId = userId;
    this.assetId = assetId;
    this.type = type; // 'BUY' ou 'SELL'
    this.quantity = quantity;
    this.price = price;
    this.totalAmount = quantity * price;
    this.status = 'PENDING';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.executedAt = null;
    this.fees = 0;
  }

  execute() {
    this.status = 'EXECUTED';
    this.executedAt = new Date();
    this.updatedAt = new Date();
  }

  cancel() {
    if (this.status === 'EXECUTED') {
      throw new Error('Transacao ja executada nao pode ser cancelada');
    }
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }

  addFees(feeAmount) {
    this.fees += feeAmount;
    this.totalAmount += feeAmount;
    this.updatedAt = new Date();
  }

  isPending() {
    return this.status === 'PENDING';
  }

  isExecuted() {
    return this.status === 'EXECUTED';
  }

  isCancelled() {
    return this.status === 'CANCELLED';
  }
}

module.exports = Transaction; 