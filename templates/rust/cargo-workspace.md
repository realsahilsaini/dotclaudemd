---
name: cargo-workspace
displayName: Rust Cargo Workspace
description: Rust project with Cargo workspace
category: rust
tags: [rust, cargo, systems]
variables:
  - name: project_type
    prompt: "Project type?"
    options: [Binary, Library, Both]
    default: Binary
detects:
  files: [Cargo.toml]
priority: 5
---

# Project

Rust project managed with Cargo.

## Commands

- `cargo build` — Build the project
- `cargo run` — Build and run (binary crate)
- `cargo test` — Run all tests
- `cargo clippy` — Run linter
- `cargo fmt` — Format code
- `cargo doc --open` — Generate and view docs

## Architecture

- `src/main.rs` — Binary entry point
- `src/lib.rs` — Library root
- `src/` — Source modules
- `tests/` — Integration tests
- `benches/` — Benchmarks

## Conventions

- Use `Result<T, E>` for fallible operations; use `thiserror` for custom error types
- Prefer `&str` over `String` in function parameters
- Use `clippy::pedantic` lint level for strictness
- Derive `Debug` on all public types
- Use `#[cfg(test)]` modules for unit tests within source files
- Integration tests go in `tests/` directory
- Document all public APIs with `///` doc comments

## Error Handling

Use `anyhow` for application code and `thiserror` for library code. Propagate errors with `?`; avoid `.unwrap()` in production code.
