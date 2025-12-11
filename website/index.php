<?php

$host = getenv('DB_HOST') ?: 'db';
$db   = getenv('DB_NAME') ?: 'cloudca';
$user = getenv('DB_USER') ?: 'matt';
$pass = getenv('DB_PASS') ?: 'mattpass';

// ROUTER
if (!isset($_GET['submit'])) {
    // show home page
    include 'home.html';
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=$host;port=3306;dbname=$db;charset=utf8",
        $user,
        $pass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // handle form submission
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $email = $_POST['email'] ?? '';
        $stmt = $pdo->prepare("INSERT INTO users (name) VALUES (:name)");
        $stmt->execute([":name" => $email]);

        echo "<h2>Inserted row: " . htmlspecialchars($email) . "</h2>";
        echo "<p><a href='/'>Go Back</a></p>";
        exit;
    }

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
