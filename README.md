# Bank CSV → OFX Converter

Browser-only tool that converts bank CSV exports to OFX format for [YNAB](https://www.youneedabudget.com/) import. All conversions happen client-side — no data leaves your computer.

## Supported banks

- **Swedbank LT** — semicolon-separated CSV export
- **Revolut** — new comma-separated CSV format
- **N26** — CSV export
- **Citadele** — CSV export

## Live version

Deployed on GitHub Pages: [https://zhilvis.github.io/swed-csv-ofx/](https://zhilvis.github.io/swed-csv-ofx/)

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build to docs/ for GitHub Pages
npm test         # Run tests
```

## Stack

- **Vite** + **TypeScript**
- **PapaParse** for CSV parsing
- **Vitest** for testing
- Deployed via GitHub Pages from the `docs/` folder
