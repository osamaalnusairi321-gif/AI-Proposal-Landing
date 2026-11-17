# Accuracy Proposal Engine landing page

Buildless HTML, CSS, and JavaScript with two registration paths and a Google Apps Script receiver.

## Branding

The page uses Accuracy Consultancy's official local logo and favicon. The palette and typefaces match the main website's design system:

- Burgundy `#7B1C2E`, dark burgundy `#5C1422`.
- Canvas `#FAFAF8`, stone `#F0EBE8`, ink `#1A0D10`, muted `#6B5A5E`.
- Cormorant Garamond headings and Inter body text, with system fallbacks.
- Fine borders, restrained rectangular buttons, and warm neutral form surfaces.

All asset paths are relative, so the page also works under a GitHub Pages project path. Keep the `assets/` folder alongside `index.html`.

## Registration behavior

| Path | Required | Optional |
| --- | --- | --- |
| Waitlist / early access | Full name, valid work email, company name, company website | Phone |
| Pilot Partner | Full name, valid work email, company name, company website, pilot commitment checkbox | Phone |

The submit button starts grey and disabled. It becomes burgundy and enabled only when the selected path's requirements are met. Switching paths preserves contact details and removes the pilot consent requirement for waitlist registrations. Returning to Pilot Partner requires checking the commitment again.

Validation updates on typing, pasting, change events, focus, and returning to the page. Whitespace-only required fields and incomplete email addresses do not enable submission. A readiness hint explains what is still required.

Submissions use a native HTML POST to the Apps Script Web App. The receiver shows confirmation only after it saves the row. A missing endpoint shows an unavailable message and does not claim success. Duplicate clicks are blocked while submitting, and controls recover when returning with the browser Back button.

## Connected spreadsheet and backend

Registration spreadsheet:
https://docs.google.com/spreadsheets/d/1ZsFV8YmBpBvLqPNfY2h_KZb9wvtp82Jna3FZkyQrduI/edit

A bound Apps Script project has been created and the tested `backend/Code.gs` code has been saved here:
https://script.google.com/home/projects/1kgJOGKmUttb_fTs3lRUih7JToTbAH5c6XKCiwmO87DnbQ_pprcd-jurO/edit

The account owner authorized the Web App, deployed as version 2 with **Execute as: Me** and **Who has access: Anyone**. Its public `/exec` URL is configured in `config.js`. A spreadsheet URL is not a submission endpoint.

Expected column order, verified in the existing spreadsheet:

- `Waitlist`: Submitted at, Full name, Work email, Company, Phone (optional), Source, Company website.
- `Pilot Partners`: Submitted at, Full name, Work email, Company, Phone (optional), Pilot commitment accepted, Application status, Source, Company website.

The backend validates required fields, checks pilot consent, routes to the matching tab, protects formula-like values as literal text, and uses a lock for concurrent writes. It never returns spreadsheet contents to visitors.

After changing `backend/Code.gs`, save the updated code in Apps Script and publish a new deployment version. Updating the website files alone does not update the running Google backend.

## Local preview and verification

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`.

```sh
node --check script.js
node --test tests/*.test.cjs
```

The backend tests use a mocked spreadsheet service and do not write real registrations. Browser checks cover initial disabled state, valid waitlist without phone, pilot checkbox gating, switching paths, invalid email, whitespace-only company, the missing-endpoint message, and responsive layout.

End-to-end verification on 17 November 2026 also saved a real waitlist test without a phone and a pilot test with a phone and consent into the correct spreadsheet tabs. Both showed the backend confirmation page. The two labeled test entries were then cleared with the owner's approval. The browser Back button restored a usable form.

## GitHub Pages

Repository: https://github.com/osamaalnusairi321-gif/AI-Proposal-Landing

In **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, then save.

Expected website URL after Pages is enabled:
https://osamaalnusairi321-gif.github.io/AI-Proposal-Landing/

The site files are at the repository root, with local images in `assets/`. The backend source and tests are included for maintenance; GitHub Pages does not execute `.gs` files. The deployed Google Apps Script endpoint in `config.js` handles registrations.

## Field validation

Company name and website are mandatory for both paths. Names accept Unicode letters, spaces, apostrophes, hyphens and periods. Company names allow letters, numbers and business punctuation. Email addresses must have valid local and public domain syntax. Websites accept public domains and HTTP(S) addresses; plain domains are saved with `https://`. Phone remains optional; if supplied, it requires 7–15 ASCII digits including the country code, without + or separators.

Invalid fields show red messages directly below them, expose accessible descriptions, and prevent submission. Messages disappear when corrected. The same rules run in the browser and receiver. These are format checks; they do not prove ownership or deliverability. New website columns are appended without moving existing registration columns.
