<?php

return [
    'api_key'      => env('WHATSAPP_API_KEY'),
    'base_url'     => env('WHATSAPP_BASE_URL'),
    'sender'       => env('WHATSAPP_SENDER'),
    'otp_template' => env('WHATSAPP_OTP_TEMPLATE', 'password_reset_code_es'),
];
