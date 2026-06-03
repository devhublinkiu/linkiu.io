<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Funelinks\FunelinksData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FunelinksController extends Controller
{
    public function __construct(private readonly FunelinksData $data) {}

    public function index(Request $request): Response
    {
        abort_if(! auth()->user()->can('funelinks.ver'), 403);

        $productoId = $request->integer('producto_id') ?: null;
        $periodo    = in_array($request->string('periodo')->value(), ['hoy', '7d', '30d'], true)
            ? $request->string('periodo')->value()
            : '7d';
        $origen     = in_array($request->string('origen')->value(), ['facebook', 'instagram', 'google', 'direct', 'otros'], true)
            ? $request->string('origen')->value()
            : null;

        return Inertia::render('admin/analytics/funelinks/Index', $this->data->todo($productoId, $periodo, $origen));
    }
}
