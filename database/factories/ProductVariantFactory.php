<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => fake()->randomElement(['A5', 'A4', 'A3', 'Default']),
            'sku' => Str::upper(Str::random(8)),
            'price' => fake()->numberBetween(15000, 150000),
            'compare_at_price' => null,
            'stock' => fake()->numberBetween(0, 50),
            'position' => 0,
        ];
    }

    /**
     * Indicate that the variant is sold out.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => 0,
        ]);
    }
}
