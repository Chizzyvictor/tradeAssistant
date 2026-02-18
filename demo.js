#!/usr/bin/env node

/**
 * Demo script to showcase the inventory management system
 */

import { InventoryService } from './src/services/InventoryService.js';
import chalk from 'chalk';

async function runDemo() {
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   Trade Assistant - Inventory System Demo       ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════╝\n'));

  const service = new InventoryService();

  // Clear existing data for demo
  await service.productStore.clear();
  await service.transactionStore.clear();

  console.log(chalk.yellow('📦 Creating sample products...\n'));

  // Add sample products
  const laptop = await service.addProduct({
    name: 'Dell Laptop XPS 15',
    sku: 'LAP-XPS-001',
    description: '15-inch professional laptop with 16GB RAM',
    category: 'Electronics',
    price: 1299.99,
    quantity: 25,
    minStockLevel: 5,
    unit: 'pcs',
    supplier: 'Dell Inc.',
  });

  const mouse = await service.addProduct({
    name: 'Logitech Wireless Mouse',
    sku: 'MOU-LOG-001',
    description: 'Ergonomic wireless mouse',
    category: 'Electronics',
    price: 29.99,
    quantity: 150,
    minStockLevel: 20,
    unit: 'pcs',
    supplier: 'Logitech',
  });

  const desk = await service.addProduct({
    name: 'Standing Desk',
    sku: 'FUR-DSK-001',
    description: 'Adjustable height standing desk',
    category: 'Furniture',
    price: 499.99,
    quantity: 8,
    minStockLevel: 3,
    unit: 'pcs',
    supplier: 'Office Furniture Co.',
  });

  const chair = await service.addProduct({
    name: 'Ergonomic Office Chair',
    sku: 'FUR-CHR-001',
    description: 'Mesh back office chair with lumbar support',
    category: 'Furniture',
    price: 299.99,
    quantity: 2,
    minStockLevel: 5,
    unit: 'pcs',
    supplier: 'Office Furniture Co.',
  });

  const notebook = await service.addProduct({
    name: 'Premium Notebook',
    sku: 'STA-NOT-001',
    description: 'A4 ruled notebook, 200 pages',
    category: 'Stationery',
    price: 4.99,
    quantity: 0,
    minStockLevel: 50,
    unit: 'pcs',
    supplier: 'Stationery Supplies',
  });

  console.log(chalk.green('✅ Created 5 sample products\n'));

  // Display all products
  console.log(chalk.yellow('📊 Current Inventory:\n'));
  const products = await service.getAllProducts();
  products.forEach((p) => {
    const status = p.getStockStatus();
    let statusIcon = '✅';
    if (status === 'LOW_STOCK') statusIcon = '⚠️';
    if (status === 'OUT_OF_STOCK') statusIcon = '🚨';

    console.log(
      `${statusIcon} ${chalk.cyan(p.sku)} - ${p.name} | Qty: ${p.quantity} | $${p.price}`
    );
  });

  // Perform stock operations
  console.log(chalk.yellow('\n📈 Performing stock operations...\n'));

  await service.addStock(
    laptop.id,
    10,
    'New shipment received',
    'PO-2024-001'
  );
  console.log(chalk.green('✅ Added 10 laptops (new quantity: 35)'));

  await service.removeStock(mouse.id, 25, 'Sold to corporate client', 'INV-1001');
  console.log(chalk.green('✅ Removed 25 mice (new quantity: 125)'));

  await service.adjustStock(chair.id, 10, 'Inventory count adjustment');
  console.log(chalk.green('✅ Adjusted chairs to 10 units'));

  // Show low stock and out of stock
  console.log(chalk.yellow('\n⚠️  Stock Alerts:\n'));

  const lowStock = await service.getLowStockProducts();
  if (lowStock.length > 0) {
    console.log(chalk.yellow('Low Stock Items:'));
    lowStock.forEach((p) => {
      console.log(
        `  ⚠️  ${p.name} - Current: ${p.quantity}, Min: ${p.minStockLevel}`
      );
    });
  }

  const outOfStock = await service.getOutOfStockProducts();
  if (outOfStock.length > 0) {
    console.log(chalk.red('\nOut of Stock Items:'));
    outOfStock.forEach((p) => {
      console.log(`  🚨 ${p.name} - OUT OF STOCK`);
    });
  }

  // Show summary
  console.log(chalk.yellow('\n📊 Inventory Summary:\n'));
  const summary = await service.getInventorySummary();
  console.log(`  Total Products:      ${chalk.green(summary.totalProducts)}`);
  console.log(
    `  Total Value:         ${chalk.green('$' + summary.totalValue.toFixed(2))}`
  );
  console.log(`  Categories:          ${chalk.green(summary.totalCategories)}`);
  console.log(
    `  Total Transactions:  ${chalk.green(summary.totalTransactions)}`
  );
  console.log(
    `  Low Stock Count:     ${summary.lowStockCount > 0 ? chalk.yellow(summary.lowStockCount) : chalk.green(summary.lowStockCount)}`
  );
  console.log(
    `  Out of Stock Count:  ${summary.outOfStockCount > 0 ? chalk.red(summary.outOfStockCount) : chalk.green(summary.outOfStockCount)}`
  );

  // Show transaction history for laptop
  console.log(chalk.yellow('\n📜 Recent Transactions for Dell Laptop:\n'));
  const laptopTransactions = await service.getProductTransactions(laptop.id);
  laptopTransactions.forEach((t) => {
    const typeColor =
      t.type === 'IN' ? chalk.green : t.type === 'OUT' ? chalk.red : chalk.yellow;
    console.log(
      `  ${typeColor(t.type)} | Qty: ${t.quantity} | ${t.previousQuantity} → ${t.newQuantity} | ${t.reason}`
    );
  });

  // Search demo
  console.log(chalk.yellow('\n🔍 Search Results for "chair":\n'));
  const searchResults = await service.searchProducts('chair');
  searchResults.forEach((p) => {
    console.log(`  ${chalk.cyan(p.sku)} - ${p.name} (${p.category})`);
  });

  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║              Demo Completed!                      ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════╝\n'));

  console.log(chalk.white('Next steps:'));
  console.log(chalk.gray('  • Run "npm start" for interactive CLI'));
  console.log(chalk.gray('  • Start API server from CLI menu'));
  console.log(chalk.gray('  • Check data/products.json and data/transactions.json\n'));
}

runDemo().catch((error) => {
  console.error(chalk.red('Demo failed:'), error);
  process.exit(1);
});
