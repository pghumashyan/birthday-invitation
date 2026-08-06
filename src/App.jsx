import { useEffect, useMemo, useState } from 'react'

/* ============================================================================
 * CONFIG — everything you might want to change lives here and nowhere else.
 * ==========================================================================*/
const CONFIG = {
  // Paste the Apps Script web app URL here (see DEPLOY.md, step 1).
  // Leave it empty to run in demo mode: nothing is sent, the payload is logged
  // to the browser console so you can test the whole flow first.
  endpoint:
    'https://script.google.com/macros/s/AKfycbxZ0jUdZvNGIZTyqhW2Fmj6yZJIt9wkerSYo3zkno4yl-hUtaJxenN9WGW5Wxu4Wfz4bA/exec',

  // Event moment in Yerevan time (+04:00). Drives the countdown.
  eventDate: '2026-09-28T17:00:00+04:00',

  // Venue coordinates — used for the embedded map and the Yandex route link.
  // These come from the restaurant's Yandex Maps listing. requirements.txt gave
  // 40.1983 / 44.4900, which sits ~830 m away — far enough to drop a guest on
  // the wrong street. Worth confirming once on a map before sending the link.
  lat: 40.194364,
  lon: 44.481653,

  venueName: 'Florence Restaurant',
  venueCity: 'Երևան',
  venueAddress: 'Բարբյուսի փող. 64/2',
  googleMapsQuery: 'Florence Restaurant, Barbusse 64/2, Yerevan',

  // Cover portrait. Drop the file at public/tsolak.jpg — portrait orientation,
  // 1200px+ on the short side. If it is missing the cover falls back to a
  // monogram panel rather than a broken image.
  photo: '/tsolak.jpg',
  // Where to zoom into the portrait: 'x% y%'. Point it at the face.
  photoFocus: '66% 26%',
  monogram: 'ՑԽ',
  firstName: 'ՑՈԼԱԿ',


  honoreeName: 'Ցոլակ Խաչատրյան',
  age: 30,

  // Sanity guard on the headcount field so a typo like "100" can't quietly
  // wreck your table booking. Raise it if you expect big families.
  maxGuests: 30,
}

