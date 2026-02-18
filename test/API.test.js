import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/api/server.js';

describe('API Routes', () => {
  let server;

  before(async () => {
    // Start server on a test port
    server = app.listen(3001);
  });

  after(() => {
    server.close();
  });

  it('should respond to health check', async () => {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.timestamp);
  });

  it('should get all products', async () => {
    const response = await fetch('http://localhost:3001/api/products');
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  it('should get inventory summary', async () => {
    const response = await fetch('http://localhost:3001/api/summary');
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data);
    assert.ok(typeof data.data.totalProducts === 'number');
    assert.ok(typeof data.data.totalValue === 'number');
  });

  it('should get all categories', async () => {
    const response = await fetch('http://localhost:3001/api/categories');
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  it('should handle 404 for invalid routes', async () => {
    const response = await fetch('http://localhost:3001/invalid-route');
    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
  });
});
