import {
    Facebook01Icon,
    InstagramIcon,
    Mail01Icon,
    TiktokIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { Logo } from '@/components/store/logo';
import { home } from '@/routes';
import { cart, contact, product } from '@/routes/store';

const EMAIL = 'hello@elmienda.com';

const socials = [
    { label: 'Instagram', icon: InstagramIcon, href: '#' },
    { label: 'Facebook', icon: Facebook01Icon, href: '#' },
    { label: 'TikTok', icon: TiktokIcon, href: '#' },
];

const columns = [
    {
        title: 'Shop',
        links: [
            { label: 'All products', href: home() },
            { label: 'Featured print', href: product() },
            { label: 'Your cart', href: cart() },
        ],
    },
    {
        title: 'Help',
        links: [
            { label: 'Contact us', href: contact() },
            { label: 'Shipping & returns', href: '#' },
            { label: 'Custom orders', href: '#' },
            { label: 'FAQ', href: '#' },
        ],
    },
];

export function StoreFooter() {
    return (
        <footer className="mt-16 border-t">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                    <Link href={home()} aria-label="Elmienda home">
                        <Logo className="w-32" />
                    </Link>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                        Handmade prints &amp; crafts, made in small batches in
                        Manila.
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                        {socials.map(({ label, icon, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition hover:border-brand hover:bg-brand/15 hover:text-foreground"
                            >
                                <HugeiconsIcon icon={icon} size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {columns.map((column) => (
                    <div key={column.title}>
                        <h3 className="text-sm font-medium">{column.title}</h3>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            {column.links.map((link) => (
                                <li key={link.label}>
                                    {typeof link.href === 'string' ? (
                                        <a
                                            href={link.href}
                                            className="transition hover:text-foreground"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="transition hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
                    <p>
                        &copy; {new Date().getFullYear()} Elmienda. Handmade
                        with love.
                    </p>
                    <a
                        href={`mailto:${EMAIL}`}
                        className="flex items-center gap-2 transition hover:text-foreground"
                    >
                        <HugeiconsIcon icon={Mail01Icon} size={16} />
                        {EMAIL}
                    </a>
                </div>
            </div>
        </footer>
    );
}
