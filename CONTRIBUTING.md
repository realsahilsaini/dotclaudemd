# Contributing to dotclaudemd

## Adding a Template

1. Fork the repository
2. Create a new `.md` file in the appropriate `templates/<category>/` directory
3. Add YAML frontmatter with required fields:

```yaml
---
name: my-template          # Unique identifier (kebab-case)
displayName: My Template   # Human-readable name
description: Short desc    # One-line description
category: javascript       # Category directory name
tags: [javascript, react]  # Searchable tags
variables:                 # Template variables (optional)
  - name: var_name
    prompt: "Question?"
    options: [A, B, C]     # Optional: creates select prompt
    default: A             # Optional: default value
detects:                   # Auto-detection rules (optional)
  files: [package.json]
  dependencies: [react]
priority: 10               # Higher = preferred when multiple match
---
```

4. Write the template content below the frontmatter using `{{variable_name}}` for substitutions
5. Run `npm test` to verify your template parses correctly
6. Submit a PR

## Template Guidelines

- Keep templates under 80 lines — concise is better than comprehensive
- Include a Commands section with build/test/dev commands
- Focus on project facts, not personality instructions
- Use `{{variables}}` for things that vary between projects
- Test that your template renders correctly with default values

## Development

```bash
npm install          # Install dependencies
npm run build        # Build CLI
npm test             # Run tests
npm run test:watch   # Watch mode
```

## Code Style

- TypeScript with strict mode
- ESM modules (`"type": "module"`)
- Core logic uses dependency injection for testability
- Tests use vitest
