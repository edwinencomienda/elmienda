import {
    ArrowLeft01Icon,
    CreditCardIcon,
    Delete02Icon,
    MinusSignIcon,
    PlusSignIcon,
    SecurityCheckIcon,
    ShoppingCart01Icon,
    TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Seo } from '@/components/store/seo';
import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { peso, useCart } from '@/hooks/use-cart';
import { home } from '@/routes';

const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_FEE = 120;

export default function Cart() {
    const { items, count, subtotal, setQty, remove, clear } = useCart();

    const shipping =
        subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
            ? 0
            : SHIPPING_FEE;
    const total = subtotal + shipping;
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

    return (
        <>
            <Seo />
            <StoreHeader />

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="animate-fade-up text-3xl font-semibold">
                        Your Cart
                    </h1>
                    {items.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clear}
                            className="text-muted-foreground"
                        >
                            Clear cart
                        </Button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="flex animate-fade-up flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-brand/20">
                            <HugeiconsIcon
                                icon={ShoppingCart01Icon}
                                size={28}
                                className="text-brand"
                            />
                        </div>
                        <div>
                            <p className="font-medium">Your cart is empty</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Have a look around — everything is handmade in
                                small batches.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="rounded-full bg-brand text-neutral-900 hover:bg-brand/80"
                        >
                            <Link href={home()}>Browse the shop</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
                        <div className="animate-fade-up divide-y border-t">
                            {items.map((line) => (
                                <div key={line.id} className="flex gap-4 py-5">
                                    <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-brand/10 ring-1 ring-brand/40 ring-inset">
                                        <img
                                            src={line.image}
                                            alt={line.name}
                                            loading="lazy"
                                            className="size-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h2 className="font-medium">
                                                    {line.name}
                                                </h2>
                                                {line.variant && (
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        {line.variant}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="font-medium">
                                                {peso(line.price * line.qty)}
                                            </p>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center rounded-full border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Decrease quantity of ${line.name}`}
                                                    className="rounded-full"
                                                    onClick={() =>
                                                        setQty(
                                                            line.id,
                                                            line.qty - 1,
                                                        )
                                                    }
                                                >
                                                    <HugeiconsIcon
                                                        icon={MinusSignIcon}
                                                        size={16}
                                                        strokeWidth={2}
                                                    />
                                                </Button>
                                                <span className="w-8 text-center text-sm">
                                                    {line.qty}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Increase quantity of ${line.name}`}
                                                    className="rounded-full"
                                                    onClick={() =>
                                                        setQty(
                                                            line.id,
                                                            line.qty + 1,
                                                        )
                                                    }
                                                >
                                                    <HugeiconsIcon
                                                        icon={PlusSignIcon}
                                                        size={16}
                                                        strokeWidth={2}
                                                    />
                                                </Button>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                aria-label={`Remove ${line.name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    remove(line.id);
                                                    toast.success(
                                                        `Removed ${line.name}`,
                                                    );
                                                }}
                                            >
                                                <HugeiconsIcon
                                                    icon={Delete02Icon}
                                                    size={16}
                                                />
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit animate-fade-up rounded-2xl border p-6 [animation-delay:0.15s]">
                            <h2 className="font-medium">Order summary</h2>

                            <dl className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                        Subtotal ({count}{' '}
                                        {count === 1 ? 'item' : 'items'})
                                    </dt>
                                    <dd>{peso(subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                        Shipping
                                    </dt>
                                    <dd>
                                        {shipping === 0
                                            ? 'Free'
                                            : peso(shipping)}
                                    </dd>
                                </div>
                            </dl>

                            <Separator className="my-4" />

                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>{peso(total)}</span>
                            </div>

                            {remaining > 0 && (
                                <p className="mt-3 rounded-lg bg-brand/15 px-3 py-2 text-xs text-muted-foreground">
                                    Add {peso(remaining)} more for free
                                    shipping.
                                </p>
                            )}

                            <Button
                                size="lg"
                                className="mt-5 w-full rounded-full bg-brand text-neutral-900 hover:bg-brand/80"
                                onClick={() =>
                                    toast.info('Checkout is not wired up yet.')
                                }
                            >
                                <HugeiconsIcon
                                    icon={CreditCardIcon}
                                    size={20}
                                    strokeWidth={2}
                                />
                                Checkout
                            </Button>

                            <Button
                                asChild
                                variant="ghost"
                                className="mt-2 w-full rounded-full"
                            >
                                <Link href={home()}>
                                    <HugeiconsIcon
                                        icon={ArrowLeft01Icon}
                                        size={16}
                                    />
                                    Continue shopping
                                </Link>
                            </Button>

                            <div className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <HugeiconsIcon
                                        icon={TruckDeliveryIcon}
                                        size={14}
                                        className="shrink-0"
                                    />
                                    Ships in 2–3 business days
                                </p>
                                <p className="flex items-center gap-2">
                                    <HugeiconsIcon
                                        icon={SecurityCheckIcon}
                                        size={14}
                                        className="shrink-0"
                                    />
                                    14-day easy returns
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            <StoreFooter />
        </>
    );
}
