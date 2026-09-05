# Urban Genetics Atlas — Live Release Log


# Urban Genetics Atlas — V1.4-20260903-170848

**Date:** 2026-09-03 17:08:48 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed Land _ V1.1.geojson` → `reclaimed/Reclaimed Land _ V1.1.geojson`
- GeoJSON: `Buildings - Age or Heritage Grade.geojson` → `buildings/Buildings - Age or Heritage Grade.geojson`
- Terrain: `51941` objects → `terrain/`

## Automated pre-release checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- Deployment paths generated from fresh Development code.
- Favicon/logo/social metadata checked.
- Complete self-contained local archive created.
- Public AI context regenerated.

# Urban Genetics Atlas — V1.4-20260903-205342

**Date:** 2026-09-03 20:53:42 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects → `terrain/`

## Automated pre-release checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- Deployment paths generated from fresh Development code.
- Favicon/logo/social metadata checked.
- Complete self-contained local archive created.
- Public AI context regenerated.

## Maintainer notes

Renamed public runtime GeoJSON files to remove spaces and improve deployment reliability.

Added satellite imagery as an online basemap option.

This release also tests the automated Development → Live deployment, runtime dependency discovery, complete local archiving, AI context generation and release logging.

Updated Mean Building Height colours to improve contrast between cells.

# Urban Genetics Atlas — V1.4-20260904-011047

**Date:** 2026-09-04 01:10:47 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **baseline**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Updated basemap switch to binary slider.

Added toggles and filters for each UGS Class to control visbility.

# Urban Genetics Atlas — V1.4-20260904-211207

**Date:** 2026-09-04 21:12:07 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.4-20260905-190715

**Date:** 2026-09-05 19:07:15 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Functional changes:
- Dual-handle mean building-height range control on one visual track.
- Building-height minimum can be 0 m; maximum 500 m represents 500+ m.
- Basemap / satellite switch aligned.
- Basemap BUILDINGS visibility toggle added.
- Reclaimed Land ordering above satellite imagery.

Cleanup performed:
- Removed unused basemapControl JavaScript reference.
- Removed unused popupRectsOverlap helper.
- Removed stale one-way building-height CSS reference.
- Consolidated the building-height range event handlers into one set.
- Kept current visual/behavioural structure otherwise unchanged.
- No language/content rewrite performed.
