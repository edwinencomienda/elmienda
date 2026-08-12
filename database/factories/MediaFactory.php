<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'path' => 'products/'.Str::uuid().'.jpg',
            'disk' => 'r2',
            'filename' => fake()->word().'.jpg',
            'mime_type' => 'image/jpeg',
            'alt' => fake()->sentence(4),
            'width' => 1200,
            'height' => 1200,
            'size' => fake()->numberBetween(50_000, 2_000_000),
            'uploaded_by' => null,
        ];
    }
}
