# Versus Space - Information Architecture & Siloing Blueprint

## 1. Current Page Structure Map

```
VERSUS SPACE HOME PAGE
│
├─ HERO SECTION (H1 Focus)
│  ├─ Badge: "Free Real-Time Polling Platform"
│  ├─ H1: "Create Real-Time Polls That Engage Instantly"
│  ├─ Value Proposition Paragraph
│  ├─ CTA Buttons: "Start a War" + "Give a Star"
│  ├─ Trust Note
│  └─ Demo Video (YouTube embed)
│
├─ STATS SECTION (No H2 - Gap)
│  ├─ Polls Created Counter
│  ├─ Clicks Cast Counter
│  └─ Create Poll Button
│
├─ LEADERBOARD SECTION (H2 present in component)
│  ├─ H2: "Live Leaderboard"
│  ├─ Subtitle: "See what's trending..."
│  ├─ Top 5 Polls List
│  └─ "Create Your Own Poll" Card
│
├─ BUILT FOR SECTION (No H2 - Gap)
│  ├─ Label: "BUILT FOR HACKATHON AT"
│  └─ Ente Logo Link
│
├─ HOW IT WORKS SECTION (H2 + H3)
│  ├─ Badge: "Simple Process"
│  ├─ H2: "How to Create a Real-Time Poll"
│  ├─ Subtitle Paragraph
│  └─ 3 Step Cards (H3 titles)
│     ├─ Step 1: "Create Your Poll" (H3)
│     ├─ Step 2: "Share the Link" (H3)
│     └─ Step 3: "Watch Live Results" (H3)
│
├─ USE CASES SECTION (H2 + H3)
│  ├─ Badge: "Use Cases"
│  ├─ H2: "Best Uses for Real-Time Polling"
│  ├─ Subtitle Paragraph
│  └─ 6 Use Case Cards (H3 titles)
│     ├─ H3: "Live Presentations"
│     ├─ H3: "Classroom Activities"
│     ├─ H3: "Team Decisions"
│     ├─ H3: "Events & Conferences"
│     ├─ H3: "Social Engagement"
│     └─ H3: "Quick Feedback"
│
├─ FAQ SECTION (H2 + H3)
│  ├─ Badge: "FAQ"
│  ├─ H2: "Frequently Asked Questions"
│  ├─ Subtitle Paragraph
│  └─ 6 FAQ Items (H3 questions)
│     ├─ H3: "What is Versus Space?"
│     ├─ H3: "Is Versus Space free to use?"
│     ├─ H3: "Do participants need an account to vote?"
│     ├─ H3: "Can I see poll results in real-time?"
│     ├─ H3: "Are online polls anonymous?"
│     └─ H3: "How do I share a poll with my audience?"
│
├─ CTA SECTION (H2 only)
│  ├─ H2: "Ready to Create Your First Real-Time Poll?"
│  ├─ Subtitle Paragraph
│  ├─ CTA Button: "Create Free Poll"
│  └─ Trust Features (3-item list)
│
└─ FOOTER
   ├─ Copyright
   ├─ "Inspired by neal.fun" Link
   └─ "Built by aswinasok" Link

```

---

## 2. Recommended Siloing Strategy

### Silo 1: Product Features & How-To
**Focus:** Educational content about using Versus Space

```
/how-it-works (future page - optional)
├─ How to Create a Poll (detailed guide)
├─ How to Share a Poll (detailed guide)
├─ How to View Results (detailed guide)
└─ Best Practices

Backlinks From:
├─ Hero: "Launch free online polls" → #how-it-works
├─ Use Cases: "See how it works" links
└─ FAQ: Relevant answer links
```

**Keywords in silo:**
- "how to create a poll"
- "real-time poll creation"
- "share poll link"
- "view poll results"

### Silo 2: Use Cases & Industry Applications
**Focus:** Industry-specific applications and benefits

