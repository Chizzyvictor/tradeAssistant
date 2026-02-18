<?php
require_once 'config/config.php';
requireAuth();

$pageTitle = 'Products';

$db = new Database();
$conn = $db->connect();

// Handle product deletion
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $conn->prepare('DELETE FROM products WHERE id = ?');
    if ($stmt->execute([$id])) {
        $_SESSION['success'] = 'Product deleted successfully';
    } else {
        $_SESSION['error'] = 'Failed to delete product';
    }
    header('Location: products.php');
    exit;
}

// Handle product add/edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name']);
    $sku = sanitizeInput($_POST['sku']);
    $description = sanitizeInput($_POST['description']);
    $category_id = $_POST['category_id'] ?: null;
    $unit_price = floatval($_POST['unit_price']);
    $min_stock_level = intval($_POST['min_stock_level']);

    if (isset($_POST['id']) && !empty($_POST['id'])) {
        // Update existing product
        $id = $_POST['id'];
        $stmt = $conn->prepare('UPDATE products SET name = ?, sku = ?, description = ?, category_id = ?, unit_price = ?, min_stock_level = ? WHERE id = ?');
        if ($stmt->execute([$name, $sku, $description, $category_id, $unit_price, $min_stock_level, $id])) {
            $_SESSION['success'] = 'Product updated successfully';
        } else {
            $_SESSION['error'] = 'Failed to update product';
        }
    } else {
        // Add new product
        $current_stock = intval($_POST['current_stock']) ?? 0;
        $stmt = $conn->prepare('INSERT INTO products (name, sku, description, category_id, unit_price, current_stock, min_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)');
        if ($stmt->execute([$name, $sku, $description, $category_id, $unit_price, $current_stock, $min_stock_level])) {
            $_SESSION['success'] = 'Product added successfully';
        } else {
            $_SESSION['error'] = 'Failed to add product';
        }
    }
    header('Location: products.php');
    exit;
}

// Get all products with category information
$products = $conn->query('
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name
')->fetchAll();

// Get all categories for dropdown
$categories = $conn->query('SELECT * FROM categories ORDER BY name')->fetchAll();

// Get product for editing if ID is provided
$editProduct = null;
if (isset($_GET['edit']) && is_numeric($_GET['edit'])) {
    $stmt = $conn->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$_GET['edit']]);
    $editProduct = $stmt->fetch();
}

require_once 'includes/header.php';
?>

<div id="alert-container">
    <?php if (isset($_SESSION['success'])): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle"></i> <?php echo $_SESSION['success']; unset($_SESSION['success']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>
    <?php if (isset($_SESSION['error'])): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-circle"></i> <?php echo $_SESSION['error']; unset($_SESSION['error']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>
</div>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-box"></i> Products</h2>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal">
        <i class="fas fa-plus"></i> Add Product
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped table-hover data-table" id="products_table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Unit Price</th>
                        <th>Current Stock</th>
                        <th>Min Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($products as $product): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($product['sku']); ?></td>
                            <td><?php echo htmlspecialchars($product['name']); ?></td>
                            <td><?php echo htmlspecialchars($product['category_name'] ?? 'N/A'); ?></td>
                            <td><?php echo formatCurrency($product['unit_price']); ?></td>
                            <td><?php echo $product['current_stock']; ?></td>
                            <td><?php echo $product['min_stock_level']; ?></td>
                            <td>
                                <?php
                                if ($product['current_stock'] == 0) {
                                    echo '<span class="badge badge-out-stock">Out of Stock</span>';
                                } elseif ($product['current_stock'] <= $product['min_stock_level']) {
                                    echo '<span class="badge badge-low-stock">Low Stock</span>';
                                } else {
                                    echo '<span class="badge badge-in-stock">In Stock</span>';
                                }
                                ?>
                            </td>
                            <td class="table-actions">
                                <a href="?edit=<?php echo $product['id']; ?>" class="btn btn-sm btn-info" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <a href="?delete=<?php echo $product['id']; ?>" class="btn btn-sm btn-danger delete-confirm" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Product Modal -->
<div class="modal fade" id="productModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-box"></i> <?php echo $editProduct ? 'Edit Product' : 'Add New Product'; ?>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="" class="needs-validation" novalidate>
                <?php if ($editProduct): ?>
                    <input type="hidden" name="id" value="<?php echo $editProduct['id']; ?>">
                <?php endif; ?>
                
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="name" class="form-label required">Product Name</label>
                            <input type="text" class="form-control" id="name" name="name" 
                                   value="<?php echo $editProduct ? htmlspecialchars($editProduct['name']) : ''; ?>" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="sku" class="form-label required">SKU</label>
                            <input type="text" class="form-control" id="sku" name="sku" 
                                   value="<?php echo $editProduct ? htmlspecialchars($editProduct['sku']) : ''; ?>" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"><?php echo $editProduct ? htmlspecialchars($editProduct['description']) : ''; ?></textarea>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="category_id" class="form-label">Category</label>
                            <select class="form-select" id="category_id" name="category_id">
                                <option value="">Select Category</option>
                                <?php foreach ($categories as $category): ?>
                                    <option value="<?php echo $category['id']; ?>" 
                                        <?php echo ($editProduct && $editProduct['category_id'] == $category['id']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($category['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="unit_price" class="form-label required">Unit Price</label>
                            <input type="number" class="form-control currency-input" id="unit_price" name="unit_price" 
                                   step="0.01" min="0" value="<?php echo $editProduct ? $editProduct['unit_price'] : '0.00'; ?>" required>
                        </div>
                    </div>

                    <div class="row">
                        <?php if (!$editProduct): ?>
                            <div class="col-md-6 mb-3">
                                <label for="current_stock" class="form-label">Initial Stock</label>
                                <input type="number" class="form-control" id="current_stock" name="current_stock" 
                                       min="0" value="0">
                            </div>
                        <?php endif; ?>
                        <div class="col-md-<?php echo $editProduct ? '12' : '6'; ?> mb-3">
                            <label for="min_stock_level" class="form-label required">Minimum Stock Level</label>
                            <input type="number" class="form-control" id="min_stock_level" name="min_stock_level" 
                                   min="0" value="<?php echo $editProduct ? $editProduct['min_stock_level'] : '10'; ?>" required>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Product
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php if ($editProduct): ?>
<script>
    $(document).ready(function() {
        $('#productModal').modal('show');
    });
</script>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
