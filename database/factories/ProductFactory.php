<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'status' => ProductStatus::Draft,
            'featured' => false,
            'position' => 0,
        ];
    }

    /**
     * Indicate that the product is visible on the storefront.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProductStatus::Active,
        ]);
    }

    /**
     * Indicate that the product is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProductStatus::Archived,
        ]);
    }
}
