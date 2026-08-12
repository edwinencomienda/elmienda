import {
    Clock01Icon,
    InstagramIcon,
    Location01Icon,
    Mail01Icon,
    PaintBrush01Icon,
    PackageIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Seo } from '@/components/store/seo';
import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EMAIL = 'hello@elmienda.com';

const channels = [
    {
        icon: Mail01Icon,
        title: 'Email',
        body: EMAIL,
        href: `mailto:${EMAIL}`,
    },
    {
        icon: InstagramIcon,
        title: 'Instagram',
        body: '@elmienda',
        href: '#',
    },
    {
        icon: Location01Icon,
        title: 'Studio',
        body: 'Manila, Philippines',
    },
    {
        icon: Clock01Icon,
        title: 'Reply time',
        body: 'Within 1–2 business days',
    },
];

const topics = [
    {
        icon: PackageIcon,
        title: 'Order help',
        body: 'Questions about a shipment, a return, or a change to an order you already placed.',
    },
    {
        icon: PaintBrush01Icon,
        title: 'Custom & wholesale',
        body: 'Commission a custom print or ask about bulk orders for shops, weddings and events.',
    },
];

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    /**
     * There is no inbox on the server yet, so the form hands the message to the
     * visitor's own mail client with everything pre-filled.
     */
    const openMailClient = (event: React.FormEvent) => {
        event.preventDefault();

        const subject = `Message from ${name || 'the Elmienda site'}`;
        const body = `${message}\n\n—\n${name}\n${email}`;

        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <>
            <Seo />
            <StoreHeader />

            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-brand)_1.5px,transparent_1.5px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:24px_24px]" />
                <div className="mx-auto max-w-6xl px-6 py-16 text-center">
                    <h1 className="animate-fade-up text-3xl font-semibold sm:text-4xl">
                        Say hello
                    </h1>
                    <p className="mx-auto mt-3 max-w-md animate-fade-up leading-relaxed text-muted-foreground [animation-delay:0.15s]">
                        Questions about an order, a custom print, or stocking
                        Elmienda in your shop? Send a note — every message is
                        read by a real person.
                    </p>
                </div>
            </section>

            <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:grid-cols-2">
                <form
                    onSubmit={openMailClient}
                    className="animate-fade-up space-y-5"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            required
                            rows={6}
                            placeholder="How can we help?"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-full bg-brand text-neutral-900 hover:bg-brand/80"
                    >
                        <HugeiconsIcon
                            icon={Mail01Icon}
                            size={20}
                            strokeWidth={2}
                        />
                        Send message
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        This opens your email app with the message ready to
                        send.
                    </p>
                </form>

                <div className="animate-fade-up space-y-8 [animation-delay:0.15s]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {channels.map(({ icon, title, body, href }) => {
                            const content = (
                                <>
                                    <HugeiconsIcon
                                        icon={icon}
                                        size={20}
                                        strokeWidth={2}
                                        className="text-foreground"
                                    />
                                    <p className="mt-3 text-sm font-medium">
                                        {title}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {body}
                                    </p>
                                </>
                            );

                            return href ? (
                                <a
                                    key={title}
                                    href={href}
                                    className="rounded-2xl border p-5 transition hover:border-brand hover:bg-brand/10"
                                >
                                    {content}
                                </a>
                            ) : (
                                <div
                                    key={title}
                                    className="rounded-2xl border p-5"
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>

                    <div className="divide-y border-t">
                        {topics.map(({ icon, title, body }) => (
                            <div key={title} className="flex gap-3 py-4">
                                <HugeiconsIcon
                                    icon={icon}
                                    size={18}
                                    strokeWidth={2}
                                    className="mt-0.5 shrink-0 text-muted-foreground"
                                />
                                <div>
                                    <p className="text-sm font-medium">
                                        {title}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        {body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <StoreFooter />
        </>
    );
}
