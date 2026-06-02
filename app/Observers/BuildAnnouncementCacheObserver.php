<?php

namespace App\Observers;

use App\Support\MenuCache;
use Illuminate\Database\Eloquent\Model;

/**
 * Invalida MenuCache cuando un anuncio se crea, actualiza o elimina —
 * lo que recompone los anuncios visibles en el navbar.
 */
class BuildAnnouncementCacheObserver
{
    public function saved(Model $model): void
    {
        MenuCache::invalidar();
    }

    public function deleted(Model $model): void
    {
        MenuCache::invalidar();
    }
}
