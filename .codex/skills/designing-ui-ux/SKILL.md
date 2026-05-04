---
name: designing-ui-ux
description: Use when the user requests UI/UX work (design, build, create, implement, review, fix, or improve interfaces) to ensure a professional aesthetic.
---

# Designing UI/UX

## Overview
Comprehensive design guide and searchable database for web and mobile applications. Ensures consistent spacing, modern aesthetics, and accessibility across 13 technology stacks.

## When to Use
- User asks to "make it look professional" or "improve the design".
- Starting a new component or page implementation.
- Reviewing existing UI for accessibility or visual polish.
- Selecting color palettes, typography, or layout patterns.

## Core Patterns

### 1. Analyze & Research (Step 1)
Identify product type, style keywords, and target industry. Use these to query the design database.

### 2. Design System Generation (Step 2 - REQUIRED)
**Always start with `--design-system`** to get reasoned recommendations:

```bash
python3 .codex/skills/designing-ui-ux/scripts/search.py "<product_type> <keywords>" --design-system
```

### 3. Hierarchy & Persistence (Step 2b)
Use `--persist` to create a Source of Truth (`design-system/MASTER.md`) and page-specific overrides.

## Implementation Guide

### Prerequisites
Check Python: `python3 --version || python --version`. Install via `winget` (Windows) or `brew` (macOS) if missing.

### Common Rules for Professional UI
- **No Emojis as Icons**: Use SVG icons (Lucide, Heroicons).
- **Floating Navbars**: Add spacing from edges (`top-4 left-4 right-4`).
- **Cursor Pointer**: Mandatory for all clickable elements.
- **Stable Hover**: Avoid scale transforms that shift layout.

## Quick Reference
| Need | Domain | Command Flag |
|------|--------|--------------|
| Design System | multiple | `--design-system` |
| Charts | `chart` | `--domain chart` |
| UX Guidelines | `ux` | `--domain ux` |
| Tailwind Tips | `html-tailwind` | `--stack html-tailwind` |

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "Emojis are easier" | Emojis look amateur in pro apps. Use consistent SVG icons. |
| "Hover doesn't need scale" | Layout shifts are annoying. Use color/opacity transitions. |
| "I'll guess the colors" | Consistency is key. Use the suggested palette from search. |
| "A11y can wait" | Accessible UI is better UI. Follow guidelines from the start. |

## Red Flags - STOP and Check
- Using emojis like 🎨 🚀 as UI icons.
- Instant state changes without `transition`.
- Missing `cursor-pointer` on interactive cards.
- Content hidden behind fixed navbars.
- Insufficient text contrast in light mode.