```
/use-cases (future page - optional)
├─ Presentations (detailed guide)
├─ Classroom Activities (detailed guide)
├─ Team Decisions (detailed guide)
├─ Events & Conferences (detailed guide)
├─ Social Engagement (detailed guide)
└─ Quick Feedback (detailed guide)

Backlinks From:
├─ How It Works: Process applies to all use cases
├─ FAQ: Q&A about use cases
└─ CTA: "See use cases" link
```

**Keywords in silo:**
- "audience polling for presentations"
- "classroom engagement tools"
- "team voting tools"
- "event polling software"
- "social media polls"

### Silo 3: Comparisons & Competitive Content
**Focus:** Why Versus Space vs alternatives (future)

```
/comparisons (future page - optional)
├─ vs Other Polling Tools
├─ Free vs Paid Solutions
├─ Why Real-Time Polling Matters
└─ Feature Comparison

Backlinks From:
├─ Hero: Positioning statement
├─ FAQ: Differentiation answers
└─ Features: Detailed comparison
```

**Keywords in silo:**
- "free polling tool"
- "real-time voting software"
- "best online polling platform"
- "audience response system"

### Silo 4: FAQ & Support
**Focus:** Question resolution and common issues

```
/faq (or FAQ accordion on home)
├─ What is Versus Space?
├─ Pricing & Limits
├─ Usage & Features
├─ Privacy & Security
└─ Troubleshooting

Backlinks From:
├─ All sections → Relevant FAQ items
├─ CTAs → FAQ section
└─ Use cases → FAQ answers
```

**Keywords in silo:**
- "free online polling"
- "anonymous voting"
- "no signup polls"
- "poll privacy"

---

## 3. Internal Link Matrix (Home Page - Phase 1)

### From Hero Section
```
Start a War (button)        → /create
Give a Star (link)          → https://github.com/AswinAsok... (external, correct)
"Launch free online polls"  → #how-it-works (NEW LINK)
```

### From Stats Section
```
Create Poll (button)        → /create
```

### From Leaderboard Section
```
Poll Cards (clickable)      → /poll/{id} (already done ✓)
Create Your Own Poll (card) → /create (already done ✓)
```

### From How It Works Section
```
Step titles (H3s)           → Could link to use cases (optional)
Share the Link step         → /guide/sharing (future page)
Watch Results step          → /poll-features (future page)
```

### From Use Cases Section
```
Live Presentations          → /guide/presentations (future)
Classroom Activities        → /guide/classroom (future)
Team Decisions              → /guide/team-voting (future)
Events & Conferences        → /guide/events (future)
Social Engagement           → /guide/social-polls (future)
Quick Feedback              → /guide/surveys (future)

OR (Phase 1): Link to #how-it-works
```

### From FAQ Section
```
All FAQ questions           → Add internal links in answers where appropriate:
  - Share answers link to #how-it-works
  - Privacy answers link to /privacy (if exists)
  - Feature questions link to relevant sections
```

### From CTA Section
```
Create Free Poll (button)   → /create (already done ✓)
```

### From Footer
```
neal.fun link               → https://neal.fun (external ✓)
GitHub link                 → https://github.com/AswinAsok (external ✓)
```

---

## 4. Header Hierarchy Visualization

### Current → Recommended

```
CURRENT HIERARCHY          RECOMMENDED HIERARCHY
─────────────────          ──────────────────────

H1 Main Title              H1: Main Title (unchanged ✓)
   (Hero)                      │
                               │
H2 How It Works            H2: Platform Stats (sr-only)
   H3: Step 1              H2: Live Leaderboard
   H3: Step 2              H2: Built For... (or removed)
   H3: Step 3              H2: How It Works
                               H3: Step 1
H2 Use Cases                   H3: Step 2
   H3: Case 1                  H3: Step 3
   H3: Case 2              H2: Best Uses
   H3: Case 3                  H3: Use Case 1
   H3: Case 4                  H3: Use Case 2
   H3: Case 5                  H3: Use Case 3
   H3: Case 6                  H3: Use Case 4
                               H3: Use Case 5
H2 FAQ                         H3: Use Case 6
   H3: Q1                  H2: Frequently Asked
   H3: Q2                      H3: Q1
   H3: Q3                      H3: Q2
   H3: Q4                      H3: Q3
   H3: Q5                      H3: Q4
   H3: Q6                      H3: Q5
                               H3: Q6
H2 Ready to Create...      H2: Ready to Create...

GAPS FIXED:
- Added sr-only H2 for Stats
- Added or clarified H2 for Leaderboard
- Added clear H2 for Built For section
```

