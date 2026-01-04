<?php
session_start();

// Destroy all session data
session_destroy();

// Redirect to auth page
header('Location: auth.php?logout=success');
exit;
?>
