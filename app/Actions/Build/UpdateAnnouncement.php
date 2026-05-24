<?php

namespace App\Actions\Build;

use App\Models\BuildAnnouncement;

class UpdateAnnouncement
{
    public function handle(BuildAnnouncement $announcement, array $data): void
    {
        $announcement->update([
            'texto'     => $data['texto'],
            'emoji'     => $data['emoji'] ?? null,
            'btn_texto' => $data['btn_texto'] ?: null,
            'btn_link'  => $data['btn_link']  ?: null,
            'fin_timer' => $data['fin_timer'] ?: null,
            'activo'    => $data['activo'],
        ]);
    }
}
