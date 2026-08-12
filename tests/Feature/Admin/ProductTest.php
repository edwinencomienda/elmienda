<?php

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->admin()->create());
});

/**
 * A valid create/update payload.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function productPayload(array $overrides = []): array
{
    return [
        'name' => 'Floral Art Print',
        'slug' => '',
        'description' => 'Hand illustrated.',
        'category_id' => null,
        'status' => 'active',
        'featured' => false,
        'seo_title' => null,
        'seo_description' => null,
        'variants' => [
            ['name' => 'A4', 'sku' => 'FAP-A4', 'price' => 350, 'compare_at_price' => null, 'stock' => 10],
        ],
        ...$overrides,
    ];
}

test('the index lists products with price and variant counts', function () {
    $product = Product::factory()->active()->create(['name' => 'Floral Print']);
    ProductVariant::factory()->for($product)->create(['price' => 35000]);
    ProductVariant::factory()->for($product)->create(['price' => 52000]);

    $this->get(route('admin.products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/index')
            ->where('products.data.0.name', 'Floral Print')
            ->where('products.data.0.variants_count', 2)
            ->where('products.data.0.price_from', 35000));
});

test('the index exposes the main image as a thumbnail', function () {
    $withImage = Product::factory()->create(['name' => 'Floral Print']);
    $main = Media::factory()->create();
    $withImage->media()->attach([
        Media::factory()->create()->id => ['position' => 1],
        $main->id => ['position' => 0],
    ]);
    Product::factory()->create(['name' => 'No Image']);

    // The index lists newest first within the same position.
    $this->get(route('admin.products.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.name', 'No Image')
            ->where('products.data.0.thumb', null)
            ->where('products.data.1.name', 'Floral Print')
            ->where('products.data.1.thumb', $main->url(['width' => 80, 'quality' => 75])));
});

test('the index filters by search, status and category', function () {
    $category = Category::factory()->create();
    Product::factory()->active()->for($category)->create(['name' => 'Floral Print']);
    Product::factory()->create(['name' => 'Sticker Pack']);

    $this->get(route('admin.products.index', ['search' => 'Floral']))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));

    $this->get(route('admin.products.index', ['status' => 'draft']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Sticker Pack'));

    $this->get(route('admin.products.index', ['category' => $category->id]))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));
});

test('a product is created with variants priced in centavos', function () {
    $this->post(route('admin.products.store'), productPayload())
        ->assertRedirect();

    $product = Product::firstOrFail();

    expect($product->slug)->toBe('floral-art-print')
        ->and($product->status)->toBe(ProductStatus::Active)
        ->and($product->variants)->toHaveCount(1)
        ->and($product->variants->first()->price)->toBe(35000);
});

test('decimal prices survive the round trip', function () {
    $this->post(route('admin.products.store'), productPayload([
        'variants' => [
            ['name' => 'A4', 'sku' => null, 'price' => '349.99', 'compare_at_price' => '499.50', 'stock' => 1],
        ],
    ]))->assertRedirect();

    $variant = ProductVariant::firstOrFail();

    expect($variant->price)->toBe(34999)
        ->and($variant->compare_at_price)->toBe(49950);
});

test('a product needs at least one variant', function () {
    $this->post(route('admin.products.store'), productPayload(['variants' => []]))
        ->assertSessionHasErrors('variants');

    expect(Product::count())->toBe(0);
});

test('updating syncs variants: adds, edits and removes', function () {
    $product = Product::factory()->create();
    $kept = ProductVariant::factory()->for($product)->create(['name' => 'A4', 'price' => 30000]);
    $removed = ProductVariant::factory()->for($product)->create(['name' => 'A3']);

    $this->put(route('admin.products.update', $product), productPayload([
        'name' => $product->name,
        'slug' => $product->slug,
        'variants' => [
            ['id' => $kept->id, 'name' => 'A4', 'sku' => null, 'price' => 400, 'compare_at_price' => null, 'stock' => 5],
            ['name' => 'A2', 'sku' => null, 'price' => 900, 'compare_at_price' => null, 'stock' => 2],
        ],
    ]))->assertRedirect();

    expect($product->refresh()->variants->pluck('name')->all())->toBe(['A4', 'A2'])
        ->and($kept->refresh()->price)->toBe(40000)
        ->and(ProductVariant::whereKey($removed->id)->exists())->toBeFalse();
});

test('duplicate SKUs are rejected', function () {
    ProductVariant::factory()->create(['sku' => 'TAKEN']);

    $this->post(route('admin.products.store'), productPayload([
        'variants' => [
            ['name' => 'A4', 'sku' => 'TAKEN', 'price' => 350, 'compare_at_price' => null, 'stock' => 1],
        ],
    ]))->assertSessionHasErrors('variants.0.sku');

    $this->post(route('admin.products.store'), productPayload([
        'variants' => [
            ['name' => 'A4', 'sku' => 'DUP', 'price' => 350, 'compare_at_price' => null, 'stock' => 1],
            ['name' => 'A3', 'sku' => 'DUP', 'price' => 450, 'compare_at_price' => null, 'stock' => 1],
        ],
    ]))->assertSessionHasErrors('variants.1.sku');
});

test('slugs stay unique across products including trashed ones', function () {
    Product::factory()->create(['slug' => 'floral-art-print'])->delete();

    $this->post(route('admin.products.store'), productPayload())
        ->assertSessionHasErrors('slug');
});

test('a product can be duplicated as a draft without SKUs', function () {
    $product = Product::factory()->active()->create(['name' => 'Floral Print', 'slug' => 'floral-print']);
    ProductVariant::factory()->for($product)->create(['sku' => 'FAP-A4']);

    $this->post(route('admin.products.duplicate', $product))->assertRedirect();

    $copy = Product::where('slug', 'floral-print-copy')->firstOrFail();

    expect($copy->name)->toBe('Floral Print (copy)')
        ->and($copy->status)->toBe(ProductStatus::Draft)
        ->and($copy->variants)->toHaveCount(1)
        ->and($copy->variants->first()->sku)->toBeNull();
});

test('a product can be deleted', function () {
    $product = Product::factory()->create();

    $this->delete(route('admin.products.destroy', $product))
        ->assertRedirect(route('admin.products.index'));

    expect(Product::count())->toBe(0)
        ->and(Product::withTrashed()->count())->toBe(1);
});

test('the edit form exposes prices in pesos', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->create(['price' => 34999]);

    $this->get(route('admin.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/form')
            ->where('product.variants.0.price', 349.99));
});

test('non-admins cannot touch products', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('admin.products.index'))->assertForbidden();
    $this->post(route('admin.products.store'), productPayload())->assertForbidden();
});
