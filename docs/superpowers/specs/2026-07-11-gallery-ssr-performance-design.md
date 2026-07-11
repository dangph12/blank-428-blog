# Gallery SSR Performance Enhancement

## Problem

Gallery page shows a loading spinner while React fetches images from `/api/gallery.json` on mount. Images are only visible after the client-side fetch + decode + render cycle completes.

## Solution

SSR the first 10 images directly into HTML. React hydrates on top — same DOM nodes, no flash — and handles infinite scroll for remaining images.

## Architecture

```
SSR: Cloudinary SDK → first 10 images → render masonry HTML
Hydrate: GalleryGrid receives initialImages + initialCursor
       → pre-fills state, skips first fetch
       → cursor points past first 10
       → infinite scroll fetches page 2+ via /api/gallery.json?cursor=...
```

## File Changes

### 1. `src/lib/cloudinary.ts` (new)

Shared helper extracted from `gallery.json.ts`:

```ts
buildImageData(resource, CLOUD_BASE) → ImgData
fetchGalleryImages(limit, cursor?) → { images, nextCursor }
```

### 2. `src/pages/api/gallery.json.ts`

Use `fetchGalleryImages` from shared lib. No behavior change.

### 3. `src/pages/gallery/index.astro`

```astro
import { fetchGalleryImages } from '~/lib/cloudinary';
const { images: initialImages, nextCursor: initialCursor }
  = await fetchGalleryImages(10).catch(() => ({ images: [], nextCursor: null }));

<GalleryGrid client:load {initialImages} {initialCursor} />
```

On Cloudinary error → `initialImages=[]` → client falls back to fetch on mount.

### 4. `src/components/GalleryGrid.tsx`

**Props:** `initialImages: ImgData[]`, `initialCursor: string | null`

**State:** `useState<ImgData[]>(initialImages)` — pre-filled, no loading spinner

**Mount effect:** skips first fetch when initialImages exist

**Cursor:** `cursorRef.current = initialCursor`

**Infinite scroll:** IntersectionObserver on sentinel div, 200px rootMargin. Replaces load-more button. Keeps lightbox prefetch (near-end in carousel).

**First-row fade-in:** After each batch load, track IDs of first `colCount` images. Render with `.fade-in-row` class + staggered `animationDelay`. Clear after 600ms.

**colCount hydration fix:** `useEffect(() => setColCount(getColCount()), [])` — adjusts columns after hydration.

### 5. `src/styles/gallery.css`

Add:
- `.fade-in-row` — `feedIn` keyframes (opacity 0→1, translateY 8→0, 0.4s)
- `.bounce` — `bounce-up-down` keyframes (1.2s, 8px amplitude)
- `.gallery-loading-indicator` — flex row with beret + text

## Error Handling

| Scenario | Behavior |
|---|---|
| SSR Cloudinary fail | `initialImages=[]`, client fetches normally |
| Client fetch fail | Existing catch, shows "Lỗi tải ảnh" |
| 0 images total | "Đã tải hết" |
| Concurrent triggers | `loadingRef` guard in loadMore prevents duplicates |

## Edge Cases

- **Mobile colCount mismatch:** SSR uses 3 columns, mount effect adjusts to correct count. One-time re-layout, no flash.
- **SSR images colCount:** Refs are kept in sync with state for Observer/loadMore access without stale closures.
- **Hydration timing:** `client:load` — images in HTML immediately, React hydrates on top.
