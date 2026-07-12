# Vue 3 Port: Blank.428 Blog

## Goal

Port existing Astro SSR blog to Vue 3 SPA, preserving visual layout, effects, and content flow from Sanity CMS.

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Vue 3 (`<script setup>`) | Composition API, best practice |
| Build | Vite | Standard for Vue 3 |
| Routing | vue-router 4 | SPA routes matching current structure |
| State | Pinia | Theme toggle state + localStorage |
| SEO (meta) | `@unhead/vue` | Per-page title/OG/Twitter meta |
| SEO (static) | `vite-plugin-prerender` | Pre-render indexable routes at build |
| CMS | `@sanity/client` + `@sanity/image-url` | Client-side read queries |
| Cloudinary | `@cloudinary/vue` + `@cloudinary/url-gen` | `AdvancedImage` component |
| Icons | `lucide-vue-next` | Direct Vue port of current icon set |
| PortableText | `@portabletext/vue` | Official Sanity Vue renderer |
| Lightbox | `vue-easy-lightbox` | Replace React lightbox dependency |
| Click effect | `mouse-firework` | Same lib, works anywhere |
| Deployment | Netlify + SPA redirect + 1 Function | Gallery API keeps Cloudinary creds server-side |

## Architecture

```
src/
├── App.vue                 # Root: Layout shell
├── main.ts                 # Bootstrap: router, pinia, global styles, unhead
├── router/
│   └── index.ts            # Routes with scroll behavior
├── stores/
│   └── theme.ts            # Pinia store: dark/light toggle + localStorage
├── composables/
│   ├── useSanity.ts        # Sanity client singleton + query wrapper
│   ├── useScrollAnimation.ts  # IntersectionObserver for entrance animations
│   └── useScrollHeader.ts     # Header hide/show on scroll
├── components/
│   ├── AppHeader.vue       # Fixed header: nav dropdown, theme toggle, scroll hide
│   ├── AppFooter.vue       # Footer with copyright + powered by
│   ├── AppLoader.vue       # Page load curtain animation (beret + split screen)
│   ├── PaceLoader.vue      # Top progress bar
│   ├── BackToTop.vue       # Scroll-to-top floating button
│   ├── ClickEffect.vue     # mouse-firework wrapper
│   ├── HeroBanner.vue      # Fullscreen CldImage banner with gradient mask
│   ├── PostCard.vue        # Card with image, title, excerpt, date
│   ├── PostPagination.vue  # Page number navigation
│   ├── Sidebar.vue         # Author avatar, stats, social links
│   ├── AboutSection.vue    # Blog intro + author card grid
│   ├── SanityContent.vue   # @portabletext/vue wrapper
│   ├── SanityImage.vue     # Custom portable text image renderer
│   └── GalleryGrid.vue     # Masonry grid + infinite scroll + lightbox
├── views/
│   ├── HomeView.vue        # Hero + post cards + sidebar + pagination
│   ├── PostsView.vue       # Post listing with category filter + pagination
│   ├── PostDetailView.vue  # Single post + prev/next navigation
│   ├── AboutView.vue       # About page with sidebar
│   └── GalleryView.vue     # Gallery header + masonry grid
├── styles/
│   ├── variables.css       # CSS custom properties (preserved)
│   ├── global.css          # Reset + base styles (adapted from Astro)
│   ├── animations.css      # Keyframes (preserved)
│   └── gallery.css         # Gallery-specific styles (preserved)
├── lib/
│   ├── text-utils.ts       # preventOrphan, formatDate (ported)
│   ├── url-for-image.ts    # Sanity image builder (ported)
│   ├── pagination.ts       # Pagination logic (ported)
│   └── cloudinary.ts       # Cloudinary helper (ported to @cloudinary/url-gen)
└── types/
    └── sanity.ts           # TypeScript interfaces (preserved)
```

## Routes

| Path | View | Notes |
|---|---|---|
| `/` | HomeView | Hero, post cards with pagination, sidebar |
| `/posts` | PostsView | All posts with category filter via `?category=` |
| `/posts/:slug` | PostDetailView | Single post, prev/next links |
| `/about` | AboutView | Blog intro + author cards, sidebar |
| `/gallery` | GalleryView | Masonry grid, infinite scroll, lightbox |

## Data Flow

1. **Sanity content**: Each view fetches in `onMounted` using `useSanity().query()`. Loading state shown via loader/spinner.
2. **Gallery**: Initial 10 images fetched via Cloudinary server-side (build-time or first load). More loaded via Netlify Function cursor-based pagination.
3. **Theme**: Pinia store reads `localStorage` on init, sets `data-theme` on `<html>`. Toggle button in header.
4. **SEO**: `useHead` composable from `@unhead/vue` called in each view for title + meta + OG tags.

## SEO Strategy

- **Pre-rendered routes** (`/`, `/posts`, `/about`, `/gallery`): `vite-plugin-prerender` generates static HTML at build time. Served by Netlify, Vue hydrates on client.
- **Dynamic routes** (`/posts/:slug`): `@unhead/vue` sets title + OG tags after client render. Good for social sharing; search engines may index if they execute JS.
- Each view calls `useHead({ title, meta, ... })` with page-specific values.

## Component Migration Pattern

Each `.astro` file → Vue SFC:

| Astro | Vue equivalent |
|---|---|
| `---` frontmatter + `Astro.props` | `<script setup>` + `defineProps` |
| `{variable}` | `{{ variable }}` |
| `{array.map(x => ...)}` | `v-for` |
| `{condition && ...}` | `v-if` |
| `<slot />` | `<slot />` |
| `<style>` (scoped by default) | `<style scoped>` |
| `<style is:global>` | `<style>` or `:deep()` |
| `<script>` (vanilla JS per component) | `onMounted` + composables |
| `Astro.url.searchParams` | `useRoute().query` |
| `Astro.redirect` | `router.push` / `router.replace` |

## Netlify Configuration

- `netlify.toml`: SPA redirect rule (`/* -> /index.html`, 200)
- `netlify/functions/gallery.ts`: Proxy for Cloudinary gallery API
- Gallery endpoint: `/.netlify/functions/gallery?cursor=X&limit=20`

## Non-goals

- No server-side rendering (Nuxt)
- No React components
- No framework migration of Sanity Studio (kept separate in studio/)
- No styled-components (currently unused, remove from deps)
- No 1:1 pixel-perfect replication — same visual intent, adapted to Vue idioms
