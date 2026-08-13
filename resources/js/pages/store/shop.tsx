import {
    BadgeIcon,
    FilterHorizontalIcon,
    GiftIcon,
    GridViewIcon,
    Image02Icon,
    Mail01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Seo } from '@/components/store/seo';
import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import { Button } from '@/components/ui/button';
import { categories, products } from '@/data/products';
import { peso } from '@/hooks/use-cart';
import { product } from '@/routes/store';
import heroCollage from '../../../images/hero-collage.png';

const categoryIcons = {
    All: GridViewIcon,
    Prints: Image02Icon,
    Stickers: BadgeIcon,
    Cards: Mail01Icon,
    Gifts: GiftIcon,
} as const;

export default function Shop() {
    const [active, setActive] = useState('All');

    const visible =
        active === 'All'
            ? products
            : products.filter((item) => item.tag === active);

    return (
        <>
            <Seo />
            <StoreHeader />

            <section className="relative flex items-center overflow-hidden border-b bg-[#f3eff6]">
                <div className="relative mx-auto grid min-h-[420px] w-full max-w-6xl items-center gap-10 px-6 py-16 md:min-h-[520px] md:grid-cols-2">
                    <div className="animate-fade-up">
                        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-neutral-900 md:text-5xl">
                            Handmade prints &amp; crafts, made{' '}
                            <span className="text-brand">just for you.</span>
                        </h1>
                        <p className="mt-4 max-w-md text-lg text-neutral-600">
                            Thoughtful prints, cute stickers, and meaningful
                            gifts.
                        </p>
                        <Button
                            size="lg"
                            className="mt-8 h-12 px-10 text-base"
                            onClick={() =>
                                document
                                    .getElementById('catalog')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            Shop Now
                        </Button>
                    </div>

                    <img
                        src={heroCollage}
                        alt="Framed print, greeting card, lavender and a candle"
                        className="mx-auto w-full max-w-lg animate-fade-up [animation-delay:0.15s]"
                    />
                </div>
            </section>

            <main id="catalog" className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-8 flex flex-wrap items-center gap-2">
                    <HugeiconsIcon
                        icon={FilterHorizontalIcon}
                        size={16}
                        className="mr-1 text-muted-foreground"
                    />
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={
                                active === category ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => setActive(category)}
                        >
                            <HugeiconsIcon
                                icon={
                                    categoryIcons[
                                        category as keyof typeof categoryIcons
                                    ]
                                }
                                size={16}
                                strokeWidth={2}
                            />
                            {category}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {visible.map((item, index) => (
                        <Link
                            key={item.id}
                            href={product()}
                            className="group animate-fade-up"
                            style={{ animationDelay: `${index * 0.06}s` }}
                        >
                            <div className="aspect-square overflow-hidden rounded-2xl bg-brand/10 ring-1 ring-brand/40 ring-inset">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                            <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">
                                {item.tag}
                            </p>
                            <h3 className="text-sm font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {peso(item.price)}
                            </p>
                        </Link>
                    ))}
                </div>
            </main>

            <StoreFooter />
        </>
    );
}
