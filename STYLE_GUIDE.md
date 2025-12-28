# Versus Space Style Guide

A comprehensive design system and styling reference for the Versus Space application.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Border Radius](#border-radius)
6. [Shadows](#shadows)
7. [Transitions & Easing](#transitions--easing)
8. [Glassmorphism](#glassmorphism)
9. [Component Patterns](#component-patterns)
10. [Animations](#animations)
11. [Responsive Breakpoints](#responsive-breakpoints)
12. [Icons](#icons)
13. [Accessibility](#accessibility)

---

## Design Tokens

All design tokens are defined as CSS custom properties in `src/global.css`.

### Usage

```css
.element {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal) var(--ease-out);
}
```

---

## Color System

### Primary Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#3ecf8e` | Primary CTAs, accents, highlights |
| `--color-primary-dark` | `#34b27b` | Hover states, gradients |
| `--color-primary-darker` | `#24b47e` | Active states |
| `--color-primary-light` | `rgba(62, 207, 142, 0.1)` | Backgrounds, badges |

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#11181c` | Base page background |
| `--color-bg-alt` | `#171717` | Alternate sections |
| `--color-bg-elevated` | `#1C1C1C` | Elevated surfaces |
| `--color-bg-card` | `#232323` | Card backgrounds |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text` | `#ededed` | Primary text |
| `--color-text-light` | `#a1a1a1` | Secondary text |
| `--color-text-muted` | `#6b6b6b` | Muted/hint text |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#3ecf8e` | Success states |
| `--color-danger` | `#ef4444` | Errors, destructive actions |
| `--color-warning` | `#f5a623` | Warnings |
| `--color-info` | `#3b82f6` | Informational |

### Voting Option Color Variants

```css
/* Variant 0 - Green (Default) */
background: linear-gradient(135deg, #3ecf8e 0%, #2ab77a 100%);

/* Variant 1 - Purple */
background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);

/* Variant 2 - Blue */
background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);

/* Variant 3 - Orange */
background: linear-gradient(135deg, #fbbf24 0%, #f5a623 100%);

/* Variant 4 - Red */
background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);

/* Variant 5 - Cyan */
background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
```

---

## Typography

### Font Families

| Font | Usage | Fallbacks |
|------|-------|-----------|
| **Parkinsans** | Headings, display text | - |
| **Google Sans / Circular** | Body text, UI elements | -apple-system, BlinkMacSystemFont, Segoe UI, Roboto |
| **Source Code Pro** | Monospace, code | SF Mono, Monaco, Inconsolata |

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| Hero Title | `3.25rem` | Landing page hero |
| Section Title | `2rem` | Section headings |
| Page Title | `1.75rem` | Dashboard page titles |
| Card Title | `1.125rem` | Card headings |
| Body | `1rem` / `0.9375rem` | Default body text |
| Small | `0.875rem` | Secondary info |
| XSmall | `0.75rem` | Badges, hints |
| XXSmall | `0.6875rem` | Micro badges |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | `400` | Body text |
| Medium | `500` | UI elements, labels |
| Semibold | `600` | Headings, buttons |
| Bold | `700` | Emphasis |

### Line Heights

- **Headings:** `1.1` - `1.2`
- **Body:** `1.5` - `1.6`
- **UI Elements:** `1.35`

### Letter Spacing

- **Headings:** `-0.02em` to `-0.03em`
- **Body:** Normal
- **Uppercase (avoided):** Was `0.05em`, now removed

---

## Spacing

Based on a 4px grid system.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight spacing |
| `--space-2` | `8px` | Small gaps |
| `--space-3` | `12px` | Default gaps |
| `--space-4` | `16px` | Section padding |
| `--space-6` | `24px` | Card padding |
| `--space-8` | `32px` | Section margins |
| `--space-12` | `48px` | Large sections |
| `--space-16` | `64px` | Page sections |
| `--space-24` | `96px` | Hero spacing |

### Common Patterns

```css
/* Card padding */
padding: 1rem;           /* Compact */
padding: 1.5rem;         /* Standard */
padding: 2rem;           /* Spacious */

/* Section padding */
padding: 2rem;           /* Dashboard sections */
padding: 5rem 2rem;      /* Landing sections */

/* Element gaps */
gap: 0.5rem;             /* Tight (buttons, badges) */
gap: 0.75rem;            /* Default (grid items) */
gap: 1rem;               /* Standard (cards) */
gap: 2rem;               /* Sections */
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Buttons, inputs |
| `--radius-md` | `8px` | Cards |
| `--radius-lg` | `12px` | Large cards, modals |
| `--radius-xl` | `16px` | Hero sections |
| `--radius-full` | `999px` | Pills, badges, avatars |

---

## Shadows

### Standard Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 4px rgba(0, 0, 0, 0.2)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.3)` | Cards |
| `--shadow-lg` | `0 12px 40px rgba(0, 0, 0, 0.3)` | Modals |
| `--shadow-xl` | `0 16px 48px rgba(0, 0, 0, 0.4)` | Hero elements |

### Glow Shadows

```css
/* Focus glow */
--focus-ring: 0 0 0 3px rgba(62, 207, 142, 0.3);

/* Button shadow (subtle) */
box-shadow: 0 1px 4px rgba(62, 207, 142, 0.12);

/* Button hover shadow */
box-shadow: 0 2px 6px rgba(62, 207, 142, 0.18);

/* Active indicator glow */
box-shadow: 0 0 6px var(--color-primary);
```

---

## Transitions & Easing

### Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms` | Hover states, toggles |
| `--transition-normal` | `200ms` | Default interactions |
| `--transition-slow` | `300ms` | Layout changes |
| `--transition-slower` | `500ms` | Page transitions |

### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary easing |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy |

### Usage Pattern

```css
transition: all var(--transition-normal) var(--ease-out);
transition: transform var(--transition-fast) var(--ease-out);
transition: opacity var(--transition-slow) var(--ease-in-out);
```

---

## Glassmorphism

### Glass Tokens

```css
--glass-bg: rgba(28, 28, 28, 0.25);
--glass-bg-hover: rgba(62, 207, 142, 0.1);
--glass-border: rgba(255, 255, 255, 0.18);
--glass-border-hover: rgba(255, 255, 255, 0.3);
--glass-blur: blur(24px) saturate(180%);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 80px rgba(0, 0, 0, 0.1);
--glass-inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.1),
                         inset 0 -1px 0 rgba(255, 255, 255, 0.05);
```

### Full Glass Effect

```css
.glassCard {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow), var(--glass-inner-highlight);
}
```

### Subtle Card (No Glassmorphism)

For dashboard cards, use subtle styling without heavy effects:

```css
.subtleCard {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
}

.subtleCard:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}
```

---

## Component Patterns

### Primary Button

```css
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, #34b27b 100%);
  color: #000000;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: 0 1px 4px rgba(62, 207, 142, 0.12);
}

.btnPrimary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(62, 207, 142, 0.18);
}
```

### Secondary Button

```css
.btnSecondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  transition: all var(--transition-fast) var(--ease-out);
}

.btnSecondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
```

### Form Input

```css
.input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.9375rem;
  transition: all var(--transition-fast) var(--ease-out);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}
```

### Badge

```css
.badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
}

.badge.success {
  background: rgba(62, 207, 142, 0.15);
  color: var(--color-primary);
}

.badge.muted {
  background: rgba(100, 116, 139, 0.15);
  color: var(--color-text-light);
}
```

### Active Indicator Dot

```css
.activeDot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--color-primary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 4px var(--color-primary); }
  50% { box-shadow: 0 0 8px var(--color-primary); }
}
```

---

## Animations

### Fade In Up

```css
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

.animated {
  animation: fadeInUp 0.5s var(--ease-out) both;
}
```

### Staggered Animation

```css
.list-item {
  animation: fadeInUp 0.3s var(--ease-out) both;
}

/* Apply via inline style or loop */
.list-item:nth-child(1) { animation-delay: 0s; }
.list-item:nth-child(2) { animation-delay: 0.05s; }
.list-item:nth-child(3) { animation-delay: 0.1s; }
/* Or dynamically: style={{ animationDelay: `${index * 0.05}s` }} */
```

### Loading Spinner

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Button Shine Effect

```css
.button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s var(--ease-out);
}

.button:hover::before {
  left: 150%;
}
```

---

## Responsive Breakpoints

### Breakpoint Values

| Name | Width | Usage |
|------|-------|-------|
| Desktop | `> 1024px` | Full layout |
| Tablet | `768px - 1024px` | Condensed sidebar |
| Mobile | `< 768px` | Single column, drawer |
| Small Mobile | `< 480px` | Minimal UI |

### Media Query Patterns

```css
/* Mobile first approach */
.element {
  /* Mobile styles (default) */
  padding: 1rem;
}

@media (min-width: 768px) {
  .element {
    /* Tablet and up */
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .element {
    /* Desktop */
    padding: 2rem;
  }
}

/* Or desktop-first (current pattern) */
@media (max-width: 768px) {
  .element {
    /* Mobile overrides */
  }
}

@media (max-width: 480px) {
  .element {
    /* Small mobile overrides */
  }
}
```

### Responsive Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Sidebar Responsive Behavior

- **Desktop (>1024px):** 280px width, full labels
- **Tablet (768px-1024px):** 72px width, icons only
- **Mobile (<768px):** Hidden, slide-out drawer with overlay

---

## Icons

### Icon Library

Using **Hugeicons** (`@hugeicons/react` with `@hugeicons/core-free-icons`).

### Icon Sizes

| Context | Size | Usage |
|---------|------|-------|
| Navigation | `20px` | Sidebar nav items |
| Actions | `16px - 18px` | Buttons, badges |
| Cards | `24px` | Action card icons |
| Stats | `18px` | Stat card icons |
| Small | `12px - 14px` | Inline with text |

### Icon Usage Pattern

```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, BarChartIcon } from '@hugeicons/core-free-icons';

<HugeiconsIcon icon={Add01Icon} size={18} />
```

### Common Icons

| Icon | Usage |
|------|-------|
| `Home04Icon` | Dashboard |
| `BarChartIcon` | My Polls |
| `Add01Icon` | Create/Add actions |
| `CompassIcon` | Explore |
| `ChartLineData01Icon` | Analytics |
| `Settings01Icon` | Settings |
| `HelpCircleIcon` | Help |
| `Logout01Icon` | Sign out |
| `GlobeIcon` | Public |
| `LockIcon` | Private |
| `Calendar01Icon` | Date |
| `Delete01Icon` | Delete |
| `Copy01Icon` | Copy |
| `Tick01Icon` | Success/Check |
| `SquareArrowUpRightIcon` | External link/View |
| `ArrowRight01Icon` | Navigation arrow |

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```css
.interactive:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Or with border */
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.1);
}
```

### Touch Targets

Minimum touch target sizes:

- **Standard:** `44px` height
- **Small mobile:** `40px` height

```css
.button {
  min-height: 44px;
  padding: 0.75rem 1rem;
}

@media (max-width: 480px) {
  .button {
    min-height: 40px;
  }
}
```

### Reduced Motion

Respect user preferences:

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

### Screen Reader Only

```css
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Color Contrast

- Primary text on dark background: `#ededed` on `#11181c` (ratio > 10:1)
- Muted text: `#6b6b6b` on `#11181c` (ratio > 4.5:1)
- Primary green on dark: `#3ecf8e` on `#11181c` (ratio > 7:1)

---

## File Structure

```
src/
├── global.css              # CSS variables, resets, base styles
├── styles/
│   └── Shared.module.css   # Shared component styles
├── components/
│   ├── Layout/
│   │   ├── Sidebar.module.css
│   │   ├── DashboardLayout.module.css
│   │   └── Header.module.css
│   ├── Dashboard/
│   │   ├── DashboardHome.module.css
│   │   └── MyPolls.module.css
│   ├── Auth/
│   │   └── AuthForm.module.css
│   ├── Home/
│   │   └── Home.module.css
│   └── Poll/
│       ├── CreatePoll.module.css
│       └── VotingInterface.module.css
```

---

## Design Principles

1. **Dark Mode First:** Design with dark backgrounds and light text as the primary theme
2. **Subtle Over Bold:** Prefer understated effects; avoid heavy shadows and transforms
3. **Consistent Spacing:** Use the 4px grid for all spacing decisions
4. **Performance:** Use CSS transforms for animations, avoid layout thrashing
5. **Progressive Enhancement:** Base styles work without animations
6. **Mobile Responsive:** All components must work on 320px+ screens
7. **Accessibility First:** Focus states, touch targets, and color contrast are non-negotiable

---

## Quick Reference

### Card Styling (Subtle)

```css
background: rgba(255, 255, 255, 0.02);
border: 1px solid rgba(255, 255, 255, 0.04);
border-radius: var(--radius-md);
padding: 1rem;
```

### Hover Transform

```css
transform: translateY(-1px);  /* Subtle lift */
transform: translateY(-2px);  /* Standard lift */
```

### Shadow Scale

```css
/* Rest state */
box-shadow: 0 1px 4px rgba(62, 207, 142, 0.12);

/* Hover state */
box-shadow: 0 2px 6px rgba(62, 207, 142, 0.18);
```

### Green Gradient Button

```css
background: linear-gradient(135deg, var(--color-primary) 0%, #34b27b 100%);
color: #000000;
```

---

*Last updated: December 2024*
