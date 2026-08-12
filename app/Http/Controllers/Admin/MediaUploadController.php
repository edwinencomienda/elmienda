<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\MediaUploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Hands the browser a short-lived presigned PUT URL so image bytes go straight
 * to R2. Nothing large passes through PHP, which sidesteps upload size limits
 * and request timeouts.
 */
class MediaUploadController extends Controller
{
    /**
     * How long the browser has to start the upload.
     */
    private const URL_LIFETIME_MINUTES = 10;

    /**
     * Issue a presigned upload URL for one file.
     */
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless(MediaUploads::supportsPresignedUploads(), 409, 'Direct uploads are not configured.');

        $validated = $request->validate([
            'filename' => ['required', 'string', 'max:255'],
            'mime_type' => ['required', 'string', 'in:'.implode(',', MediaUploads::ALLOWED_MIME_TYPES)],
            'size' => ['required', 'integer', 'min:1', 'max:'.MediaUploads::MAX_BYTES],
        ]);

        $disk = MediaUploads::disk();
        $path = MediaUploads::generatePath($validated['filename']);

        $signed = Storage::disk($disk)->temporaryUploadUrl(
            $path,
            now()->addMinutes(self::URL_LIFETIME_MINUTES),
            ['ContentType' => $validated['mime_type']],
        );

        return response()->json([
            'path' => $path,
            'disk' => $disk,
            'url' => $signed['url'],
            'headers' => $signed['headers'] ?? [],
        ]);
    }
}
