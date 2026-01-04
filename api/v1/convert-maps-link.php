<?php
/**
 * Convert Google Maps Link to Display Format
 * Geocode location untuk dapat coordinates yang sesuai
 */
ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    $link = $_GET['link'] ?? $_POST['link'] ?? '';
    $location = $_GET['location'] ?? $_POST['location'] ?? '';

    if (empty($link)) {
        throw new Exception('Link parameter required');
    }

    // Jika sudah embed format, return langsung
    if (strpos($link, '/embed?pb=') !== false) {
        echo json_encode([
            'success' => true,
            'type' => 'embed',
            'url' => $link
        ]);
        exit;
    }

    // Untuk semua tipe link lain, geocode location untuk dapat coordinates
    $lat = null;
    $lng = null;

    // Extract coordinates dari regular maps URL jika ada format @lat,lng
    if (strpos($link, 'google.com/maps') !== false) {
        if (preg_match('/@([-\d.]+),([-\d.]+)/', $link, $matches)) {
            $lat = floatval($matches[1]);
            $lng = floatval($matches[2]);
        }
    }

    // Jika masih tidak ada coordinates, geocode location name
    if (!$lat || !$lng) {
        if (!empty($location)) {
            $geocodeUrl = 'https://nominatim.openstreetmap.org/search?q=' . urlencode($location) . '&format=json&limit=1&timeout=5';

            $context = stream_context_create([
                'http' => [
                    'timeout' => 5,
                    'header' => "User-Agent: Tourify-Maps/1.0\r\n"
                ]
            ]);

            $response = @file_get_contents($geocodeUrl, false, $context);
            if ($response) {
                $data = json_decode($response, true);
                if (!empty($data[0])) {
                    $lat = floatval($data[0]['lat']);
                    $lng = floatval($data[0]['lon']);
                }
            }
        }
    }

    // Fallback coordinates
    if (!$lat || !$lng) {
        $lat = -7.200;
        $lng = 109.890;
    }

    // Generate Google Maps embed URL dengan coordinates dan marker yang visible
    // Gunakan format pb yang proper dengan location search
    // Format: pb=!1m18!1m12!1m3!1d[zoom level]!2d[longitude]!3d[latitude]!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s[place_id]!2s[location_name]

    // Better approach: Use search-based embed yang menampilkan marker
    // Search untuk location akan otomatis show marker
    $searchQuery = urlencode($location);
    $embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7917.557771!2d{$lng}!3d{$lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s{$searchQuery}!5e0!3m2!1sen!2sid!4v" . time();

    echo json_encode([
        'success' => true,
        'type' => 'converted',
        'embed_url' => $embedUrl,
        'coordinates' => ['lat' => $lat, 'lng' => $lng],
        'location' => $location
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>