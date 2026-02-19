<?php
require_once 'config/config.php';
requireAuth();

$pageTitle = 'Stock Movements';

$db = new Database();
$conn = $db->connect();

// Handle stock movement deletion
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $id = $_GET['delete'];
    
    // Get movement details first
    $stmt = $conn->prepare('SELECT product_id, movement_type, quantity FROM stock_movements WHERE id = ?');
    $stmt->execute([$id]);
    $movement = $stmt->fetch();
    
    if ($movement) {
        // Reverse the stock change
        $product_id = $movement['product_id'];
        $quantity = $movement['quantity'];
        
        if ($movement['movement_type'] === 'in') {
            // If it was stock in, reduce current stock
            $conn->prepare('UPDATE products SET current_stock = current_stock - ? WHERE id = ?')
                 ->execute([$quantity, $product_id]);
        } elseif ($movement['movement_type'] === 'out') {
            // If it was stock out, increase current stock
            $conn->prepare('UPDATE products SET current_stock = current_stock + ? WHERE id = ?')
                 ->execute([$quantity, $product_id]);
        }
        
        // Delete the movement record
        $stmt = $conn->prepare('DELETE FROM stock_movements WHERE id = ?');
        if ($stmt->execute([$id])) {
            $_SESSION['success'] = 'Stock movement deleted and inventory adjusted';
        } else {
            $_SESSION['error'] = 'Failed to delete stock movement';
        }
    }
    
    header('Location: stock-movements.php');
    exit;
}

// Handle new stock movement
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_id = intval($_POST['product_id']);
    $movement_type = $_POST['movement_type'];
    $quantity = intval($_POST['quantity']);
    $reference_number = sanitizeInput($_POST['reference_number']);
    $notes = sanitizeInput($_POST['notes']);
    $user_id = $_SESSION['user_id'];

    // Get current stock
    $stmt = $conn->prepare('SELECT current_stock FROM products WHERE id = ?');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();
    
    if ($product) {
        $current_stock = $product['current_stock'];
        $new_stock = $current_stock;

        // Calculate new stock based on movement type
        if ($movement_type === 'in') {
            $new_stock = $current_stock + $quantity;
        } elseif ($movement_type === 'out') {
            $new_stock = $current_stock - $quantity;
            if ($new_stock < 0) {
                $_SESSION['error'] = 'Insufficient stock for this operation';
                header('Location: stock-movements.php');
                exit;
            }
        } elseif ($movement_type === 'adjustment') {
            // Adjustment sets stock to absolute value (not additive)
            $new_stock = $quantity;
        }

        // Start transaction
        $conn->beginTransaction();
        
        try {
            // Update product stock
            $stmt = $conn->prepare('UPDATE products SET current_stock = ? WHERE id = ?');
            $stmt->execute([$new_stock, $product_id]);

            // Insert stock movement record
            $stmt = $conn->prepare('INSERT INTO stock_movements (product_id, movement_type, quantity, reference_number, notes, user_id) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$product_id, $movement_type, $quantity, $reference_number, $notes, $user_id]);

            $conn->commit();
            $_SESSION['success'] = 'Stock movement recorded successfully';
        } catch (Exception $e) {
            $conn->rollBack();
            $_SESSION['error'] = 'Failed to record stock movement: ' . $e->getMessage();
        }
    } else {
        $_SESSION['error'] = 'Product not found';
    }

    header('Location: stock-movements.php');
    exit;
}

