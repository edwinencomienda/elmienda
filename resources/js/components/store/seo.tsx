import { Head, usePage } from '@inertiajs/react';

export type SeoData = {
    title?: string;
    description?: string;
    /** Root-relative or absolute path to a 1200×630 image. */
    image?: string;
    type?: 'website' | 'article' | 'product';
    robots?: string;
};

const DEFAULT_IMAGE = '/images/og-image.png';
const SITE_NAME = 'Elmienda';

/**
 * Re-applies the head tags on client-side navigation. The first paint is
 * rendered server-side in app.blade.php from the same route props, so
 * crawlers that do not run JavaScript still see them.
 */
export function Seo() {
    const page = usePage<{ seo?: SeoData }>();
    const seo = page.props.seo ?? {};

    const pageTitle = seo.title ?? '';
    const title = pageTitle ? `${pageTitle} - ${SITE_NAME}` : SITE_NAME;
    const description =
        seo.description ?? 'Handmade prints and crafts, made in small batches.';
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const image = seo.image ?? DEFAULT_IMAGE;
    const absoluteImage = image.startsWith('http')
        ? image
        : `${origin}${image}`;
    const canonical = `${origin}${page.url}`;

    return (
        <Head title={pageTitle}>
            <meta
                name="description"
                content={description}
                head-key="description"
            />
            <meta
                name="robots"
                content={seo.robots ?? 'index, follow'}
                head-key="robots"
            />
            <link rel="canonical" href={canonical} head-key="canonical" />

            <meta
                property="og:type"
                content={seo.type ?? 'website'}
                head-key="og:type"
            />
            <meta property="og:title" content={title} head-key="og:title" />
            <meta
                property="og:description"
                content={description}
                head-key="og:description"
            />
            <meta property="og:url" content={canonical} head-key="og:url" />
            <meta
                property="og:image"
                content={absoluteImage}
                head-key="og:image"
            />

            <meta
                name="twitter:title"
                content={title}
                head-key="twitter:title"
            />
            <meta
                name="twitter:description"
                content={description}
                head-key="twitter:description"
            />
            <meta
                name="twitter:image"
                content={absoluteImage}
                head-key="twitter:image"
            />
        </Head>
    );
}
