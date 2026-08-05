# Design brief — Ցոլակ Խաչատրյանի 30-ամյակը

Everything a designer needs to redesign this page without breaking it. Copy this whole file into
a design session as context.

---

## 1. What this is

A single-page birthday invitation, sent as a link over WhatsApp and Telegram. A guest taps the
link on their phone, reads what the event is, sees when and where, and replies yes or no with a
headcount. Their answer lands in a Google Sheet the host uses to book the table.

It is **not** a marketing site. There is no navigation, no scroll-jacking, no sign-up. One page,
read top to bottom, one action at the end.

---

## 2. The event — the facts

| | |
|---|---|
| Occasion | 30th birthday |
| Honoree | Ցոլակ Խաչատրյան (monogram: **ՑԽ**) |
| Date | Monday **28 September 2026**, 17:30 (Yerevan, UTC+4) |
| Venue | **Florence Restaurant**, Բարբյուսի փող. 64/2, Երևան |
| Coordinates | 40.194364, 44.481653 — verified against the Yandex listing |
| RSVP deadline | **11 September 2026** |
| Language | **Armenian only** |

---

## 3. Who opens this

- Friends and family in Yerevan, wide age range — including people who are not comfortable with
  fussy web interfaces.
- **Almost entirely on phones**, opened from a chat app's in-app browser.
- Many will be on mobile data, some on older Android devices.
- Some will hand the phone to someone else to read.
- They arrive cold from a link preview. Nothing about the occasion can be assumed.

Design implication: large tap targets, high contrast, no hover-dependent affordances, nothing
that needs explaining.

---

## 4. Hard constraints — break these and the page breaks

### 4.1 Armenian typography (the big one)

**Most display fonts have no Armenian glyphs.** If you specify Playfair, Clash Display, Cormorant,
or nearly any trendy face, Armenian text silently falls back to a system font and looks worse than
plain defaults. Verify Armenian coverage **before** committing to a typeface.

Known-good families: **Noto Serif Armenian**, **Noto Sans Armenian**, **Mardoto**, **Arian AMU**,
**Arti**. Google Fonts can filter by Armenian support.

Two further Armenian-specific rules learned the hard way here:

- **Armenian runs ~20–30% longer than English** for the same meaning. Labels that fit in a mockup
  will wrap on a real phone. Test every string at **320px**, not 390px.
- **Uppercase + wide letter-spacing is only viable for two or three words.** Set an entire
  Armenian sentence in tracked caps and it becomes unreadable and overflows. Short labels
  (ԱՄՍԱԹԻՎ, ՎԱՅՐԸ) — fine. A full question — never.
- Armenian has tall ascenders and low descenders; `line-height: 1.6` minimum, or lines collide.

### 4.2 No photographs of the honoree

He does not want his picture used. The page currently carries **zero images** — the hero is a
drawn SVG laurel emblem. Any redesign must hold up without portrait photography.

Non-personal imagery (textures, objects, the venue, abstract shapes) is acceptable if it earns
its place. Anything added must be self-hosted in `public/`.

### 4.3 Mobile-first, and genuinely responsive

- Design at **390px**. Verify at **320px** (iPhone SE) and **430px**.
- **Zero horizontal overflow at any width** — this is a hard pass/fail.
- All content lives inside **one rounded card column** (`max-w-md`, 448px) floating on a dark
  backdrop (`#241a19`), so the invitation reads as a separate object rather than a full-bleed
  website. The card clips its interior bands with `overflow-hidden`.
- On mobile the card nearly fills the width (12px gutter); on desktop the backdrop shows around it.
- Tap targets ≥ 44px.

### 4.4 Static hosting

Hosted on GitHub Pages. **No server, no build-time data, no database.** Everything is a static
file. The RSVP posts directly from the browser to a Google Apps Script endpoint.

### 4.5 Technical shape

- **React + Vite + Tailwind CSS v4**, JavaScript (not TypeScript).
- All UI lives in **one file**, `src/App.jsx`, with a `CONFIG` block and a `TEXT` block at the top.
  Every user-facing string is in `TEXT`. Keep it that way — it is how the host edits copy.
- Colours are Tailwind v4 theme variables in `src/index.css` (`@theme { --color-*: … }`).
- Fonts load from Google Fonts in `index.html`.

---

## 5. What must not be touched

The RSVP form's logic is verified by a 16-check browser suite. A redesign may restyle it freely
but must preserve:

