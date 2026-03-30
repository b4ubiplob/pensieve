# Design System Specification: The Architectural Curator

## 1. Overview & Creative North Star: The Architectural Curator
This design system rejects the "cluttered dashboard" trope of project management. Instead, it adopts the **Architectural Curator**—a North Star that prioritizes structural clarity, editorial breathing room, and a sense of "quiet authority." 

Unlike standard tools that rely on dense grids and heavy borders, this system uses **intentional asymmetry** and **tonal layering** to guide the eye. We break the template look by treating every screen as a high-end editorial layout: large display type sits in expansive whitespace, and information is grouped into "islands of focus" rather than rigid rows. The result is a tool that feels less like a spreadsheet and more like a private digital studio.

---

## 2. Colors & Surface Philosophy
The palette is built on deep, intellectual blues and slate grays, punctuated by a high-voltage Electric Indigo.

### The Color Logic
- **Primary (`#0a0054`) & Surface Tint (`#4d44e3`):** These represent the "Command Center." Use them sparingly to ground the user.
- **Secondary (`#515f74`):** This is your functional slate. It provides professional neutrality without the coldness of pure black.
- **Tertiary (`#001815`):** Reserved for moments of deep focus or dark-themed utility sections.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts. To separate a sidebar from a main content area, place a `surface-container-low` section against the standard `surface` background. The change in tone is the boundary.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper. 
1. **Base Layer:** `surface` (#f7f9fb)
2. **Structural Sections:** `surface-container-low` (#f2f4f6)
3. **Interactive Cards:** `surface-container-lowest` (#ffffff)
4. **Elevated Overlays:** `surface-bright` (#f7f9fb)

### The Glass & Gradient Rule
To inject "soul" into the efficiency, use **Glassmorphism** for floating navigation or hovering task details. 
- **Effect:** Use a semi-transparent `surface` color with a `backdrop-blur: 12px`.
- **CTAs:** Primary buttons should use a subtle linear gradient from `primary` (#0a0054) to `surface-tint` (#4d44e3) at a 135-degree angle to provide a tactile, premium depth.

---

## 3. Typography: Editorial Authority
We use a dual-typeface system to balance character with legibility.

- **The Voice (Manrope):** Used for `display` and `headline` scales. Its geometric nature feels modern and architectural. Use `display-lg` (3.5rem) for project titles to create an immediate sense of scale.
- **The Engine (Inter):** Used for `title`, `body`, and `label` scales. Inter’s high x-height ensures that complex task descriptions and data remain legible even at `body-sm` (0.75rem).

**Editorial Hint:** Use `title-lg` (1.375rem) with increased letter spacing (0.02em) for section headers to create a premium, "gallery" feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a fallback, not a first choice.

- **The Layering Principle:** Achieve depth by "stacking." A `surface-container-lowest` card placed on a `surface-container-high` background creates a natural lift.
- **Ambient Shadows:** When a shadow is required (e.g., a dragging task card), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06)`. The shadow color is a tinted version of `on-surface` (#191c1e), making it feel like real light.
- **The "Ghost Border" Fallback:** If a border is required for accessibility in data-dense tables, use `outline-variant` (#c5c6cd) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: Refined Utility

### Buttons
- **Primary:** Gradient fill (`primary` to `surface-tint`), `xl` roundedness (0.75rem), and `title-sm` typography. 
- **Secondary:** Transparent background with a `Ghost Border` and `on-secondary-container` text.
- **Tertiary:** Pure text using `label-md` with `0.5rem` bottom padding to create a "tab-like" interaction.

### Input Fields
- **Styling:** Use `surface-container-highest` (#e0e3e5) as the fill color. 
- **Interaction:** On focus, transition the background to `surface-container-lowest` and add a 2px `surface-tint` bottom-only border. This maintains a clean, architectural look without boxing the user in.

### Cards & Task Lists
- **Rule:** Forbid divider lines. 
- **Implementation:** Separate tasks using the `2` spacing scale (0.7rem). Use `surface-container-low` for the list background and `surface-container-lowest` for the individual task items to create a "floating" effect within the container.

### The "Pulse" Chip
For project status, use `tertiary-fixed` (#89f5e7) for a "Healthy" status. The chip should have a 1px `Ghost Border` of its own color to give it a jewelry-like finish.

---

## 6. Do’s and Don’ts

### Do
- **Do use generous whitespace.** A project title should have at least `10` (3.5rem) of top margin.
- **Do use "Surface Nesting"** to group related tasks.
- **Do use Inter for all data-heavy points.** Efficiency is found in legibility.
- **Do use Manrope for "Moments of Arrival"** (Dashboards, Project Overviews).

### Don’t
- **Don’t use 1px solid black or grey borders.** It breaks the "Architectural" flow.
- **Don’t use standard drop shadows.** If it looks like a "box shadow," it’s too heavy. It should look like "ambient light."
- **Don’t crowd the corners.** Use `xl` (0.75rem) roundedness for large containers and `md` (0.375rem) for small components like chips to maintain a sophisticated softness.
- **Don’t use "Pure White" (#ffffff) for the background.** Always use the slightly off-white `surface` (#f7f9fb) to reduce eye strain and feel more premium.