import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { StockTransaction } from '../src/models/StockTransaction.js';

describe('StockTransaction Model', () => {
  let transaction;

  before(() => {
    transaction = new StockTransaction({
      productId: 'test-product-id',
      type: 'IN',
      quantity: 50,
      previousQuantity: 100,
      newQuantity: 150,
      reason: 'Restocking',
    });
  });

  it('should create a transaction with all properties', () => {
    assert.strictEqual(transaction.productId, 'test-product-id');
    assert.strictEqual(transaction.type, 'IN');
    assert.strictEqual(transaction.quantity, 50);
    assert.strictEqual(transaction.previousQuantity, 100);
    assert.strictEqual(transaction.newQuantity, 150);
    assert.strictEqual(transaction.reason, 'Restocking');
    assert.ok(transaction.id);
  });

  it('should validate valid transaction', () => {
    const validation = transaction.validate();
    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  it('should reject transaction without product ID', () => {
    const invalidTransaction = new StockTransaction({
      productId: '',
      type: 'IN',
      quantity: 10,
      previousQuantity: 0,
      newQuantity: 10,
    });
    const validation = invalidTransaction.validate();
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.some((e) => e.includes('Product ID')));
  });

  it('should reject transaction with invalid type', () => {
    const invalidTransaction = new StockTransaction({
      productId: 'test-id',
      type: 'INVALID',
      quantity: 10,
      previousQuantity: 0,
      newQuantity: 10,
    });
    const validation = invalidTransaction.validate();
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.some((e) => e.includes('type')));
  });

  it('should accept all valid transaction types', () => {
    const types = ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'];
    types.forEach((type) => {
      const t = new StockTransaction({
        productId: 'test-id',
        type,
        quantity: 10,
        previousQuantity: 0,
        newQuantity: 10,
      });
      const validation = t.validate();
      assert.strictEqual(validation.isValid, true);
    });
  });

  it('should reject transaction with zero quantity', () => {
    const invalidTransaction = new StockTransaction({
      productId: 'test-id',
      type: 'IN',
      quantity: 0,
      previousQuantity: 10,
      newQuantity: 10,
    });
    const validation = invalidTransaction.validate();
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.some((e) => e.includes('Quantity')));
  });

  it('should convert to JSON correctly', () => {
    const json = transaction.toJSON();
    assert.strictEqual(json.productId, transaction.productId);
    assert.strictEqual(json.type, transaction.type);
    assert.strictEqual(json.quantity, transaction.quantity);
    assert.strictEqual(json.previousQuantity, transaction.previousQuantity);
    assert.strictEqual(json.newQuantity, transaction.newQuantity);
  });
});
