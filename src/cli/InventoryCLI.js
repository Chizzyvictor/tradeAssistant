import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { InventoryService } from '../services/index.js';

const inventoryService = new InventoryService();

/**
 * CLI Menu System for Inventory Management
 */
export class InventoryCLI {
  async start() {
    console.clear();
    this.showWelcome();

    let exit = false;
    while (!exit) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📦 View All Products', value: 'view_products' },
            { name: '➕ Add New Product', value: 'add_product' },
            { name: '✏️  Update Product', value: 'update_product' },
            { name: '🗑️  Delete Product', value: 'delete_product' },
            { name: '📈 Add Stock', value: 'add_stock' },
            { name: '📉 Remove Stock', value: 'remove_stock' },
            { name: '🔧 Adjust Stock', value: 'adjust_stock' },
            { name: '⚠️  View Low Stock Products', value: 'low_stock' },
            { name: '🔍 Search Products', value: 'search' },
            { name: '📊 View Summary', value: 'summary' },
            { name: '📜 View Transactions', value: 'transactions' },
            { name: '🌐 Start API Server', value: 'start_server' },
            new inquirer.Separator(),
            { name: '🚪 Exit', value: 'exit' },
          ],
        },
      ]);

      try {
        switch (action) {
          case 'view_products':
            await this.viewProducts();
            break;
          case 'add_product':
            await this.addProduct();
            break;
          case 'update_product':
            await this.updateProduct();
            break;
          case 'delete_product':
            await this.deleteProduct();
            break;
          case 'add_stock':
            await this.addStock();
            break;
          case 'remove_stock':
            await this.removeStock();
            break;
          case 'adjust_stock':
            await this.adjustStock();
            break;
          case 'low_stock':
            await this.viewLowStock();
            break;
          case 'search':
            await this.searchProducts();
            break;
          case 'summary':
            await this.viewSummary();
            break;
          case 'transactions':
            await this.viewTransactions();
            break;
          case 'start_server':
            await this.startServer();
            break;
          case 'exit':
            exit = true;
            console.log(chalk.green('\n👋 Goodbye!\n'));
            break;
        }
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
      }

      if (!exit) {
        await this.pressEnterToContinue();
      }
    }
  }

  showWelcome() {
    console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║   Trade Assistant - Inventory System  ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));
  }

  async viewProducts() {
    const products = await inventoryService.getAllProducts();

    if (products.length === 0) {
      console.log(chalk.yellow('\n📦 No products found.'));
      return;
    }

    const table = new Table({
      head: [
        chalk.cyan('SKU'),
        chalk.cyan('Name'),
        chalk.cyan('Category'),
        chalk.cyan('Price'),
        chalk.cyan('Quantity'),
        chalk.cyan('Status'),
      ],
      colWidths: [15, 25, 15, 12, 10, 15],
    });

    products.forEach((product) => {
      const status = product.getStockStatus();
      let statusColor = chalk.green;
      if (status === 'LOW_STOCK') statusColor = chalk.yellow;
      if (status === 'OUT_OF_STOCK') statusColor = chalk.red;

      table.push([
        product.sku,
        product.name,
        product.category,
        `$${product.price.toFixed(2)}`,
        product.quantity,
        statusColor(status),
      ]);
    });

    console.log('\n' + table.toString());
    console.log(chalk.gray(`\nTotal products: ${products.length}`));
  }

  async addProduct() {
    console.log(chalk.cyan('\n➕ Add New Product\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Product name:',
        validate: (input) => input.trim() !== '' || 'Name is required',
      },
      {
        type: 'input',
        name: 'sku',
        message: 'SKU:',
        validate: (input) => input.trim() !== '' || 'SKU is required',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
      },
      {
        type: 'input',
        name: 'category',
        message: 'Category:',
        default: 'General',
      },
      {
        type: 'number',
        name: 'price',
        message: 'Price:',
        validate: (input) => input >= 0 || 'Price must be non-negative',
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'Initial quantity:',
        default: 0,
        validate: (input) => input >= 0 || 'Quantity must be non-negative',
      },
      {
        type: 'number',
        name: 'minStockLevel',
        message: 'Minimum stock level:',
        default: 10,
        validate: (input) => input >= 0 || 'Must be non-negative',
      },
      {
        type: 'input',
        name: 'unit',
        message: 'Unit (e.g., pcs, kg):',
        default: 'pcs',
      },
      {
        type: 'input',
        name: 'supplier',
        message: 'Supplier (optional):',
      },
    ]);

    const product = await inventoryService.addProduct(answers);
    console.log(chalk.green('\n✅ Product added successfully!'));
    console.log(chalk.gray(`Product ID: ${product.id}`));
  }

  async updateProduct() {
    const products = await inventoryService.getAllProducts();

    if (products.length === 0) {
      console.log(chalk.yellow('\n📦 No products available to update.'));
      return;
    }

    const { productId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'productId',
        message: 'Select product to update:',
        choices: products.map((p) => ({
          name: `${p.sku} - ${p.name}`,
          value: p.id,
        })),
      },
    ]);

    const product = products.find((p) => p.id === productId);

    const updates = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Product name:',
        default: product.name,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: product.description,
      },
      {
        type: 'input',
        name: 'category',
        message: 'Category:',
        default: product.category,
      },
      {
        type: 'number',
        name: 'price',
        message: 'Price:',
        default: product.price,
      },
      {
        type: 'number',
        name: 'minStockLevel',
        message: 'Minimum stock level:',
        default: product.minStockLevel,
      },
    ]);

    await inventoryService.updateProduct(productId, updates);
    console.log(chalk.green('\n✅ Product updated successfully!'));
  }

  async deleteProduct() {
    const products = await inventoryService.getAllProducts();

    if (products.length === 0) {
      console.log(chalk.yellow('\n📦 No products available to delete.'));
      return;
    }

    const { productId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'productId',
        message: 'Select product to delete:',
        choices: products.map((p) => ({
          name: `${p.sku} - ${p.name}`,
          value: p.id,
        })),
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this product?',
        default: false,
      },
    ]);

    if (confirm) {
      await inventoryService.deleteProduct(productId);
      console.log(chalk.green('\n✅ Product deleted successfully!'));
    } else {
      console.log(chalk.yellow('\n❌ Deletion cancelled.'));
    }
  }

  async addStock() {
    const products = await inventoryService.getAllProducts();

    if (products.length === 0) {
      console.log(chalk.yellow('\n📦 No products available.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'productId',
        message: 'Select product:',
        choices: products.map((p) => ({
          name: `${p.sku} - ${p.name} (Current: ${p.quantity})`,
          value: p.id,
        })),
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'Quantity to add:',
        validate: (input) => input > 0 || 'Quantity must be positive',
      },
      {
        type: 'input',
        name: 'reason',
        message: 'Reason (optional):',
        default: 'Stock replenishment',
      },
      {
        type: 'input',
        name: 'reference',
        message: 'Reference number (optional):',
      },
    ]);

    const product = await inventoryService.addStock(
      answers.productId,
      answers.quantity,
      answers.reason,
      answers.reference
    );

    console.log(chalk.green('\n✅ Stock added successfully!'));
    console.log(chalk.gray(`New quantity: ${product.quantity}`));
  }

  async removeStock() {
    const products = await inventoryService.getAllProducts();

    if (products.length === 0) {
      console.log(chalk.yellow('\n📦 No products available.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'productId',
        message: 'Select product:',
        choices: products.map((p) => ({
          name: `${p.sku} - ${p.name} (Current: ${p.quantity})`,
          value: p.id,
        })),
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'Quantity to remove:',
        validate: (input) => input > 0 || 'Quantity must be positive',
      },
      {
        type: 'input',
        name: 'reason',
        message: 'Reason (optional):',
        default: 'Sale',
      },
      {
        type: 'input',
        name: 'reference',
        message: 'Reference number (optional):',
      },
    ]);

    const product = await inventoryService.removeStock(
      answers.productId,
      answers.quantity,
      answers.reason,
      answers.reference
    );

    console.log(chalk.green('\n✅ Stock removed successfully!'));
    console.log(chalk.gray(`New quantity: ${product.quantity}`));
  }

  async adjustStock() {
    const products = await inventoryService.getAllProducts();

    if (products.length === 0) {
      console.log(chalk.yellow('\n📦 No products available.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'productId',
        message: 'Select product:',
        choices: products.map((p) => ({
          name: `${p.sku} - ${p.name} (Current: ${p.quantity})`,
          value: p.id,
        })),
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'New quantity:',
        validate: (input) => input >= 0 || 'Quantity must be non-negative',
      },
      {
        type: 'input',
        name: 'reason',
        message: 'Reason:',
        default: 'Stock adjustment',
      },
    ]);

    const product = await inventoryService.adjustStock(
      answers.productId,
      answers.quantity,
      answers.reason
    );

    console.log(chalk.green('\n✅ Stock adjusted successfully!'));
    console.log(chalk.gray(`New quantity: ${product.quantity}`));
  }

  async viewLowStock() {
    const lowStock = await inventoryService.getLowStockProducts();
    const outOfStock = await inventoryService.getOutOfStockProducts();

    if (lowStock.length === 0 && outOfStock.length === 0) {
      console.log(chalk.green('\n✅ All products are well-stocked!'));
      return;
    }

    if (outOfStock.length > 0) {
      console.log(chalk.red.bold('\n🚨 OUT OF STOCK:'));
      const table = new Table({
        head: [chalk.cyan('SKU'), chalk.cyan('Name'), chalk.cyan('Category')],
        colWidths: [15, 30, 20],
      });

      outOfStock.forEach((p) => {
        table.push([p.sku, p.name, p.category]);
      });

      console.log(table.toString());
    }

    if (lowStock.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  LOW STOCK:'));
      const table = new Table({
        head: [
          chalk.cyan('SKU'),
          chalk.cyan('Name'),
          chalk.cyan('Quantity'),
          chalk.cyan('Min Level'),
        ],
        colWidths: [15, 30, 12, 12],
      });

      lowStock.forEach((p) => {
        table.push([p.sku, p.name, p.quantity, p.minStockLevel]);
      });

      console.log(table.toString());
    }
  }

  async searchProducts() {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Search query:',
        validate: (input) => input.trim() !== '' || 'Query is required',
      },
    ]);

    const products = await inventoryService.searchProducts(query);

    if (products.length === 0) {
      console.log(chalk.yellow('\n🔍 No products found.'));
      return;
    }

    const table = new Table({
      head: [
        chalk.cyan('SKU'),
        chalk.cyan('Name'),
        chalk.cyan('Category'),
        chalk.cyan('Quantity'),
      ],
      colWidths: [15, 30, 15, 12],
    });

    products.forEach((p) => {
      table.push([p.sku, p.name, p.category, p.quantity]);
    });

    console.log('\n' + table.toString());
    console.log(chalk.gray(`\nFound ${products.length} product(s)`));
  }

  async viewSummary() {
    const summary = await inventoryService.getInventorySummary();

    console.log(chalk.cyan.bold('\n📊 Inventory Summary\n'));
    console.log(chalk.white('Total Products:      ') + chalk.green(summary.totalProducts));
    console.log(chalk.white('Total Value:         ') + chalk.green(`$${summary.totalValue.toFixed(2)}`));
    console.log(chalk.white('Categories:          ') + chalk.green(summary.totalCategories));
    console.log(chalk.white('Total Transactions:  ') + chalk.green(summary.totalTransactions));
    console.log(
      chalk.white('Low Stock Products:  ') +
        (summary.lowStockCount > 0
          ? chalk.yellow(summary.lowStockCount)
          : chalk.green(summary.lowStockCount))
    );
    console.log(
      chalk.white('Out of Stock:        ') +
        (summary.outOfStockCount > 0
          ? chalk.red(summary.outOfStockCount)
          : chalk.green(summary.outOfStockCount))
    );

    if (summary.categories.length > 0) {
      console.log(
        chalk.white('\nCategories:          ') +
          chalk.gray(summary.categories.join(', '))
      );
    }
  }

  async viewTransactions() {
    const transactions = await inventoryService.getAllTransactions();

    if (transactions.length === 0) {
      console.log(chalk.yellow('\n📜 No transactions found.'));
      return;
    }

    const recentTransactions = transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    const table = new Table({
      head: [
        chalk.cyan('Type'),
        chalk.cyan('Product ID'),
        chalk.cyan('Quantity'),
        chalk.cyan('Reason'),
        chalk.cyan('Date'),
      ],
      colWidths: [12, 20, 12, 25, 20],
    });

    for (const t of recentTransactions) {
      const product = await inventoryService.getProductById(t.productId);
      const productName = product ? product.name : 'Unknown';

      let typeColor = chalk.white;
      if (t.type === 'IN') typeColor = chalk.green;
      if (t.type === 'OUT') typeColor = chalk.red;
      if (t.type === 'ADJUSTMENT') typeColor = chalk.yellow;

      table.push([
        typeColor(t.type),
        productName.substring(0, 18),
        t.quantity,
        t.reason.substring(0, 23),
        new Date(t.timestamp).toLocaleString(),
      ]);
    }

    console.log('\n' + table.toString());
    console.log(
      chalk.gray(
        `\nShowing ${recentTransactions.length} of ${transactions.length} total transactions`
      )
    );
  }

  async startServer() {
    console.log(chalk.cyan('\n🌐 Starting API server...\n'));
    const { startServer } = await import('../api/server.js');
    await startServer();
    console.log(
      chalk.green(
        '\n✅ API server started! Press Ctrl+C to stop and return to menu.\n'
      )
    );

    // Wait for user to press Ctrl+C
    await new Promise(() => {});
  }

  async pressEnterToContinue() {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray('Press Enter to continue...'),
      },
    ]);
    console.clear();
    this.showWelcome();
  }
}
