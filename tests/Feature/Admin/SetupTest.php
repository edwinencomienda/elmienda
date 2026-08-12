<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the setup screen is reachable while the store has no admin', function () {
    $this->get(route('admin.setup'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/setup'));
});

test('the first user becomes a verified admin and lands in the admin', function () {
    $response = $this->post(route('admin.setup.store'), [
        'name' => 'Elmienda Owner',
        'email' => 'owner@example.com',
        'password' => 'correct-horse-battery',
        'password_confirmation' => 'correct-horse-battery',
    ]);

    $response->assertRedirect(route('admin.dashboard'));

    $user = User::where('email', 'owner@example.com')->firstOrFail();

    expect($user->is_admin)->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull();

    $this->assertAuthenticatedAs($user);
});

test('setup 404s once an admin exists', function () {
    User::factory()->admin()->create();

    $this->get(route('admin.setup'))->assertNotFound();

    $this->post(route('admin.setup.store'), [
        'name' => 'Interloper',
        'email' => 'nope@example.com',
        'password' => 'correct-horse-battery',
        'password_confirmation' => 'correct-horse-battery',
    ])->assertNotFound();

    expect(User::where('email', 'nope@example.com')->exists())->toBeFalse();
});

test('a non-admin account does not unlock the store', function () {
    User::factory()->create();

    $this->get(route('admin.setup'))->assertOk();
});

test('setup validates its input', function () {
    $this->post(route('admin.setup.store'), [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'short',
        'password_confirmation' => 'mismatch',
    ])->assertSessionHasErrors(['name', 'email', 'password']);

    expect(User::count())->toBe(0);
});
