<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProductRequest extends FormRequest
{
    /**
     * Fall back to a slug derived from the name so the field is optional.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->input('slug') ?: $this->input('name', '')),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        // The route parameter is only a Product on update; on store it is absent.
        $route = $this->route('product');
        $productId = $route instanceof Product ? $route->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Product::class)->ignore($productId),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'featured' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],

            // Attached images, in display order.
            'media' => ['array'],
            'media.*' => ['integer', 'exists:media,id'],

            // A product is not sellable without at least one priced variant.
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => [
                'nullable',
                'integer',
                Rule::exists(ProductVariant::class, 'id')
                    ->where('product_id', $productId ?? 0),
            ],
            'variants.*.name' => ['required', 'string', 'max:255'],
            'variants.*.sku' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'variants.*.compare_at_price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * SKUs are unique across the whole catalog, which array rules cannot
     * express on their own: check the payload against itself and the database.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $seen = [];

            foreach ($this->input('variants', []) as $index => $variant) {
                $sku = $variant['sku'] ?? null;

                if (blank($sku)) {
                    continue;
                }

                if (in_array($sku, $seen, strict: true)) {
                    $validator->errors()->add("variants.{$index}.sku", 'This SKU is used twice on this product.');

                    continue;
                }

                $seen[] = $sku;

                $taken = ProductVariant::where('sku', $sku)
                    ->when($variant['id'] ?? null, fn ($query, $id) => $query->whereKeyNot($id))
                    ->exists();

                if ($taken) {
                    $validator->errors()->add("variants.{$index}.sku", 'This SKU is already used by another product.');
                }
            }
        }];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'variants.required' => 'Add at least one variant so the product has a price.',
            'variants.min' => 'Add at least one variant so the product has a price.',
        ];
    }
}
