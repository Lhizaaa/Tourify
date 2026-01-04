<?php
/**
 * Public Tour Guides API
 * Accessible untuk semua user (tidak perlu auth)
 * File: /api/tour-guides.php
 */

ob_clean();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile:$errline");
    return true;
});
require_once __DIR__ . '/../../config/database.php';

$action = $_GET['action'] ?? '';
$pdo = get_db();

try {
    switch ($action) {
        case 'list':
            // Get all tour guides dengan pagination
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = 12;
            $offset = ($page - 1) * $limit;
            $search = trim($_GET['search'] ?? '');

            $query = "SELECT 
                        g.guide_id,
                        g.name,
                        g.bio,
                        g.contact,
                        g.price,
                        g.profile_picture,
                        (SELECT COUNT(*) FROM BOOKING WHERE guide_id = g.guide_id AND status = 'paid') as completed_bookings
                     FROM TourGuide g
                     WHERE 1=1";

            $params = [];
            if ($search) {
                $query .= " AND (g.name LIKE ? OR g.bio LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            $query .= " ORDER BY g.name ASC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $guides = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM TourGuide WHERE 1=1";
            if ($search) {
                $countQuery .= " AND (name LIKE ? OR bio LIKE ?)";
            }

            $countStmt = $pdo->prepare($countQuery);
            if ($search) {
                $countStmt->execute(["%$search%", "%$search%"]);
            } else {
                $countStmt->execute();
            }
            $total = $countStmt->fetch()['total'];

            // Add image path prefix untuk guides
            foreach ($guides as &$guide) {
                if (!empty($guide['profile_picture'])) {
                    $guide['profile_picture'] = 'guides/' . $guide['profile_picture'];
                }
            }

            echo json_encode([
                'success' => true,
                'data' => $guides,
                'total' => $total,
                'pages' => ceil($total / $limit),
                'current_page' => $page
            ]);
            break;

        case 'detail':
            // Get single guide detail
            $guide_id = intval($_GET['id'] ?? 0);

            if ($guide_id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid guide ID']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT 
                                    g.*,
                                    (SELECT COUNT(*) FROM BOOKING WHERE guide_id = g.guide_id AND status = 'paid') as completed_bookings
                                 FROM TourGuide g 
                                 WHERE g.guide_id = ?");
            $stmt->execute([$guide_id]);
            $guide = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($guide) {
                // Add image path prefix untuk guides
                if (!empty($guide['profile_picture'])) {
                    $guide['profile_picture'] = 'guides/' . $guide['profile_picture'];
                }
                echo json_encode(['success' => true, 'data' => $guide]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Guide not found']);
            }
            break;

        case 'search':
            // Advanced search
            $keyword = trim($_GET['q'] ?? '');

            if (strlen($keyword) < 2) {
                echo json_encode(['error' => 'Search keyword too short']);
                exit;
            }

            $query = "SELECT 
                        g.guide_id,
                        g.name,
                        g.profile_picture,
                        (SELECT COUNT(*) FROM BOOKING WHERE guide_id = g.guide_id AND status = 'paid') as completed_bookings
                     FROM TourGuide g
                     WHERE (g.name LIKE ? OR g.bio LIKE ?)
                     ORDER BY g.name ASC
                     LIMIT 20";

            $stmt = $pdo->prepare($query);
            $stmt->execute(["%$keyword%", "%$keyword%"]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add image path prefix untuk guides
            foreach ($results as &$guide) {
                if (!empty($guide['profile_picture'])) {
                    $guide['profile_picture'] = 'guides/' . $guide['profile_picture'];
                }
            }

            echo json_encode([
                'success' => true,
                'results' => $results,
                'count' => count($results)
            ]);
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>