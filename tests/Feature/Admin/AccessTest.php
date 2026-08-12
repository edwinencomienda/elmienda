<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the admin redirects to setup while the store is unclaimed', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('admin.setup'));
});

test('guests are sent to login once the store is claimed', function () {
    User::factory()->admin()->create();

    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('non-admin users are forbidden from the admin', function () {
    $this->actingAs(User::factory()->create());
    User::factory()->admin()->create();

    $this->get(route('admin.dashboard'))->assertForbidden();
});

test('admins see catalog stats and low stock', function () {
    $this->actingAs(User::factory()->admin()->create());

    $product = Product::factory()->active()->create(['name' => 'Floral Print']);
    ProductVariant::factory()->for($product)->create(['name' => 'A4', 'stock' => 2]);
    ProductVariant::factory()->for($product)->create(['name' => 'A3', 'stock' => 40]);

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('stats.products', 1)
            ->where('stats.active', 1)
            ->has('lowStock', 1)
            ->where('lowStock.0.name', 'A4'));
});

test('public registration is disabled', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register', [
        'name' => 'Interloper',
        'email' => 'nope@example.com',
        'password' => 'correct-horse-battery',
        'password_confirmation' => 'correct-horse-battery',
    ])->assertNotFound();

    expect(User::where('email', 'nope@example.com')->exists())->toBeFalse();
});
