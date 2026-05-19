<?php

namespace App\Actions\Productos;

use App\Models\VariableGrupo;
use Illuminate\Support\Facades\Storage;

class EliminarVariableGrupo
{
    public function execute(VariableGrupo $grupo): void
    {
        if ($grupo->tipo === 'imagen') {
            foreach ($grupo->items as $item) {
                if ($item->valor) {
                    Storage::disk('s3')->delete($item->valor);
                }
            }
        }

        $grupo->delete();
    }
}
