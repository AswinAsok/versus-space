# Mentimeter UI Design System Analysis

> **Analysis Date:** December 2025  
> **Website:** https://www.mentimeter.com  
> **Brand Identity By:** Bold Scandinavia (2020) with recent illustration updates by Loek Vugs (2025)

---

## Overview

Mentimeter is an interactive presentation platform that enables real-time audience engagement. Their visual identity was created by Bold Scandinavia in 2020, taking visual cues from data visualization elements like bar charts, pie charts, lines, and dots. The brand recently (late 2025) introduced a new hand-drawn illustration system by Dutch designer Loek Vugs.

---

## Typography

### Primary Typeface: Menti Sans

| Property    | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Font Family | Menti Sans                                                   |
| Type        | Custom Sans-Serif                                            |
| Created By  | Letters from Sweden (in collaboration with Bold Scandinavia) |
| Character   | Geometric with quirky details referencing bar charts         |
| Usage       | Primary brand font across all touchpoints                    |

**Available Weights:**

- Light
- Regular
- Medium
- Semibold
- Bold

**Design Notes:**

- Custom-designed specifically for Mentimeter
- Subtle references to data visualization in letter forms
- Optimized for accessibility and readability
- Used across marketing, UI, and brand communications

### Secondary/Display Typeface: Menti Display

| Property    | Value                                         |
| ----------- | --------------------------------------------- |
| Font Family | Menti Display                                 |
| Type        | Display Sans-Serif                            |
| Usage       | Headlines, hero sections, marketing materials |
| Character   | Bold, impactful display variant               |

### Presentation Theme Fonts

| Theme       | Font   | Designer       |
| ----------- | ------ | -------------- |
| Menti White | Gilroy | Radomir Tinkov |
| Menti Dark  | Gilroy | Radomir Tinkov |

**Gilroy Font Weights (used in presentations):**

- Light
- Regular
- Medium
- Semibold
- Bold
- ExtraBold

### Fallback Font Stack (Web)

```css
font-family: 'Menti Sans', 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

### Typography Scale (Estimated)

| Element         | Size    | Weight         | Line Height |
| --------------- | ------- | -------------- | ----------- |
| H1 (Hero)       | 48-72px | Bold (700)     | 1.1-1.2     |
| H2 (Section)    | 36-48px | Semibold (600) | 1.2-1.3     |
| H3 (Subsection) | 24-32px | Semibold (600) | 1.3         |
| H4 (Card Title) | 20-24px | Medium (500)   | 1.4         |
| Body Large      | 18-20px | Regular (400)  | 1.5-1.6     |
| Body            | 16px    | Regular (400)  | 1.5-1.6     |
| Body Small      | 14px    | Regular (400)  | 1.5         |
| Caption         | 12-13px | Regular (400)  | 1.4         |

---

## Color Palette

### Primary Colors

| Color Name           | Hex Code  | RGB                | Usage                            |
| -------------------- | --------- | ------------------ | -------------------------------- |
| Menti Blue (Primary) | `#196AFF` | rgb(25, 106, 255)  | Primary brand color, CTAs, links |
| Menti Dark Blue      | `#0D47A1` | rgb(13, 71, 161)   | Headers, emphasis                |
| White                | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark        |
| Black                | `#1A1A1A` | rgb(26, 26, 26)    | Primary text                     |

### Secondary/Accent Colors (Vibrant Palette)

| Color Name   | Hex Code  | RGB               | Usage %                        |
| ------------ | --------- | ----------------- | ------------------------------ |
| Coral/Orange | `#FF6B4A` | rgb(255, 107, 74) | ~10% - Accents, highlights     |
| Magenta/Pink | `#E91E63` | rgb(233, 30, 99)  | ~8% - Interactive elements     |
| Purple       | `#9C27B0` | rgb(156, 39, 176) | ~8% - Visual variety           |
| Teal         | `#00BFA5` | rgb(0, 191, 165)  | ~10% - Success states, accents |
| Yellow       | `#FFCA28` | rgb(255, 202, 40) | ~5% - Highlights, warnings     |
| Green        | `#4CAF50` | rgb(76, 175, 80)  | ~5% - Success, positive states |

### Neutral Colors

| Color Name | Hex Code  | RGB                | Usage              |
| ---------- | --------- | ------------------ | ------------------ |
| Gray 900   | `#1A1A1A` | rgb(26, 26, 26)    | Primary text       |
| Gray 700   | `#4A4A4A` | rgb(74, 74, 74)    | Secondary text     |
| Gray 500   | `#9E9E9E` | rgb(158, 158, 158) | Placeholder text   |
| Gray 300   | `#E0E0E0` | rgb(224, 224, 224) | Borders, dividers  |
| Gray 100   | `#F5F5F5` | rgb(245, 245, 245) | Subtle backgrounds |
| Gray 50    | `#FAFAFA` | rgb(250, 250, 250) | Light backgrounds  |

### Color Usage Distribution (Estimated)

```
Primary Blue:     35% ████████████████████
White:            30% ██████████████████
Neutrals (Grays): 20% ████████████
Accent Colors:    15% █████████
```

### Gradient Usage

Mentimeter uses subtle gradients primarily in:

- Hero sections
- Interactive data visualizations
- Brand illustrations

**Common Gradient Pattern:**

```css
/* Blue gradient (hero sections) */
background: linear-gradient(135deg, #196aff 0%, #0d47a1 100%);

/* Vibrant accent gradient */
background: linear-gradient(135deg, #ff6b4a 0%, #e91e63 100%);
```

---

## Design Elements

### The Menti Line

