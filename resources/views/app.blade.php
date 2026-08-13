<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        @php
            $seo = $page['props']['seo'] ?? [];
            $seoTitle = isset($seo['title'])
                ? $seo['title'].' - '.config('app.name')
                : config('app.name');
            $seoDescription = $seo['description'] ?? 'Handmade prints and crafts, made in small batches.';
            $seoImage = url($seo['image'] ?? '/images/og-image.png');
        @endphp

        {{-- Rendered server-side so crawlers see them; kept in sync on SPA navigation by <Seo>. --}}
        <link data-inertia="canonical" rel="canonical" href="{{ url()->current() }}">
        <meta data-inertia="description" name="description" content="{{ $seoDescription }}">
        <meta data-inertia="robots" name="robots" content="{{ $seo['robots'] ?? 'index, follow' }}">
        <meta name="theme-color" content="#DCB6FB">

        <meta property="og:site_name" content="{{ config('app.name') }}">
        <meta property="og:locale" content="en_PH">
        <meta data-inertia="og:type" property="og:type" content="{{ $seo['type'] ?? 'website' }}">
        <meta data-inertia="og:title" property="og:title" content="{{ $seoTitle }}">
        <meta data-inertia="og:description" property="og:description" content="{{ $seoDescription }}">
        <meta data-inertia="og:url" property="og:url" content="{{ url()->current() }}">
        <meta data-inertia="og:image" property="og:image" content="{{ $seoImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">

        <meta name="twitter:card" content="summary_large_image">
        <meta data-inertia="twitter:title" name="twitter:title" content="{{ $seoTitle }}">
        <meta data-inertia="twitter:description" name="twitter:description" content="{{ $seoDescription }}">
        <meta data-inertia="twitter:image" name="twitter:image" content="{{ $seoImage }}">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
