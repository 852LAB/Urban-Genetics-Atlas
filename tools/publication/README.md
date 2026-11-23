# Regenerate the report map artwork

The report uses transparent category-colour sheets drawn from the released `atlas_v2` polygons at zoom 14. The directory `site/publication/signature/` in the active app includes a geographic index, the source archive SHA-256 and the matching palette. Each sheet spans four by four source tiles. Only sheets covering a report's location are requested. Signature opacity is applied during composition.

With Node 22 or later and Python with Pillow, run from the repository root. Supply the public PMTiles file and the browser distribution of pmtiles 4.2.1 used by the Atlas. Set `app_dir` to the active application directory. Generate into a clean release staging tree, update the application's release manifest and check the cover against public tiles at contrasting locations.

```bash
set -o pipefail
node tools/publication/extract-public-signature.cjs "$pmtiles_file" "$pmtiles_browser_js" "$app_dir/site/publication/vendor/vector-reader.js" |
  python3 tools/publication/paint-public-signature.py "$app_dir" "$pmtiles_file"
```

When binding a new map release, update the published archive URL in the artwork index generator. For a different archive, layer or palette, the report renderer uses live vector tiles.
