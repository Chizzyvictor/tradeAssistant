#!/usr/bin/env node

import { InventoryCLI } from './cli/index.js';

/**
 * Main entry point for the Trade Assistant Inventory Management System
 */
async function main() {
  const cli = new InventoryCLI();
  await cli.start();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
