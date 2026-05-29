<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;

class UpdateSeo
{
    public function handle(array $data): void
    {
        BuildConfig::set('build_seo_nombre_tienda',   $data['nombre_tienda']);
        BuildConfig::set('build_seo_telefono_tienda', $data['telefono_tienda'] ?? '');

        // Destinatarios de notificaciones de pedido (lista). Se persiste como
        // JSON con shape [{nombre, telefono}]. Vacío = fallback al
        // build_seo_telefono_tienda en SendPulseService::notificarOrdenAlDueno.
        $destinatarios = $data['notif_destinatarios'] ?? [];
        BuildConfig::set('build_notif_pedidos_destinatarios', json_encode($destinatarios));
    }
}
