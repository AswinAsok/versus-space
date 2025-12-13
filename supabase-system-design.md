# Supabase Design System Documentation

## Complete Visual & Technical Design Analysis

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Logo & Brand Assets](#logo--brand-assets)
5. [UI Components & Framework](#ui-components--framework)
6. [Layout & Grid System](#layout--grid-system)
7. [Dark/Light Theme System](#darklight-theme-system)
8. [Animations & Motion](#animations--motion)
9. [Iconography](#iconography)
10. [Design Patterns & Trends](#design-patterns--trends)
11. [Technical Stack](#technical-stack)
12. [Accessibility](#accessibility)

---

## Brand Overview

### Brand Identity

Supabase positions itself as "The Postgres Development Platform" with the tagline **"Build in a weekend, Scale to millions"**. The brand identity reflects:

- **Developer-First Approach**: Technical sophistication balanced with approachability
- **Open Source Philosophy**: Transparency and community-driven development
- **Modern & Trustworthy**: Clean, professional aesthetic that inspires confidence
- **Speed & Simplicity**: Design that communicates rapid development capabilities

### Design Philosophy

Supabase's design language emphasizes:

- **Clarity over complexity**: Clean interfaces that reduce cognitive load
- **Developer empowerment**: Tools that feel accessible rather than intimidating
- **Dark-mode first**: Optimized for late-night coding sessions
- **Technical precision**: Design that respects the technical nature of the product

---

## Color Palette

### Primary Brand Colors

| Color Name                 | Hex Code  | RGB          | Usage                                     |
| -------------------------- | --------- | ------------ | ----------------------------------------- |
| **Jungle Green (Primary)** | `#3ECF8E` | 62, 207, 142 | Primary brand color, CTAs, success states |
| **Brand Green Dark**       | `#34B27B` | 52, 178, 123 | Hover states, emphasis                    |
| **Brand Green Darker**     | `#24B47E` | 36, 180, 126 | Active states                             |

### Background Colors

| Color Name           | Hex Code  | Usage                     |
| -------------------- | --------- | ------------------------- |
| **Bunker (Dark BG)** | `#11181C` | Primary dark background   |
| **Dark Gray**        | `#171717` | Secondary dark background |
| **Scale 100**        | `#1C1C1C` | Card backgrounds (dark)   |
| **Scale 200**        | `#232323` | Elevated surfaces         |
| **Athens Gray**      | `#F8F9FA` | Light mode background     |
| **White**            | `#FFFFFF` | Light mode cards          |

### Text Colors

| Color Name     | Hex Code  | Usage                     |
| -------------- | --------- | ------------------------- |
| **Foreground** | `#EDEDED` | Primary text (dark mode)  |
| **Muted**      | `#A1A1A1` | Secondary text            |
| **Subtle**     | `#6B6B6B` | Tertiary/placeholder text |
| **Dark Text**  | `#1C1C1C` | Primary text (light mode) |

### Accent & Utility Colors

| Color Name            | Hex Code  | Usage                |
| --------------------- | --------- | -------------------- |
| **Warning**           | `#F5A623` | Warning states       |
| **Error/Destructive** | `#EF4444` | Error states         |
| **Info Blue**         | `#3B82F6` | Information callouts |
| **Purple Accent**     | `#9333EA` | Special features     |

### Gradient Specifications

```css
/* Hero gradient overlay */
background: linear-gradient(
  180deg,
  rgba(17, 24, 28, 0) 0%,
  rgba(17, 24, 28, 0.8) 50%,
  rgba(17, 24, 28, 1) 100%
);

/* Green glow effect */
background: radial-gradient(ellipse at center, rgba(62, 207, 142, 0.15) 0%, transparent 70%);

/* Card hover gradient */
background: linear-gradient(145deg, rgba(62, 207, 142, 0.05) 0%, transparent 50%);
```

### CSS Variables (Scale System)

Supabase uses Radix UI colors with a custom scale system:

```css
:root {
  --colors-scale1: var(--colors-gray1);
  --colors-scale2: var(--colors-gray2);
  --colors-scale3: var(--colors-gray3);
  /* ... continues to scale12 */
  --colors-scale12: var(--colors-gray12);
}

.dark {
  --colors-scale1: var(--colors-slate1);
  --colors-scale2: var(--colors-slate2);
  /* ... continues to scale12 */
}
```

---

## Typography

### Font Families

#### Primary Font: Custom Sans-Serif Stack

```css
font-family:
  'Circular',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  Oxygen,
  Ubuntu,
  Cantarell,
  'Open Sans',
  'Helvetica Neue',
  sans-serif;
```

#### Monospace Font (Code)

```css
font-family:
  'Source Code Pro', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace;
```

### Font Weights

| Weight    | Value | Usage              |
| --------- | ----- | ------------------ |
| Light     | 300   | Large display text |
| Regular   | 400   | Body text          |
| Medium    | 500   | Emphasis, labels   |
| Semi-Bold | 600   | Headings, buttons  |
| Bold      | 700   | Strong emphasis    |

### Type Scale

| Element    | Size (Desktop)  | Size (Mobile)   | Line Height | Weight |
| ---------- | --------------- | --------------- | ----------- | ------ |
| H1 (Hero)  | 56px / 3.5rem   | 36px / 2.25rem  | 1.1         | 600    |
| H2         | 40px / 2.5rem   | 28px / 1.75rem  | 1.2         | 600    |
| H3         | 30px / 1.875rem | 24px / 1.5rem   | 1.3         | 600    |
| H4         | 24px / 1.5rem   | 20px / 1.25rem  | 1.4         | 600    |
| H5         | 20px / 1.25rem  | 18px / 1.125rem | 1.4         | 500    |
| Body Large | 18px / 1.125rem | 16px / 1rem     | 1.6         | 400    |
| Body       | 16px / 1rem     | 16px / 1rem     | 1.6         | 400    |
| Body Small | 14px / 0.875rem | 14px / 0.875rem | 1.5         | 400    |
| Caption    | 12px / 0.75rem  | 12px / 0.75rem  | 1.4         | 400    |
| Code       | 14px / 0.875rem | 13px            | 1.5         | 400    |

### Letter Spacing

| Element Type    | Letter Spacing     |
| --------------- | ------------------ |
| Headings        | -0.02em to -0.03em |
| Body            | 0                  |
| All Caps Labels | 0.05em to 0.1em    |
| Code            | 0                  |

---

## Logo & Brand Assets

### Logo Specifications

- **Primary Logo**: Supabase wordmark with icon
- **Icon Only**: Green database/lightning bolt hybrid mark
- **Wordmark Only**: "supabase" text in lowercase

### Logo Colors

| Variant     | Background        | Logo Color                  |
| ----------- | ----------------- | --------------------------- |
| Dark Theme  | Dark backgrounds  | White wordmark + Green icon |
| Light Theme | Light backgrounds | Dark wordmark + Green icon  |
| Monochrome  | Any               | Single color version        |

### Clear Space

- Minimum clear space: 1x height of the icon around all sides
- Never distort, rotate, or alter proportions
- Never use unapproved colors for the wordmark

### Usage Guidelines

- Do not use any other color for the wordmark
- Maintain aspect ratio at all times
- Minimum size: 80px width for full logo

---

## UI Components & Framework

### Component Library Stack

Supabase's UI is built on a three-tier architecture:

1. **Radix UI Primitives**: Accessible, unstyled base components
2. **shadcn/ui**: Pre-styled component variants
3. **Custom Supabase UI**: Brand-specific implementations

### Core Component Packages

```json
{
  "@radix-ui/react-*": "Latest versions",
  "@headlessui/react": "^1.7.17",
  "lucide-react": "^0.436.0",
  "@heroicons/react": "^2.1.3",
  "cmdk": "^1.1.1"
}
```

### Button Styles

```css
/* Primary Button */
.btn-primary {
  background: #3ecf8e;
  color: #000000;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: #34b27b;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #ededed;
  border: 1px solid #333333;
  border-radius: 6px;
  padding: 10px 16px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #444444;
}
```

### Card Component

```css
.card {
  background: #1c1c1c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.card:hover {
  border-color: rgba(62, 207, 142, 0.3);
  background: linear-gradient(145deg, rgba(62, 207, 142, 0.03) 0%, transparent 50%);
}
```

### Input Fields

```css
.input {
  background: #0d0d0d;
  border: 1px solid #333333;
  border-radius: 6px;
  padding: 10px 14px;
  color: #ededed;
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: #3ecf8e;
  box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.1);
}
```

---

## Layout & Grid System

### Container Widths

| Breakpoint   | Max Width | Padding |
| ------------ | --------- | ------- |
| Default      | 100%      | 16px    |
| sm (640px)   | 640px     | 24px    |
| md (768px)   | 768px     | 24px    |
| lg (1024px)  | 1024px    | 32px    |
| xl (1280px)  | 1280px    | 32px    |
| 2xl (1536px) | 1400px    | 32px    |

### Grid System

```css
/* Standard 12-column grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Product bento grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 16px;
}
```

### Spacing Scale (Based on 4px)

| Token    | Value | Usage            |
| -------- | ----- | ---------------- |
| space-1  | 4px   | Tight spacing    |
| space-2  | 8px   | Icon gaps        |
| space-3  | 12px  | Input padding    |
| space-4  | 16px  | Standard spacing |
| space-6  | 24px  | Card padding     |
| space-8  | 32px  | Section spacing  |
| space-12 | 48px  | Large gaps       |
| space-16 | 64px  | Section padding  |
| space-24 | 96px  | Hero spacing     |

### Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

---

## Dark/Light Theme System

### Theme Detection

```javascript
// Automatic theme detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Manual theme toggle using data attribute
document.documentElement.setAttribute('data-theme', 'dark');
```

### Theme Variables

```css
/* Light Theme */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 153 58% 53%;
  --primary-foreground: 0 0% 0%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
}

/* Dark Theme */
[data-theme='dark'] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 153 58% 53%;
  --primary-foreground: 0 0% 0%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
}
```

### Implementation Pattern

Supabase uses Radix Colors which automatically handles light/dark variants through CSS variables, eliminating the need for separate dark mode classes on individual components.

---

## Animations & Motion

### Animation Philosophy

- **Subtle & Purposeful**: Animations enhance UX without distraction
- **Performance-First**: Hardware-accelerated transforms preferred
- **Consistent Timing**: Standardized duration and easing curves

### Timing Functions

```css
/* Standard easing curves */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Duration scale */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Keyframe Animations

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse Glow (for CTAs) */
@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(62, 207, 142, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(62, 207, 142, 0);
  }
}

/* Infinite scroll for logo carousel */
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

### Hover Transitions

```css
/* Card hover lift */
.card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

/* Button hover */
.button {
  transition: all 0.15s ease;
}

.button:hover {
  transform: translateY(-1px);
}

/* Link underline animation */
.link {
  position: relative;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #3ecf8e;
  transition: width 0.2s ease;
}

.link:hover::after {
  width: 100%;
}
```

### Framer Motion Patterns (React)

```jsx
// Staggered list animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
```

### Scroll-Based Animations

```css
/* Intersection Observer triggers */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### AI Icon Animation

Supabase includes custom AI icon animations defined in `ai-icon-animation-style.module.css` with multi-step animated sequences for their AI features.

---

## Iconography

### Primary Icon Library

**Lucide React** (v0.436.0) - Primary icon set

- Tree-shakeable SVG icons
- Consistent 24x24 base size
- 1.5px stroke width

### Secondary Icon Library

**Heroicons** (v2.1.3) - Supplementary icons

- Used in Studio and WWW applications
- Outline and solid variants

### Icon Sizing

| Size | Pixel Value | Usage               |
| ---- | ----------- | ------------------- |
| xs   | 12px        | Inline badges       |
| sm   | 16px        | Compact UI          |
| md   | 20px        | Default             |
| lg   | 24px        | Navigation, buttons |
| xl   | 32px        | Feature icons       |
| 2xl  | 48px        | Hero icons          |

### Icon Styling

```css
.icon {
  color: currentColor;
  flex-shrink: 0;
}

.icon-muted {
  color: #6b6b6b;
}

.icon-brand {
  color: #3ecf8e;
}
```

---

## Design Patterns & Trends

### Bento Grid Layout

The homepage features a distinctive bento-box grid layout for product features:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 16px;
}

/* Large featured card */
.bento-large {
  grid-column: span 2;
  grid-row: span 2;
}

/* Standard card */
.bento-standard {
  grid-column: span 1;
  grid-row: span 1;
}
```

### Glassmorphism Effects

```css
.glass-card {
  background: rgba(28, 28, 28, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Glow Effects

```css
/* Green glow on hover */
.glow-effect {
  position: relative;
}

.glow-effect::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, rgba(62, 207, 142, 0.2), transparent 50%);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.glow-effect:hover::before {
  opacity: 1;
}
```

### Infinite Logo Carousel

```css
.logo-carousel {
  display: flex;
  animation: scroll 30s linear infinite;
  width: max-content;
}

.logo-carousel:hover {
  animation-play-state: paused;
}
```

### Command Palette (⌘K)

Powered by `cmdk` library for keyboard-driven navigation with fuzzy search capabilities.

### Social Proof Patterns

- Trusted company logos in scrolling carousel
- Twitter/X testimonial cards with profile images
- GitHub star count badge in navigation
- Customer story case studies

---

## Technical Stack

### Frontend Framework

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x"
}
```

### Styling

```json
{
  "tailwindcss": "3.4.1",
  "@tailwindcss/typography": "latest",
  "tailwindcss-animate": "latest"
}
```

### UI Components

```json
{
  "@radix-ui/react-*": "various",
  "@supabase/ui": "internal package",
  "cmdk": "^1.1.1",
  "vaul": "drawer component",
  "sonner": "toast notifications"
}
```

### Animation Libraries

```json
{
  "framer-motion": "10.x",
  "tailwindcss-animate": "latest"
}
```

### State Management

```json
{
  "jotai": "^2.8.0",
  "zustand": "used in some apps",
  "@tanstack/react-query": "data fetching"
}
```

### Build Tools

- **pnpm** - Package manager with workspace support
- **Turborepo** - Monorepo build system
- **Vercel** - Deployment platform

---

## Accessibility

### Standards Compliance

- WCAG 2.1 AA compliance target
- Radix UI primitives provide built-in accessibility
- Keyboard navigation support throughout

### Focus States

```css
/* Focus visible ring */
.focus-visible:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: #3ecf8e;
  ring-offset: 2px;
  ring-offset-color: #11181c;
}
```

### Color Contrast

- All text meets minimum 4.5:1 contrast ratio
- Interactive elements meet 3:1 contrast ratio
- Focus indicators are clearly visible

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ARIA Patterns

- Proper heading hierarchy (h1 → h6)
- Descriptive link text
- Form labels and error states
- Live regions for dynamic content

---

## Quick Reference

### Essential Values

| Property           | Value        |
| ------------------ | ------------ |
| Primary Color      | `#3ECF8E`    |
| Dark Background    | `#11181C`    |
| Border Radius (sm) | `6px`        |
| Border Radius (md) | `8px`        |
| Border Radius (lg) | `12px`       |
| Default Transition | `0.2s ease`  |
| Fast Transition    | `0.15s ease` |

### Import Statement (Tailwind Config)

```javascript
const ui = require('@supabase/ui/dist/config/ui.config.js');

module.exports = ui({
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@supabase/ui/dist/config/default-theme.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
```

---

## Resources

- **Brand Assets**: [supabase.com/brand-assets](https://supabase.com/brand-assets)
- **UI Library**: [supabase.com/ui](https://supabase.com/ui)
- **GitHub UI Package**: [github.com/supabase/supabase/tree/master/packages/ui](https://github.com/supabase/supabase/tree/master/packages/ui)
- **Design System**: Inspired by [Radix](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com)

---

_Document Version: 1.0_  
_Last Updated: December 2025_  
_Based on analysis of supabase.com and official documentation_