1. **The headcount field only exists when "attending" is true.** Not disabled — absent.
2. **The headcount input is `type="text"` with `inputMode="numeric"`.** It must NOT become
   `type="number"`: number inputs silently discard typed letters, so the guest sees nothing appear
   and gets no error. This was a real reported bug.
3. **Validation is live** — errors appear as you type and clear the moment the value is fixed.
4. **Bad values are rejected, never coerced.** `2.5` must not become `25`.
5. **The payload shape is fixed:**
   ```json
   { "timestamp": "ISO string", "guestName": "string", "attending": true, "totalCount": 4 }
   ```
   `totalCount` must be a real `Number` (0 when not attending) — the host sums that column.
6. **The POST sends `Content-Type: text/plain`.** `application/json` triggers a CORS preflight
   that Google Apps Script cannot answer, and the request never arrives.

---

## 6. Current design system

Replace it if you have something better — but this is what is there now, and it works.

### Palette

| Token | Hex | Role |
|---|---|---|
| `paper` | `#fdf8f3` | page background |
| `blush` | `#f7e9e3` | alternating section bands |
| `blush-deep` | `#f0dbd2` | hero gradient top |
| `wine` | `#6f2733` | headings, primary buttons, countdown band |
| `wine-deep` | `#571d27` | footer |
| `gold` | `#b08d57` | every ornament, borders, accents |
| `gold-soft` | `#d9bd8c` | gold on dark backgrounds |
| `ink` | `#2a2119` | body text |
| `muted` | `#7a6b5d` | secondary text |
| `rule` | `#e3d6c8` | hairlines |
| `alert` | `#a03b2e` | validation errors |
| `backdrop` | `#241a19` | the dark stage the card sits on |

Warm paper and blush throughout, **one** deep wine block (the countdown) plus the footer for
contrast, gold as the only accent. The restraint is deliberate — more colours made it look cheap.

### Type

- Display / headings: **Noto Serif Armenian**, weights 300–600
- Body / labels: **Noto Sans Armenian**, weights 300–600
- Big numerals (30, 28, countdown) are the serif — they carry the page
- Small caps labels: 10px, `letter-spacing: 0.28em`, uppercase — **short strings only**

### Motifs

- **Laurel emblem** — SVG wreath, leaves swept along an arc, open at the crown. Hero centrepiece.
- **Ornament divider** — gold flourish `—— ⟨◇⟩ ——` between sections.
- **Corner filigree** — small gold brackets at the four corners of framed cards.
- **Dot texture** — 5% opacity radial-dot pattern over large colour fills, so they read as paper.
- Rounded-full pills for form fields and buttons.

### Motion

Restrained: a fade-up on section entry, a scale-in on rules. All of it disabled under
`prefers-reduced-motion`.

---

## 7. Page structure and the job of each section

| # | Section | Job |
|---|---|---|
| 1 | **Cover** | «Ցոլակ Խաչատրյանի» above the laurel emblem holding the **30**, «ամյակը» in gold caps below. Must say "this is a celebration" in one glance. |
| 2 | **Greeting** | Framed «Հարգելի՛ բարեկամներ և ընկերներ» card + the invitation sentence. **This is the only place that says what the occasion actually is.** Then the date, large. |
| 3 | **Location** | Venue name, address, live embedded Yandex map, app icon tiles for Yandex Navigator and Google Maps. |
| 4 | **Wishes** | Short practical note to guests (what to bring, dress code). |
| 5 | **RSVP** | Reply-by date, then name / attending / headcount, then submit. **The point of the page.** |
| 6 | **Countdown** | Days-hours-minutes-seconds on the wine band. Builds anticipation; deliberately last. |
| 7 | **Footer** | ՑԽ monogram roundel, ornament, name. |

This order came from a reference site the host liked (`invite-moment-site.ru`). Match the flow,
not their artwork — the fringe, chrome drips, statue and disco ball are that studio's assets.

---

## 8. Every string on the page

Armenian, with English gloss. These live in the `TEXT` block.

**Cover**
- `Հրավեր` — Invitation (eyebrow label)
- `Ցոլակ Խաչատրյանի` / `30` / `ամյակը` — split around the emblem; reads as one title, «Ցոլակ Խաչատրյանի 30-ամյակը»

**Greeting**
- `Հարգելի՛ բարեկամներ և ընկերներ` — Dear relatives and friends
- `Եթե ստացել եք այս հրավերը, ուրեմն Դուք իմ ընտանիքի համար կարևոր հյուր եք։` — If you have received this invitation, you are an important guest to my family.
- `Հրավիրում եմ Ձեզ ինձ հետ կիսելու տարվա ամենաջերմ երեկոն՝ Ցոլակ Խաչատրյանի 30-ամյակի տոնակատարությունը։` — I invite you to share with me the warmest evening of the year: the celebration of Tsolak Khachatryan's 30th. (Host's own wording.)
- `28` / `Սեպտեմբերի` / `երկուշաբթի · 17:30`

