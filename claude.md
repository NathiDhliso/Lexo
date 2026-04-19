# Claude Code Configuration

## Strict Rules

### No Emojis
Never use emojis anywhere in code, comments, commit messages, documentation, UI strings, toast messages, or any output. This includes unicode emoji characters, emoji shortcodes, and ASCII emoticons. No exceptions.

### No Hyphens as Punctuation
Never use hyphens, en dashes, or em dashes as punctuation in prose, comments, or documentation. Use commas, semicolons, colons, or separate sentences instead. Hyphens in code identifiers, CSS classes, filenames, and CLI flags are structural and permitted.

### Minimal Color Palette
Users hate excessive color. Keep the UI as minimal as possible.
- Use a maximum of 2 accent colors across the entire app
- Prefer neutral grays, whites, and blacks for backgrounds and text
- Reserve color only for actionable states: error (red), success (green), warning (amber)
- No gradients on backgrounds unless explicitly requested
- No colorful badges, tags, or decorative elements
- Borders and dividers should be subtle neutral tones only

### No Instructional Text in the UI
Never write explanatory sentences, descriptions, or instructions inside the application interface. Users find this patronizing.
- Replace prose descriptions with compact visual indicators (icons, dots, badges)
- All indicators must have a tooltip on hover explaining their meaning
- If a group of indicators needs explanation, use a small legend component (an info icon that expands on hover)
- Toast messages must be 5 words or fewer
- Modal headers: title only, no subtitle descriptions
- Empty states: icon and a single short label only, no paragraphs

### Code Style
- Keep comments concise and professional
- No decorative comment banners or ASCII art
- Use JSDoc style for function documentation
- Prefer single line comments over block comments where possible

### File Size Limit
- No source file may exceed 400 lines
- If a component grows beyond 400 lines, extract sub-components, hooks, or utilities
- Services should be split by domain concern, not bundled into monoliths

### Commit Messages
- Use imperative mood (e.g. "Add conflict checker" not "Added conflict checker")
- No emojis, no decorative prefixes
- Keep under 72 characters for the subject line
