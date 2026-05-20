## 2024-05-20 - Missing ARIA Labels on Icon-only Buttons
**Learning:** It was found that icon-only buttons across the application (like those in AIVoiceAssistant) frequently omit `aria-label`s, breaking accessibility for screen readers. Buttons with visual icons only must have clear textual representations in the DOM.
**Action:** When creating new components or reviewing existing code with icon-only interactive elements, ensure an `aria-label` or `title` property is added describing the action.
