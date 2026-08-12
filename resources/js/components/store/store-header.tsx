import { ShoppingCart01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { home } from '@/routes';
import { cart, product } from '@/routes/store';

const links = [
    { label: 'Shop', href: home() },
    { label: 'Featured', href: product() },
];

export function StoreHeader() {
    const { count } = useCart();

    return (
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href={home()} aria-label="Elmienda home">
                    <img
                        src="/logo.svg"
                        alt="Elmienda"
                        className="w-32 dark:invert"
                    />
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                    {links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-muted-foreground transition hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Button
                        asChild
                        className="rounded-full bg-brand text-neutral-900 hover:bg-brand/80"
                    >
                        <Link href={cart()}>
                            <HugeiconsIcon
                                icon={ShoppingCart01Icon}
                                size={16}
                                strokeWidth={2}
                            />
                            Cart ({count})
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
