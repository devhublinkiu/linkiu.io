<?php

namespace App\Actions\Build;

use App\Models\BuildAnnouncement;

class StoreAnnouncement
{
    public function handle(array $data): BuildAnnouncement
    {
        $orden = (BuildAnnouncement::max('orden') ?? 0) + 1;

        return BuildAnnouncement::create([
            'texto'     => $data['texto'],
            'emoji'     => $data['emoji'] ?? null,
            'btn_texto' => $data['btn_texto'] ?: null,
            'btn_link'  => $data['btn_link']  ?: null,
            'fin_timer' => $data['fin_timer'] ?: null,
            'activo'    => $data['activo'] ?? true,
            'orden'     => $orden,
        ]);
    }
}
