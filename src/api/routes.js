import express from 'express';
import { InventoryService } from '../services/index.js';

const router = express.Router();
const inventoryService = new InventoryService();

/**
 * @route GET /api/products
 * @desc Get all products
 */
router.get('/products', async (req, res) => {
  try {
    const { category, status } = req.query;
    let products = await inventoryService.getAllProducts();

    // Filter by category if provided
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // Filter by stock status if provided
    if (status === 'low') {
      products = products.filter((p) => p.isLowStock() && !p.isOutOfStock());
    } else if (status === 'out') {
      products = products.filter((p) => p.isOutOfStock());
    }

    res.json({
      success: true,
      count: products.length,
      data: products.map((p) => p.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/products/:id
 * @desc Get product by ID
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await inventoryService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/products
 * @desc Create a new product
 */
router.post('/products', async (req, res) => {
  try {
    const product = await inventoryService.addProduct(req.body);

    res.status(201).json({
      success: true,
      data: product.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/products/:id
 * @desc Update a product
 */
router.put('/products/:id', async (req, res) => {
  try {
    const product = await inventoryService.updateProduct(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: product.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product
 */
router.delete('/products/:id', async (req, res) => {
  try {
    await inventoryService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/products/:id/stock/add
 * @desc Add stock to a product
 */
router.post('/products/:id/stock/add', async (req, res) => {
  try {
    const { quantity, reason, reference } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    const product = await inventoryService.addStock(
      req.params.id,
      quantity,
      reason,
      reference
    );

    res.json({
      success: true,
      data: product.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/products/:id/stock/remove
 * @desc Remove stock from a product
 */
router.post('/products/:id/stock/remove', async (req, res) => {
  try {
    const { quantity, reason, reference } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    const product = await inventoryService.removeStock(
      req.params.id,
      quantity,
      reason,
      reference
    );

    res.json({
      success: true,
      data: product.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/products/:id/stock/adjust
 * @desc Adjust stock to a specific quantity
 */
router.post('/products/:id/stock/adjust', async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    const product = await inventoryService.adjustStock(
      req.params.id,
      quantity,
      reason
    );

    res.json({
      success: true,
      data: product.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/products/:id/transactions
 * @desc Get transaction history for a product
 */
router.get('/products/:id/transactions', async (req, res) => {
  try {
    const transactions = await inventoryService.getProductTransactions(
      req.params.id
    );

    res.json({
      success: true,
      count: transactions.length,
      data: transactions.map((t) => t.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/transactions
 * @desc Get all transactions
 */
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await inventoryService.getAllTransactions();

    res.json({
      success: true,
      count: transactions.length,
      data: transactions.map((t) => t.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/categories
 * @desc Get all categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await inventoryService.getCategories();

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/summary
 * @desc Get inventory summary
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await inventoryService.getInventorySummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/search
 * @desc Search products
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const products = await inventoryService.searchProducts(q);

    res.json({
      success: true,
      count: products.length,
      data: products.map((p) => p.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
