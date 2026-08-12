import {
    ArrowDown01Icon,
    ArrowRight01Icon,
    File01Icon,
    PackageIcon,
    SecurityCheckIcon,
    ShoppingCart01Icon,
    Tag01Icon,
    TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductGallery } from '@/components/store/product-gallery';
import { Seo } from '@/components/store/seo';
import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import { Button } from '@/components/ui/button';
import { productGallery, products } from '@/data/products';
import { peso, useCart } from '@/hooks/use-cart';
import { home } from '@/routes';

const featured = products[0];

const sizes = ['A5', 'A4', 'A3'];
const frames = ['No frame', 'Wood', 'Black'];

const perks = [
    { icon: TruckDeliveryIcon, label: 'Ships in 2–3 business days' },
    { icon: Tag01Icon, label: 'Free shipping over ₱1,000' },
    { icon: SecurityCheckIcon, label: '14-day easy returns' },
];

const details = [
    {
        icon: File01Icon,
        title: 'Details & materials',
        body: 'Printed on 250gsm acid-free matte paper with archival inks. Unframed prints arrive in a protective sleeve with a backing board.',
    },
    {
        icon: PackageIcon,
        title: 'Shipping & returns',
        body: 'Orders ship from Manila within 2–3 business days. Returns accepted within 14 days if unused and in original packaging.',
    },
];

export default function Product() {
    const { add } = useCart();
    const [size, setSize] = useState(sizes[0]);
    const [frame, setFrame] = useState(frames[0]);

    const addToCart = () => {
        const variant = `${size} · ${frame}`;

        add({
            id: `${featured.id}-${size}-${frame}`,
            name: featured.name,
            price: featured.price,
            variant,
            qty: 1,
            image: featured.image,
        });
        toast.success(`Added ${featured.name}`, {
            description: variant,
        });
    };

    return (
        <>
            <Seo />
            <StoreHeader />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
                    <Link
                        href={home()}
                        className="transition hover:text-foreground"
                    >
                        Shop
                    </Link>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    <span className="text-foreground">{featured.name}</span>
                </nav>

                <div className="grid gap-10 md:grid-cols-2">
                    <div className="animate-fade-up">
                        <ProductGallery
                            images={productGallery}
                            alt={featured.name}
                        />
                    </div>

                    <div className="animate-fade-up [animation-delay:0.15s]">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                            {featured.tag}
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold">
                            {featured.name}
                        </h1>
                        <p className="mt-3 text-2xl">{peso(featured.price)}</p>
                        <p className="mt-5 leading-relaxed text-muted-foreground">
                            A hand-illustrated floral print, made in small
                            batches on thick matte paper. Each one is printed
                            and packed by hand — perfect for framing or gifting.
                        </p>

                        <OptionGroup
                            label="Size"
                            options={sizes}
                            value={size}
                            onChange={setSize}
                        />
                        <OptionGroup
                            label="Frame"
                            options={frames}
                            value={frame}
                            onChange={setFrame}
                        />

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button
                                size="lg"
                                onClick={addToCart}
                                className="flex-1 rounded-full bg-brand text-neutral-900 hover:bg-brand/80"
                            >
                                <HugeiconsIcon
                                    icon={ShoppingCart01Icon}
                                    size={20}
                                    strokeWidth={2}
                                />
                                Add to Cart
                            </Button>
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                            {perks.map(({ icon, label }) => (
                                <p
                                    key={label}
                                    className="flex items-center gap-2"
                                >
                                    <HugeiconsIcon
                                        icon={icon}
                                        size={16}
                                        className="shrink-0"
                                    />
                                    {label}
                                </p>
                            ))}
                        </div>

                        <div className="mt-8 divide-y border-t">
                            {details.map(({ icon, title, body }) => (
                                <details key={title} className="group py-4">
                                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            <HugeiconsIcon
                                                icon={icon}
                                                size={16}
                                                className="text-muted-foreground"
                                            />
                                            {title}
                                        </span>
                                        <HugeiconsIcon
                                            icon={ArrowDown01Icon}
                                            size={16}
                                            className="text-muted-foreground transition group-open:rotate-180"
                                        />
                                    </summary>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {body}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </>
    );
}

function OptionGroup({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="mt-6">
            <p className="mb-2 text-sm font-medium">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <Button
                        key={option}
                        variant={value === option ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => onChange(option)}
                    >
                        {option}
                    </Button>
                ))}
            </div>
        </div>
    );
}
