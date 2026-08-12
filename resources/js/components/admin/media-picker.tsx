import { ImagePlus, X } from 'lucide-react';
import { useState } from 'react';
import { MediaDropzone } from '@/components/admin/media-dropzone';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import mediaRoutes from '@/routes/admin/media';
import type { MediaItem } from '@/types/media';

type Props = {
    selected: MediaItem[];
    onChange: (media: MediaItem[]) => void;
};

type Library = {
    items: MediaItem[];
    supportsPresignedUploads: boolean;
};

/**
 * Read the media library over Inertia's JSON endpoint. Called from click
 * handlers rather than an effect so opening the dialog does not cascade
 * renders.
 */
async function fetchLibrary(): Promise<Library> {
    try {
        const response = await fetch(mediaRoutes.list().url, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            return { items: [], supportsPresignedUploads: false };
        }

        const data = await response.json();

        return {
            items: data.items ?? [],
            supportsPresignedUploads: data.supportsPresignedUploads ?? false,
        };
    } catch {
        return { items: [], supportsPresignedUploads: false };
    }
}

/**
 * Shows the images attached to a product and opens the library to add more.
 * The first image is the one the storefront uses as the thumbnail.
 */
export function MediaPicker({ selected, onChange }: Props) {
    const [library, setLibrary] = useState<Library | null>(null);

    return (
        <div className="grid gap-3">
            {selected.length > 0 && (
                <ul className="grid grid-cols-3 gap-2">
                    {selected.map((item, index) => (
                        <li
                            key={item.id}
                            className="group relative overflow-hidden rounded-lg border"
                        >
                            <img
                                src={item.thumb}
                                alt={item.alt ?? ''}
                                className="aspect-square w-full bg-muted object-cover"
                            />
                            {index === 0 && (
                                <span className="absolute top-1 left-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                                    Main
                                </span>
                            )}
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                aria-label={`Remove ${item.filename}`}
                                className="absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                onClick={() =>
                                    onChange(
                                        selected.filter(
                                            (current) => current.id !== item.id,
                                        ),
                                    )
                                }
                            >
                                <X className="size-3" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={async () => setLibrary(await fetchLibrary())}
            >
                <ImagePlus />
                {selected.length > 0 ? 'Manage images' : 'Add images'}
            </Button>

            {library && (
                <MediaLibraryDialog
                    initialLibrary={library}
                    onClose={() => setLibrary(null)}
                    selected={selected}
                    onChange={onChange}
                />
            )}
        </div>
    );
}

function MediaLibraryDialog({
    initialLibrary,
    onClose,
    selected,
    onChange,
}: Props & {
    initialLibrary: Library;
    onClose: () => void;
}) {
    const [library, setLibrary] = useState<Library>(initialLibrary);
    const [draft, setDraft] = useState<MediaItem[]>(selected);

    // Newly uploaded images go straight into the grid and into the selection,
    // which is almost always what someone uploading from here wants.
    const handleUploaded = (items: MediaItem[]) => {
        setLibrary((current) => ({
            ...current,
            items: [...items, ...current.items],
        }));
        setDraft((current) => [...current, ...items]);
    };

    const toggle = (item: MediaItem) => {
        setDraft((current) =>
            current.some((entry) => entry.id === item.id)
                ? current.filter((entry) => entry.id !== item.id)
                : [...current, item],
        );
    };

    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Product images</DialogTitle>
                    <DialogDescription>
                        Pick from your library, or drop new files to upload. The
                        first selected image is the main one.
                    </DialogDescription>
                </DialogHeader>

                <MediaDropzone
                    supportsPresignedUploads={library.supportsPresignedUploads}
                    onUploaded={handleUploaded}
                    className="py-6"
                />

                <div className="max-h-80 overflow-y-auto">
                    {library.items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No images yet. Upload some above.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-4 gap-2">
                            {library.items.map((item) => {
                                const position = draft.findIndex(
                                    (entry) => entry.id === item.id,
                                );

                                return (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(item)}
                                            className={cn(
                                                'relative w-full overflow-hidden rounded-lg border-2 transition-colors',
                                                position === -1
                                                    ? 'border-transparent hover:border-muted-foreground/40'
                                                    : 'border-primary',
                                            )}
                                        >
                                            <img
                                                src={item.thumb}
                                                alt={item.alt ?? ''}
                                                loading="lazy"
                                                className="aspect-square w-full bg-muted object-cover"
                                            />
                                            {position !== -1 && (
                                                <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                                    {position + 1}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onChange(draft);
                            onClose();
                        }}
                    >
                        Use {draft.length} image{draft.length === 1 ? '' : 's'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
