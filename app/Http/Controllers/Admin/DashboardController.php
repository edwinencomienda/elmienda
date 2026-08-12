<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * The number of units at which a variant is considered low on stock.
     */
    private const LOW_STOCK_THRESHOLD = 5;

    /**
     * Show the admin overview.
     */
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'products' => Product::count(),
                'active' => Product::where('status', ProductStatus::Active)->count(),
                'drafts' => Product::where('status', ProductStatus::Draft)->count(),
                'categories' => Category::count(),
                'media' => Media::count(),
            ],
            'lowStock' => ProductVariant::query()
                ->with('product:id,name,slug')
                ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
                ->orderBy('stock')
                ->limit(10)
                ->get()
                ->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'name' => $variant->name,
                    'stock' => $variant->stock,
                    'product' => $variant->product->name,
                    'slug' => $variant->product->slug,
                ]),
        ]);
    }
}