const TEXT = {
  eyebrow: 'Հրավեր',
  titleTop: 'Ցոլակ Խաչատրյանի',
  titleAge: '30',
  partyLabel: 'BIRTHDAY PARTY',
  // Dative, not nominative: it reads as one phrase with the «Հրավեր» label
  // directly above it — "invitation TO the celebration of the 30th".
  titleBottom: 'ամյակի տոնակատարությանը',


  greetingTitle: 'Հարգելի՛ բարեկամներ և ընկերներ',
  // First the personal note — why this landed in their hands at all.
  inviteOccasion:
    'Եթե ստացել եք այս հրավերը, ուրեմն Դուք իմ ընտանիքի համար կարևոր հյուր եք։',
  // Then the ask. The page says WHEN and WHERE everywhere else; this is the bit
  // that says WHAT, so a guest opening a cold link never has to infer it.
  inviteNote:
    'Հրավիրում եմ Ձեզ ինձ հետ կիսելու տարվա ամենաջերմ երեկոն՝ Ցոլակ Խաչատրյանի 30-ամյակի տոնակատարությունը։',

  dateDay: '28',
  dateMonth: 'Սեպտեմբերի',
  dateWeekday: 'երկուշաբթի',
  timeValue: '17:00',

  locationTitle: 'Վայրը',
  openIn: 'Բացել հավելվածում',
  mapButton: 'Տեսնել քարտեզի վրա',
  yandex: 'Yandex Navigator',
  yandexHint: 'Պահանջվում է Yandex Navigator հավելվածը',
  gmaps: 'Google Maps',

  wishesTitle: 'Մաղթանքներ',
  wishesBody:
    'Ընկերնե՛ր և հարազատնե՛ր, բերեք Ձեզ հետ լավ տրամադրություն և դրական էներգիա։',

  formTitle: 'Հարցաթերթիկ',
  formDeadline: 'Շնորհակալ կլինեմ, եթե հաստատեք Ձեր ներկայությունը մինչև սեպտեմբերի 11-ը',
  nameLabel: 'Անուն Ազգանուն',
  namePlaceholder: 'Օր․՝ Արամ Հակոբյան',
  nameError: 'Խնդրում ենք նշել Ձեր անունը',
  statusQuestion: 'Կկարողանա՞ք ներկա գտնվել',
  statusError: 'Խնդրում ենք ընտրել տարբերակներից մեկը',
  going: 'Անպայման կգամ',
  notGoing: 'Ցավոք, չեմ կարողանա',
  countLabel: 'Քանի՞ հոգով եք գալու (ներառյալ Ձեզ)',
  countError: 'Մուտքագրեք միայն թիվ՝ առնվազն 1',
  countMaxError: `Առավելագույնը ${CONFIG.maxGuests} հոգի`,
  submit: 'Ուղարկել',
  submitting: 'Ուղարկվում է…',
  submittingSlow: 'Կարող է տևել մի քանի վայրկյան',
  successGoing: 'Շնորհակալություն',
  successGoingSub: 'Ձեր պատասխանը գրանցված է։ Սպասում ենք Ձեզ։',
  successNotGoing: 'Ափսոս, կկարոտենք Ձեզ',
  successNotGoingSub: 'Շնորհակալություն պատասխանի համար։',
  people: 'հոգի',
  errorTitle: 'Չհաջողվեց ուղարկել',
  errorSub: 'Ստուգեք ինտերնետ կապը և փորձեք կրկին։',
  retry: 'Կրկին փորձել',

  countdownTitle: 'Մինչև ծննդյան օրը մնաց',
  countdownOver: 'Տոնը սկսվեց',
  units: ['օր', 'ժամ', 'րոպե', 'վայրկյան'],
}

/* Shared type treatment — tracked-out small caps are the spine of this design. */
const LABEL = 'text-[10px] uppercase tracking-[0.28em]'
const HEADING = 'font-serif text-3xl text-wine sm:text-4xl'

/* ============================================================================
 * Decorative pieces
 * ==========================================================================*/

