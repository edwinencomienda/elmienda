import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import media from '@/routes/admin/media';
import type { MediaItem } from '@/types/media';

export const ACCEPTED_IMAGE_TYPES =
    'image/jpeg,image/png,image/webp,image/avif,image/gif';

const MAX_BYTES = 20971520;

type UploadUrl = {
    path: string;
    url: string;
    headers: Record<string, string>;
};

/**
 * Uploads images either straight to R2 with a presigned URL, or through PHP
 * when the bucket is not configured (local development).
 *
 * Everything goes over fetch rather than Inertia's router: uploading from the
 * product form must not navigate, or the unsaved product would be lost.
 */
export function useMediaUpload(supportsPresignedUploads: boolean) {
    const [uploading, setUploading] = useState(0);

    const uploadOne = useCallback(
        async (file: File): Promise<MediaItem | null> => {
            if (file.size > MAX_BYTES) {
                toast.error(`${file.name} is larger than 20MB.`);

                return null;
            }

            const dimensions = await readDimensions(file);

            if (!supportsPresignedUploads) {
                const body = new FormData();
                body.append('file', file);

                if (dimensions.width && dimensions.height) {
                    body.append('width', String(dimensions.width));
                    body.append('height', String(dimensions.height));
                }

                return record(body, file.name);
            }

            const signedResponse = await post(media.uploadUrl().url, {
                filename: file.name,
                mime_type: file.type,
                size: file.size,
            });

            if (!signedResponse?.ok) {
                toast.error(`Could not start the upload for ${file.name}.`);

                return null;
            }

            const signed: UploadUrl = await signedResponse.json();

            const put = await fetch(signed.url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type, ...signed.headers },
                body: file,
            });

            if (!put.ok) {
                toast.error(`Upload failed for ${file.name}.`);

                return null;
            }

            return record(
                { path: signed.path, filename: file.name, ...dimensions },
                file.name,
            );
        },
        [supportsPresignedUploads],
    );

    const upload = useCallback(
        async (files: FileList | File[]): Promise<MediaItem[]> => {
            const list = Array.from(files);

            if (list.length === 0) {
                return [];
            }

            setUploading((count) => count + list.length);

            const uploaded: MediaItem[] = [];

            for (const file of list) {
                try {
                    const item = await uploadOne(file);

                    if (item) {
                        uploaded.push(item);
                    }
                } finally {
                    setUploading((count) => count - 1);
                }
            }

            if (uploaded.length > 0) {
                toast.success(
                    `${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded.`,
                );
            }

            return uploaded;
        },
        [uploadOne],
    );

    return { upload, uploading };
}

/**
 * Save the media row and return it, so callers can show it immediately.
 */
async function record(
    body: FormData | Record<string, unknown>,
    filename: string,
): Promise<MediaItem | null> {
    const response = await post(media.store().url, body);

    if (!response?.ok) {
        toast.error(`Could not save ${filename}.`);

        return null;
    }

    return response.json();
}

async function post(
    url: string,
    body: FormData | Record<string, unknown>,
): Promise<Response | null> {
    const isFormData = body instanceof FormData;

    try {
        return await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': readXsrfToken(),
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            },
            body: isFormData ? body : JSON.stringify(body),
        });
    } catch {
        return null;
    }
}

/**
 * Read the intrinsic size so the catalog can reserve space for the image.
 */
function readDimensions(
    file: File,
): Promise<{ width?: number; height?: number }> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({});
        };
        image.src = url;
    });
}

function readXsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}