---

## 5. Content Depth Assessment

### Current Content Completeness

| Section | Completeness | Words | Status |
|---------|------------|-------|--------|
| Hero | 100% | ~150 | Complete with video |
| Stats | 60% | ~20 | Missing context |
| Leaderboard | 85% | ~50 | Good, could add context |
| Built For | 40% | ~10 | Orphaned, needs narrative |
| How It Works | 95% | ~200 | Excellent |
| Use Cases | 100% | ~150 | Complete |
| FAQ | 90% | ~500 | Strong, needs internal links |
| CTA | 85% | ~100 | Good, could use testimonial |

**Total page word count: ~1,300 words** (Good depth for topic)

### Content Gaps to Fill

1. **Stats Context** (Add 50-100 words)
   - Explain why these numbers matter
   - Connect to value proposition
   - Example: "X polls created daily by users like..."

2. **Built For Section** (Restructure)
   - Add narrative context
   - Explain hackathon connection
   - Link to community story

3. **Internal Cross-references** (Add 20-30 links)
   - FAQ answers reference How It Works
   - Use Cases reference specific features
   - CTAs link to How It Works

4. **Trust & Social Proof** (Add 100-200 words)
   - Testimonial section (optional)
   - User stories (optional)
   - Press mentions (optional)

---

## 6. Featured Snippet Optimization

### Quick Wins by Section

#### FAQ Section → "People Also Ask" Box
```
Queries:
- "What is Versus Space?"
  Answer: Directly answered in FAQ ✓
  Target: Position 0 for branded query

- "How to create a poll"
  Answer: Covered in How It Works
  Enhancement: Make first FAQ answer even more direct

- "Free online polling tools"
  Answer: "Yes, Versus Space is completely free..."
  Current: Covered in FAQ ✓

- "Audience response system"
  Answer: Add to FAQ or dedicated section
  Currently Missing
```

#### How It Works → "How To" Snippet
```
Format: Step-by-step (currently perfect for this)
Schema: HowTo (recommended in main doc)
Current status: Eligible for carousel in search results

Optimization:
- Ensure each step is 20-40 words
- Add estimated time (30 seconds) ✓ Already mentioned
- Include preview image for each step
```

#### Use Cases → List Snippet
```
Current: 6 use cases with descriptions
Format: Perfect for featured snippet

Optimization:
- Add intro: "Real-time polls are used for:"
- Use consistent numbering (1-6)
- Keep descriptions 30-50 words each
- Add schema markup for list snippet
```

#### Stats Section → Knowledge Panel
```
Metrics: Polls created + Votes cast
Currently: Not optimized for knowledge panel

Opportunity:
- Add schema with metric definitions
- Format: "X polls • Y votes this week"
- Link to organization schema
```

---

## 7. URL Structure Recommendations

### Phase 1 (Current)
```
https://versus.space/                    Home
https://versus.space/auth                Sign Up/Login
https://versus.space/create              Create Poll
https://versus.space/poll/:id            View Poll
https://versus.space/dashboard           User Dashboard
```

### Phase 2 (Add optional support pages)
```
https://versus.space/                    Home (main silo)
https://versus.space/how-it-works/       How It Works Hub
  /create                                  How to Create a Poll
  /share                                   How to Share a Poll
  /view-results                            How to View Results
  /privacy                                 Privacy & Anonymity
https://versus.space/use-cases/          Use Cases Hub
  /presentations                           Live Presentations Guide
  /classroom                               Classroom Activities Guide
  /team-voting                             Team Decisions Guide
  /events                                  Events & Conferences Guide
  /social                                  Social Engagement Guide
  /surveys                                 Quick Feedback Guide
https://versus.space/faq/                FAQ Page (or stay on home)
https://versus.space/comparisons/        Why Versus Space
```

