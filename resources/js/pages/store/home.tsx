import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function Home() {
    return (
        <>
            <Head title="Prints & Crafts" />
            <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-brand)_1.5px,transparent_1.5px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:24px_24px]" />
                <img
                    src="/logo.svg"
                    alt="Elmienda"
                    className="w-96 max-w-full animate-fade-up dark:invert"
                />
                <p className="max-w-md animate-fade-up text-lg text-muted-foreground [animation-delay:0.15s]">
                    Handmade prints &amp; crafts, made with love.
                </p>
                <Button
                    asChild
                    size="lg"
                    className="animate-fade-up rounded-full bg-brand px-8 text-neutral-900 [animation-delay:0.3s] hover:bg-brand/80"
                >
                    <Link href={home()}>
                        Shop Now
                        <HugeiconsIcon
                            icon={ArrowRight02Icon}
                            size={16}
                            strokeWidth={2}
                        />
                    </Link>
                </Button>
            </section>
        </>
    );
}
