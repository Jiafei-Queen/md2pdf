# Security Policy

## Architecture

MD2PDF is a **hybrid** app: editing, rendering, and all exports happen in the browser, but sharing a document involves a server round-trip.

- **Editing and exporting are fully client-side** — markdown parsing, PDF/HTML/Markdown/image generation, and custom CSS all run in the browser and never touch the network
- **Auto-save stays local** — drafts are written to `localStorage` only, never uploaded
- **Sharing uploads the document** — `Share Link` POSTs your markdown to `POST /api/save`, where a Cloudflare Worker encrypts it with AES-256-GCM and stores it in Cloudflare KV
- **Only the ciphertext is stored** — KV holds the encrypted document, never readable markdown
- **The decryption key travels in the URL hash** (`#k=`), which browsers never send to the server, so the key itself is not transmitted
- **If the API is unreachable, sharing falls back** to an LZ-string compressed URL (`/share?doc=`) that keeps the content in the link itself
- No analytics, no tracking, no cookies
- CDN dependencies load from `cdnjs.cloudflare.com` (marked, highlight.js, html2canvas, lz-string, github-markdown-css) and `cdn.jsdelivr.net` (mermaid, fflate)

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public issue**
2. Email **cxkctrl1303@hotmail.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
3. Allow reasonable time for a fix before public disclosure

## Scope

The main security concerns are:

- **XSS via markdown input** — `marked.js` handles sanitization
- **Custom CSS injection** — Scoped to the preview element only
- **CDN integrity** — Dependencies loaded from trusted CDNs
- **Share-link confidentiality** — anyone holding the full link (including the `#k=` hash) can read the document, so treat the link as a secret. Anyone with the `editKey` can overwrite it
- **Rate limiting** — `POST /api/save` is limited to 10 requests/minute per IP
- **Link lifetime** — shared documents expire from KV after 90 days; the timer resets on update

## Supported Versions

Only the latest version deployed at [md2pdf.studio](https://md2pdf.studio) is supported.
