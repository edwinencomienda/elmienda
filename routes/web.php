<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'store/shop')->name('home');
Route::inertia('/hero', 'store/home')->name('store.hero');
Route::inertia('/product', 'store/product')->name('store.product');
Route::inertia('/cart', 'store/cart')->name('store.cart');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
