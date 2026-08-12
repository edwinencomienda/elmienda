import { Head, Link, router } from '@inertiajs/react';
import {
    Copy,
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCentavos } from '@/lib/money';
import { dashboard } from '@/routes/admin';
import productRoutes from '@/routes/admin/products';

type Product = {
    id: number;
    name: string;
    slug: string;
    status: string;
    featured: boolean;
    category: string | null;
    variants_count: number;
    price_from: number | null;
    thumb: string | null;
};

type Option = { value: string | number; label: string };

type Props = {
    products: {
        data: Product[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: { search?: string; status?: string; category?: string };
    categories: Option[];
    statuses: Option[];
};

const ALL = 'all';

const statusVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    active: 'default',
    draft: 'secondary',
    archived: 'outline',
};

export default function ProductsIndex({
    products,
    filters,
    categories,
    statuses,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleting, setDeleting] = useState<Product | null>(null);

    const applyFilters = (next: Record<string, string | undefined>) => {
        router.get(
            productRoutes.index().url,
            {
                search: search || undefined,
                status: filters.status,
                category: filters.category,
                ...next,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Products"
                        description={`${products.total} product(s) in your catalog.`}
                    />
                    <Button asChild>
                        <Link href={productRoutes.create()}>
                            <Plus />
                            New product
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="relative flex-1 sm:max-w-xs"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({});
                        }}
                    >
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search products"
                            className="pl-9"
                            aria-label="Search products"
                        />
                    </form>

                    <Select
                        value={filters.status ?? ALL}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === ALL ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-40" aria-label="Status">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem
                                    key={status.value}
                                    value={String(status.value)}
                                >
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.category ?? ALL}
                        onValueChange={(value) =>
                            applyFilters({
                                category: value === ALL ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-44" aria-label="Category">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.value}
                                    value={String(category.value)}
                                >
                                    {category.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Variants
                                </TableHead>
                                <TableHead className="text-right">
                                    From
                                </TableHead>
                                <TableHead className="w-32" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No products match. Try clearing the
                                        filters.
                                    </TableCell>
                                </TableRow>
                            )}
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {product.thumb ? (
                                                <img
                                                    src={product.thumb}
                                                    alt=""
                                                    loading="lazy"
                                                    className="size-10 shrink-0 rounded-md border bg-muted object-cover"
                                                />
                                            ) : (
                                                <span
                                                    aria-hidden
                                                    className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground"
                                                >
                                                    <ImageIcon className="size-4" />
                                                </span>
                                            )}
                                            <Link
                                                href={productRoutes.edit(
                                                    product.id,
                                                )}
                                                className="hover:underline"
                                            >
                                                {product.name}
                                            </Link>
                                            {product.featured && (
                                                <Badge variant="outline">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.category ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                statusVariant[product.status] ??
                                                'secondary'
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {product.variants_count}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {product.price_from === null
                                            ? '—'
                                            : formatCentavos(
                                                  product.price_from,
                                              )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                <Link
                                                    href={productRoutes.edit(
                                                        product.id,
                                                    )}
                                                >
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Duplicate ${product.name}`}
                                                onClick={() =>
                                                    router.post(
                                                        productRoutes.duplicate(
                                                            product.id,
                                                        ).url,
                                                    )
                                                }
                                            >
                                                <Copy />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${product.name}`}
                                                onClick={() =>
                                                    setDeleting(product)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {products.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {products.links.map((link) => (
                            <Button
                                key={link.label}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete “{deleting?.name}”?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The product is removed from the catalog. This can be
                            undone from the database if you need it back.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleting) {
                                    router.delete(
                                        productRoutes.destroy(deleting.id).url,
                                    );
                                }

                                setDeleting(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Store admin', href: dashboard() },
        { title: 'Products', href: productRoutes.index() },
    ],
};
