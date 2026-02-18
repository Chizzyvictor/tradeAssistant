import { v4 as uuidv4 } from 'uuid';

/**
 * Product model representing an inventory item
 */
export class Product {
  constructor({
    id = uuidv4(),
    name,
    description = '',
    category = 'General',
    sku,
    price,
    quantity = 0,
    minStockLevel = 10,
    unit = 'pcs',
    supplier = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.sku = sku;
    this.price = price;
    this.quantity = quantity;
    this.minStockLevel = minStockLevel;
    this.unit = unit;
    this.supplier = supplier;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Check if product is low on stock
   */
  isLowStock() {
    return this.quantity <= this.minStockLevel;
  }

  /**
   * Check if product is out of stock
   */
  isOutOfStock() {
    return this.quantity === 0;
  }

  /**
   * Get stock status
   */
  getStockStatus() {
    if (this.isOutOfStock()) {
      return 'OUT_OF_STOCK';
    } else if (this.isLowStock()) {
      return 'LOW_STOCK';
    }
    return 'IN_STOCK';
  }

  /**
   * Update quantity
   */
  updateQuantity(newQuantity) {
    this.quantity = newQuantity;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Validate product data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Product name is required');
    }

    if (!this.sku || this.sku.trim() === '') {
      errors.push('SKU is required');
    }

    if (typeof this.price !== 'number' || this.price < 0) {
      errors.push('Price must be a non-negative number');
    }

    if (typeof this.quantity !== 'number' || this.quantity < 0) {
      errors.push('Quantity must be a non-negative number');
    }

    if (typeof this.minStockLevel !== 'number' || this.minStockLevel < 0) {
      errors.push('Minimum stock level must be a non-negative number');
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
      name: this.name,
      description: this.description,
      category: this.category,
      sku: this.sku,
      price: this.price,
      quantity: this.quantity,
      minStockLevel: this.minStockLevel,
      unit: this.unit,
      supplier: this.supplier,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      stockStatus: this.getStockStatus(),
    };
  }
}
