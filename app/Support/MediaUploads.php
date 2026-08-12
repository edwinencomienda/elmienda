<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Shared rules for accepting media, so the presigned-upload path and the
 * fallback direct-upload path cannot drift apart.
 */
class MediaUploads
{
    /**
     * The image types the media library accepts.
     *
     * @var list<string>
     */
    public const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/gif',
    ];

    /**
     * 20 MB, comfortably above any product photo.
     */
    public const MAX_BYTES = 20971520;

    /**
     * The disk media is stored on: R2 when configured, the local public disk
     * otherwise, so development works before the bucket exists.
     */
    public static function disk(): string
    {
        return self::supportsPresignedUploads() ? 'r2' : 'public';
    }

    /**
     * Whether the browser can upload straight to storage.
     */
    public static function supportsPresignedUploads(): bool
    {
        return filled(config('filesystems.disks.r2.bucket'))
            && filled(config('filesystems.disks.r2.key'));
    }

    /**
     * Build the object key. Generated server-side so a client cannot overwrite
     * an existing object or escape the products/ prefix.
     */
    public static function generatePath(string $filename): string
    {
        $extension = Str::lower(pathinfo($filename, PATHINFO_EXTENSION));

        return 'products/'.Str::uuid().($extension ? ".{$extension}" : '');
    }
}
