<?php
// BERGS website inquiry handler. Sends website inquiries to info@bergsph.com.
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok'=>false,'message'=>'Invalid request method.']);
    exit;
}

// Honeypot: bots should never fill this field.
if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['ok'=>true,'message'=>'Thank you.']);
    exit;
}

function clean($value) {
    return trim(str_replace(["\r", "\n"], ' ', (string)$value));
}

$name = clean($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$company = clean($_POST['company'] ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$type = clean($_POST['inquiry_type'] ?? 'General Inquiry');

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok'=>false,'message'=>'Please complete all required fields and enter a valid email address.']);
    exit;
}

if (strlen($name) > 120 || strlen($subject) > 180 || strlen($message) > 5000 || strlen($email) > 180) {
    http_response_code(422);
    echo json_encode(['ok'=>false,'message'=>'One or more fields are too long.']);
    exit;
}

$to = 'info@bergsph.com';
$mailSubject = '[BERGS Website] ' . $type . ' - ' . $subject;
$body = "New inquiry received from the BERGS website\n\n";
$body .= "Inquiry Type: {$type}\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Phone: " . ($phone ?: 'Not provided') . "\n";
$body .= "Company / Organization: " . ($company ?: 'Not provided') . "\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n\n";
$body .= "Sent from: bergsph.com\n";

// Use the BERGS domain as From to improve deliverability; reply goes to the visitor.
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: BERGS Website <info@bergsph.com>\r\n";
$headers .= "Reply-To: {$email}\r\n";

$sent = @mail($to, $mailSubject, $body, $headers);

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'message'=>'We could not send the inquiry right now. Please email info@bergsph.com directly.']);
    exit;
}

echo json_encode(['ok'=>true,'message'=>'Thank you. Your inquiry has been sent to the BERGS team.']);
