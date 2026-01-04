<?php
/**
 * Seed Script - Insert Destinasi Data
 * Data dari screenshot public page
 */
require_once __DIR__ . '/db.php';

$pdo = get_db();

echo "Seeding Destinasi Data...\n\n";

// Data destinasi
$destinations = [
    [
        'name' => 'Dieng Plateau',
        'description' => 'Dataran tinggi vulkanik yang menakjubkan dengan pemandangan alam spektakuler di ketinggian 2.000 meter. Diarsa tinggi vulkanik yang menakjubkan dengan pemandangan pegunungan, danau berwarna, dan candi-candi kuno. Dieng Plateau...',
        'location' => 'Dieng, Banjarnegara',
        'price' => 25000,
        'category_id' => 1, // Pegunungan
        'image' => NULL,
        'rating' => 4.8,
        'review_count' => 1250
    ],
    [
        'name' => 'Telaga Warna',
        'description' => 'Danau vulkanik yang terkenal dengan airnya yang berubah warna dari hijau menjadi biru tergantung pantuan cahaya matahari. Danau vulkanik yang terkenal dengan keindahan alamnya yang memukau...',
        'location' => 'Dieng, Banjarnegara',
        'price' => 15000,
        'category_id' => 2, // Danau
        'image' => NULL,
        'rating' => 4.7,
        'review_count' => 980
    ],
    [
        'name' => 'Kawah Sikidang',
        'description' => 'Kawah vulkanik aktif dengan fumarol dan kolam lumpur mendidih yang mengeluarkan gas beracun. Kawah vulkanik aktif dengan fumarol dan kolam lumppur mendidih yang mengeluarkan gas belerang. Kawah Sikidang terkenal ka...',
        'location' => 'Dieng, Banjarnegara',
        'price' => 20000,
        'category_id' => 1, // Pegunungan / Goa Alam
        'image' => NULL,
        'rating' => 4.6,
        'review_count' => 850
    ],
    [
        'name' => 'Candi Arjuna',
        'description' => 'Kompleks candi Hindu tertua di Indonesia yang dibangun pada abad ke-8. Candi Arjuna terdiri dari lima candi yang menghad akan candi utama yang megah dengan arsitektur yang indah...',
        'location' => 'Dieng, Banjarnegara',
        'price' => 10000,
        'category_id' => 4, // Candi Bersejarah
        'image' => NULL,
        'rating' => 4.5,
        'review_count' => 720
    ],
    [
        'name' => 'Bukit Sikunir',
        'description' => 'Spot terbaik untuk menyaksikan golden sunrise di kawasan Dieng. Bukit Sikunir menawarkan pemandangan matahari terbit yang terbit yan spektakuler dengan awan yang membentang luas di bawah...',
        'location' => 'Dieng, Banjarnegara',
        'price' => 15000,
        'category_id' => 1, // Pegunungan / Adventure
        'image' => NULL,
        'rating' => 4.9,
        'review_count' => 1500
    ],
    [
        'name' => 'Air Terjun Pekasaran',
        'description' => 'Air terjun alami yang tersembunyi di tengah hutan dengan ketinggian sekitar 30 meter. Air Terjun Pekasaran menawarkan ke...',
        'location' => 'Pekasaran, Banjarnegara',
        'price' => 5000,
        'category_id' => 3, // Air Terjun
        'image' => NULL,
        'rating' => 4.4,
        'review_count' => 450
    ]
];

// Check if data already exists
$stmt = $pdo->query("SELECT COUNT(*) as count FROM DESTINATION");
$existingCount = $stmt->fetch()['count'];

