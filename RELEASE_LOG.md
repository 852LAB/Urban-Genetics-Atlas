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

# Urban Genetics Atlas — V1.5-20260909-205856

**Date:** 2026-09-09 20:58:56 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`.
- PMTiles: `852LAB_V1.5.pmtiles` → `atlas/852LAB_V1.5.pmtiles`
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

# Urban Genetics Atlas — V1.5-20260910-020423

**Date:** 2026-09-10 02:04:23 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`.
- PMTiles: `852LAB_V1.5.pmtiles` → `atlas/852LAB_V1.5.pmtiles`
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
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.6-20260911-192850

**Date:** 2026-09-11 19:28:50 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
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
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Revision and integration of data analysis:
- Dev Pressure Idx
- Renewal
- Genesis
- UGS

Market Exposure re-calibrated.

Standardisation and systematic review of colour ramp principals.

Color ramp improvements based on distribution of data.

Opacity controls for UI - analysis & fabric.

Language pass and refinement.

Added conditional colour to key market elements - green if up trend. Red down (strike chart and figure with arrow).

Minor formatting on UI market snapshot.

# Urban Genetics Atlas — V1.6-20260911-195715

**Date:** 2026-09-11 19:57:15 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
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
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.6-20260912-000148

**Date:** 2026-09-12 00:01:48 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
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
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

UI & navigation update:

- Reworked Atlas controls into three dedicated Fabric, Analysis and Market panels with custom icons.
- Added responsive content-fit panel behaviour for desktop and mobile.
- Added persistent Fabric and Analysis opacity controls, including when panels are minimised.
- Separated Map View controls from Fabric; Terrain now operates independently from Fabric opacity.
- Improved Reclaimed Land visibility above Satellite/Terrain.
- Added two-location Market comparison using the retained previous hex and current popup selection.
- Corrected UGS profile-bar scaling.
- Added compact auto-minimising MapLibre attribution.
- Removed native zoom/compass controls.
- General mobile, spacing, alignment and responsive UI refinements.

# Urban Genetics Atlas — V1.6-20260912-192048

**Date:** 2026-09-12 19:20:48 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
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
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Market analysis + UI update:

- Added Land Registry Transaction Activity using monthly ASP building-unit registration statistics while preserving the geography of the official source.
- Added Transaction Pulse to show whether recent transaction activity is stronger or weaker than its own recent norm and whether activity is rising or falling.
- Added Transaction Exposure, combining Transaction Pulse with local Development Pressure and Capacity Opportunity to provide finer-grained local differentiation without inventing 100 m transaction counts.
- Added a secondary Market overlay control so Market Momentum, Market Exposure, Transaction Pulse and Transaction Exposure can be compared with the primary Analysis layer, with independent opacity.
- Introduced distinct colour families for the four Market signals to make layered comparisons easier to read.
- Integrated the Land Registry transaction history into the repeatable Market update pipeline and public Market Context.
- Added a mobile master hamburger to hide/show the complete control rail when more map space is wanted.
- Refined panel behaviour: Market now minimises to an opacity bar like Fabric and Analysis; master visibility switches no longer minimise panels; panel icons are the sole minimise/expand controls.
- Restored the custom Analysis panel icon and standardised all interface sliders to a neutral grey treatment.
- Refined information controls and general responsive UI presentation.
