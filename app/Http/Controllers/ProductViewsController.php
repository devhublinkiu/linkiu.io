<?php

namespace App\Http\Controllers;

use App\Models\ProductView;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ProductViewsController extends Controller
{
    /**
     * Patrones de User-Agent que identificamos como bots. Lista conservadora
     * pero pragmatica — cubre los crawlers y previewers que mas trafico
     * generan. Cualquier bot con UA fake nos pasara, pero contra eso no hay
     * defensa simple sin perjudicar usuarios reales.
     *
     * Incluye previewers de redes sociales (facebookexternalhit, whatsapp,
     * telegrambot) porque solo generan un hit cuando alguien comparte un
     * link — el humano que clickea cuenta despues como vista normal.
     */
    private const BOT_PATTERNS = [
        'bot', 'crawl', 'spider', 'slurp',
        'mediapartners', 'adsbot',
        'googlebot', 'bingbot', 'duckduckbot', 'yandexbot',
        'baiduspider', 'sogou', 'exabot',
        'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'rogerbot',
        'facebookexternalhit', 'twitterbot', 'linkedinbot',
        'whatsapp', 'telegrambot', 'discordbot', 'skypeuripreview',
        'pinterestbot', 'redditbot',
        'headlesschrome', 'phantomjs', 'puppeteer', 'playwright',
        'curl', 'wget', 'python-requests', 'go-http-client',
    ];

    public function track(Request $request)
    {
        // Filtro de bots — descartamos antes de validar/parsear para no
        // gastar BD en trafico no humano. Devolvemos 200 OK para no
        // levantar sospechas ni provocar reintentos.
        if ($this->esBot($request->userAgent() ?? '')) {
            return response()->json(['ok' => true]);
        }

        // sendBeacon envía application/json — lo mergeamos al request
        if (str_contains($request->header('Content-Type', ''), 'application/json')) {
            $json = json_decode($request->getContent(), true) ?? [];
            $request->merge($json);
        }

        $data = $request->validate([
            'producto_id'  => 'required|integer|exists:productos,id',
            'scroll_depth' => 'nullable|integer|min:0|max:100',
        ]);

        $hoy = Carbon::today()->toDateString();

        ProductView::upsert(
            [[
                'producto_id'        => $data['producto_id'],
                'fecha'              => $hoy,
                'visitas'            => 1,
                'scroll_depth_sum'   => $data['scroll_depth'] ?? 0,
                'scroll_depth_count' => isset($data['scroll_depth']) ? 1 : 0,
            ]],
            uniqueBy: ['producto_id', 'fecha'],
            update: [
                'visitas'            => \DB::raw('visitas + 1'),
                'scroll_depth_sum'   => isset($data['scroll_depth'])
                    ? \DB::raw('scroll_depth_sum + ' . (int) $data['scroll_depth'])
                    : \DB::raw('scroll_depth_sum'),
                'scroll_depth_count' => isset($data['scroll_depth'])
                    ? \DB::raw('scroll_depth_count + 1')
                    : \DB::raw('scroll_depth_count'),
            ],
        );

        return response()->json(['ok' => true]);
    }

    private function esBot(string $userAgent): bool
    {
        if ($userAgent === '') return true;  // sin UA = sospechoso

        $ua = strtolower($userAgent);
        foreach (self::BOT_PATTERNS as $patron) {
            if (str_contains($ua, $patron)) return true;
        }
        return false;
    }
}
