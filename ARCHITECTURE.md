# FitQuest Architecture

## Main idea

- `src/app`: bootstrap, providers, router and global app concerns
- `src/shared`: reusable UI, utils, constants, types and validators
- `src/services`: platform and infrastructure adapters
- `src/features`: product modules organized by business area
- `src/mocks`: replaceable mock data sources

## Feature rule

Each feature should expose one clear public UI entry:

- `presentation/pages`: real route pages
- `presentation/components`: reusable UI only for that feature
- `presentation/sections`: page composition blocks
- `presentation/navigation`: feature route paths and nav config

Avoid creating extra layers like `screens`, `dashboard/pages`, `students/pages`, or compatibility wrappers unless there is a real technical need.

## Current profile modules

- `student`: richer module with subfeatures like workouts, nutrition, run, progress and profile
- `personal`: route pages live in `presentation/pages`
- `nutritionist`: route pages live in `presentation/pages`
- `auth`: mocked authentication, isolated for future replacement

## Practical conventions

- Routes should import from `presentation/pages`
- Layouts should import navigation config from `presentation/navigation`
- Page-specific composition should stay in `presentation/sections`
- Firebase or external services should stay behind repositories/adapters
- If a file only reexports another file and does not preserve compatibility for a real consumer, remove it
