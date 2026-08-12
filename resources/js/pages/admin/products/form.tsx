import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react';
import { MediaPicker } from '@/components/admin/media-picker';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    allowNextVisit,
    useUnsavedChanges,
} from '@/hooks/use-unsaved-changes';
import { dashboard } from '@/routes/admin';
import productRoutes from '@/routes/admin/products';
import type { MediaItem } from '@/types/media';

type Variant = {
    id?: number;
    name: string;
    sku: string | null;
    price: number | string;
    compare_at_price: number | string | null;
    stock: number | string;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category_id: number | null;
    status: string;
    featured: boolean;
    seo_title: string | null;
    seo_description: string | null;
    media: MediaItem[];
    variants: Variant[];
};

type Option = { value: string | number; label: string };

type Props = {
    product: Product | null;
    categories: Option[];
    statuses: Option[];
};

const NONE = 'none';

const emptyVariant: Variant = {
    name: '',
    sku: '',
    price: '',
    compare_at_price: '',
    stock: 0,
};

export default function ProductForm({ product, categories, statuses }: Props) {
    const { data, setData, submit, transform, processing, isDirty, errors } =
        useForm({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        description: product?.description ?? '',
        category_id: product?.category_id ?? null,
        status: product?.status ?? 'draft',
        featured: product?.featured ?? false,
        seo_title: product?.seo_title ?? '',
        seo_description: product?.seo_description ?? '',
        media: product?.media ?? [],
        variants: product?.variants ?? [{ ...emptyVariant }],
    });

    useUnsavedChanges(isDirty && !processing);

    const updateVariant = (
        index: number,
        patch: Partial<Variant>,
    ): void => {
        setData(
            'variants',
            data.variants.map((variant, current) =>
                current === index ? { ...variant, ...patch } : variant,
            ),
        );
    };

    const submitForm = (event: React.FormEvent) => {
        event.preventDefault();
        allowNextVisit();
        // The server wants ids in display order, not the full media objects.
        transform((current) => ({
            ...current,
            media: current.media.map((item) => item.id),
        }));
        submit(
            product
                ? productRoutes.update(product.id)
                : productRoutes.store(),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={product ? product.name : 'New product'} />

            <form
                onSubmit={submitForm}
                className="flex h-full flex-1 flex-col gap-6 p-4"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label="Back to products"
                        >
                            <Link href={productRoutes.index()}>
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <Heading
                            title={product ? product.name : 'New product'}
                            description="Details, pricing and stock."
                        />
                    </div>
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner />}
                        {product ? 'Save changes' : 'Create product'}
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(event) =>
                                            setData('slug', event.target.value)
                                        }
                                        placeholder="auto-generated from the name"
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        rows={6}
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Variants</CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setData('variants', [
                                            ...data.variants,
                                            { ...emptyVariant },
                                        ])
                                    }
                                >
                                    <Plus />
                                    Add variant
                                </Button>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Every product needs at least one variant.
                                    Use “Default” if it only comes one way.
                                </p>

                                {data.variants.map((variant, index) => (
                                    <div
                                        key={variant.id ?? `new-${index}`}
                                        className="grid items-start gap-3 rounded-lg border p-3 sm:grid-cols-[auto_1fr_1fr_auto]"
                                    >
                                        <GripVertical className="mt-2.5 size-4 text-muted-foreground" />

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`variant-${index}-name`}
                                            >
                                                Name
                                            </Label>
                                            <Input
                                                id={`variant-${index}-name`}
                                                value={variant.name}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        name: event.target
                                                            .value,
                                                    })
                                                }
                                                placeholder="A4 — Framed"
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `variants.${index}.name` as keyof typeof errors
                                                    ] as string | undefined
                                                }
                                            />

                                            <Label
                                                htmlFor={`variant-${index}-sku`}
                                                className="mt-2"
                                            >
                                                SKU
                                            </Label>
                                            <Input
                                                id={`variant-${index}-sku`}
                                                value={variant.sku ?? ''}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        sku: event.target.value,
                                                    })
                                                }
                                                placeholder="Optional"
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `variants.${index}.sku` as keyof typeof errors
                                                    ] as string | undefined
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`variant-${index}-price`}
                                            >
                                                Price (₱)
                                            </Label>
                                            <Input
                                                id={`variant-${index}-price`}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={variant.price}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        price: event.target
                                                            .value,
                                                    })
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `variants.${index}.price` as keyof typeof errors
                                                    ] as string | undefined
                                                }
                                            />

                                            <Label
                                                htmlFor={`variant-${index}-stock`}
                                                className="mt-2"
                                            >
                                                Stock
                                            </Label>
                                            <Input
                                                id={`variant-${index}-stock`}
                                                type="number"
                                                min="0"
                                                value={variant.stock}
                                                onChange={(event) =>
                                                    updateVariant(index, {
                                                        stock: event.target
                                                            .value,
                                                    })
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `variants.${index}.stock` as keyof typeof errors
                                                    ] as string | undefined
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Remove variant ${index + 1}`}
                                            disabled={data.variants.length < 2}
                                            onClick={() =>
                                                setData(
                                                    'variants',
                                                    data.variants.filter(
                                                        (_, current) =>
                                                            current !== index,
                                                    ),
                                                )
                                            }
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                ))}

                                <InputError message={errors.variants} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visibility</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <InputError message={errors.status} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={
                                            data.category_id
                                                ? String(data.category_id)
                                                : NONE
                                        }
                                        onValueChange={(value) =>
                                            setData(
                                                'category_id',
                                                value === NONE
                                                    ? null
                                                    : Number(value),
                                            )
                                        }
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>
                                                No category
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.value}
                                                    value={String(
                                                        category.value,
                                                    )}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="featured">Featured</Label>
                                    <Switch
                                        id="featured"
                                        checked={data.featured}
                                        onCheckedChange={(checked) =>
                                            setData('featured', checked)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Search listing</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="seo_title">SEO title</Label>
                                    <Input
                                        id="seo_title"
                                        value={data.seo_title}
                                        onChange={(event) =>
                                            setData(
                                                'seo_title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Defaults to the product name"
                                    />
                                    <InputError message={errors.seo_title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="seo_description">
                                        SEO description
                                    </Label>
                                    <Textarea
                                        id="seo_description"
                                        rows={4}
                                        value={data.seo_description}
                                        onChange={(event) =>
                                            setData(
                                                'seo_description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.seo_description}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MediaPicker
                                    selected={data.media}
                                    onChange={(media) => setData('media', media)}
                                />
                                <InputError message={errors.media} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </>
    );
}

ProductForm.layout = {
    breadcrumbs: [
        { title: 'Store admin', href: dashboard() },
        { title: 'Products', href: productRoutes.index() },
    ],
};
