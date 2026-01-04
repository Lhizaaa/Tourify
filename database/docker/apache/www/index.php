   <?php
   $host = getenv('DB_HOST') ?: 'dbserver';
   $db = getenv('DB_NAME') ?: 'appdb';
   $user = getenv('DB_USER') ?: 'appuser';
   $pass = getenv('DB_PASSWORD') ?: 'secret123';

   try {
       $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
       $pdo = new PDO($dsn, $user, $pass);
       $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
       
       echo "<h1>Koneksi ke MariaDB BERHASIL</h1>";
       
       // Query yang benar
       $sql = "SELECT NOW() AS db_time";
       $stmt = $pdo->query($sql);
       $row = $stmt->fetch(PDO::FETCH_ASSOC);
       
       echo "<p>Waktu di database: " . htmlspecialchars($row['db_time']) . "</p>";
   } catch (PDOException $e) {
       echo "<h1>Koneksi ke MariaDB GAGAL</h1>";
       echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
   }