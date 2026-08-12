import {
    Menu01Icon,
    Search01Icon,
    ShoppingCart01Icon,
    UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/store/logo';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { cart, product } from '@/routes/store';

/**
 * Plain cart icon — no button fill — with the item count anchored to its
 * bottom-right edge like an online-status dot. The count only appears once
 * something is actually in the cart.
 */
function CartLink({
    count,
    size,
    wiggle,
}: {
    count: number;
    size: number;
    wiggle: boolean;
}) {
    return (
        <Link
            href={cart()}
            aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
            className="flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-brand/15"
        >
            <span
                className={cn(
                    'relative inline-flex shrink-0 motion-reduce:animate-none',
                    wiggle && 'animate-wiggle',
                )}
            >
                <HugeiconsIcon
                    icon={ShoppingCart01Icon}
                    size={size}
                    strokeWidth={2}
                />
                {count > 0 && (
                    <span className="absolute -right-1.5 -bottom-1.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] leading-none font-semibold text-background ring-2 ring-background">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </span>
        </Link>
    );
}

/**
 * Icon-only header action that matches {@link CartLink}'s hit area and hover
 * treatment. Inert for now — placeholder for search and account features.
 */
function HeaderAction({
    icon,
    label,
    size,
}: {
    icon: typeof Search01Icon;
    label: string;
    size: number;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-brand/15"
        >
            <HugeiconsIcon icon={icon} size={size} strokeWidth={2} />
        </button>
    );
}

const links = [
    { label: 'Shop', href: home() },
    { label: 'Featured', href: product() },
    { label: 'Cart', href: cart() },
];

export function StoreHeader() {
    const { count } = useCart();
    const [open, setOpen] = useState(false);
    const [wiggle, setWiggle] = useState(false);
    const previousCount = useRef(count);

    /** Wiggle the cart icon whenever the item count grows. */
    useEffect(() => {
        if (count > previousCount.current) {
            setWiggle(true);
            const timer = window.setTimeout(() => setWiggle(false), 600);

            previousCount.current = count;

            return () => window.clearTimeout(timer);
        }

        previousCount.current = count;
    }, [count]);

    return (
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
                <div className="flex flex-1 justify-start">
                    <Link href={home()} aria-label="Elmienda home">
                        <Logo className="w-32 md:w-36" />
                    </Link>
                </div>

                {/* Centred navigation, desktop only */}
                <nav className="hidden items-center gap-8 text-sm md:flex">
                    {links.slice(0, 2).map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-muted-foreground transition hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-1 items-center justify-end gap-1">
                    <HeaderAction
                        icon={Search01Icon}
                        label="Search"
                        size={22}
                    />
                    <HeaderAction icon={UserIcon} label="Account" size={22} />
                    <CartLink count={count} size={22} wiggle={wiggle} />

                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger
                            aria-label="Open menu"
                            className="flex size-10 items-center justify-center rounded-full transition hover:bg-brand/15 md:hidden"
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
