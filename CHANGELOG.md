# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added a new `/components` route with an interactive design-system playground to browse, search, preview, and copy JSX for FitQuest UI components.
- Added a comprehensive FitQuest UI component library covering primitives, form controls, layout, navigation, feedback, data display, and fitness-focused widgets.
- Added shared utility helpers (`clamp`, `cx`, `copyToClipboard`, and `debounce`) used by the component playground and UI primitives.
- Added semantic theme tokens for `gamification`, `star`, and `surface-subtle`, plus Tailwind color mappings for `success`, `info`, and `warning`.
- Added a new Training Plan experience under `/tabs/workouts` with modular page components in `src/pages/training-plan`, including weekly calendar, workout hero, exercise list, and desktop summary panel.
- Added a private placeholder route `/treinos/sessao` for workout session flow entry.

### Changed
- Updated global theme tokens and base styles to a refreshed FitQuest visual system, including revised color scales, typography defaults, and utility classes.
- Updated Vite and Tailwind configuration to support auto-imported React APIs, automatic local component registration, and expanded Tailwind content scanning.
- Updated routing exports to include the new component showcase page.
- Updated light and dark palettes to a stricter FitQuest semantic model (`primary`, `secondary`, `tertiary`, `accent`, `destructive`, `success`, `info`, `warning`) with improved contrast.
- Updated accent semantics to neutral surfaces and reserved purple hues for gamification contexts.
- Updated authenticated layout and key feature pages to consume semantic tokens (`background`, `card`, `border`, `muted`, `sidebar`, etc.) instead of hardcoded component colors.
- Updated workouts navigation target to the new responsive Training Plan page with mobile and desktop-specific structure (desktop 3/6/3 layout).

### Fixed
- Replaced local `react-router-dom` module typing overrides with official package typings to improve type reliability.
- Removed hardcoded color literals (`#`, `rgb`, `hsl`) from application components and replaced them with semantic token-based classes.
- Removed gradient-based styling from app surfaces and progress visuals to align with product design constraints.
- Normalized component corner radii to subtle values (8-12px) by replacing oversized radius utilities.

### Deprecated
- None.

### Removed
- Removed legacy theme color variables file in favor of the consolidated global theme token setup.

### Security
- None.
