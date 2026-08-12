<?php

use App\Models\Media;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->admin()->create());
    Storage::fake('public');
});

test('the library lists images', function () {
    Media::factory()->count(3)->create();

    $this->get(route('admin.media.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/media/index')
            ->has('media.data', 3)
            ->where('supportsPresignedUploads', false));
});

test('the picker reads the library as plain json', function () {
    Media::factory()->count(2)->create();

    $response = $this->getJson(route('admin.media.list'))->assertOk();

    expect($response->json('items'))->toHaveCount(2)
        ->and($response->json('items.0'))->toHaveKeys(['id', 'filename', 'thumb', 'url'])
        ->and($response->json('supportsPresignedUploads'))->toBeFalse();
});

test('uploading returns the created record as json', function () {
    $response = $this->postJson(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('print.jpg', 1200, 800),
    ])->assertCreated();

    expect($response->json())->toHaveKeys(['id', 'filename', 'thumb'])
        ->and($response->json('filename'))->toBe('print.jpg')
        ->and($response->json('id'))->toBe(Media::firstOrFail()->id);
});

test('an image can be uploaded through PHP when R2 is not configured', function () {
    $this->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('print.jpg', 1200, 800),
    ])->assertRedirect();

    $media = Media::firstOrFail();

    expect($media->disk)->toBe('public')
        ->and($media->filename)->toBe('print.jpg')
        ->and($media->path)->toStartWith('products/');

    Storage::disk('public')->assertExists($media->path);
});

test('non-image uploads are rejected', function () {
    $this->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('file');

    expect(Media::count())->toBe(0);
});

test('a presigned upload is recorded only once the object exists', function () {
    $this->post(route('admin.media.store'), [
        'path' => 'products/missing.jpg',
        'filename' => 'missing.jpg',
    ])->assertStatus(422);

    Storage::disk('public')->put('products/real.jpg', 'bytes');

    $this->post(route('admin.media.store'), [
        'path' => 'products/real.jpg',
        'filename' => 'print.jpg',
    ])->assertRedirect();

    expect(Media::where('path', 'products/real.jpg')->exists())->toBeTrue();
});

test('a client cannot write outside the products prefix', function () {
    $this->post(route('admin.media.store'), [
        'path' => '../secrets.env',
        'filename' => 'secrets.env',
    ])->assertSessionHasErrors('path');
});

test('the presigned upload endpoint is unavailable without R2', function () {
    $this->post(route('admin.media.upload-url'), [
        'filename' => 'print.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 1000,
    ])->assertStatus(409);
});

test('alt text can be edited', function () {
    $media = Media::factory()->create(['alt' => null]);

    $this->put(route('admin.media.update', $media), ['alt' => 'A floral print'])
        ->assertRedirect();

    expect($media->refresh()->alt)->toBe('A floral print');
});

test('deleting media removes the stored object', function () {
    Storage::disk('public')->put('products/gone.jpg', 'bytes');
    $media = Media::factory()->create(['path' => 'products/gone.jpg', 'disk' => 'public']);

    $this->delete(route('admin.media.destroy', $media))->assertRedirect();

    expect(Media::count())->toBe(0);
    Storage::disk('public')->assertMissing('products/gone.jpg');
});

test('media attaches to a product in the submitted order', function () {
    $first = Media::factory()->create();
    $second = Media::factory()->create();

    $this->post(route('admin.products.store'), [
        'name' => 'Floral Art Print',
        'slug' => '',
        'status' => 'draft',
        'media' => [$second->id, $first->id],
        'variants' => [
            ['name' => 'A4', 'sku' => null, 'price' => 350, 'compare_at_price' => null, 'stock' => 1],
        ],
    ])->assertRedirect();

    expect(Product::firstOrFail()->media->pluck('id')->all())
        ->toBe([$second->id, $first->id]);
});

test('media urls use cloudflare transformations when a host is configured', function () {
    config()->set('filesystems.disks.r2.transform_url', 'https://cdn.elmienda.com');
    $media = Media::factory()->create(['path' => 'products/abc.jpg', 'disk' => 'r2']);

    expect($media->url(['width' => 600, 'quality' => 80]))
        ->toBe('https://cdn.elmienda.com/cdn-cgi/image/format=auto,width=600,quality=80/products/abc.jpg');
});

test('media urls fall back to the plain object without a transform host', function () {
    config()->set('filesystems.disks.public.transform_url', null);
    $media = Media::factory()->create(['path' => 'products/abc.jpg', 'disk' => 'public']);

    expect($media->url(['width' => 600]))->toBe(Storage::disk('public')->url('products/abc.jpg'));
});

test('non-admins cannot touch media', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('admin.media.index'))->assertForbidden();
    $this->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('print.jpg'),
    ])->assertForbidden();
});
