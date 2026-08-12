<?php

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

test('a product belongs to a category and has ordered variants', function () {
    $product = Product::factory()
        ->for(Category::factory()->create(['name' => 'Prints']))
        ->create();

    ProductVariant::factory()->for($product)->create(['name' => 'A3', 'position' => 1]);
    ProductVariant::factory()->for($product)->create(['name' => 'A5', 'position' => 0]);

    expect($product->category->name)->toBe('Prints')
        ->and($product->variants->pluck('name')->all())->toBe(['A5', 'A3']);
});

test('the active scope only returns active products', function () {
    Product::factory()->active()->create();
    Product::factory()->create();
    Product::factory()->archived()->create();

    expect(Product::active()->count())->toBe(1);
});

test('deleting a product cascades to its variants', function () {
    $product = Product::factory()->has(ProductVariant::factory()->count(3), 'variants')->create();

    $product->forceDelete();

    expect(ProductVariant::count())->toBe(0);
});

test('media attaches to products in position order', function () {
    $product = Product::factory()->create();
    $first = Media::factory()->create();
    $second = Media::factory()->create();

    $product->media()->attach([$second->id => ['position' => 1], $first->id => ['position' => 0]]);

    expect($product->media->pluck('id')->all())->toBe([$first->id, $second->id]);
});

test('media builds a cloudflare transformation url', function () {
    config()->set('filesystems.disks.r2.transform_url', 'https://cdn.elmienda.com');
    $media = Media::factory()->create(['path' => 'products/img-1.jpg', 'disk' => 'r2']);

    expect($media->url(['width' => 600, 'quality' => 80]))
        ->toBe('https://cdn.elmienda.com/cdn-cgi/image/format=auto,width=600,quality=80/products/img-1.jpg');
});

test('users are not admins by default', function () {
    expect(User::factory()->create()->is_admin)->toBeFalse()
        ->and(User::factory()->admin()->create()->is_admin)->toBeTrue();
});

test('the catalog seeder ports the storefront catalog and is idempotent', function () {
    (new CatalogSeeder)->run();
    (new CatalogSeeder)->run();

    expect(Category::count())->toBe(4)
        ->and(Product::count())->toBe(8)
        ->and(Product::where('status', ProductStatus::Active)->count())->toBe(8);

    $print = Product::where('slug', 'floral-art-print')->first();

    expect($print->variants->pluck('name')->all())->toBe(['A5', 'A4', 'A3'])
        ->and($print->variants->firstWhere('name', 'A4')->price)->toBe(35000);
});
