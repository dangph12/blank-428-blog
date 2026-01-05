# Blank.428 Blog - Hugo Theme Integration

This project integrates the Hugo Reimu theme styling into an Astro + React + Tailwind blog.

## 🎨 Features Implemented

### **Styling**

- ✅ Red-based color system with light/dark themes
- ✅ CSS custom properties for theming
- ✅ Custom scrollbar styling
- ✅ Card-based layouts with hover effects
- ✅ Animated H2 underlines
- ✅ Responsive design

### **Animations**

- ✅ Fade-up scroll animations (Framer Motion)
- ✅ Zoom-in effects
- ✅ Slide animations
- ✅ Blur-in effects
- ✅ Page loading progress bar (Pace.js)

### **Interactive Effects**

- ✅ Click confetti effect (canvas-confetti)
- ✅ Dark/Light/Auto theme toggle
- ✅ Auto-hide header on scroll
- ✅ Lazy loading images (lazysizes)
- ✅ Smooth transitions

### **Custom Cursor Support**

- ✅ Custom cursor images (optional)
- ✅ Different cursors for different elements
- ✅ Place cursor images in `/public/images/cursor/`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AnimatedSection.tsx    # Framer Motion scroll animations
│   │   ├── Card.astro             # Post card component
│   │   ├── ClickEffect.tsx        # Confetti click effect
│   │   ├── Footer.astro           # Site footer
│   │   ├── Header.astro           # Site header with auto-hide
│   │   ├── LazyLoad.astro         # Lazy loading images
│   │   ├── PaceLoader.astro       # Loading progress bar
│   │   └── ThemeToggle.tsx        # Theme switcher
│   ├── layouts/
│   │   └── Layout.astro           # Main layout with all integrations
│   ├── pages/
│   │   ├── index.astro            # Home page with animations
│   │   └── posts/
│   │       └── [slug].astro       # Post page with styled content
│   └── styles/
│       ├── variables.css          # Color system & CSS variables
│       ├── animations.css         # Keyframe animations
│       └── global.css             # Base styles & typography
└── public/
    └── images/
        └── cursor/                # Custom cursor images (optional)
```

## 🚀 Usage

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 🎯 Customization

### Change Theme Colors

Edit `src/styles/variables.css`:

```css
:root {
  --red-1: #ff5252; /* Primary color */
  --red-2: #ff7c7c; /* Secondary color */
  /* ... more colors */
}
```

### Adjust Animations

Edit `src/styles/animations.css` or modify animation props in components:

```tsx
<AnimatedSection
  animation="fade-up"
  duration={0.8}
  delay={0.2}
>
```

### Enable Custom Cursors

1. Add cursor images to `/public/images/cursor/`
2. Add class to HTML element in `Layout.astro`:

```html
<html lang="en" class="reimu-cursor"></html>
```

### Disable Click Effects

In `Layout.astro`:

```tsx
<ClickEffect client:load enabled={false} />
```

## 📦 Dependencies

- **framer-motion** - Scroll animations
- **canvas-confetti** - Click effects
- **pace-js** - Loading bar
- **lazysizes** - Lazy loading
- **photoswipe** - Image gallery (ready to use)
- **clipboard** - Copy functionality (ready to use)
- **gsap** - Advanced animations (ready to use)

## 🌙 Theme Toggle

Click the floating button (☀️/🌙/🔄) to cycle through:

- **Auto** - Follows system preference
- **Light** - Light theme
- **Dark** - Dark theme

## 📱 Responsive Design

All components are fully responsive with breakpoints at:

- Mobile: < 480px
- Tablet: < 768px
- Desktop: > 768px

## 🎨 Color Palette

### Light Theme

- Background: `#eee`
- Primary: `#ff5252`
- Text: `#444`

### Dark Theme

- Background: `#21252b`
- Primary: `#ff5252`
- Text: `#999`

## ⚡ Performance

- Lazy loading images
- Code splitting
- CSS-only animations where possible
- Optimized bundle size
- Smooth 60fps animations

---

Enjoy your new themed blog! 🎉