### XML Sitemap Structure (Priority)
```
High (1.0):     https://versus.space/
High (0.8):     https://versus.space/poll/* (dynamic)
Medium (0.6):   https://versus.space/create
                https://versus.space/auth
                https://versus.space/dashboard
Low (0.3):      https://versus.space/how-it-works (future)
```

---

## 8. Topic Cluster Map

```
PILLAR CONTENT (Home Page)
    ↓
    ├─→ Cluster 1: How It Works
    │   ├─ Create a Poll
    │   ├─ Share Poll Link
    │   ├─ View Real-Time Results
    │   └─ Poll Features Guide
    │
    ├─→ Cluster 2: Use Cases
    │   ├─ Presentations (Pillar)
    │   ├─ Classroom (Pillar)
    │   ├─ Team Decisions (Pillar)
    │   ├─ Events (Pillar)
    │   ├─ Social Media (Pillar)
    │   └─ Surveys (Pillar)
    │
    ├─→ Cluster 3: FAQ & Support
    │   ├─ Pricing & Limits
    │   ├─ Privacy & Security
    │   ├─ Troubleshooting
    │   └─ Account Management
    │
    └─→ Cluster 4: Why Versus Space
        ├─ Feature Comparison
        ├─ Free vs Paid
        ├─ Best Practices
        └─ Customer Stories

All clusters link back to pillar (home page)
```

---

## 9. Navigation Hierarchy

### Information Architecture Layers

**Layer 1: Primary Navigation**
```
Home → Create Poll → View Poll → Dashboard → [Optional] About
```

**Layer 2: Content Navigation (Home Page)**
```
Hero → Features → How It Works → Use Cases → FAQ → CTA
       ↓          ↓              ↓            ↓      ↓
       Stats  Leaderboard  6 examples  6 Qs  Convert
```

**Layer 3: Fragment Navigation (NEW)**
```
#how-it-works
#use-cases
#faq
#leaderboard
```

**Layer 4: Secondary Navigation (Future)**
```
How to Guides → Specific Guides → Related Content
Use Cases     → Industry Guides → Related Content
FAQ           → Support Pages   → Related Content
```

---

## 10. Keyword Mapping by Section

### Primary Keywords (Home Page)

```
SECTION              PRIMARY KW               SECONDARY KW              LSI/ENTITY
─────────────────    ───────────────────      ────────────────────      ──────────
Hero                 real-time polling        online polls              engagement
                     live voting              audience response         interactive

Stats                platform stats           active users              community
                     poll leaderboard         trending polls            popular

Leaderboard          trending polls           top polls                 community
                     poll leaderboard         most voted                popular

How It Works         how to create poll       poll creation tutorial    step-by-step
                     easy polling             quick polls               30 seconds

Use Cases            real-time polling uses  audience engagement       various industries
                     presentation tools      classroom polling         team voting

FAQ                  free polling tool        no signup polling         anonymous voting
                     poll creation FAQ        online surveys            vote security

CTA                  create free poll         start polling now         build poll
                     polling platform         audience feedback         instant results
```

---

## 11. Breadcrumb Navigation (Optional Enhancement)

### Breadcrumb Path Examples

```
Home > How to Create a Poll > Create Poll
Home > Use Cases > Presentations > Create Poll
Home > FAQ > [Topic] > How It Works
Home > Trending Polls > [Poll Name] > Vote
```

