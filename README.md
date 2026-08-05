# Ցոլակ Խաչատրյանի 30-ամյակը

Mobile-first birthday invitation with an RSVP form that writes straight into a Google Sheet.

```bash
npm install
npm run dev      # http://localhost:5173
```

**→ Setup and deployment: [DEPLOY.md](DEPLOY.md)**
**→ Redesigning it: [DESIGN-BRIEF.md](DESIGN-BRIEF.md)** — full context to hand to a designer or
an AI design session

Two things stand between this and a link you can send out:

1. Deploy [`apps-script/Code.gs`](apps-script/Code.gs) and paste its URL into `CONFIG.endpoint`
2. Push to GitHub and point your domain at it

There are no photographs on the page by design — the hero is a laurel emblem, so there is
nothing to upload.

Until step 2 is done the site runs in **demo mode** — the form works end to end but logs the
answer to the browser console instead of sending it.

## Page structure

1. **Cover** — «Ցոլակ Խաչատրյանի» + laurel emblem with the 30 + «ամյակը»
2. **Greeting** — framed "Հարգելի՛ բարեկամներ և ընկերներ" card, then the date large
3. **Location** — venue, address, live Yandex map, app icons for Navigator and Google Maps
4. **Wishes** — short note to guests
5. **RSVP** — reply-by date, then the form
6. **Countdown** — days/hours/minutes/seconds on the wine band

## Where things live

| What | Where |
|---|---|
| Every piece of text, the date, coordinates, guest limit | `CONFIG` / `TEXT` at the top of [`src/App.jsx`](src/App.jsx) |
| The whole UI | [`src/App.jsx`](src/App.jsx) |
| Fonts, colors, animations | [`src/index.css`](src/index.css) |
| Alternative designs | [`src/App.party.jsx`](src/App.party.jsx) (dark/neon), [`src/App.editorial.jsx`](src/App.editorial.jsx) (minimal cream) |
| Link-preview tags | [`index.html`](index.html) |
| Sheet writer | [`apps-script/Code.gs`](apps-script/Code.gs) |
| Auto-deploy on push | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) |

## Four designs are in here

The live one is `src/App.jsx` — warm cream and blush, gold ornaments, a deep wine countdown
band, a laurel emblem instead of photography, and the section flow above. Three other passes are
kept alongside it:

| File | Look |
|---|---|
| `src/App.jsx` | **Current** — warm cream and wine, gold ornaments |
| `src/App.bold.jsx` | Near-black, chrome numerals, electric blue (needs `src/index.bold.css`) |
| `src/App.editorial.jsx` | Minimal cream, hairline rules, very sparse |
| `src/App.party.jsx` | Dark purple, neon gradients, glassmorphism |

To switch, change the import in [`src/main.jsx`](src/main.jsx):

```js
import App from './App.editorial.jsx'
```

Each one expects its own colours in [`src/index.css`](src/index.css), so if you switch to
`App.party.jsx` also set `body`'s `background-color` to `#0b0616` and flip
`<meta name="theme-color">` in [`index.html`](index.html) to match.

## Notes

- `.npmrc` pins this project to the public npm registry, because the machine's global npm config
  points at a work CodeArtifact registry that doesn't carry these packages.
- The RSVP POST deliberately sends `Content-Type: text/plain`. Using `application/json` triggers a
  CORS preflight that Google Apps Script does not answer, and the request would never arrive.
