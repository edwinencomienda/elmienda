<?php

use Illuminate\Support\Facades\Route;

/*
 * Per-page SEO. These are rendered into the document head server-side by
 * resources/views/app.blade.php (so crawlers see them without running JS) and
 * re-applied on client-side navigation by the <Seo> React component.
 */
Route::inertia('/', 'store/shop', ['seo' => [
    'title' => 'Handmade Prints & Crafts',
    'description' => 'Elmienda makes handmade prints, stickers, cards and gifts in small batches in Manila. Shop original art prints and craft pieces, packed by hand.',
]])->name('home');

Route::inertia('/hero', 'store/home', ['seo' => [
    'title' => 'Welcome',
    'description' => 'Handmade prints and crafts from Elmienda, made with love in small batches.',
]])->name('store.hero');

Route::inertia('/product', 'store/product', ['seo' => [
    'title' => 'Floral Art Print',
    'description' => 'A hand-illustrated floral art print on 250gsm acid-free matte paper, printed and packed by hand. Available in A5, A4 and A3, framed or unframed.',
    'type' => 'product',
]])->name('store.product');

Route::inertia('/cart', 'store/cart', ['seo' => [
    'title' => 'Your Cart',
    'description' => 'Review the handmade prints and crafts in your Elmienda cart before checking out.',
    'robots' => 'noindex, follow',
]])->name('store.cart');

Route::inertia('/contact', 'store/contact', ['seo' => [
    'title' => 'Contact',
    'description' => 'Get in touch with Elmienda about orders, custom prints, wholesale or anything else. We reply within one to two business days.',
]])->name('store.contact');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
