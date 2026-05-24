<?php

namespace App\Actions\Build;

use App\Models\BuildAnnouncement;

class DeleteAnnouncement
{
    public function handle(BuildAnnouncement $announcement): void
    {
        $announcement->delete();
    }
}
