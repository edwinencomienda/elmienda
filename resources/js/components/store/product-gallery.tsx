import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Percent of the gallery width a swipe must cover to advance an image. */
const SWIPE_THRESHOLD = 15;

export function ProductGallery({
    images,
    alt,
}: {
    images: string[];
    alt: string;
}) {
    const [index, setIndex] = useState(0);
    const [drag, setDrag] = useState(0);
    const startX = useRef<number | null>(null);
    const trackWidth = useRef(1);

    const go = (next: number) =>
        setIndex(Math.min(Math.max(next, 0), images.length - 1));

    const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        startX.current = event.touches[0].clientX;
        trackWidth.current = event.currentTarget.clientWidth || 1;
    };

    const onTouchMove = (event: React.TouchEvent) => {
        if (startX.current === null) {
            return;
        }

        const delta =
            ((event.touches[0].clientX - startX.current) / trackWidth.current) *
            100;
        const atEdge =
            (index === 0 && delta > 0) ||
            (index === images.length - 1 && delta < 0);

        // Dampen the pull when there is nothing left to reveal in that direction.
        setDrag(atEdge ? delta / 3 : delta);
    };

    const onTouchEnd = () => {
        if (Math.abs(drag) > SWIPE_THRESHOLD) {
            go(drag < 0 ? index + 1 : index - 1);
        }

        startX.current = null;
        setDrag(0);
    };

    const offset = -index * 100 + drag;

    return (
        <div>
            <div
                className="group relative aspect-square touch-pan-y overflow-hidden rounded-2xl bg-brand/10 ring-1 ring-brand/40 select-none ring-inset"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className={cn(
                        'flex size-full',
                        drag === 0 &&
                            'transition-transform duration-300 ease-out',
                    )}
                    style={{ transform: `translateX(${offset}%)` }}
                >
                    {images.map((image, position) => (
                        <img
                            key={image}
                            src={image}
                            alt={`${alt} — image ${position + 1}`}
                            draggable={false}
                            loading={position === 0 ? 'eager' : 'lazy'}
                            className="size-full shrink-0 object-cover"
                        />
                    ))}
                </div>

                <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => go(index - 1)}
                    disabled={index === 0}
                    className="absolute top-1/2 left-3 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur transition group-hover:opacity-100 disabled:pointer-events-none disabled:group-hover:opacity-30 md:flex"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                </button>
                <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => go(index + 1)}
                    disabled={index === images.length - 1}
                    className="absolute top-1/2 right-3 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur transition group-hover:opacity-100 disabled:pointer-events-none disabled:group-hover:opacity-30 md:flex"
                >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </button>

                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
                    {images.map((image, position) => (
                        <span
                            key={image}
                            className={cn(
                                'h-1.5 rounded-full bg-foreground/30 transition-all',
                                position === index
                                    ? 'w-4 bg-foreground/70'
                                    : 'w-1.5',
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((image, position) => (
                    <button
                        key={image}
                        type="button"
                        aria-label={`View image ${position + 1}`}
                        onClick={() => setIndex(position)}
                        className={cn(
                            'aspect-square overflow-hidden rounded-xl transition',
                            position === index
                                ? 'ring-2 ring-brand'
                                : 'ring-1 ring-brand/40 ring-inset hover:ring-brand',
                        )}
                    >
                        <img
                            src={image}
                            alt=""
                            loading="lazy"
                            draggable={false}
                            className="size-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
