<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\MediaUploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    /**
     * Show the media library.
     */
    public function index(): Response
    {
        return Inertia::render('admin/media/index', [
            'media' => Media::query()
                ->withCount('products')
                ->latest()
                ->paginate(48)
                ->through(fn (Media $media) => $this->present($media)),
            'supportsPresignedUploads' => MediaUploads::supportsPresignedUploads(),
        ]);
    }

    /**
     * The media library as plain JSON, for the picker on the product form.
     * Inertia only speaks its page protocol to requests carrying X-Inertia, so
     * callers using fetch need an endpoint of their own.
     */
    public function list(): JsonResponse
    {
        return response()->json([
            'items' => Media::query()
                ->withCount('products')
                ->latest()
                ->limit(200)
                ->get()
                ->map(fn (Media $media) => $this->present($media)),
            'supportsPresignedUploads' => MediaUploads::supportsPresignedUploads(),
        ]);
    }

    /**
     * Record an image. Accepts either a file uploaded through PHP, or the path
     * of an object the browser already PUT straight to storage.
     *
     * Returns JSON to fetch callers so uploading from the product form does not
     * trigger an Inertia visit that would discard unsaved edits.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'file' => [
                Rule::requiredIf(fn () => blank($request->input('path'))),
                'image',
                'mimetypes:'.implode(',', MediaUploads::ALLOWED_MIME_TYPES),
                'max:'.(MediaUploads::MAX_BYTES / 1024),
            ],
            'path' => ['nullable', 'string', 'starts_with:products/', 'max:255'],
            'filename' => ['nullable', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'width' => ['nullable', 'integer', 'min:1'],
            'height' => ['nullable', 'integer', 'min:1'],
        ]);

        $disk = MediaUploads::disk();

        if ($file = $request->file('file')) {
            $path = MediaUploads::generatePath($file->getClientOriginalName());
            Storage::disk($disk)->putFileAs('', $file, $path);

            $attributes = [
                'path' => $path,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ];
        } else {
            // The object is already in the bucket; trust only its key and
            // confirm it actually landed there.
            abort_unless(Storage::disk($disk)->exists($validated['path']), 422);

            $attributes = [
                'path' => $validated['path'],
                'filename' => $validated['filename'] ?? basename($validated['path']),
                'mime_type' => Storage::disk($disk)->mimeType($validated['path']) ?: null,
                'size' => Storage::disk($disk)->size($validated['path']),
            ];
        }

        $media = Media::create([
            ...$attributes,
            'disk' => $disk,
            'alt' => $validated['alt'] ?? null,
            'width' => $validated['width'] ?? null,
            'height' => $validated['height'] ?? null,
            'uploaded_by' => $request->user()->id,
        ]);

        if ($request->expectsJson()) {
            return response()->json($this->present($media->loadCount('products')), 201);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Image uploaded.')]);

        return back();
    }

    /**
     * Update an image's alt text.
     */
    public function update(Request $request, Media $media): RedirectResponse
    {
        $media->update($request->validate([
            'alt' => ['nullable', 'string', 'max:255'],
        ]));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Image updated.')]);

        return back();
    }

    /**
     * Delete an image and the object behind it.
     */
    public function destroy(Media $media): RedirectResponse
    {
        // A failed remote delete only orphans a cheap object, so it must not
        // take the request down with it.
        Storage::disk($media->disk)->delete($media->path);

        $media->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Image deleted.')]);

        return back();
    }

    /**
     * Shape a media row for the front end.
     *
     * @return array<string, mixed>
     */
    private function present(Media $media): array
    {
        return [
            'id' => $media->id,
            'filename' => $media->filename,
            'alt' => $media->alt,
            'size' => $media->size,
            'products_count' => $media->products_count,
            'thumb' => $media->url(['width' => 300, 'quality' => 80]),
            'url' => $media->url(['width' => 1200, 'quality' => 85]),
        ];
    }
}