if ($existingCount > 0) {
    echo "⚠️  Database sudah memiliki " . $existingCount . " destinasi.\n";
    echo "Hapus data lama? (y/n): ";
    $input = trim(fgets(STDIN));
    if (strtolower($input) === 'y') {
        // Delete related records first due to foreign keys
        $pdo->exec("DELETE FROM REVIEW WHERE destination_id IN (SELECT destination_id FROM DESTINATION)");
        $pdo->exec("DELETE FROM BOOKING WHERE destination_id IN (SELECT destination_id FROM DESTINATION)");
        $pdo->exec("DELETE FROM ITINERARYDETAIL WHERE destination_id IN (SELECT destination_id FROM DESTINATION)");
        $pdo->exec("DELETE FROM DESTINATION");
        echo "✓ Data lama dihapus\n\n";
    } else {
        echo "Cancelled.\n";
        exit;
    }
}

// Insert data
$stmt = $pdo->prepare("INSERT INTO DESTINATION (name, description, location, price, category_id, image, created_at) 
                       VALUES (?, ?, ?, ?, ?, ?, NOW())");

$inserted = 0;
foreach ($destinations as $dest) {
    try {
        $result = $stmt->execute([
            $dest['name'],
            $dest['description'],
            $dest['location'],
            $dest['price'],
            $dest['category_id'],
            $dest['image']
        ]);

        if ($result) {
            echo "✓ Inserted: " . $dest['name'] . " (Rp " . number_format($dest['price']) . ")\n";
            $inserted++;

            // Insert fake reviews untuk rating
            $destId = $pdo->lastInsertId();
            insertFakeReviews($pdo, $destId, $dest['rating'], $dest['review_count']);
        }
    } catch (Exception $e) {
        echo "✗ Error inserting " . $dest['name'] . ": " . $e->getMessage() . "\n";
    }
}

echo "\n✓ Seeding complete!\n";
echo "  Total inserted: " . $inserted . " destinations\n";

// Verify
$stmt = $pdo->query("SELECT COUNT(*) as count FROM DESTINATION");
$finalCount = $stmt->fetch()['count'];
echo "  Total in database: " . $finalCount . "\n";

/**
 * Insert fake reviews untuk seeding
 */
function insertFakeReviews($pdo, $destId, $rating, $count)
{
    // Get some user IDs
    $users = $pdo->query("SELECT user_id FROM USERS LIMIT " . min($count, 10))->fetchAll();

    if (empty($users)) {
        // Create dummy user if none exists
        $pdo->prepare("INSERT INTO USERS (name, email, password) VALUES (?, ?, ?)")
            ->execute(['Wisatawan', 'wisatawan@example.com', password_hash('123456', PASSWORD_DEFAULT)]);
        $users = $pdo->query("SELECT user_id FROM USERS LIMIT " . min($count, 10))->fetchAll();
    }

    if (!empty($users)) {
        $roundedRating = round($rating);

        // Insert some reviews
        $stmt = $pdo->prepare("INSERT INTO REVIEW (user_id, destination_id, rating, review_text, created_at) 
                              VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL RAND() * 90 DAY))");

        for ($i = 0; $i < min($count / 10, 5); $i++) {
            $userId = $users[$i % count($users)]['user_id'];
            $reviewText = generateReviewText();

            try {
                $stmt->execute([
                    $userId,
                    $destId,
                    $roundedRating,
                    $reviewText
                ]);
            } catch (Exception $e) {
                // Skip if review already exists
            }
        }
    }
}

/**
 * Generate random review text
 */
function generateReviewText()
{
    $reviews = [
        'Destinasi yang sangat indah dan menakjubkan!',
        'Pemandangan alam yang spektakuler. Highly recommended!',
        'Tempat yang wajib dikunjungi ketika ke daerah ini.',
        'Saya sangat suka dengan keindahan alam di sini.',
        'Pengalaman yang tak terlupakan!',
        'Worth it untuk dikunjungi bersama keluarga.',
        'Tempat yang sempurna untuk berfoto-foto.',
        'Sangat memuaskan dan sesuai ekspektasi.',
        'Destinasi favorit saya sekarang!',
        'Kualitas pelayanan juga sangat baik.'
    ];

    return $reviews[array_rand($reviews)];
}
?>