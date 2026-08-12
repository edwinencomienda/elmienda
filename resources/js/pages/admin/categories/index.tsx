import { Form, Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import categoryRoutes from '@/routes/admin/categories';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    position: number;
    products_count: number;
};

type Props = {
    categories: Category[];
};

export default function CategoriesIndex({ categories }: Props) {
    const [editing, setEditing] = useState<Category | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<Category | null>(null);

    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Categories"
                        description="Group your products so shoppers can filter them."
                    />
                    <Button onClick={() => setCreating(true)}>
                        <Plus />
                        New category
                    </Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">
                                    Products
                                </TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No categories yet. Create your first
                                        one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {category.slug}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {category.products_count}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${category.name}`}
                                                onClick={() =>
                                                    setEditing(category)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${category.name}`}
                                                onClick={() =>
                                                    setDeleting(category)
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
            </div>

            <CategoryDialog
                key={editing?.id ?? 'new'}
                category={editing}
                open={creating || editing !== null}
                onClose={() => {
                    setCreating(false);
                    setEditing(null);
                }}
            />

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
                            {deleting?.products_count
                                ? `${deleting.products_count} product(s) will stay, but lose this category.`
                                : 'This category is not used by any product.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleting) {
                                    router.delete(
                                        categoryRoutes.destroy(deleting.id).url,
                                        { preserveScroll: true },
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

function CategoryDialog({
    category,
    open,
    onClose,
}: {
    category: Category | null;
    open: boolean;
    onClose: () => void;
}) {
    const action = category
        ? categoryRoutes.update.form(category.id)
        : categoryRoutes.store.form();

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Edit category' : 'New category'}
                    </DialogTitle>
                    <DialogDescription>
                        The slug is generated from the name when left blank.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={onClose}
                    className="grid gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    defaultValue={category?.name ?? ''}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={category?.slug ?? ''}
                                    placeholder="auto-generated"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={category?.description ?? ''}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    {category ? 'Save changes' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Store admin', href: dashboard() },
        { title: 'Categories', href: categoryRoutes.index() },
    ],
};
