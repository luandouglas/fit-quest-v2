# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added a new `/components` route with an interactive design-system playground to browse, search, preview, and copy JSX for FitQuest UI components.
- Added a comprehensive FitQuest UI component library covering primitives, form controls, layout, navigation, feedback, data display, and fitness-focused widgets.
- Added shared utility helpers (`clamp`, `cx`, `copyToClipboard`, and `debounce`) used by the component playground and UI primitives.

### Changed
- Updated global theme tokens and base styles to a refreshed FitQuest visual system, including revised color scales, typography defaults, and utility classes.
- Updated Vite and Tailwind configuration to support auto-imported React APIs, automatic local component registration, and expanded Tailwind content scanning.
- Updated routing exports to include the new component showcase page.

### Fixed
- Replaced local `react-router-dom` module typing overrides with official package typings to improve type reliability.

### Deprecated
- None.

### Removed
- Removed legacy theme color variables file in favor of the consolidated global theme token setup.

### Security
- None.
