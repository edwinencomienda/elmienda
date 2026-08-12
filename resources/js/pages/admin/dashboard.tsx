import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

type Props = {
    stats: {
        products: number;
        active: number;
        drafts: number;
        categories: number;
        media: number;
    };
    lowStock: Array<{
        id: number;
        name: string;
        stock: number;
        product: string;
        slug: string;
    }>;
};

export default function AdminDashboard({ stats, lowStock }: Props) {
    const tiles = [
        { label: 'Products', value: stats.products },
        { label: 'Active', value: stats.active },
        { label: 'Drafts', value: stats.drafts },
        { label: 'Categories', value: stats.categories },
        { label: 'Media', value: stats.media },
    ];

    return (
        <>
            <Head title="Store admin" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Store admin"
                    description="Manage your catalog, categories and media."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {tiles.map((tile) => (
                        <Card key={tile.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {tile.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold tabular-nums">
                                    {tile.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Low stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStock.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Everything is well stocked.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {lowStock.map((variant) => (
                                    <li
                                        key={variant.id}
                                        className="flex items-center justify-between py-3 text-sm"
                                    >
                                        <span>
                                            {variant.product}
                                            <span className="text-muted-foreground">
                                                {' '}
                                                · {variant.name}
                                            </span>
                                        </span>
                                        <Badge
                                            variant={
                                                variant.stock === 0
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                        >
                                            {variant.stock} left
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Store admin', href: dashboard() }],
};
