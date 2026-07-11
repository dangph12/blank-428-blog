# Gallery SSR Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SSR first 10 gallery images so content appears instantly, React hydrates for infinite scroll.

**Architecture:** Astro page frontmatter calls Cloudinary SDK directly for first 10 images, passes them as props to GalleryGrid. React component pre-fills state, skips initial fetch, uses cursor-based pagination from page 2. Load-more button replaced with IntersectionObserver infinite scroll. New batch's first row gets fade-in animation.

**Tech Stack:** Astro (SSR), React, Cloudinary SDK, IntersectionObserver

## Global Constraints

- No test infrastructure exists — verify with `astro build` or `astro dev`
- Keep `f_auto,q_auto,w_{width}` Cloudinary transforms
- Use `/images/beret.png` from existing static assets
- Follow existing patterns in `gallery.json.ts` for Cloudinary config
- Batch size stays 20 for client fetches, 10 for SSR initial
- All existing functionality preserved (lightbox, zoom, masonry)

---

### Task 1: Create shared Cloudinary lib

**Files:**
- Create: `src/lib/cloudinary.ts`

**Interfaces:**
- Produces: `buildImageData(resource, cloudBase): ImgData`, `fetchGalleryImages(limit, cursor?): Promise<{ images: ImgData[], nextCursor: string | null }>`

- [ ] **Step 1: Create `src/lib/cloudinary.ts`**

Extract image-building and fetching logic from `src/pages/api/gallery.json.ts`:

```ts
export interface ImgData {
  id: string;
  src: string;
  thumb: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export function buildImageData(resource: any, cloudBase: string): ImgData {
  const t = (w: number) => `f_auto,q_auto,w_${w}`;
  const url = (w: number) =>
    `${cloudBase}/${t(w)}/${resource.public_id}.${resource.format}`;
  return {
    id: resource.public_id,
    src: url(1200),
    thumb: url(400),
    srcset: `${url(400)} 400w, ${url(800)} 800w, ${url(1200)} 1200w`,
    width: resource.width,
    height: resource.height,
    alt: resource.public_id.split('/').pop() || '',
  };
}

export async function fetchGalleryImages(
  limit: number,
  cursor?: string
): Promise<{
  images: ImgData[];
  nextCursor: string | null;
}> {
  const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return { images: [], nextCursor: null };
  }

  const { v2 as cloudinary } = await import('cloudinary');
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });

  const CLOUD_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  const result = await cloudinary.search
    .expression('folder:blank-428-blog/gallery')
    .sort_by('created_at', 'desc')
    .max_results(limit)
    .next_cursor(cursor)
    .execute();

  return {
    images: result.resources.map((r: any) => buildImageData(r, CLOUD_BASE)),
    nextCursor: result.next_cursor || null,
  };
}
```

- [ ] **Step 2: Run Astro build to verify no errors**

Run: `npx astro build`
Expected: No errors, lib compiles successfully

### Task 2: Update API route to use shared lib

**Files:**
- Modify: `src/pages/api/gallery.json.ts`

**Interfaces:**
- Consumes: `fetchGalleryImages` from `~/lib/cloudinary`
- Produces: Same API response shape (no breaking changes)

- [ ] **Step 1: Replace inline logic with shared lib**

```ts
import type { APIRoute } from 'astro';
import { fetchGalleryImages } from '~/lib/cloudinary';

function err(msg: string, status = 500) {
  return new Response(
    JSON.stringify({ error: msg, images: [], nextCursor: null }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export const GET: APIRoute = async ({ url }) => {
  const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return err('Cloudinary credentials not configured in .env');
  }

  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);

  try {
    const { images, nextCursor } = await fetchGalleryImages(limit, cursor);
    return new Response(JSON.stringify({ images, nextCursor }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return err(e.message || 'Failed to fetch gallery');
  }
};
```

- [ ] **Step 2: Verify API route still works**

Run: `npx astro build`
Expected: No errors

### Task 3: Gallery page — SSR first 10 images

**Files:**
- Modify: `src/pages/gallery/index.astro`

**Interfaces:**
- Consumes: `fetchGalleryImages` from `~/lib/cloudinary`
- Produces: passes `initialImages: ImgData[]` and `initialCursor: string | null` to GalleryGrid

- [ ] **Step 1: Add frontmatter fetch for first 10 images**

Replace the frontmatter section to import from shared lib and fetch initial data:

