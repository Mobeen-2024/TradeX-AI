## 2024-05-15 - [Add Semantic Labels and ARIA properties to AuthFlow]
**Learning:** Found that custom inputs lacked `htmlFor` linkage to their labels, and icon-only buttons lacked `aria-label` properties, preventing screen readers from understanding their purpose. In addition, using `focus:outline-none` on interactive elements without a fallback removed keyboard focus visibility.
**Action:** Always link `<label>`s and `<input>`s, use `aria-label`s for icon buttons, and provide a `focus-visible:ring-2` to restore focus indicators when default outline is removed.
