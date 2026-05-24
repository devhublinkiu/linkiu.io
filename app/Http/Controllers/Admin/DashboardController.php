<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardStatsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(DashboardStatsService $stats): Response
    {
        // Sin permiso específico: el dashboard es el landing de todos los admins.
        // El middleware del grupo /admin ya garantiza autenticación + verified.
        return Inertia::render('admin/Dashboard', $stats->obtener());
    }
}
