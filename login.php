<?php
require_once 'config/config.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitizeInput($_POST['username']);
    $password = $_POST['password'];

    if (!empty($username) && !empty($password)) {
        $db = new Database();
        $conn = $db->connect();

        $stmt = $conn->prepare('SELECT id, username, password, full_name, role FROM users WHERE username = ? AND is_active = 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['role'] = $user['role'];
            
            header('Location: index.php');
            exit;
        } else {
            $error = 'Invalid username or password';
        }
    } else {
        $error = 'Please enter both username and password';
    }
}

$pageTitle = 'Login';
require_once 'includes/header.php';
?>

<div class="login-container">
    <div class="row justify-content-center w-100">
        <div class="col-md-5 col-lg-4">
            <div class="card login-card">
                <div class="login-header">
                    <i class="fas fa-boxes"></i>
                    <h3 class="mb-0">Inventory System</h3>
                    <p class="mb-0">Sign in to continue</p>
                </div>
                <div class="card-body p-4">
                    <?php if ($error): ?>
                        <div class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-circle"></i> <?php echo $error; ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="" class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="username" class="form-label required">Username</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                <input type="text" class="form-control" id="username" name="username" 
                                       placeholder="Enter username" required autofocus>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="password" class="form-label required">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="password" name="password" 
                                       placeholder="Enter password" required>
                            </div>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="fas fa-sign-in-alt"></i> Sign In
                            </button>
                        </div>
                    </form>

                    <div class="text-center mt-4">
                        <small class="text-muted">
                            Default credentials: <strong>admin</strong> / <strong>admin123</strong>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
