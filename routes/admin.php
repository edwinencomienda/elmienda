<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MediaUploadController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SetupController;
use Illuminate\Support\Facades\Route;

/*
 * Store management. The first-run setup claims the store; every account after
 * that is created by an administrator from /admin/users.
 */
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('setup.incomplete')->group(function () {
        Route::get('setup', [SetupController::class, 'create'])->name('setup');
        Route::post('setup', [SetupController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('setup.store');
    });

    Route::middleware(['auth', 'verified', 'admin'])->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::post('categories/reorder', [CategoryController::class, 'reorder'])
            ->name('categories.reorder');
        Route::resource('categories', CategoryController::class)
            ->except(['create', 'show', 'edit']);

        Route::post('media/upload-url', MediaUploadController::class)->name('media.upload-url');
        Route::get('media/list', [MediaController::class, 'list'])->name('media.list');
        Route::resource('media', MediaController::class)
            ->except(['create', 'show', 'edit'])
            ->parameters(['media' => 'media']);

        Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate'])
            ->name('products.duplicate');
        Route::resource('products', ProductController::class)->except('show');
    });
});
