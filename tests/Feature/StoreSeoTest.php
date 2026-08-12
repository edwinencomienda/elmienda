<?php

use Inertia\Testing\AssertableInertia as Assert;

test('store pages render their SEO metadata', function (string $routeName, string $title, bool $isIndexed) {
    $response = $this->get(route($routeName))
        ->assertSuccessful()
        ->assertSee('<title>'.e($title).' - Elmienda</title>', false)
        ->assertSee('data-inertia="description"', false)
        ->assertSee('data-inertia="canonical"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', $title));

    $response->assertSee(
        $isIndexed ? 'content="index, follow"' : 'content="noindex, follow"',
        false,
    );
})->with([
    'shop' => ['home', 'Handmade Prints & Crafts', true],
    'cart' => ['store.cart', 'Your Cart', false],
]);
