import { Menu01Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Logo } from '@/components/store/logo';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { home } from '@/routes';
import { cart, product } from '@/routes/store';

const links = [
    { label: 'Shop', href: home() },
    { label: 'Featured', href: product() },
    { label: 'Cart', href: cart() },
];

export function StoreHeader() {
    const { count } = useCart();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <Link href={home()} aria-label="Elmienda home">
                    <Logo className="w-32 md:w-36" />
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden items-center gap-6 text-sm md:flex">
                    {links.slice(0, 2).map((link) => (
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

                {/* Mobile: cart icon, then the menu on the far right */}
                <div className="flex items-center gap-1 md:hidden">
                    <Link
                        href={cart()}
                        aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
                        className="relative flex size-10 items-center justify-center rounded-full transition hover:bg-brand/15"
                    >
                        <HugeiconsIcon
                            icon={ShoppingCart01Icon}
                            size={22}
                            strokeWidth={2}
                        />
                        {count > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] leading-4 font-medium text-neutral-900">
                                {count}
                            </span>
                        )}
                    </Link>

                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger
                            aria-label="Open menu"
                            className="flex size-10 items-center justify-center rounded-full transition hover:bg-brand/15"
                        >
                            <HugeiconsIcon
                                icon={Menu01Icon}
                                size={22}
                                strokeWidth={2}
                            />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 p-6">
                            <SheetTitle className="sr-only">Menu</SheetTitle>
                            <Logo className="w-32" />
                            <nav className="mt-4 flex flex-col">
                                {links.map((link) => (
                                    <SheetClose key={link.label} asChild>
                                        <Link
                                            href={link.href}
                                            className="border-b py-4 text-base transition hover:text-brand"
                                        >
                                            {link.label}
                                            {link.label === 'Cart' &&
                                                count > 0 &&
                                                ` (${count})`}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
