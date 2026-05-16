# Domain Docs

## Layout: single-context

This repo uses a single-context layout:

- `CONTEXT.md` at the repo root — domain language, key concepts, and bounded contexts
- `docs/adr/` at the repo root — Architecture Decision Records (ADRs)

## Consumer rules

When reading domain context:
1. Always read `CONTEXT.md` first for domain vocabulary before proposing changes.
2. Check `docs/adr/` for past architectural decisions that may constrain your approach.
3. If `CONTEXT.md` does not exist yet, proceed without it and suggest the user create one.
4. If `docs/adr/` does not exist yet, proceed without it.
