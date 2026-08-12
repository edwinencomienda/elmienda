import { FilterHorizontalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import { Button } from '@/components/ui/button';
import { categories, products } from '@/data/products';
import { peso } from '@/hooks/use-cart';
import { product } from '@/routes/store';

export default function Shop() {
    const [active, setActive] = useState('All');

    const visible =
        active === 'All'
            ? products
            : products.filter((item) => item.tag === active);

    return (
        <>
            <Head title="Shop" />
            <StoreHeader />

            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-brand)_1.5px,transparent_1.5px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:24px_24px]" />
                <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
                    <img
                        src="/logo.svg"
                        alt="Elmienda"
                        className="w-80 max-w-full animate-fade-up dark:invert"
                    />
                    <p className="mt-4 animate-fade-up text-lg text-muted-foreground [animation-delay:0.15s]">
                        Handmade prints &amp; crafts, made in small batches.
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 py-12">
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
                            className="rounded-full"
                            onClick={() => setActive(category)}
                        >
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
