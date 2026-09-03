# Urban Genetics Atlas — Release Automation

The final package automates Development → Live releases.

### It discovers runtime data
It scans the fresh Development `atlas.js` for every locally referenced `.pmtiles` and `.geojson`, plus the terrain tile directory when referenced. Multiple PMTiles and multiple GeoJSON sources are supported.

### It archives complete releases
Every successful run creates a self-contained archive under `C:\UrbanGeneticsAtlas_Releases\`. The archive includes `range_server.py`, application files, assets, discovered runtime data, terrain, AI context, release notes, release log and SHA-256 checksums. Its `atlas.js` retains local data paths so the archive is independently launchable.

### It deploys
Runtime data is uploaded to Cloudflare R2; application/context files are committed and pushed to GitHub; GitHub Pages is checked for the exact release marker; R2 objects/CORS/PMTiles range support are checked; and a GitHub Release is created.

### It protects GitHub
GeoJSON, PMTiles, terrain, `range_server.py` and `.qmd` files are rejected from the Git staging set.

### AI context
`public-ai-notes.md` is the human-controlled conceptual layer. The release generates `atlas-context.md` and `llms.txt` for each release.

### Optional human release note
Put a short note in `C:\UrbanGeneticsAtlas\release-notes.txt` before a release. It is included automatically.

### Install
Copy the supplied files into `C:\UrbanGeneticsAtlas` and its `scripts` subdirectory as described in `INSTALL.txt`.