// Get all stock movements with product and user information
$movements = $conn->query('
    SELECT sm.*, p.name as product_name, p.sku, u.username 
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    JOIN users u ON sm.user_id = u.id
    ORDER BY sm.movement_date DESC
')->fetchAll();

// Get all products for dropdown
$products = $conn->query('SELECT id, name, sku, current_stock FROM products ORDER BY name')->fetchAll();

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
    <h2><i class="fas fa-exchange-alt"></i> Stock Movements</h2>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#movementModal">
        <i class="fas fa-plus"></i> Record Movement
    </button>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped table-hover data-table" id="movements_table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Reference</th>
                        <th>User</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($movements as $movement): ?>
                        <tr>
                            <td><?php echo formatDate($movement['movement_date']); ?></td>
                            <td><?php echo htmlspecialchars($movement['product_name']); ?></td>
                            <td><?php echo htmlspecialchars($movement['sku']); ?></td>
                            <td>
                                <?php
                                $badgeClass = 'badge-movement-' . $movement['movement_type'];
                                $icon = '';
                                switch ($movement['movement_type']) {
                                    case 'in':
                                        $icon = '<i class="fas fa-arrow-down"></i> ';
                                        break;
                                    case 'out':
                                        $icon = '<i class="fas fa-arrow-up"></i> ';
                                        break;
                                    case 'adjustment':
                                        $icon = '<i class="fas fa-adjust"></i> ';
                                        break;
                                }
                                ?>
                                <span class="badge <?php echo $badgeClass; ?>">
                                    <?php echo $icon . ucfirst($movement['movement_type']); ?>
                                </span>
                            </td>
                            <td><?php echo $movement['quantity']; ?></td>
                            <td><?php echo htmlspecialchars($movement['reference_number'] ?? 'N/A'); ?></td>
                            <td><?php echo htmlspecialchars($movement['username']); ?></td>
                            <td><?php echo htmlspecialchars($movement['notes'] ?? ''); ?></td>
                            <td class="table-actions">
                                <a href="?delete=<?php echo $movement['id']; ?>" class="btn btn-sm btn-danger delete-confirm" title="Delete & Reverse">
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

<!-- Stock Movement Modal -->
<div class="modal fade" id="movementModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-exchange-alt"></i> Record Stock Movement
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="" class="needs-validation" novalidate>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="product_id" class="form-label required">Product</label>
                            <select class="form-select" id="product_id" name="product_id" required>
                                <option value="">Select Product</option>
                                <?php foreach ($products as $product): ?>
                                    <option value="<?php echo $product['id']; ?>" data-stock="<?php echo $product['current_stock']; ?>">
                                        <?php echo htmlspecialchars($product['name']); ?> (<?php echo $product['sku']; ?>) - Stock: <?php echo $product['current_stock']; ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="movement_type" class="form-label required">Movement Type</label>
                            <select class="form-select" id="movement_type" name="movement_type" required>
                                <option value="">Select Type</option>
                                <option value="in">Stock In (Receive)</option>
                                <option value="out">Stock Out (Issue)</option>
                                <option value="adjustment">Adjustment</option>
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="quantity" class="form-label required">Quantity</label>
                            <input type="number" class="form-control" id="quantity" name="quantity" min="1" required>
                            <input type="hidden" id="current_stock" value="0">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="reference_number" class="form-label">Reference Number</label>
                            <input type="text" class="form-control" id="reference_number" name="reference_number" 
                                   placeholder="e.g., PO-123, INV-456">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes</label>
                        <textarea class="form-control" id="notes" name="notes" rows="3" 
                                  placeholder="Additional notes or comments"></textarea>
                    </div>

                    <div id="stock_preview" class="alert alert-info" style="display: none;">
                        <strong>Stock Preview:</strong> <span id="preview_text"></span>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Record Movement
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    // Update current stock when product is selected
    $('#product_id').on('change', function() {
        var stock = $(this).find(':selected').data('stock');
        $('#current_stock').val(stock || 0);
        updateStockPreview();
    });

    // Update preview when movement type or quantity changes
    $('#movement_type, #quantity').on('change input', function() {
        updateStockPreview();
    });

    function updateStockPreview() {
        var currentStock = parseInt($('#current_stock').val()) || 0;
        var quantity = parseInt($('#quantity').val()) || 0;
        var movementType = $('#movement_type').val();
        
        if (!movementType || quantity <= 0) {
            $('#stock_preview').hide();
            return;
        }

        var newStock = currentStock;
        var operation = '';

        if (movementType === 'in') {
            newStock = currentStock + quantity;
            operation = '+';
        } else if (movementType === 'out') {
            newStock = currentStock - quantity;
            operation = '-';
        } else if (movementType === 'adjustment') {
            newStock = quantity;
            operation = '=';
        }

        $('#preview_text').html(
            currentStock + ' ' + operation + ' ' + quantity + ' = <strong>' + newStock + '</strong>'
        );

        $('#stock_preview').show();
        
        if (newStock < 0) {
            $('#stock_preview').removeClass('alert-info alert-success').addClass('alert-danger');
        } else {
            $('#stock_preview').removeClass('alert-danger').addClass('alert-success');
        }
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
