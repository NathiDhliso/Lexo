# Claude Code Configuration

## Strict Rules

### No Emojis
Never use emojis anywhere in code, comments, commit messages, documentation, UI strings, toast messages, or any output. This includes unicode emoji characters, emoji shortcodes, and ASCII emoticons. No exceptions.

### No Hyphens as Punctuation
Never use hyphens (–, —, -) as punctuation in prose, comments, or documentation. Use commas, semicolons, colons, or separate sentences instead. This applies to em dashes, en dashes, and single hyphens used as separators in text.

Note: Hyphens in code identifiers (e.g. `matter-workbench`), CSS classes, filenames, and CLI flags are structural and permitted.

### Code Style
- Keep comments concise and professional
- No decorative comment banners or ASCII art
- Use JSDoc style for function documentation
- Prefer single line comments over block comments where possible

### Commit Messages
- Use imperative mood (e.g. "Add conflict checker" not "Added conflict checker")
- No emojis, no decorative prefixes
- Keep under 72 characters for the subject line
