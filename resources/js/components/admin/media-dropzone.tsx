import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { ACCEPTED_IMAGE_TYPES, useMediaUpload } from '@/hooks/use-media-upload';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types/media';

type Props = {
    supportsPresignedUploads: boolean;
    /** Receives the newly created records once a batch finishes. */
    onUploaded?: (items: MediaItem[]) => void;
    className?: string;
};

export function MediaDropzone({
    supportsPresignedUploads,
    onUploaded,
    className,
}: Props) {
    const { upload: uploadFiles, uploading } = useMediaUpload(
        supportsPresignedUploads,
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);

    const upload = async (files: FileList | File[]) => {
        const uploaded = await uploadFiles(files);

        if (uploaded.length > 0) {
            onUploaded?.(uploaded);
        }
    };

    return (
        <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
                event.preventDefault();
                setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(event) => {
                event.preventDefault();
                setOver(false);
                void upload(event.dataTransfer.files);
            }}
            className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-sm transition-colors',
                over
                    ? 'border-primary bg-primary/5'
                    : 'text-muted-foreground hover:border-primary/60 hover:bg-muted/40',
                className,
            )}
        >
            {uploading > 0 ? (
                <>
                    <Spinner />
                    <span>
                        Uploading {uploading} image{uploading > 1 ? 's' : ''}…
                    </span>
                </>
            ) : (
                <>
                    <Upload className="size-5" />
                    <span>
                        Drop images here, or click to choose. JPG, PNG, WebP,
                        AVIF or GIF up to 20MB.
                    </span>
                </>
            )}

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={(event) => {
                    if (event.target.files) {
                        void upload(event.target.files);
                    }

                    event.target.value = '';
                }}
            />
        </button>
    );
}
