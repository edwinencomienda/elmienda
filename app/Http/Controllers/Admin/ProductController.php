<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * List products with search and filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only('search', 'status', 'category');

        $products = Product::query()
            ->with('category:id,name', 'media')
            ->withCount('variants')
            ->withMin('variants', 'price')
            // whereLike with caseSensitive: false picks ILIKE on Postgres,
            // which plain "like" would not be.
            ->when($filters['search'] ?? null, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->whereLike('name', "%{$search}%", caseSensitive: false)
                    ->orWhereLike('slug', "%{$search}%", caseSensitive: false)))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category_id', $category))
            ->orderBy('position')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'status' => $product->status->value,
                'featured' => $product->featured,
                'category' => $product->category?->name,
                'variants_count' => $product->variants_count,
                'price_from' => $product->getAttribute('variants_min_price'),
                'thumb' => $product->media->first()?->url(['width' => 80, 'quality' => 75]),
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $filters,
            'categories' => $this->categoryOptions(),
            'statuses' => $this->statusOptions(),
        ]);
    }

    /**
     * Show the create form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => $this->categoryOptions(),
            'statuses' => $this->statusOptions(),
        ]);
    }

    /**
     * Store a new product and its variants.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $product = DB::transaction(function () use ($validated) {
            $product = Product::create([
                ...collect($validated)->except(['variants', 'media'])->all(),
                'position' => (int) Product::max('position') + 1,
            ]);

            $this->syncVariants($product, $validated['variants']);
            $this->syncMedia($product, $validated['media'] ?? []);

            return $product;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return to_route('admin.products.edit', $product);
    }

    /**
     * Show the edit form.
     */
    public function edit(Product $product): Response
    {
        $product->load('variants', 'media');

        return Inertia::render('admin/products/form', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'category_id' => $product->category_id,
                'status' => $product->status->value,
                'featured' => $product->featured,
                'seo_title' => $product->seo_title,
                'seo_description' => $product->seo_description,
                'media' => $product->media->map(fn (Media $media) => [
                    'id' => $media->id,
                    'filename' => $media->filename,
                    'alt' => $media->alt,
                    'thumb' => $media->url(['width' => 300, 'quality' => 80]),
                ]),
                'variants' => $product->variants->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'name' => $variant->name,
                    'sku' => $variant->sku,
                    'price' => $variant->price / 100,
                    'compare_at_price' => $variant->compare_at_price === null
                        ? null
                        : $variant->compare_at_price / 100,
                    'stock' => $variant->stock,
                ]),
            ],
            'categories' => $this->categoryOptions(),
            'statuses' => $this->statusOptions(),
        ]);
    }

    /**
     * Update the given product and its variants.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($product, $validated) {
            $product->update(collect($validated)->except(['variants', 'media'])->all());

            $this->syncVariants($product, $validated['variants']);
            $this->syncMedia($product, $validated['media'] ?? []);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated.')]);

        return back();
    }

    /**
     * Soft delete the given product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted.')]);

        return to_route('admin.products.index');
    }

    /**
     * Copy a product and its variants as a fresh draft.
     */
    public function duplicate(Product $product): RedirectResponse
    {
        $copy = DB::transaction(function () use ($product) {
            $copy = $product->replicate(['slug']);
            $copy->name = "{$product->name} (copy)";
            $copy->slug = $this->uniqueSlug($product->slug);
            $copy->status = ProductStatus::Draft;
            $copy->featured = false;
            $copy->save();

            // The relation is already ordered by position, so re-indexing
            // preserves the order without reading pivot attributes.
            $copy->media()->sync(
                $product->media
                    ->values()
                    ->mapWithKeys(fn (Media $media, int $position): array => [
                        $media->id => ['position' => $position],
                    ])
                    ->all()
            );

            foreach ($product->variants as $variant) {
                $clone = $variant->replicate(['sku']);
                $clone->product_id = $copy->id;
                // SKUs are unique catalog-wide, so the copy starts without one.
                $clone->sku = null;
                $clone->save();
            }

            return $copy;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product duplicated.')]);

        return to_route('admin.products.edit', $copy);
    }

    /**
     * Attach the given media in the order supplied.
     *
     * @param  array<int, int>  $mediaIds
     */
    private function syncMedia(Product $product, array $mediaIds): void
    {
        $product->media()->sync(
            collect($mediaIds)
                ->mapWithKeys(fn (int $id, int $position) => [$id => ['position' => $position]])
                ->all()
        );
    }

    /**
     * Create, update and delete variants to match the submitted rows.
     *
     * @param  array<int, array<string, mixed>>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        $keptIds = [];

        foreach ($variants as $position => $variant) {
            $attributes = [
                'name' => $variant['name'],
                'sku' => blank($variant['sku'] ?? null) ? null : $variant['sku'],
                'price' => (int) round($variant['price'] * 100),
                'compare_at_price' => blank($variant['compare_at_price'] ?? null)
                    ? null
                    : (int) round($variant['compare_at_price'] * 100),
                'stock' => $variant['stock'],
                'position' => $position,
            ];

            $model = isset($variant['id'])
                ? tap($product->variants()->whereKey($variant['id'])->firstOrFail())
                    ->update($attributes)
                : $product->variants()->create($attributes);

            $keptIds[] = $model->id;
        }

        $product->variants()->whereKeyNot($keptIds)->delete();
    }

    /**
     * Build a slug that is not already taken, including by trashed products.
     */
    private function uniqueSlug(string $base): string
    {
        $slug = "{$base}-copy";
        $suffix = 2;

        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-copy-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function categoryOptions(): array
    {
        return Category::orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'value' => $category->id,
                'label' => $category->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return collect(ProductStatus::cases())
            ->map(fn (ProductStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])
            ->all();
    }
}