**Location**
- `Վայրը` — The place
- `Florence Restaurant` / `Երևան, Բարբյուսի փող. 64/2`
- `Բացել հավելվածում` — Open in app
- `Yandex Navigator` / `Google Maps`
- `Պահանջվում է Yandex Navigator հավելվածը` — requires the Yandex Navigator app
- `Տեսնել քարտեզի վրա` — See on the map

**Wishes**
- `Մաղթանքներ` — Wishes
- `Ընկերնե՛ր և հարազատնե՛ր, բերեք Ձեզ հետ լավ տրամադրություն և դրական էներգիա։` — Friends and family, bring good spirits and positive energy with you. (Host's own wording — do not paraphrase.)

**RSVP**
- `Հարցաթերթիկ` — Questionnaire
- `Շնորհակալ կլինեմ, եթե հաստատեք Ձեր ներկայությունը մինչև սեպտեմբերի 11-ը` — grateful if you confirm by 11 September
- `Անուն Ազգանուն` — Name Surname · placeholder `Օր․՝ Արամ Հակոբյան`
- `Կկարողանա՞ք ներկա գտնվել` — Will you be able to attend?
- `Անպայման կգամ` — I'll definitely come · `Ցավոք, չեմ կարողանա` — Sadly I can't
- `Քանի՞ հոգով եք գալու (ներառյալ Ձեզ)` — How many are coming (including you)? ← **longest label, the one that overflows**
- `Ուղարկել` — Send · `Ուղարկվում է…` — Sending…

**States**
- `Խնդրում ենք նշել Ձեր անունը` — please give your name
- `Խնդրում ենք ընտրել տարբերակներից մեկը` — please choose one
- `Մուտքագրեք միայն թիվ՝ առնվազն 1` — enter only a number, at least 1
- `Առավելագույնը 30 հոգի` — maximum 30 people
- `Շնորհակալություն` + `Ձեր պատասխանը գրանցված է։ Սպասում ենք Ձեզ։` — success, attending
- `Ափսոս, կկարոտենք Ձեզ` + `Շնորհակալություն պատասխանի համար։` — success, declining
- `Չհաջողվեց ուղարկել` + `Ստուգեք ինտերնետ կապը և փորձեք կրկին։` — send failed
- `Կրկին փորձել` — try again

**Countdown**
- `Մինչև ծննդյան օրը մնաց` — until the birthday
- `օր` / `ժամ` / `րոպե` / `վայրկյան` — day / hour / minute / second
- `Տոնը սկսվեց` — the celebration has begun (shown once the date passes)

---

## 9. States to design, not just the happy path

- Form: **empty**, **focused**, **invalid** (per field, with message below), **submitting**
  (disabled), **network error** (retry, values preserved), **success attending**,
  **success declining**
- Headcount field **appearing** when "attending" is chosen — it animates in
- Countdown **after the date passes** — must not show negative numbers
- Map **before it lazy-loads**

---

## 10. Still open — the host needs to decide

3. **Domain** — not yet purchased. Affects the link-preview URLs.
4. Whether a **non-personal image** (the restaurant, a texture) should carry the cover, or whether
   it stays purely graphic.

---

## 11. What "good" looks like here

- A guest understands **what, when, where** within five seconds of opening it.
- Replying takes under 30 seconds and never leaves anyone stuck on a field.
- It feels **warm and personal**, not like a corporate event page or a template.
- It looks intentional **without a single photograph** — the hardest constraint, and the one that
  makes or breaks the design.
- It loads fast on Yerevan mobile data. Currently ~66 KB gzipped JS, no images at all.

---

## 12. Suggested prompt for a design session

> I'm designing a mobile-first Armenian birthday invitation page. The full brief is below.
> The critical constraints: Armenian text only (most display fonts lack Armenian glyphs — verify
> coverage), no photographs of the honoree at all, must work from 320px up with zero horizontal
> overflow, and it's static React + Tailwind v4 in a single App.jsx.
>
> Give me two or three distinct visual directions for the cover and one full section, then we'll
> develop the strongest one across the whole page. Show me colour, type, and the hero treatment —
> remembering there is no photography to lean on.
>
> [paste the rest of this file]
