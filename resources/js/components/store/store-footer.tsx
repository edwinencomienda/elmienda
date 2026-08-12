import {
    Facebook01Icon,
    InstagramIcon,
    Mail01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const socials = [
    { label: 'Instagram', icon: InstagramIcon, href: '#' },
    { label: 'Facebook', icon: Facebook01Icon, href: '#' },
    { label: 'Email', icon: Mail01Icon, href: '#' },
];

export function StoreFooter() {
    return (
        <footer className="border-t py-10 text-center text-sm text-muted-foreground">
            <div className="mb-4 flex items-center justify-center gap-5">
                {socials.map(({ label, icon, href }) => (
                    <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="transition hover:text-foreground"
                    >
                        <HugeiconsIcon icon={icon} size={20} />
                    </a>
                ))}
            </div>
            <p>
                &copy; {new Date().getFullYear()} Elmienda. Handmade with love.
            </p>
        </footer>
    );
}
