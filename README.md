# Jamy FPV

Astro portfolio site for `jamyfpv.com`, with Contentful-managed flight entries rendered at build time and deployed through GitHub Pages.

## What is included

- Astro routes for `/`, `/flights`, `/flights/[slug]`, and `/contact`
- Build-time Contentful fetching for recent flights, all flights, and per-flight pages
- SEO basics: title, meta description, canonical tags, Open Graph tags, structured data, sitemap, and robots.txt
- GitHub Pages deployment workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

## Site setup

1. Install Node.js 22 or later.
2. Run `npm install` in the repo root.
3. Copy `.env.example` to `.env` and fill in:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ENVIRONMENT`
   - `CONTENTFUL_DELIVERY_TOKEN`
   - `CONTENTFUL_CONTENT_TYPE` if your content type is not named `flight`
   - `PUBLIC_SITE_URL`
   - `PUBLIC_CONTACT_EMAIL`
   - `PUBLIC_BASE_PATH` only if the site is deployed under a repo subpath instead of the custom domain root
4. Run `npm run dev` for the Astro site.

## Contentful content model

Create a content type named `flight` with these fields:

- `title` as short text, required
- `slug` as short text, required
- `youtubeUrl` as short text or URL, required
- `youtubeVideoId` as short text, optional
- `shortDescription` as long text, required
- `body` as long text, optional
- `location` as short text, optional
- `shotFor` as short text, optional
- `flightDate` as date, optional
- `publishedAt` as date and time, required
- `featured` as boolean, optional
- `tags` as list of short text values, optional
- `seoTitle` as short text, optional
- `seoDescription` as long text, optional
- `thumbnailUrl` as short text or URL, optional
- `thumbnailAlt` as short text, optional

Only published entries from the Content Delivery API appear on the public site. Unpublished or archived entries stay out of the public build.

## GitHub Pages deployment

Add these repository secrets before enabling the Pages workflow:

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ENVIRONMENT`
- `CONTENTFUL_DELIVERY_TOKEN`
- `CONTENTFUL_CONTENT_TYPE`
- `PUBLIC_SITE_URL`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_BASE_PATH`

Then enable GitHub Pages with **GitHub Actions** as the source.

The workflow deploys on pushes to `main`, manual dispatches, and `repository_dispatch` events named `contentful-rebuild`.

## Contentful webhook trigger

A practical webhook target for Contentful is GitHub's repository dispatch API:

- URL: `https://api.github.com/repos/<owner>/<repo>/dispatches`
- Method: `POST`
- Headers:
  - `Accept: application/vnd.github+json`
  - `Authorization: Bearer <github-pat>`
- JSON body:

```json
{
  "event_type": "contentful-rebuild",
  "client_payload": {
    "source": "contentful"
  }
}
```

Configure the Contentful webhook to fire on publish, unpublish, archive, unarchive, create, update, and delete events for the `flight` content type. The GitHub PAT is the shared secret protecting the trigger.

## Notes

- Flight pages are statically generated, so SEO-critical content is present in the shipped HTML.
- If a custom thumbnail is missing, the frontend falls back to the YouTube thumbnail based on the video ID.
- If Contentful is not configured yet, the site still builds and shows empty-state messaging instead of failing.
