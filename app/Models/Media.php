<?php

namespace App\Models;

use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $path
 * @property string $disk
 * @property string $filename
 * @property string|null $mime_type
 * @property string|null $alt
 * @property int|null $width
 * @property int|null $height
 * @property int|null $size
 * @property int|null $uploaded_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'path',
    'disk',
    'filename',
    'mime_type',
    'alt',
    'width',
    'height',
    'size',
    'uploaded_by',
])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    protected $table = 'media';

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * @return MorphToMany<Product, $this>
     */
    public function products(): MorphToMany
    {
        return $this->morphedByMany(Product::class, 'mediable');
    }

    /**
     * The untransformed object URL on the bucket's public domain.
     */
    public function originalUrl(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    /**
     * A resized, reformatted URL served by Cloudflare image transformations.
     *
     * Options follow Cloudflare's syntax, e.g. ['width' => 600, 'quality' => 80].
     * Falls back to the original object when no transform host is configured,
     * so local development works without a Cloudflare zone.
     *
     * @param  array<string, int|string>  $options
     */
    public function url(array $options = []): string
    {
        $host = config("filesystems.disks.{$this->disk}.transform_url");

        if (blank($host) || $options === []) {
            return $this->originalUrl();
        }

        $params = collect(['format' => 'auto', ...$options])
            ->map(fn (int|string $value, string $key) => "{$key}={$value}")
            ->implode(',');

        return rtrim($host, '/')."/cdn-cgi/image/{$params}/".ltrim($this->path, '/');
    }
}
