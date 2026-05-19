<?php

namespace App\Actions\Productos;

use App\Models\VariableItem;
use Illuminate\Support\Facades\Storage;

class EliminarVariableItem
{
    public function execute(VariableItem $item): void
    {
        if ($item->grupo->tipo === 'imagen' && $item->valor) {
            Storage::disk('s3')->delete($item->valor);
        }

        $item->delete();
    }
}