A key visual element that represents user interaction:

- Horizontal line that serves as a foundation
- Data/information "rises" from the line through participation
- Unifying element across all brand touchpoints

### Logo Symbol

The Mentimeter symbol combines:

- Abstract "M" shape
- Bar graph elements
- Pie chart references
- Data visualization aesthetics

### Illustration Style (2025 Update)

| Property  | Description                                  |
| --------- | -------------------------------------------- |
| Style     | Hand-drawn, single-color                     |
| Designer  | Loek Vugs                                    |
| Character | Minimal forms with believable human movement |
| Types     | Spot illustrations & icon set                |
| Animation | Subtle hover-triggered animations            |

### Iconography

| Property      | Value                  |
| ------------- | ---------------------- |
| Style         | Outline/Line icons     |
| Stroke Width  | 1.5-2px                |
| Corner Radius | Rounded                |
| Size Grid     | 16px, 20px, 24px, 32px |

---

## Spacing System

### Base Unit: 8px

| Token   | Value | Usage                         |
| ------- | ----- | ----------------------------- |
| space-1 | 4px   | Tight spacing, icon gaps      |
| space-2 | 8px   | Small padding, inline spacing |
| space-3 | 16px  | Component padding             |
| space-4 | 24px  | Section padding               |
| space-5 | 32px  | Large gaps                    |
| space-6 | 48px  | Section margins               |
| space-7 | 64px  | Major section breaks          |
| space-8 | 96px  | Page sections                 |

---

## Border Radius

| Element      | Radius             |
| ------------ | ------------------ |
| Buttons      | 8px                |
| Cards        | 12-16px            |
| Input Fields | 8px                |
| Modals       | 16px               |
| Pills/Tags   | 999px (full round) |
| Avatar       | 50% (circle)       |

---

## Shadow System

| Level  | CSS Value                      | Usage                     |
| ------ | ------------------------------ | ------------------------- |
| Subtle | `0 1px 2px rgba(0,0,0,0.05)`   | Hover states              |
| Small  | `0 2px 4px rgba(0,0,0,0.1)`    | Cards, buttons            |
| Medium | `0 4px 12px rgba(0,0,0,0.1)`   | Dropdowns, popovers       |
| Large  | `0 8px 24px rgba(0,0,0,0.12)`  | Modals, floating elements |
| XLarge | `0 16px 48px rgba(0,0,0,0.15)` | Hero cards                |

---

## Button Styles

### Primary Button

```css
.btn-primary {
  background-color: #196aff;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #0d47a1;
  transform: translateY(-1px);
}
```

### Secondary Button

```css
.btn-secondary {
  background-color: transparent;
  color: #196aff;
  border: 2px solid #196aff;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 8px;
}
```

---

## Component Overview

### Cards

- Clean white backgrounds
- Subtle shadows (Small level)
- 12-16px border radius
- 24px internal padding
- Optional colored accent borders

### Forms/Inputs

- Height: 44-48px
- Border: 1px solid Gray 300
- Focus state: Blue border with subtle shadow
- Placeholder: Gray 500
- Border radius: 8px

### Navigation

- Fixed header on scroll
- Height: ~64px
- White background with subtle shadow
- Primary navigation links in Gray 700/900
- CTA buttons in Primary Blue

---

## Animation & Motion

### Principles

- Subtle and purposeful
- Support user interaction
- Don't distract from content
- Enhance data visualization moments

### Timing

| Type               | Duration  | Easing      |
| ------------------ | --------- | ----------- |
| Micro-interactions | 150-200ms | ease-out    |
| State changes      | 200-300ms | ease-in-out |
| Page transitions   | 300-400ms | ease-in-out |
| Data animations    | 400-600ms | ease-out    |

---

## Responsive Breakpoints

| Breakpoint | Width       | Target              |
| ---------- | ----------- | ------------------- |
| xs         | 0-575px     | Mobile portrait     |
| sm         | 576-767px   | Mobile landscape    |
| md         | 768-991px   | Tablet              |
| lg         | 992-1199px  | Desktop             |
| xl         | 1200-1399px | Large desktop       |
| xxl        | 1400px+     | Extra large screens |

---

## Accessibility

### Color Contrast

- All text meets WCAG AA standards (4.5:1 for normal text)
- Large text meets 3:1 minimum
- Interactive elements meet 3:1 contrast ratio

### Focus States

- Visible focus indicators (blue outline)
- Focus ring: `0 0 0 3px rgba(25, 106, 255, 0.3)`

---

## Brand Voice & Messaging

### Tone Characteristics

- **Inclusive:** Every voice matters
- **Playful:** Fun and engaging
- **Simple:** Clear and accessible
- **Energetic:** Active and dynamic

### Tagline

> "Listen, learn, and think. Together."

---

## Key Statistics (Brand Impact)

| Metric           | Value                              |
| ---------------- | ---------------------------------- |
| User Growth      | +81% (70M to 127M users in 1 year) |
| New Presenters   | +260% (in 1 year)                  |
| Uniqueness Score | +8.5%                              |
| Likability       | +5.6%                              |
| Purchase Intent  | +4.0%                              |

---

## Credits

- **Brand Identity:** Bold Scandinavia (Stockholm)
- **Creative Direction:** Oliver Helfrich
- **Design:** Yun Yu, Ivo Rubboli
- **Custom Typeface:** Letters from Sweden
- **Illustration System (2025):** Loek Vugs
- **Art Direction (2025):** Mikael Lundin, Peter Viksten

---

_This document is based on publicly available information and visual analysis of the Mentimeter website and brand materials as of December 2025._
i h
