# Asset Guidelines

This project keeps static image assets in `public/assets/images`. Angular serves these files directly, so large or wrongly formatted files affect loading time immediately.

## Folder rules

| Asset type           | Folder                              | Preferred format       | Max source size          |
| -------------------- | ----------------------------------- | ---------------------- | ------------------------ |
| Quick-link buttons   | `public/assets/images/quick-links/` | WebP                   | 256x256                  |
| Unit icons           | `public/assets/images/units/`       | WebP                   | 128x128 or source-native |
| Building icons       | `public/assets/images/buildings/`   | WebP                   | 128x128 or source-native |
| Battle/stat icons    | `public/assets/images/battle/`      | WebP or SVG            | small                    |
| Resource icons       | `public/assets/images/resources/`   | WebP, SVG, or tiny PNG | small                    |
| Branding/logo assets | `public/assets/images/branding/`    | WebP or SVG            | usage-based              |
| UI-only icons        | icon component or SVG sprite        | SVG                    | n/a                      |

## Format rules

Use WebP for raster game/art images.

Use SVG for UI symbols, actions, and simple scalable icons.

Use PNG only when the asset is tiny, transparent, and there is a clear reason not to convert it.

Do not keep large source images in `public/assets/images`. Store only the optimized runtime version.

## Naming rules

Use lowercase, descriptive names.

Use existing game IDs where possible, for example `swordsman.webp`, `senate.webp`, or `button_grepoWiki.webp`.

Keep file extensions truthful. A `.webp` file must actually be WebP.

## Code rules

Do not hardcode image paths inside page components.

Add shared image mappings to `src/app/data/asset-paths.ts`.

Use `loading="lazy"`, `decoding="async"`, and explicit `width`/`height` for non-critical images where practical.

## Checks
