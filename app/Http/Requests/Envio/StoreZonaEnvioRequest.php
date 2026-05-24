<?php

namespace App\Http\Requests\Envio;

class StoreZonaEnvioRequest extends BaseZonaEnvioRequest
{
    // Reglas y mensajes idénticos a Update — el frontend reemplaza la zona
    // completa al editar, así que ambos endpoints reciben el mismo payload.
}
