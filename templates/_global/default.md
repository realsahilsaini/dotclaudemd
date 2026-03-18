---
name: default
displayName: Default
description: Generic CLAUDE.md template for any project
category: _global
tags: [general, default]
variables:
  - name: project_name
    prompt: "Project name?"
    default: my-project
  - name: language
    prompt: "Primary language?"
    options: [TypeScript, JavaScript, Python, Go, Rust, Java, Other]
    default: TypeScript
priority: 0
---

# {{project_name}}

## Commands

<!-- Add your build, test, and dev commands here -->

```bash
# Build
# npm run build

# Test
# npm test

# Dev
# npm run dev
```

## Architecture

<!-- Describe your project structure and key directories -->

## Code Conventions

- Follow the existing code style in the repository
- Write types/interfaces for all data structures
- Keep functions small and focused
- Write tests for new functionality

## Key Files

<!-- List important files that Claude should know about -->

## Notes

<!-- Any additional context that helps Claude understand this project -->
