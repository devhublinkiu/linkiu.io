<?php

use Illuminate\Support\Facades\Broadcast;

// Canal público de seguimiento de orden (accesible sin autenticación)
Broadcast::channel('orders.{codigo}', fn () => true);

// Canal de notificaciones admin (accesible sin auth para simplificar — canal público)
Broadcast::channel('admin-orders', fn () => true);
