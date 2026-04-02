# Design System: Editorial Nocturne

## 1. Overview & Creative North Star: "The Architectural Void"
This design system is not merely a "dark mode" flip; it is a study in depth, atmosphere, and structural precision. The Creative North Star is **"The Architectural Void"**—an aesthetic inspired by modern brutalist architecture at twilight. We move away from the "flat" web by using light as a physical material. 

By utilizing deep indigo foundations and slate-blue surfaces, we create a UI that feels carved rather than drawn. We break the standard "box-in-a-box" template through intentional asymmetry, extreme typographic scale shifts, and the rejection of traditional borders in favor of tonal transitions.

## 2. Colors: Tonal Atmosphere
The palette is rooted in a deep navy abyss, moving upward through layers of slate.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be defined solely through background color shifts. 
*   *Example:* A `surface_container_low` (`#091328`) section sitting directly on a `surface` (`#060e20`) background.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Hierarchy is achieved by "stacking" container tiers:
- **Base Layer:** `surface` (#060e20) for the primary application background.
- **Sectioning:** `surface_container` (#0f1930) for large structural blocks.
- **Component Level:** `surface_container_high` (#141f38) for cards or navigation elements.
- **Elevated States:** `surface_container_highest` (#192540) for active or focused elements.

### The "Glass & Gradient" Rule
To escape the "standard" feel, use **Glassmorphism** for floating elements (Modals, Dropdowns). Use `surface_container_high` at 70% opacity with a `20px` backdrop-blur. 
*   **Signature Texture:** Primary CTAs should use a subtle linear gradient: `primary` (#9fa7ff) to `primary_container` (#8d98ff) at a 135-degree angle. This adds "soul" and prevents the interface from feeling sterile.

## 3. Typography: The Editorial Scale
We pair the geometric authority of **Manrope** with the high-utility clarity of **Inter**.

- **Display (Manrope):** Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. This creates an "Editorial" impact that feels like a premium magazine.
- **Headlines (Manrope):** `headline-lg` through `headline-sm`. These are the anchors of your layout. Use them to create asymmetrical focal points.
- **Body (Inter):** `body-lg` (1rem) is the workhorse. Ensure a line-height of 1.6 for maximum readability against the dark background.
- **Labels (Inter):** `label-md` (0.75rem) in `on_surface_variant` (#a3aac4) for metadata.

## 4. Elevation & Depth: Tonal Layering
In this system, light is the only source of truth. We do not use "shadows" in the traditional sense; we use **Ambient Glows**.

- **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface_container_low` card on a `surface_container_lowest` background. The subtle shift in hex code creates a "soft lift."
- **Ambient Shadows:** For floating elements (Modals), use a wide-spread blur (`40px+`) with `on_surface` (#dee5ff) at 4% opacity. This mimics natural light bouncing off the dark surface.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**: `outline_variant` (#40485d) at 15% opacity. Never use 100% opaque lines.

## 5. Components: Structural Primitives

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`). Text in `on_primary` (#101b8b). Corner radius: `ROUND_FOUR` (1rem).
- **Secondary:** Ghost style. No fill. `Ghost Border` (15% opacity outline). Text in `primary`.
- **Tertiary:** Text-only. `label-md` in `primary` with an underline on hover.

### Cards & Lists
- **Rule:** Forbid divider lines.
- **Implementation:** Separate list items using the Spacing Scale (e.g., `spacing.4` / 1rem) or by alternating background tints between `surface_container` and `surface_container_low`.

### Input Fields
- **Surface:** `surface_container_highest` (#192540).
- **State:** When active, the "Ghost Border" increases to 40% opacity in `primary`. Helper text must use `body-sm` in `on_surface_variant`.

### Signature Component: The "Slate Floating Nav"
A navigation bar using `surface_container_high` with 80% opacity and a `backdrop-blur`. It should not span the full width of the screen, but float with `ROUND_FOUR` corners and an `Ambient Shadow`.

## 6. Do's and Don'ts

### Do:
- **Embrace Negative Space:** Use `spacing.20` (5rem) between major sections to let the "Void" breathe.
- **Asymmetric Layouts:** Shift your headline 1/3 to the left while keeping the body text on the 2/3 line to create architectural tension.
- **Tonal Contrast:** Ensure `on_surface` text is always used on `surface` backgrounds for AA accessibility.

### Don't:
- **Don't use pure black:** It kills the "Indigo Slate" depth. Never go darker than `surface_container_lowest` (#000000) and only for the deepest recesses.
- **Don't use 1px Borders:** This is the quickest way to make the design feel "cheap" or "templated."
- **Don't use standard shadows:** Avoid high-contrast, small-blur shadows; they feel "dirty" on dark navy surfaces.