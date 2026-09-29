# G-MAX Website

A static HTML, CSS and vanilla JavaScript website for G-MAX Ltd.

## Run locally

```bash
cd gmax-website
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser.

## Pages

- `index.html` — Home
- `about.html` — About Us
- `services.html` — Services
- `pricing.html` — Pricing
- `faq.html` — Frequently Asked Questions
- `contact.html` — Contact Us

## Vercel deployment

This repository intentionally keeps the website in the `gmax-website` directory. In the Vercel project settings, use:

- **Framework Preset:** `Other`
- **Root Directory:** `gmax-website`
- **Build Command:** leave empty
- **Output Directory:** leave empty
- **Install Command:** leave empty

Vercel will serve `index.html` at `/`, and the existing relative CSS, JavaScript, asset, and page links will work without a build step or a `vercel.json` file.

## Contact form

The contact form intentionally does not submit data because there is no backend or form provider configured. It directs visitors to the published email address and telephone number instead.
