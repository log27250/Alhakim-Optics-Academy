# Alhakim Optics Academy

## GitHub Pages deployment
1. Upload all files and folders in this package to the **root** of your repository (same level as README.md).
2. Open Repository → Settings → Pages.
3. Under Build and deployment choose **Deploy from a branch**.
4. Select branch `main`, folder `/ (root)`, then Save.
5. Wait for GitHub Pages to publish the site.

## Included
- `index.html`, `styles.css`, `app.js`: responsive academy interface.
- `content/`: master JSON content file.
- `icons/`: PWA icons (192 and 512 px).
- `manifest.webmanifest`, `sw.js`: installable PWA and offline cache.

## Current scope and limitations
This is a client-side first release. It reads the supplied JSON, displays all 12 departments and 231 curriculum topics, opens the 13 written lessons, provides lesson self-assessment, bilingual search, and stores basic lesson progress locally. It does not yet include student accounts, cloud database, admin/lecturer dashboards, subscription/payment, or cross-device synchronization. Lesson content is marked for scientific review and must not be treated as final clinical guidance.

## Updating content
Replace the JSON file at `content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json` and commit the change. If the browser keeps old content, clear site data or update the service worker cache version in `sw.js`.
