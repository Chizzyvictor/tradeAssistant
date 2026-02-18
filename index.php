<?php
require_once 'config/config.php';
requireAuth();

$pageTitle = 'Dashboard';

$db = new Database();
$conn = $db->connect();

// Get statistics
$totalProducts = $conn->query('SELECT COUNT(*) as count FROM products')->fetch()['count'];
$totalCategories = $conn->query('SELECT COUNT(*) as count FROM categories')->fetch()['count'];
$lowStockProducts = $conn->query('SELECT COUNT(*) as count FROM products WHERE current_stock <= min_stock_level')->fetch()['count'];
$totalStockValue = $conn->query('SELECT SUM(current_stock * unit_price) as total FROM products')->fetch()['total'] ?? 0;

// Get recent stock movements
$recentMovements = $conn->query('
    SELECT sm.*, p.name as product_name, u.username 
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    JOIN users u ON sm.user_id = u.id
    ORDER BY sm.movement_date DESC
    LIMIT 10
')->fetchAll();

// Get low stock products
$lowStockList = $conn->query('
    SELECT * FROM products 
    WHERE current_stock <= min_stock_level 
    ORDER BY current_stock ASC 
    LIMIT 10
')->fetchAll();

// Get movement statistics for chart
$movementStats = $conn->query('
    SELECT 
        DATE(movement_date) as date,
        movement_type,
        COUNT(*) as count
    FROM stock_movements
    WHERE movement_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(movement_date), movement_type
    ORDER BY date
')->fetchAll();

require_once 'includes/header.php';
?>

<div id="alert-container"></div>

<h2 class="mb-4"><i class="fas fa-tachometer-alt"></i> Dashboard</h2>

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="card stat-card bg-primary text-white">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="stat-label">Total Products</div>
                        <div class="stat-value"><?php echo $totalProducts; ?></div>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 mb-3">
        <div class="card stat-card bg-success text-white">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="stat-label">Stock Value</div>
                        <div class="stat-value"><?php echo formatCurrency($totalStockValue); ?></div>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 mb-3">
        <div class="card stat-card bg-warning text-white">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="stat-label">Low Stock Items</div>
                        <div class="stat-value"><?php echo $lowStockProducts; ?></div>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 mb-3">
        <div class="card stat-card bg-info text-white">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="stat-label">Categories</div>
                        <div class="stat-value"><?php echo $totalCategories; ?></div>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Recent Stock Movements -->
    <div class="col-lg-8 mb-4">
        <div class="card">
            <div class="card-header">
                <i class="fas fa-exchange-alt"></i> Recent Stock Movements
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($recentMovements)): ?>
                                <tr>
                                    <td colspan="5" class="text-center text-muted">No stock movements yet</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($recentMovements as $movement): ?>
                                    <tr>
                                        <td><?php echo formatDate($movement['movement_date']); ?></td>
                                        <td><?php echo htmlspecialchars($movement['product_name']); ?></td>
                                        <td>
                                            <?php
                                            $badgeClass = 'badge-movement-' . $movement['movement_type'];
                                            $typeLabel = ucfirst($movement['movement_type']);
                                            ?>
                                            <span class="badge <?php echo $badgeClass; ?>"><?php echo $typeLabel; ?></span>
                                        </td>
                                        <td><?php echo $movement['quantity']; ?></td>
                                        <td><?php echo htmlspecialchars($movement['username']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
                <div class="text-center mt-3">
                    <a href="stock-movements.php" class="btn btn-primary btn-sm">
                        <i class="fas fa-list"></i> View All Movements
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Low Stock Alert -->
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-header bg-warning text-white">
                <i class="fas fa-exclamation-triangle"></i> Low Stock Alert
            </div>
            <div class="card-body">
                <?php if (empty($lowStockList)): ?>
                    <p class="text-center text-muted">All products are well stocked!</p>
                <?php else: ?>
                    <div class="list-group list-group-flush">
                        <?php foreach ($lowStockList as $product): ?>
                            <div class="list-group-item px-0">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong><?php echo htmlspecialchars($product['name']); ?></strong>
                                        <br>
                                        <small class="text-muted">SKU: <?php echo $product['sku']; ?></small>
                                    </div>
                                    <span class="badge bg-danger"><?php echo $product['current_stock']; ?></span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="text-center mt-3">
                        <a href="products.php" class="btn btn-warning btn-sm">
                            <i class="fas fa-boxes"></i> View All Products
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
