import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MediaDropzone } from '@/components/admin/media-dropzone';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes/admin';
import mediaRoutes from '@/routes/admin/media';
import type { MediaItem } from '@/types/media';

type Props = {
    media: {
        data: MediaItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    supportsPresignedUploads: boolean;
};

export default function MediaIndex({ media, supportsPresignedUploads }: Props) {
    const [editing, setEditing] = useState<MediaItem | null>(null);
    const [deleting, setDeleting] = useState<MediaItem | null>(null);

    return (
        <>
            <Head title="Media" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Media"
                    description={`${media.total} image(s). Used across your products.`}
                />

                {!supportsPresignedUploads && (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                        R2 is not configured, so uploads are being stored
                        locally and go through PHP. Fill in the R2 keys in{' '}
                        <code>.env</code> to upload straight to the bucket.
                    </p>
                )}

                <MediaDropzone
                    supportsPresignedUploads={supportsPresignedUploads}
                    onUploaded={() => router.reload({ only: ['media'] })}
                />

                {media.data.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        No images yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {media.data.map((item) => (
                            <figure
                                key={item.id}
                                className="group relative overflow-hidden rounded-xl border"
                            >
                                <img
                                    src={item.thumb}
                                    alt={item.alt ?? ''}
                                    loading="lazy"
                                    className="aspect-square w-full cursor-pointer bg-muted object-cover"
                                    onClick={() => setEditing(item)}
                                />
                                <figcaption className="flex items-center justify-between gap-2 p-2 text-xs">
                                    <span className="truncate">
                                        {item.filename}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0"
                                        aria-label={`Delete ${item.filename}`}
                                        onClick={() => setDeleting(item)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                )}

                {media.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {media.links.map((link) => (
                            <Button
                                key={link.label}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {editing && (
                <AltTextDialog
                    key={editing.id}
                    item={editing}
                    onClose={() => setEditing(null)}
                />
            )}

            <AlertDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete “{deleting?.filename}”?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleting?.products_count
                                ? `This image is used by ${deleting.products_count} product(s) and will disappear from them.`
                                : 'This image is not used by any product.'}{' '}
                            The file is removed from storage too.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleting) {
                                    router.delete(
                                        mediaRoutes.destroy(deleting.id).url,
                                        { preserveScroll: true },
                                    );
                                }

                                setDeleting(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function AltTextDialog({
    item,
    onClose,
}: {
    item: MediaItem;
    onClose: () => void;
}) {
    const { data, setData, put, processing, errors } = useForm({
        alt: item.alt ?? '',
    });

    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{item.filename}</DialogTitle>
                </DialogHeader>

                <img
                    src={item.url}
                    alt={item.alt ?? ''}
                    className="max-h-80 w-full rounded-lg bg-muted object-contain"
                />

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(mediaRoutes.update(item.id).url, {
                            preserveScroll: true,
                            onSuccess: onClose,
                        });
                    }}
                    className="grid gap-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="alt">Alt text</Label>
                        <Input
                            id="alt"
                            value={data.alt}
                            onChange={(event) =>
                                setData('alt', event.target.value)
                            }
                            placeholder="Describe the image for screen readers"
                        />
                        <InputError message={errors.alt} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

MediaIndex.layout = {
    breadcrumbs: [
        { title: 'Store admin', href: dashboard() },
        { title: 'Media', href: mediaRoutes.index() },
    ],
};
