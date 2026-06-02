<?php

namespace App\Observers;

use App\Support\MenuCache;
use App\Support\Producto\SnapshotsRepository;
use App\Support\ProductosCache;
use Illuminate\Database\Eloquent\Model;

/**
 * Observer único compartido por Producto y sus relaciones.
 *
 * Cualquier cambio (created/updated/deleted) invalida:
 *  - El cache público de productos (listado/detalle/categoría).
 *  - Los snapshots de performance del admin (Score, Temperatura, etc.).
 *    Se invalidan ambos porque cualquier cambio puede afectar el p75 del
 *    catálogo y por ende los percentiles de TODOS los productos.
 *
 * La granularidad fina (invalidar solo el snapshot del producto afectado)
 * no funciona porque el contexto del catálogo depende de todos.
 */
class ProductosCacheObserver
{
    public function saved(Model $model): void
    {
        ProductosCache::invalidar();
        SnapshotsRepository::invalidar();
        MenuCache::invalidar();
    }

    public function deleted(Model $model): void
    {
        ProductosCache::invalidar();
        SnapshotsRepository::invalidar();
        MenuCache::invalidar();
    }
}
