<?php
/**
 * API mínima del panel administrativo (opcional).
 * Funciona en cualquier hosting con PHP 7.4+ (cPanel, Hostinger, etc.).
 *  - GET  ?ping=1                         → comprueba que el servidor está activo
 *  - POST {action:"login",    pass}       → valida la clave
 *  - POST {action:"save",     pass, content} → guarda ../content.json
 *  - POST {action:"upload",   pass, name, data(dataURL)} → guarda imagen en ../uploads/
 *  - POST {action:"password", pass, newPass} → cambia la clave
 * Clave inicial: 123456. Al cambiarla se guarda cifrada en data/.pass
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const DEFAULT_PASS = '123456';
const MAX_CONTENT = 20 * 1024 * 1024;   // 20 MB
const MAX_IMAGE   = 8 * 1024 * 1024;    // 8 MB

$root     = dirname(__DIR__);
$dataDir  = __DIR__ . '/data';
$passFile = $dataDir . '/.pass';
$lockFile = $dataDir . '/.attempts';

function out(array $d, int $code = 200): void { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
  out(['ok' => isset($_GET['ping'])]);
}

$raw = file_get_contents('php://input', false, null, 0, MAX_CONTENT + 1024);
if ($raw === false || strlen($raw) > MAX_CONTENT) out(['ok' => false, 'message' => 'Contenido demasiado grande'], 413);
$in = json_decode($raw, true);
if (!is_array($in)) out(['ok' => false, 'message' => 'Solicitud no válida'], 400);

if (!is_dir($dataDir)) @mkdir($dataDir, 0750, true);

/* --- limitador de intentos por IP (10 fallos / 15 min) --- */
$ip = $_SERVER['REMOTE_ADDR'] ?? 'x';
$att = is_file($lockFile) ? (json_decode((string) file_get_contents($lockFile), true) ?: []) : [];
$now = time();
$att = array_filter($att, fn($v) => is_array($v) && $now - ($v['t'] ?? 0) < 900);
if (($att[$ip]['n'] ?? 0) >= 10) out(['ok' => false, 'message' => 'Demasiados intentos. Espere 15 minutos.'], 429);

function checkPass(string $p, string $passFile): bool {
  if (is_file($passFile)) return password_verify($p, trim((string) file_get_contents($passFile)));
  return hash_equals(DEFAULT_PASS, $p);
}

$pass = (string) ($in['pass'] ?? '');
if (!checkPass($pass, $passFile)) {
  $att[$ip] = ['n' => ($att[$ip]['n'] ?? 0) + 1, 't' => $now];
  @file_put_contents($lockFile, json_encode($att), LOCK_EX);
  out(['ok' => false, 'message' => 'Clave incorrecta'], 401);
}
unset($att[$ip]);
@file_put_contents($lockFile, json_encode($att), LOCK_EX);

switch ($in['action'] ?? '') {
  case 'login':
    out(['ok' => true]);

  case 'save':
    $c = $in['content'] ?? null;
    if (!is_array($c) || !isset($c['sections'], $c['brand'])) out(['ok' => false, 'message' => 'Contenido no válido'], 400);
    $json = json_encode($c, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    $target = $root . '/content.json';
    if (is_file($target)) @copy($target, $dataDir . '/content.backup-' . date('Ymd-His') . '.json');
    // conservar solo los 15 respaldos más recientes
    $bk = glob($dataDir . '/content.backup-*.json') ?: [];
    rsort($bk);
    foreach (array_slice($bk, 15) as $old) @unlink($old);
    $tmp = $target . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $target)) out(['ok' => false, 'message' => 'No se pudo escribir content.json (revise permisos)'], 500);
    out(['ok' => true]);

  case 'upload':
    $data = (string) ($in['data'] ?? '');
    if (!preg_match('#^data:image/(png|jpe?g|webp|gif);base64,#', $data, $m)) out(['ok' => false, 'message' => 'Formato no permitido'], 400);
    $bin = base64_decode(substr($data, strpos($data, ',') + 1), true);
    if ($bin === false || strlen($bin) > MAX_IMAGE) out(['ok' => false, 'message' => 'Imagen no válida o muy grande'], 400);
    if (@getimagesizefromstring($bin) === false) out(['ok' => false, 'message' => 'El archivo no es una imagen'], 400);
    $ext = $m[1] === 'jpeg' ? 'jpg' : $m[1];
    $dir = $root . '/uploads';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $name = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (file_put_contents($dir . '/' . $name, $bin) === false) out(['ok' => false, 'message' => 'No se pudo guardar la imagen'], 500);
    out(['ok' => true, 'url' => 'uploads/' . $name]);

  case 'password':
    $np = (string) ($in['newPass'] ?? '');
    if (strlen($np) < 6) out(['ok' => false, 'message' => 'Mínimo 6 caracteres'], 400);
    if (file_put_contents($passFile, password_hash($np, PASSWORD_DEFAULT), LOCK_EX) === false) out(['ok' => false, 'message' => 'No se pudo guardar'], 500);
    out(['ok' => true]);
}
out(['ok' => false, 'message' => 'Acción desconocida'], 400);