```astro
---
import Layout from "~/layouts/Layout.astro";
import AnimatedSection from "~/components/AnimatedSection.astro";
import GalleryGrid from "~/components/GalleryGrid.tsx";
import { fetchGalleryImages } from "~/lib/cloudinary";

const { images: initialImages, nextCursor: initialCursor } =
  await fetchGalleryImages(10).catch(() => ({
    images: [],
    nextCursor: null,
  }));
---
```

- [ ] **Step 2: Pass initial data to GalleryGrid**

```astro
<AnimatedSection animation="fade-in" delay={0.3}>
  <GalleryGrid
    client:load
    initialImages={initialImages}
    initialCursor={initialCursor}
  />
</AnimatedSection>
```

- [ ] **Step 3: Verify SSR renders initial images**

Run: `npx astro build`
Check that build output includes gallery page with 10 image references

### Task 4: GalleryGrid — SSR hydration + infinite scroll + fade-in

**Files:**
- Modify: `src/components/GalleryGrid.tsx`

- [ ] **Step 1: Add Props interface and accept initial data**

```tsx
interface Props {
  initialImages?: ImgData[];
  initialCursor?: string | null;
}

export default function GalleryGrid({
  initialImages = [],
  initialCursor = null,
}: Props) {
```

- [ ] **Step 2: Pre-fill state and skip initial fetch**

```tsx
const [images, setImages] = useState<ImgData[]>(initialImages);

// Initialize cursor ref
const cursorRef = useRef<string | null>(initialCursor);

// Only fetch on mount if no SSR data
useEffect(() => {
  if (initialImages.length === 0) loadMoreRef.current();
}, []);
```

- [ ] **Step 3: Add fade-in state tracking**

```tsx
const [fadeIds, setFadeIds] = useState<Set<string>>(new Set());
```

- [ ] **Step 4: Update `loadMoreRef.current` to track first-row fade-in**

Inside `loadMoreRef.current`, after the decode loop and before `setImages`, add:

```tsx
const newIds = new Set(next.slice(0, colCount).map((img) => img.id));
setFadeIds(newIds);
setTimeout(() => setFadeIds(new Set()), 600);
```

- [ ] **Step 5: Add IntersectionObserver for infinite scroll**

Add sentinel ref and effect (place near other effects):

```tsx
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current)
        loadMoreRef.current();
    },
    { rootMargin: '200px' }
  );
  obs.observe(sentinel);
  return () => obs.disconnect();
}, []);
```

- [ ] **Step 6: Update render — add fade-in class to first-row images**

In the `<img>` element within the columns map, add:

```tsx
<img
  className={fadeIds.has(img.id) ? 'fade-in-row' : ''}
  src={img.thumb}
  srcSet={img.srcset}
  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  alt={img.alt}
  loading='lazy'
  decoding='async'
  width={img.width}
  height={img.height}
/>
```

- [ ] **Step 7: Replace load-more button with sentinel + loading indicator**

Replace the entire `.gallery-loader` div:

```tsx
<div className='gallery-loader'>
  {error ? (
    <span>{error}</span>
  ) : loading ? (
    <span className='gallery-loading-indicator'>
      <img
        src='/images/beret.png'
        className='loading-beret bounce'
        width={28}
        height={28}
        alt=''
      />
      Đang tải...
    </span>
  ) : !hasMore ? (
    <span>Đã tải hết</span>
  ) : null}
</div>

<div ref={sentinelRef} className='gallery-sentinel' />
```

- [ ] **Step 8: Add hydration colCount fix**

Add effect to set correct column count after hydration:

```tsx
useEffect(() => {
  setColCount(getColCount());
}, []);
```

- [ ] **Step 9: Verify build**

Run: `npx astro build`
Expected: No errors

### Task 5: Gallery CSS — animations and styles

**Files:**
- Modify: `src/styles/gallery.css`

- [ ] **Step 1: Add fade-in keyframes and class**

```css
.fade-in-row {
  animation: feedIn 0.3s ease both;
}

@keyframes feedIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Add bounce keyframes for loading indicator**

```css
@keyframes bounce-up-down {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
```

- [ ] **Step 3: Add loading indicator and sentinel styles**

```css
.gallery-loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gallery-loading-indicator .loading-beret {
  opacity: 0.7;
}

.gallery-loading-indicator .bounce {
  animation: bounce-up-down 1.2s ease-in-out infinite;
}

.gallery-sentinel {
  height: 1px;
}
```

- [ ] **Step 4: Remove shimmer from .gallery-item** (no longer needed since initial images render instantly)

```css
/* Remove or keep — up to you. Keeping shimmer as fallback for slow-loading SSR images is fine. */
```

- [ ] **Step 5: Final build verification**

Run: `npx astro build`
Expected: No errors, all styles compile and apply correctly
