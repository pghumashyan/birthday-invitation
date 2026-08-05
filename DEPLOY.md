# Deploy guide

Two things to do, in this order. Budget about 30 minutes.

1. [Wire up the Google Sheet](#2-wire-up-the-google-sheet) — 10 min
2. [Publish the site](#3-publish-the-site) — 15 min

There are no photographs on this invitation by design, so there is nothing to upload — the page
is complete as it stands.

Run it locally any time with:

```bash
npm install
npm run dev
```

---

## 2. Wire up the Google Sheet

This is what makes the RSVP answers land somewhere you can count.

**Until you finish this step the site runs in demo mode:** the form works end to end, but instead
of sending anything it logs the answer to the browser console. Good for testing.

### 2a. Create the sheet

1. Go to [sheets.new](https://sheets.new) and name it something like `Ցոլակ 30 — RSVP`.
2. In row 1, type these four headers:

   | A | B | C | D |
   |---|---|---|---|
   | Ամսաթիվ | Անուն | Կարգավիճակ | Հոգի |

### 2b. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete the sample code in the editor.
3. Open [`apps-script/Code.gs`](apps-script/Code.gs) from this project, copy all of it, paste it in.
4. Click the **save** icon.

### 2c. Deploy it

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`

   > ⚠️ It must be **Anyone**, not "Anyone with a Google account". Your guests won't be signed
   > into Google when they tap the link, and the second option silently rejects them.

4. Click **Deploy**. Google will ask you to authorize — click through
   **Advanced → Go to (project name) → Allow**. The "unverified app" warning is expected; it's
   your own script.
5. Copy the **Web app URL**. It ends in `/exec`.

**Quick check:** paste that URL into a browser tab. You should see
`{"result":"ok","message":"RSVP endpoint is running"}`.

### 2d. Plug it into the site

Open [`src/App.jsx`](src/App.jsx) and paste the URL into the `CONFIG` block at the top:

```js
endpoint: 'https://script.google.com/macros/s/AKfycb.../exec',
```

Now run `npm run dev`, submit a test RSVP, and confirm a row appears in the sheet.

### If you ever edit the script

Changes don't go live on their own. You must do
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**, or the old code keeps
running.

### Counting the guests

Put this in any empty cell:

```
=SUM(D2:D)
```

That's your total headcount for the restaurant booking.

---

## 3. Publish the site

### 3a. Push to GitHub

First log in to GitHub from the terminal (one time, ~1 min). Choose **GitHub.com** → **HTTPS** →
**Login with a web browser**, and paste the code it shows you:

```bash
gh auth login
```

Then create the repo and push:

```bash
cd /Users/partevghumashyan/Desktop/birthday
git init
git add -A
git commit -m "Birthday invitation site"
gh repo create birthday --public --source=. --push
```

> The repo must be **public** for free GitHub Pages hosting. Nothing sensitive is in it — the
> Apps Script URL in `CONFIG.endpoint` is a write-only endpoint, so the worst someone could do
> with it is submit a fake RSVP. Your guest list is in the Sheet, not the repo.

### 3b. Turn on Pages

In the repo on github.com: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes on every push to `main`. Watch it under the repo's **Actions** tab — first run takes
~2 minutes.

At this point the site is already live at `https://<your-username>.github.io/birthday/` —
except the assets will 404, because `vite.config.js` is set up for a root domain. If you want to
test before buying the domain, temporarily set `base: '/birthday/'` in
[`vite.config.js`](vite.config.js), push, and check. Set it back to `'/'` before step 3c.

### 3c. Buy and connect the domain

Buy a domain from [Porkbun](https://porkbun.com) or [Namecheap](https://namecheap.com) — a `.com`
runs ~$10/yr, and `.xyz` / `.click` are often ~$1–5 for the first year. Something like
`tsolak30.com`.

**In your registrar's DNS settings**, add five records:

| Type | Host | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<your-username>.github.io` |

**In this project**, rename `public/CNAME.example` to `public/CNAME` and put your bare domain in
it (no `https://`, no `www`):

```bash
mv public/CNAME.example public/CNAME
echo "tsolak30.com" > public/CNAME
git add -A && git commit -m "Add custom domain" && git push
```

**In GitHub:** Settings → Pages → Custom domain → type the domain → Save. Once the check passes,
tick **Enforce HTTPS**.

DNS takes anywhere from 10 minutes to a few hours to propagate. The HTTPS certificate can take up
to 24 hours after that — the site works over `http://` in the meantime, so don't panic.

### 3d. Fix the link preview

When you send the link on WhatsApp or Telegram, the preview card comes from the `og:` tags in
[`index.html`](index.html). One still points at `example.com`. Replace it with your real domain:

```html
<meta property="og:url" content="https://tsolak30.com/" />
```

It must be an **absolute** URL — relative paths don't work for link previews.

The preview is deliberately **text-only** (the invitation sentence plus date and venue), since
there are no photographs to show. If you later decide you want a picture on the preview card —
of the restaurant, say, rather than of him — drop it in `public/` and add:

```html
<meta property="og:image" content="https://tsolak30.com/preview.jpg" />
```

…and change `twitter:card` back to `summary_large_image`.

---

## 4. Watching the responses come in

Every RSVP appears as a new row in your Sheet, newest at the bottom:

| Ամսաթիվ | Անուն | Կարգավիճակ | Հոգի |
|---|---|---|---|
| 04.08.2026 17:32 | Արամ Հակոբյան | Գալիս է | 4 |
| 04.08.2026 18:10 | Անի Պետրոսյան | Չի գալիս | 0 |

Put these in empty cells somewhere off to the side (say F1, F2, F3):

```
=SUM(D2:D)                      ← total people to book a table for
=COUNTIF(C2:C,"Գալիս է")        ← how many invitations said yes
=COUNTIF(C2:C,"Չի գալիս")       ← how many declined
```

**Get notified instead of checking.** In the Sheet: **Tools → Notification settings → Edit
notifications → "Any changes are made" → "Right away"**. You'll get an email the moment someone
RSVPs, so you never have to remember to look.

**On your phone:** install the Google Sheets app and the sheet is in your pocket — useful when the
restaurant calls to confirm numbers.

### If responses stop arriving

Submit a test RSVP yourself and check in this order:

1. Open the `/exec` URL in a browser — it should say `{"result":"ok",...}`. If it errors, the
   deployment is broken; redeploy (see 2c).
2. Check `CONFIG.endpoint` in `src/App.jsx` is the `/exec` URL, not the `/dev` one.
3. Confirm the deployment's **Who has access** is `Anyone`, not "Anyone with a Google account".
4. Open the live site, press **F12 → Console**, submit, and read the error.

---

## Changing event details later

Everything is in the `CONFIG` and `TEXT` blocks at the top of [`src/App.jsx`](src/App.jsx):
date, coordinates, venue name, max guest count, and every piece of Armenian text on the page.

The venue coordinates from the requirements are `40.1983, 44.4900`. Worth confirming against
Google Maps before you send the link out — they drive the Yandex Navigator route.
