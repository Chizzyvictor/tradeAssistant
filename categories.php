<?php
require_once 'config/config.php';
requireAuth();

$pageTitle = 'Categories';

$db = new Database();
$conn = $db->connect();

// Handle category deletion
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $conn->prepare('DELETE FROM categories WHERE id = ?');
    if ($stmt->execute([$id])) {
        $_SESSION['success'] = 'Category deleted successfully';
    } else {
        $_SESSION['error'] = 'Failed to delete category';
    }
    header('Location: categories.php');
    exit;
}

// Handle category add/edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name']);
    $description = sanitizeInput($_POST['description']);

    if (isset($_POST['id']) && !empty($_POST['id'])) {
        // Update existing category
        $id = $_POST['id'];
        $stmt = $conn->prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?');
        if ($stmt->execute([$name, $description, $id])) {
            $_SESSION['success'] = 'Category updated successfully';
        } else {
            $_SESSION['error'] = 'Failed to update category';
        }
    } else {
        // Add new category
        $stmt = $conn->prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
        if ($stmt->execute([$name, $description])) {
            $_SESSION['success'] = 'Category added successfully';
        } else {
            $_SESSION['error'] = 'Failed to add category';
        }
    }
    header('Location: categories.php');
    exit;
}

// Get all categories with product count
$categories = $conn->query('
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name
')->fetchAll();

// Get category for editing if ID is provided
$editCategory = null;
if (isset($_GET['edit']) && is_numeric($_GET['edit'])) {
    $stmt = $conn->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$_GET['edit']]);
    $editCategory = $stmt->fetch();
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
    <h2><i class="fas fa-tags"></i> Categories</h2>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoryModal">
        <i class="fas fa-plus"></i> Add Category
    </button>
</div>

<div class="row">
    <?php foreach ($categories as $category): ?>
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-tag text-primary"></i> <?php echo htmlspecialchars($category['name']); ?>
                    </h5>
                    <p class="card-text text-muted">
                        <?php echo htmlspecialchars($category['description'] ?: 'No description'); ?>
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="badge bg-info">
                            <i class="fas fa-box"></i> <?php echo $category['product_count']; ?> Products
                        </span>
                        <div>
                            <a href="?edit=<?php echo $category['id']; ?>" class="btn btn-sm btn-info" title="Edit">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="?delete=<?php echo $category['id']; ?>" class="btn btn-sm btn-danger delete-confirm" title="Delete">
                                <i class="fas fa-trash"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<?php if (empty($categories)): ?>
    <div class="alert alert-info text-center">
        <i class="fas fa-info-circle"></i> No categories found. Click "Add Category" to create one.
    </div>
<?php endif; ?>

<!-- Category Modal -->
<div class="modal fade" id="categoryModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-tag"></i> <?php echo $editCategory ? 'Edit Category' : 'Add New Category'; ?>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="" class="needs-validation" novalidate>
                <?php if ($editCategory): ?>
                    <input type="hidden" name="id" value="<?php echo $editCategory['id']; ?>">
                <?php endif; ?>
                
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="name" class="form-label required">Category Name</label>
                        <input type="text" class="form-control" id="name" name="name" 
                               value="<?php echo $editCategory ? htmlspecialchars($editCategory['name']) : ''; ?>" required>
                    </div>

                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"><?php echo $editCategory ? htmlspecialchars($editCategory['description']) : ''; ?></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Category
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php if ($editCategory): ?>
<script>
    $(document).ready(function() {
        $('#categoryModal').modal('show');
    });
</script>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
