import { v4 as uuidv4 } from 'uuid';

/**
 * StockTransaction model for tracking all stock movements
 */
export class StockTransaction {
  constructor({
    id = uuidv4(),
    productId,
    type, // 'IN', 'OUT', 'ADJUSTMENT', 'RETURN'
    quantity,
    previousQuantity,
    newQuantity,
    reason = '',
    reference = '',
    performedBy = 'system',
    timestamp = new Date().toISOString(),
  }) {
    this.id = id;
    this.productId = productId;
    this.type = type;
    this.quantity = quantity;
    this.previousQuantity = previousQuantity;
    this.newQuantity = newQuantity;
    this.reason = reason;
    this.reference = reference;
    this.performedBy = performedBy;
    this.timestamp = timestamp;
  }

  /**
   * Validate transaction data
   */
  validate() {
    const errors = [];
    const validTypes = ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'];

    if (!this.productId) {
      errors.push('Product ID is required');
    }

    if (!validTypes.includes(this.type)) {
      errors.push(`Transaction type must be one of: ${validTypes.join(', ')}`);
    }

    if (typeof this.quantity !== 'number' || this.quantity === 0) {
      errors.push('Quantity must be a non-zero number');
    }

    if (typeof this.previousQuantity !== 'number' || this.previousQuantity < 0) {
      errors.push('Previous quantity must be a non-negative number');
    }

    if (typeof this.newQuantity !== 'number' || this.newQuantity < 0) {
      errors.push('New quantity must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      type: this.type,
      quantity: this.quantity,
      previousQuantity: this.previousQuantity,
      newQuantity: this.newQuantity,
      reason: this.reason,
      reference: this.reference,
      performedBy: this.performedBy,
      timestamp: this.timestamp,
    };
  }
}
