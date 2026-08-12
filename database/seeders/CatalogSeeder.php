<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds the catalog that the storefront currently hard-codes in
 * resources/js/data/products.ts, so the admin has real data to manage.
 *
 * Images are not seeded: media lives in Cloudflare Images and has to be
 * uploaded through the admin media library.
 */
class CatalogSeeder extends Seeder
{
    /**
     * Prints are sold in three sizes; everything else has a single variant.
     *
     * @var list<array{name: string, category: string, price: int}>
     */
    private const PRODUCTS = [
        ['name' => 'Floral Art Print', 'category' => 'Prints', 'price' => 350],
        ['name' => 'Sticker Pack — Pastels', 'category' => 'Stickers', 'price' => 180],
        ['name' => 'Greeting Card Set', 'category' => 'Cards', 'price' => 250],
        ['name' => 'Canvas Tote Bag', 'category' => 'Gifts', 'price' => 480],
        ['name' => 'Botanical Print A4', 'category' => 'Prints', 'price' => 320],
        ['name' => 'Macramé Keychain', 'category' => 'Gifts', 'price' => 150],
        ['name' => 'Mini Notebook', 'category' => 'Gifts', 'price' => 220],
        ['name' => 'Custom Name Print', 'category' => 'Prints', 'price' => 400],
    ];

    /**
     * Multipliers applied to the base price for each print size.
     *
     * @var array<string, float>
     */
    private const PRINT_SIZES = ['A5' => 0.8, 'A4' => 1.0, 'A3' => 1.5];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = collect(['Prints', 'Stickers', 'Cards', 'Gifts'])
            ->mapWithKeys(fn (string $name, int $index) => [
                $name => Category::firstOrCreate(
                    ['slug' => Str::slug($name)],
                    ['name' => $name, 'position' => $index],
                ),
            ]);

        foreach (self::PRODUCTS as $position => $definition) {
            $product = Product::firstOrCreate(
                ['slug' => Str::slug($definition['name'])],
                [
                    'category_id' => $categories[$definition['category']]->id,
                    'name' => $definition['name'],
                    'description' => 'Handmade in small batches in Manila, printed and packed by hand.',
                    'status' => ProductStatus::Active,
                    'featured' => $position === 0,
                    'position' => $position,
                ],
            );

            if ($product->variants()->exists()) {
                continue;
            }

            $variants = $definition['category'] === 'Prints'
                ? collect(self::PRINT_SIZES)->map(fn (float $multiplier, string $size) => [
                    'name' => $size,
                    'price' => (int) round($definition['price'] * $multiplier) * 100,
                ])->values()->all()
                : [['name' => 'Default', 'price' => $definition['price'] * 100]];

            foreach ($variants as $index => $variant) {
                $product->variants()->create([
                    ...$variant,
                    'sku' => Str::upper(Str::slug($product->slug).'-'.$index),
                    'stock' => 25,
                    'position' => $index,
                ]);
            }
        }
    }
}
