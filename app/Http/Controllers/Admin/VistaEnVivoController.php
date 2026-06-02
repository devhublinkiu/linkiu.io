<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\VistaEnVivo\VistaEnVivoData;
use Inertia\Inertia;
use Inertia\Response;

class VistaEnVivoController extends Controller
{
    public function __construct(private readonly VistaEnVivoData $data) {}

    public function index(): Response
    {
        return Inertia::render('admin/vista-en-vivo/Index', $this->data->todo());
    }
}
