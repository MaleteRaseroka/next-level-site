# Next Level - Gaming & Esports Arena

A multi-page website for a fictional gaming and esports arena in Pretoria, South Africa. Built with plain HTML, CSS and JavaScript (no frameworks, no build step).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home / landing page |
| `about.html` | Story, values and team |
| `experiences.html` | Comparison table (sortable) and details for each experience |
| `calculate-fees.html` | Group fee calculator with discount, VAT and quote request |
| `book.html` | 3-step booking flow with validation |
| `contact.html` | Contact form, opening hours table, FAQ |

Shared files: `css/style.css` (all styling), `js/main.js` (all behaviour), `images/`.

## Features

- Drop-down **Experiences** menu in the navigation (mouse, keyboard and mobile)
- **Tables**: experience comparison (sortable), fee summary, opening hours, booking summary
- **Error handling**: inline validation on the contact, booking, quote and newsletter forms; date and opening-hours checks on bookings; capped quantities; safe handling of blocked or corrupt browser storage; image fallbacks; global error notice
- Responsive layout (desktop, tablet, phone) and keyboard-friendly focus states

## Run it locally

1. Open the folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` and choose **Open with Live Server**

## Publish it (GitHub Pages)

1. Push these files to the root of the repository's `main` branch
2. On GitHub: **Settings > Pages > Build and deployment**
3. Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)`
4. Save. After a minute the site is live at `https://<username>.github.io/<repository>/`

## Notes

Made as a school project. Photos are placeholder stock images. There is no backend, so forms store data in the browser only.
