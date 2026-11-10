# Service image assets

Images copied from the user's Unsplash downloads. Unsplash's standard license grants a broad free-use copyright license, including commercial use, but does not itself grant rights to third-party artwork, brands, recognizable people, or property depicted in an image. Verify each original photo page and depicted artwork before deployment.

| Local file | Original download | Unsplash photo ID | Verification status |
|---|---|---|---|
| `public/services/layanan-01.webp` | `the-metropolitan-museum-of-art-JpmQavCUfUk-unsplash.jpg` | `JpmQavCUfUk` | Unsplash page identified; page describes a Met artwork, `October in the Marshes` by John Frederick Kensett, 1872. Downloaded JPEG has no EXIF copyright/creator metadata. Image is photographic reproduction of artwork; artwork-specific use rights not independently verified. |
| `public/services/layanan-02.webp` | `art-institute-of-chicago-AckZaYtIq3I-unsplash.jpg` | `AckZaYtIq3I` | Source photo page could not be reliably verified from available public endpoints during this task. Downloaded JPEG has no EXIF copyright/creator metadata. |
| `public/services/layanan-03.webp` | `art-institute-of-chicago-0hltkgJeW24-unsplash.jpg` | `0hltkgJeW24` | Source photo page could not be reliably verified from available public endpoints during this task. Downloaded JPEG has no EXIF copyright/creator metadata. |

The files were selected from the user's own Unsplash free-download workflow, copied into
this project, and converted from the original 1600px JPEG to 1280px WebP (quality 80,
`magick -strip`, total 339 KB from 772 KB). The 1600px JPEG originals are not kept in the
repository. No new license is created by local copying. Attribution is appreciated under
the Unsplash License, although generally not required. Keep this record with the assets;
revisit source-page and depicted-artwork rights before publishing.

References:
- https://unsplash.com/license
- https://unsplash.com/terms
- https://www.artic.edu/open-access/open-access-images

# Brand logo assets

Technology logos under `public/logos/` are sourced from public icon sets (Simple Icons and similar). They identify the tools and platforms named in the strip; all trademarks remain with their owners.

| Local file | Source | Note |
|---|---|---|
| `public/logos/hermes.svg` | LobeHub Icons (`@lobehub/icons-static-svg`, MIT) | Glyph mark for Hermes Agent / Nous Research. Previously a text-only `HERMES` wordmark; replaced with the vector glyph. Trademark of Nous Research. |
