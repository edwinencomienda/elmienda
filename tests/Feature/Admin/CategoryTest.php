<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->admin()->create());
});

test('the index lists categories with their product counts', function () {
    $category = Category::factory()->create(['name' => 'Prints']);
    Product::factory()->count(2)->for($category)->create();

    $this->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/index')
            ->has('categories', 1)
            ->where('categories.0.name', 'Prints')
            ->where('categories.0.products_count', 2));
});

test('a category can be created with a generated slug', function () {
    $this->post(route('admin.categories.store'), [
        'name' => 'Greeting Cards',
        'slug' => '',
        'description' => 'Cards for every occasion.',
    ])->assertRedirect();

    expect(Category::where('slug', 'greeting-cards')->exists())->toBeTrue();
});

test('a category can be updated', function () {
    $category = Category::factory()->create(['name' => 'Prints']);

    $this->put(route('admin.categories.update', $category), [
        'name' => 'Art Prints',
        'slug' => 'art-prints',
    ])->assertRedirect();

    expect($category->refresh()->name)->toBe('Art Prints');
});

test('slugs stay unique across categories', function () {
    Category::factory()->create(['slug' => 'prints']);

    $this->post(route('admin.categories.store'), ['name' => 'Prints'])
        ->assertSessionHasErrors('slug');
});

test('deleting a category keeps its products', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->for($category)->create();

    $this->delete(route('admin.categories.destroy', $category))->assertRedirect();

    expect(Category::count())->toBe(0)
        ->and($product->refresh()->category_id)->toBeNull();
});

test('categories can be reordered', function () {
    $first = Category::factory()->create(['position' => 0]);
    $second = Category::factory()->create(['position' => 1]);

    $this->post(route('admin.categories.reorder'), [
        'ids' => [$second->id, $first->id],
    ])->assertRedirect();

    expect($second->refresh()->position)->toBe(0)
        ->and($first->refresh()->position)->toBe(1);
});

test('non-admins cannot touch categories', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('admin.categories.index'))->assertForbidden();
    $this->post(route('admin.categories.store'), ['name' => 'Nope'])->assertForbidden();
});
