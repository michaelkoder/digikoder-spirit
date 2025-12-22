<?php
// Proxy PHP vers serveur Node.js local (port 3005)
// Redirige toutes les requêtes /spirit/api/* vers http://localhost:3005/api/*

// Logging pour debug
error_reporting(E_ALL);
ini_set('display_errors', 1);
$logFile = __DIR__ . '/proxy-debug.log';

function logDebug($message) {
    global $logFile;
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' - ' . $message . PHP_EOL, FILE_APPEND);
}

logDebug('=== Nouvelle requête ===');
logDebug('REQUEST_URI: ' . (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'N/A'));
logDebug('REQUEST_METHOD: ' . $_SERVER['REQUEST_METHOD']);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logDebug('OPTIONS request - returning 200');
    http_response_code(200);
    exit;
}

// Construire l'URL du backend Node
$path = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$path = preg_replace('#^/spirit/api#', '/api', $path);
$nodeUrl = 'http://127.0.0.1:3005' . $path;

logDebug('Path transformé: ' . $path);
logDebug('URL Node: ' . $nodeUrl);

// Récupérer les headers (compatible tous serveurs)
$headers = array('Content-Type: application/json');
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}
if (isset($_SERVER['CONTENT_TYPE'])) {
    $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
}

// Récupérer le body pour POST/PUT
$body = file_get_contents('php://input');

// Initialiser cURL
$ch = curl_init($nodeUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT', 'PATCH')) && !empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Exécuter la requête
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// En cas d'erreur cURL
if ($response === false) {
    logDebug('ERREUR cURL: ' . $error);
    header('Content-Type: application/json');
    http_response_code(502);
    echo json_encode(array('error' => 'Backend unavailable', 'details' => $error));
    exit;
}

logDebug('Code HTTP reçu: ' . $httpCode);
logDebug('Réponse (premiers 200 chars): ' . substr($response, 0, 200));

// Renvoyer le code HTTP et le body
http_response_code($httpCode);
header('Content-Type: application/json');
echo $response;