/** Gold flourish used as a section divider. */
function Ornament({ className = '', tone = 'text-gold' }) {
  return (
    <svg
      viewBox="0 0 140 14"
      aria-hidden="true"
      className={`mx-auto h-3.5 w-36 ${tone} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 7h44M94 7h44" strokeLinecap="round" />
      <path d="M70 1.5 76 7l-6 5.5L64 7z" />
      <path d="M54 7l6-3.5M54 7l6 3.5M86 7l-6-3.5M86 7l-6 3.5" strokeLinecap="round" />
    </svg>
  )
}

/** Corner filigree for framed cards. */
function Corner({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`absolute h-7 w-7 text-gold/70 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M1 12V1h11" strokeLinecap="round" />
      <circle cx="6" cy="6" r="1.6" />
    </svg>
  )
}

/** Leaves swept along an arc, open at the top, mirrored left and right. */
function laurelLeaves(radius, rx, ry, count, tilt) {
  return Array.from({ length: count }, (_, i) => {
    // 20°..160° in SVG coordinates (y grows downward) runs from the right side,
    // through the bottom, round to the left — leaving the crown open.
    const deg = 20 + (i * 140) / (count - 1)
    const rad = (deg * Math.PI) / 180
    const cx = 70 + radius * Math.cos(rad)
    const cy = 70 + radius * Math.sin(rad)
    return (
      <ellipse
        key={`${radius}-${i}`}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        transform={`rotate(${deg + tilt} ${cx} ${cy})`}
      />
    )
  })
}

/** Cover portrait in a gold frame, with a monogram panel if the file is absent. */
function CoverPortrait() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative w-44 shrink-0 sm:w-52">
      <Corner className="-top-2 -left-2" />
      <Corner className="-top-2 -right-2 rotate-90" />
      <Corner className="-bottom-2 -right-2 rotate-180" />
      <Corner className="-bottom-2 -left-2 -rotate-90" />

      <div className="border-2 border-gold/50 bg-blush-deep p-1.5">
        <div className="aspect-3/4 overflow-hidden bg-gradient-to-b from-blush to-blush-deep">
          {failed ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <span className="font-serif text-4xl text-gold">{CONFIG.monogram}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted">
                public/tsolak.jpg
              </span>
            </div>
          ) : (
            <img
              src={CONFIG.photo}
              alt={CONFIG.honoreeName}
              onError={() => setFailed(true)}
              // The subject sits right of centre with another guest's shoulder
              // in the bottom-left. Zooming toward him crops that out; adjust
              // CONFIG.photoFocus if you swap the picture.
              style={{ transformOrigin: CONFIG.photoFocus }}
              className="h-full w-full scale-[1.45] object-cover"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function LaurelEmblem({ children }) {
  return (
    <div className="relative h-44 w-44 shrink-0 sm:h-52 sm:w-52">
      <svg
        viewBox="0 0 140 140"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-gold"
      >
        <circle
          cx="70"
          cy="70"
          r="62"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.45"
          strokeDasharray="150 40"
          transform="rotate(110 70 70)"
        />
        <circle
          cx="70"
          cy="70"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeOpacity="0.3"
        />
        <g fill="currentColor" fillOpacity="0.75">{laurelLeaves(54, 9, 3.4, 13, 20)}</g>
        <g fill="currentColor" fillOpacity="0.45">{laurelLeaves(44, 6.5, 2.6, 11, 26)}</g>
        <circle cx="70" cy="12" r="2.6" fill="currentColor" fillOpacity="0.8" />
        <circle cx="61" cy="15" r="1.8" fill="currentColor" fillOpacity="0.55" />
        <circle cx="79" cy="15" r="1.8" fill="currentColor" fillOpacity="0.55" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Map app icons. Drawn here rather than fetched: simplified marks in each
 * service's own colours, used purely to say "this button opens that app".
 * -------------------------------------------------------------------------*/

function YandexNaviIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FC3F1D" />
      <path d="M24 10.5 34 34.5 24 29.2 14 34.5z" fill="#fff" />
    </svg>
  )
}

function GoogleMapsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
      <defs>
        <clipPath id="gm-tile">
          <rect width="48" height="48" rx="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#gm-tile)">
        <rect width="48" height="48" fill="#F1F3F4" />
        <path d="M0 33c9-1 13-9 22-11s18 3 26-3v29H0z" fill="#A8DAB5" />
        <path d="M-4 17 52 3" stroke="#4285F4" strokeWidth="5" />
        <path d="M6 52 30 -4" stroke="#FBBC04" strokeWidth="4" />
        <path
          d="M24 13c-4 0-7.2 3.2-7.2 7.2 0 5.4 7.2 13.3 7.2 13.3s7.2-7.9 7.2-13.3c0-4-3.2-7.2-7.2-7.2z"
          fill="#EA4335"
        />
        <circle cx="24" cy="20.2" r="2.6" fill="#fff" />
      </g>
    </svg>
  )
}

/** Share-sheet style tile: app icon above, service name below. */
function AppLink({ href, icon, label, external }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex flex-col items-center gap-2.5 rounded-2xl border border-gold/40 bg-paper px-3 py-5 transition hover:border-wine hover:bg-blush/50"
    >
      {icon}
      <span className="text-center text-xs leading-tight text-ink">{label}</span>
    </a>
  )
}

/** Gold roundel carrying the initials. */
function Monogram({ tone = 'border-gold/50 text-gold', className = '' }) {
  return (
    <span
      className={`inline-flex h-16 w-16 items-center justify-center rounded-full border font-serif text-xl ${tone} ${className}`}
    >
      {CONFIG.monogram}
    </span>
  )
}

