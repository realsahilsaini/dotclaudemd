---
name: test-basic
displayName: Test Basic
description: A basic test template
category: test
tags: [test, basic]
variables:
  - name: project_name
    prompt: "Project name?"
    default: my-project
  - name: language
    prompt: "Language?"
    options: [TypeScript, JavaScript]
    default: TypeScript
priority: 5
---

# {{project_name}}

A {{language}} project.

## Commands

```bash
npm test
```