### Breadcrumb Schema Format

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://versus.space/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "How It Works",
      "item": "https://versus.space/#how-it-works"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Create Poll",
      "item": "https://versus.space/create"
    }
  ]
}
```

---

## 12. Content to Section Mapping

### User Intent → Section Match

```
USER INTENT                    SECTION(S)                WHY
────────────────────────────   ──────────────────────    ─────────────────
Want to try it now             Hero CTA                  Immediate action
Understand the concept         Hero subtitle             Quick explanation
Learn how it works             How It Works              Process clarity
See it in action               Demo video                Visual proof
Check if it's free             Hero note + FAQ           Trust building
Find use cases                 Use Cases                 Relevance
Get answers to Qs              FAQ                       Problem solving
See what's popular             Leaderboard              Social proof
Explore more                   Internal links            Deep dive
```

---

## 13. Accessibility Landmarks Map

```
┌─────────────────────────────────────────┐
│  SKIP NAVIGATION LINK (NEW)             │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  <header> NAVIGATION                    │
│  (assumed, shown in other components)   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  <main id="main-content">               │ ← FOCUS OF SKIP LINK
│  ┌─────────────────────────────────────┐│
│  │ <section id="hero">                 ││
│  │   H1 Main Title                     ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ <section> Stats                     ││
│  │   H2 (sr-only)                      ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ <section id="leaderboard">          ││
│  │   H2 Live Leaderboard               ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ <section id="how-it-works">         ││
│  │   H2 How It Works                   ││
│  │   H3 Step 1, 2, 3                   ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ <section id="use-cases">            ││
│  │   H2 Use Cases                      ││
│  │   H3 Case 1-6                       ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ <section id="faq">                  ││
│  │   H2 Frequently Asked Questions     ││
│  │   H3 Questions 1-6                  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ <section> CTA Final                 ││
│  │   H2 Ready to Create...             ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  <footer>                               │
│  Copyright & Links                      │
└─────────────────────────────────────────┘
```

---

## 14. Mobile-First Information Architecture

### Mobile Content Priority

```
PRIORITY  SECTION              WHY
────────  ─────────────────    ──────────────────────────────
1         Hero                 Immediate value, CTA visible
2         Stats                Quick proof of popularity
3         CTA                  Easy conversion on mobile
4         How It Works         Explains process clearly
5         FAQ                  Answers common questions
6         Use Cases            Shows relevance
7         Leaderboard          Social proof, secondary
8         Built For            Context, tertiary
```

### Mobile Optimizations

- Hero: Full width, readable, touch-friendly buttons
- Stats: Stacked vertically (already responsive ✓)
- How It Works: Cards stack vertically ✓
- Use Cases: Single column at 480px ✓
- FAQ: Single column at 768px ✓
- Leaderboard: Full width, scrollable if needed

---

## 15. Navigation Flow Diagram

```
USER JOURNEY ON HOME PAGE

Start
  ↓
[Hero Section]
  ├─ Question: What is this?
  │  Answer: H1 + Subtitle
  ├─ Action: Try it → CTA "Start a War"
  │  Or: Learn more → Scroll
  └─→ Next: Stats or Demo
      ↓
[Demo Video]
  ├─ Question: How does it work visually?
  │  Answer: YouTube video
  └─→ Next: How It Works (explanation)
      ↓
[How It Works]
  ├─ Question: What's the process?
  │  Answer: 3 steps
  └─→ Next: Is this for me?
      ↓
[Use Cases]
  ├─ Question: Can I use this?
  │  Answer: 6 relevant examples
  ├─ Action: Create → CTA
  │  Or: Learn more → FAQ
  └─→ Next: Still have questions?
      ↓
[FAQ]
  ├─ Question: Specific concerns?
  │  Answer: 6 FAQ items
  └─→ Next: Take action
      ↓
[Final CTA]
  ├─ Action: Create → Conversion
  │  Or: See trends → Leaderboard
  └─→ End: User converts or bounces
```

---

## Conclusion

This blueprint provides:

1. **Clear section hierarchy** with proper heading structure
2. **Content silo strategy** for future expansion
3. **Internal linking roadmap** for topical authority
4. **Accessibility landmarks** for all users
5. **Mobile-first information architecture**
6. **Featured snippet opportunities** by section
7. **Keyword mapping** for SEO optimization
8. **User journey optimization** for conversions

Use this as your roadmap for both current implementation and future content expansion.