/* ============================================================================
 * Countdown
 * ==========================================================================*/
function useCountdown(targetIso) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = target - now
  if (diff <= 0) return { over: true, parts: [0, 0, 0, 0] }

  const seconds = Math.floor(diff / 1000)
  return {
    over: false,
    parts: [
      Math.floor(seconds / 86400),
      Math.floor((seconds % 86400) / 3600),
      Math.floor((seconds % 3600) / 60),
      seconds % 60,
    ],
  }
}

function Countdown() {
  const { over, parts } = useCountdown(CONFIG.eventDate)

  if (over) {
    return <p className="text-center font-serif text-3xl text-gold-soft">{TEXT.countdownOver}</p>
  }

  return (
    <div>
      <p className={`${LABEL} text-center text-gold-soft`}>{TEXT.countdownTitle}</p>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
        {parts.map((value, i) => (
          <div
            key={TEXT.units[i]}
            className="border border-gold/40 bg-wine-deep/50 px-1 py-4 text-center"
          >
            <div className="font-serif text-2xl tabular-nums text-paper sm:text-3xl">
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-gold-soft">
              {TEXT.units[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
 * RSVP form
 * ==========================================================================*/

/** Returns an error message for a headcount value, or '' if it is fine. */
function countErrorFor(raw) {
  const value = raw.trim()
  if (value === '') return TEXT.countError
  // Digits and nothing else. This is what rejects "2.5", "-3", "1e3" and "abc"
  // — Number() alone would happily accept most of them.
  if (!/^\d+$/.test(value)) return TEXT.countError
  const n = Number(value)
  if (n < 1) return TEXT.countError
  if (n > CONFIG.maxGuests) return TEXT.countMaxError
  return ''
}

function nameErrorFor(raw) {
  return raw.trim().length < 2 ? TEXT.nameError : ''
}

function RsvpForm() {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null) // null | true | false
  const [count, setCount] = useState('2')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [result, setResult] = useState(null)

  // Which fields have been interacted with, so we don't shout at someone who
  // hasn't reached the field yet.
  const [touched, setTouched] = useState({})
  // Set on the first submit attempt; from then on every field validates live so
  // errors clear the moment they are fixed.
  const [submitted, setSubmitted] = useState(false)

  // Apps Script is slow to answer — a cold start plus its redirect hop measured
  // ~6-9s from the live site. Without a word of explanation that reads as a
  // frozen page, and people start tapping the button again.
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (status !== 'sending') {
      setSlow(false)
      return
    }
    const id = setTimeout(() => setSlow(true), 2500)
    return () => clearTimeout(id)
  }, [status])

  const nameError = submitted || touched.name ? nameErrorFor(name) : ''
  const countError = attending === true && (submitted || touched.count) ? countErrorFor(count) : ''
  const attendingError = submitted && attending === null ? TEXT.statusError : ''

  const isValid =
    !nameErrorFor(name) && attending !== null && (attending === false || !countErrorFor(count))

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    setSubmitted(true)
    if (!isValid) return

    const payload = {
      timestamp: new Date().toISOString(),
      guestName: name.trim(),
      attending: attending,
      totalCount: attending ? Number(count) : 0,
    }

    setStatus('sending')

    // Demo mode: no endpoint configured yet.
    if (!CONFIG.endpoint) {
      console.log('[RSVP demo mode] payload:', payload)
      setResult(payload)
      setStatus('success')
      return
    }

    // Apps Script answers in 3-10 seconds, so awaiting it means the guest
    // stares at a spinner. sendBeacon hands the request to the browser, which
    // delivers it in the background — it returns immediately and survives the
    // tab being closed. A Blob typed text/plain keeps it a "simple request",
    // so no CORS preflight (which Apps Script cannot answer).
    //
    // The trade: we never learn whether the row was written. Acceptable here
    // because the fallback below could not read the response either.
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' })
      if (navigator.sendBeacon && navigator.sendBeacon(CONFIG.endpoint, blob)) {
        setResult(payload)
        setStatus('success')
        return
      }
    } catch {
      // Beacon unavailable or refused — fall through to the awaited request,
      // which is slower but reports real success and failure.
    }

    try {
      // Content-Type MUST stay text/plain. Using application/json makes the
      // browser send a CORS preflight OPTIONS request, and Apps Script web apps
      // do not answer OPTIONS — the request would fail before reaching the
      // script. The script does JSON.parse(e.postData.contents) either way.
      await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      setResult(payload)
      setStatus('success')
    } catch {
      try {
        // Fallback: fire-and-forget. The response is unreadable in no-cors mode
        // but the row still gets written.
        await fetch(CONFIG.endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        })
        setResult(payload)
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="animate-fade-up border border-gold/40 bg-paper px-6 py-10 text-center">
        <Ornament />
        <p className="mt-5 font-serif text-3xl text-wine">
          {result.attending ? TEXT.successGoing : TEXT.successNotGoing}
        </p>
        <p className="mt-3 text-sm text-muted">
          {result.attending ? TEXT.successGoingSub : TEXT.successNotGoingSub}
        </p>
        {result.attending && (
          <p className={`${LABEL} mt-6 inline-block border border-gold/50 px-4 py-2 text-gold`}>
            {result.totalCount} {TEXT.people}
          </p>
        )}
        <Ornament className="mt-6 rotate-180" />
      </div>
    )
  }

  const field =
    'w-full rounded-full border bg-paper px-6 py-4 text-ink placeholder-muted/40 outline-none transition focus:border-wine'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm text-ink">
          {TEXT.nameLabel}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          autoComplete="name"
          placeholder={TEXT.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          aria-invalid={Boolean(nameError)}
          className={`${field} ${nameError ? 'border-alert' : 'border-gold/40'}`}
        />
        {nameError && <p className="mt-2 px-2 text-xs text-alert">{nameError}</p>}
      </div>

      {/* Attendance */}
      <div>
        <p className="mb-3 text-sm text-ink">{TEXT.statusQuestion}</p>
        <div className="space-y-3">
          {[
            { value: true, label: TEXT.going },
            { value: false, label: TEXT.notGoing },
          ].map((option) => {
            const selected = attending === option.value
            return (
              <button
                key={String(option.value)}
                type="button"
                aria-pressed={selected}
                onClick={() => setAttending(option.value)}
                className={`flex w-full items-center gap-3 rounded-full border px-6 py-4 text-left text-sm transition ${
                  selected
                    ? 'border-wine bg-wine text-paper'
                    : 'border-gold/40 bg-paper text-muted hover:border-wine hover:text-wine'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? 'border-paper' : 'border-gold/60'
                  }`}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-paper" />}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
        {attendingError && <p className="mt-2 px-2 text-xs text-alert">{attendingError}</p>}
      </div>

      {/* Headcount — only when attending */}
      {attending === true && (
        <div className="animate-fade-up">
          <label htmlFor="count" className="mb-2 block text-sm text-ink">
            {TEXT.countLabel}
          </label>
          <input
            id="count"
            // type="text", NOT type="number". A number input silently discards
            // letters: the value reads back as "" so the guest sees nothing
            // appear and gets no explanation. Here whatever they type stays
            // visible and countErrorFor() tells them what is wrong.
            // inputMode="numeric" still brings up the number keypad on phones.
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={count}
            onChange={(e) => {
              setCount(e.target.value)
              setTouched((t) => ({ ...t, count: true }))
            }}
            onBlur={() => setTouched((t) => ({ ...t, count: true }))}
            aria-invalid={Boolean(countError)}
            aria-describedby={countError ? 'count-error' : undefined}
            className={`${field} ${countError ? 'border-alert' : 'border-gold/40'}`}
          />
          {countError && (
            <p id="count-error" className="mt-2 px-2 text-xs text-alert">
              {countError}
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-alert/40 bg-alert/5 px-4 py-3 text-center">
          <p className="text-sm text-alert">{TEXT.errorTitle}</p>
          <p className="mt-0.5 text-xs text-muted">{TEXT.errorSub}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-full border border-wine bg-wine py-4 text-[11px] uppercase tracking-[0.24em] text-paper transition hover:bg-wine-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'sending' ? TEXT.submitting : status === 'error' ? TEXT.retry : TEXT.submit}
        </button>
        {slow && (
          <p className="animate-fade-up mt-3 text-center text-xs text-muted">
            {TEXT.submittingSlow}
          </p>
        )}
      </div>
    </form>
  )
}

/* ============================================================================
 * App
 * ==========================================================================*/
export default function App() {
  const yandexUrl = `yandexnavi://build_route_on_map?lat_to=${CONFIG.lat}&lon_to=${CONFIG.lon}`
  const gmapsUrl = `https://maps.google.com/?q=${encodeURIComponent(CONFIG.googleMapsQuery)}`
  // Yandex's embeddable widget needs no API key.
  const mapEmbedUrl = `https://yandex.com/map-widget/v1/?ll=${CONFIG.lon}%2C${CONFIG.lat}&z=17&pt=${CONFIG.lon},${CONFIG.lat},pm2rdm`
  const mapPageUrl = `https://yandex.com/maps/?ll=${CONFIG.lon}%2C${CONFIG.lat}&z=17&pt=${CONFIG.lon},${CONFIG.lat}`

  const navLink =
    'block w-full rounded-full border border-gold/50 bg-paper py-4 text-center text-[11px] uppercase tracking-[0.2em] text-wine transition hover:bg-wine hover:text-paper'

  return (
    // The page is a dark stage; all content lives inside one rounded card
    // column so the invitation reads as a separate object rather than a
    // full-bleed website. overflow-hidden makes the interior bands (wine
    // countdown, blush sections) clip to the card's rounded corners.
    <div className="relative min-h-dvh bg-backdrop p-3 sm:p-8">
      <div className="texture pointer-events-none fixed inset-0 text-wine" />

      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-paper shadow-2xl shadow-wine/20">
      <main>
        {/* ---- 1. Cover ---- */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blush-deep via-blush to-paper">
          <div className="texture pointer-events-none absolute inset-0 text-wine" />
          <div className="relative px-6 pb-9 pt-12 sm:px-8 sm:pt-16">
            <div className="animate-fade-up text-center">
              {/* Not the shared LABEL: this one sits alone at the top of the
                  page and needs a little more presence than the section
                  labels further down. */}
              <p className="text-base uppercase tracking-[0.3em] text-gold">{TEXT.eyebrow}</p>
              <Ornament className="mt-4 mb-7" />

              {/* One complete heading for screen readers, the page outline and
                  search results. The visual composition below is decorative. */}
              <h1 className="sr-only">
                {TEXT.titleTop} {TEXT.titleAge}-{TEXT.titleBottom}
              </h1>

              <div aria-hidden="true" className="relative mt-2">
                {/* Hollow numeral, overlapping the portrait's top-left corner */}
                <span className="outlined-gold absolute -top-3 left-0 z-10 font-serif text-7xl leading-none sm:text-8xl">
                  {TEXT.titleAge}
                </span>

                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <span
                    className="text-sm font-semibold uppercase tracking-[0.3em] text-wine"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {CONFIG.firstName}
                  </span>

                  <CoverPortrait />
                </div>

                <p className="mt-6 text-3xl font-bold tracking-tight text-wine sm:text-4xl">
                  {TEXT.partyLabel}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ---- 2. Greeting ---- */}
        <section className="px-6 pt-10 pb-14 sm:px-8">
          <div className="relative border border-gold/40 bg-blush/50 px-6 py-10 text-center">
            <Corner className="top-2 left-2" />
            <Corner className="top-2 right-2 rotate-90" />
            <Corner className="bottom-2 right-2 rotate-180" />
            <Corner className="bottom-2 left-2 -rotate-90" />

            {/* Smaller than the other headings on purpose: this one is a full
                phrase, not one word, and needs to wrap without dominating. */}
            <h2 className="font-serif text-2xl leading-snug text-wine sm:text-3xl">
              {TEXT.greetingTitle}
            </h2>
            <Ornament className="my-6" />
            <p className="text-[15px] leading-relaxed text-muted">{TEXT.inviteOccasion}</p>
            <p className="mt-4 text-base leading-relaxed text-ink">{TEXT.inviteNote}</p>
          </div>

          <div className="mt-12 text-center">
            <p className="font-serif text-8xl leading-none text-wine sm:text-9xl">
              {TEXT.dateDay}
            </p>
            <p className={`${LABEL} mt-4 text-wine`}>{TEXT.dateMonth}</p>
            <p className={`${LABEL} mt-3 text-gold`}>
              {TEXT.dateWeekday} · {TEXT.timeValue}
            </p>
          </div>
        </section>

        {/* ---- 3. Location ---- */}
        <section className="bg-blush/60">
          <div className="px-6 py-14 sm:px-8">
            <h2 className={`${HEADING} text-center`}>{TEXT.locationTitle}</h2>
            <Ornament className="my-6" />

            <p className="text-center font-serif text-2xl text-ink">{CONFIG.venueName}</p>
            <p className="mt-2 text-center text-sm text-muted">
              {CONFIG.venueCity}
              {CONFIG.venueAddress ? `, ${CONFIG.venueAddress}` : ''}
            </p>

            <div className="mt-7 overflow-hidden border border-gold/40">
              <iframe
                src={mapEmbedUrl}
                title={CONFIG.venueName}
                loading="lazy"
                className="block h-72 w-full border-0"
              />
            </div>

            <div className="mt-6">
              <p className={`${LABEL} mb-4 text-center text-muted`}>{TEXT.openIn}</p>
              <div className="grid grid-cols-2 gap-3">
                <AppLink href={yandexUrl} icon={<YandexNaviIcon />} label={TEXT.yandex} />
                <AppLink href={gmapsUrl} icon={<GoogleMapsIcon />} label={TEXT.gmaps} external />
              </div>
              <p className="mt-4 text-center text-[10px] text-muted/70">{TEXT.yandexHint}</p>

              <a
                href={mapPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${navLink} mt-5`}
              >
                {TEXT.mapButton}
              </a>
            </div>
          </div>
        </section>

        {/* ---- 4. Wishes ---- */}
        <section className="px-6 py-14 text-center sm:px-8">
          <h2 className={HEADING}>{TEXT.wishesTitle}</h2>
          <Ornament className="my-6" />
          <div className="border border-gold/40 bg-blush/40 px-6 py-8">
            <p className="text-base leading-relaxed text-ink">{TEXT.wishesBody}</p>
          </div>
        </section>

        {/* ---- 5. RSVP ---- */}
        <section className="bg-blush/60">
          <div className="px-6 py-14 sm:px-8">
            <h2 className={`${HEADING} text-center`}>{TEXT.formTitle}</h2>
            <Ornament className="my-6" />
            <p className="mb-10 text-center text-sm leading-relaxed text-muted">
              {TEXT.formDeadline}
            </p>
            <RsvpForm />
          </div>
        </section>

        {/* ---- 6. Countdown ---- */}
        <section className="relative overflow-hidden bg-wine">
          <div className="texture pointer-events-none absolute inset-0 text-paper" />
          <div className="relative px-6 py-14 sm:px-8">
            <Countdown />
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="relative overflow-hidden bg-wine-deep py-10 text-center">
        <div className="texture pointer-events-none absolute inset-0 text-paper" />
        <div className="relative">
          <Monogram tone="border-gold-soft/50 text-gold-soft" />
          <Ornament className="mt-6" tone="text-gold-soft" />
          <p className={`${LABEL} mt-4 text-gold-soft`}>
            {CONFIG.honoreeName} · {CONFIG.age}
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}
