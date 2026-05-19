<?php

namespace App\Http\Controllers;

use App\Models\ProductView;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ProductViewsController extends Controller
{
    public function track(Request $request)
    {
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
}
