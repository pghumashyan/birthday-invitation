import { useEffect, useMemo, useState } from 'react'

/* ============================================================================
 * CONFIG — everything you might want to change lives here and nowhere else.
 * ==========================================================================*/
const CONFIG = {
  // Paste the Apps Script web app URL here (see DEPLOY.md, step 1).
  // Leave it empty to run in demo mode: nothing is sent, the payload is logged
  // to the browser console so you can test the whole flow first.
  endpoint: '',

  // Event moment in Yerevan time (+04:00). Drives the countdown.
  eventDate: '2026-09-28T17:30:00+04:00',

  // Venue coordinates — used for the embedded map and the Yandex route link.
  // These come from the restaurant's Yandex Maps listing. requirements.txt gave
  // 40.1983 / 44.4900, which sits ~830 m away — far enough to drop a guest on
  // the wrong street. Confirmed against the map: the pin lands on the building.
  lat: 40.194364,
  lon: 44.481653,

  venueName: 'Florence Restaurant',
  venueCity: 'Երևան',
  venueAddress: 'Բարբյուսի փող. 64/2',
  googleMapsQuery: 'Florence Restaurant, Barbusse 64/2, Yerevan',

  // No photographs anywhere on this page, by request.
  monogram: 'ՑԽ',

  honoreeName: 'Ցոլակ Խաչատրյան',
  firstName: 'ՑՈԼԱԿ',
  age: 30,

  // Sanity guard on the headcount field so a typo like "100" can't quietly
  // wreck your table booking. Raise it if you expect big families.
  maxGuests: 30,
}

const TEXT = {
  eyebrow: 'Հրավեր',
  partyLabel: 'ԾՆՆԴՅԱՆ ՏՈՆ',
  titleAge: '30',

  greetingTitle: 'Հարգելի',
  greetingScript: 'ընկերներ',
  inviteOccasion: 'Հրավիրում եմ Ձեզ կիսելու ինձ հետ տարվա ամենաջերմ երեկոն',
  inviteNote: 'Ցոլակ Խաչատրյանի 30-ամյակի տոնակատարությանը',

  dateDay: '28',
  dateMonth: 'ՍԵՊՏԵՄԲԵՐԻ',
  dateTime: 'ԺԱՄԸ 17:30-ԻՆ',
  dateWeekday: 'երկուշաբթի',

  locationTitle: 'ՎԱՅՐԸ',
  openIn: 'Բացել հավելվածում',
  mapButton: 'Տեսնել քարտեզի վրա',
  yandex: 'Yandex Navigator',
  yandexHint: 'Պահանջվում է Yandex Navigator հավելվածը',
  gmaps: 'Google Maps',

  wishesTitle: 'ՄԱՂԹԱՆՔՆԵՐ',
  // ↓ Replace this with what you actually want to tell guests: dress code,
  //   what to bring, anything practical.
  wishesBody: 'Ընկերնե՛ր և հարազատնե՛ր, բերեք Ձեզ հետ լավ տրամադրություն և շատ էներգիա։',

  formTitle: 'ՀԱՐՑԱԹԵՐԹԻԿ',
  formDeadline: 'Շնորհակալ կլինեմ, եթե հաստատեք Ձեր ներկայությունը մինչև սեպտեմբերի 11-ը',
  nameLabel: 'Ձեր անունը և ազգանունը',
  namePlaceholder: 'Արամ Հակոբյան',
  nameError: 'Խնդրում ենք նշել Ձեր անունը',
  statusQuestion: 'Կկարողանա՞ք ներկա գտնվել',
  statusError: 'Խնդրում ենք ընտրել տարբերակներից մեկը',
  going: 'Անպայման կգամ',
  notGoing: 'Ցավոք, չեմ կարողանա',
  countLabel: 'Քանի՞ հոգով եք գալու (ներառյալ Ձեզ)',
  countError: 'Մուտքագրեք միայն թիվ՝ առնվազն 1',
  countMaxError: `Առավելագույնը ${CONFIG.maxGuests} հոգի`,
  submit: 'ՈՒՂԱՐԿԵԼ',
  submitting: 'ՈՒՂԱՐԿՎՈՒՄ Է…',
  successGoing: 'Շնորհակալություն',
  successGoingSub: 'Ձեր պատասխանը գրանցված է։ Սպասում ենք Ձեզ։',
  successNotGoing: 'Ափսոս, կկարոտենք Ձեզ',
  successNotGoingSub: 'Շնորհակալություն պատասխանի համար։',
  people: 'հոգի',
  errorTitle: 'Չհաջողվեց ուղարկել',
  errorSub: 'Ստուգեք ինտերնետ կապը և փորձեք կրկին։',
  retry: 'ԿՐԿԻՆ ՓՈՐՁԵԼ',

  countdownTitle: 'ՄԻՆՉԵՎ ԾՆՆԴՅԱՆ ՕՐԸ',
  countdownOver: 'ՏՈՆԸ ՍԿՍՎԵՑ',
  units: ['օր', 'ժամ', 'րոպե', 'վայրկյան'],
}

/* Bold, tight caps for short display words. Never for a full sentence — set an
   Armenian sentence this way and it stops being readable. */
const DISPLAY = 'font-semibold uppercase tracking-[0.02em]'
const KICKER = 'text-[10px] uppercase tracking-[0.3em]'

/* ============================================================================
 * Decorative pieces — all drawn, since there is no photography
 * ==========================================================================*/

/** Radiating rays, the "sunburst" behind key moments. */
function Starburst({ className = '', rays = 56 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      // Purely decorative and often overlapping real controls — it must never
      // swallow a tap.
      className={`pointer-events-none ${className}`}
    >
      {Array.from({ length: rays }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1="100"
          x2="100"
          y2="2"
          stroke="currentColor"
          strokeWidth={i % 2 ? 0.5 : 1.6}
          transform={`rotate(${(i * 360) / rays} 100 100)`}
        />
      ))}
    </svg>
  )
}

/** Sticker-style lightning bolt, echoing the reference's energy. */
function Bolt({ className = '' }) {
  return (
    <svg viewBox="0 0 40 64" aria-hidden="true" className={className} fill="none">
      <path
        d="M23 2 6 34h11L15 62l19-34H22z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ============================================================================
 * Map app icons — simplified marks in each service's own colours, used purely
 * to say "this button opens that app".
 * ==========================================================================*/

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
      className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-card px-3 py-5 transition hover:border-accent-deep hover:shadow-md"
    >
      {icon}
      <span className="text-center text-xs leading-tight text-ink">{label}</span>
    </a>
  )
}

/** White panel on the black stage — the page's main structural device. */
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-[2rem] bg-card px-6 py-9 text-ink sm:px-8 ${className}`}>
      {children}
    </div>
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
    return (
      <p className={`${DISPLAY} chrome text-center text-4xl`}>{TEXT.countdownOver}</p>
    )
  }

  return (
    <div className="text-center">
      <p className={`${KICKER} text-accent`}>{TEXT.countdownTitle}</p>
      <div className="mt-7 grid grid-cols-4 gap-1">
        {parts.map((value, i) => (
          <div key={TEXT.units[i]}>
            <div className={`${DISPLAY} chrome text-4xl tabular-nums sm:text-5xl`}>
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-1.5 text-[10px] text-muted-dark">{TEXT.units[i]}</div>
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
      <div className="animate-fade-up text-center">
        <p className={`${DISPLAY} text-3xl text-ink`}>
          {result.attending ? TEXT.successGoing : TEXT.successNotGoing}
        </p>
        <div className="mx-auto my-5 h-1 w-14 rounded-full bg-accent" />
        <p className="text-sm text-muted">
          {result.attending ? TEXT.successGoingSub : TEXT.successNotGoingSub}
        </p>
        {result.attending && (
          <p className="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-card">
            {result.totalCount} {TEXT.people}
          </p>
        )}
      </div>
    )
  }

  const field =
    'w-full rounded-2xl border-2 bg-white px-5 py-4 text-ink placeholder-muted/50 outline-none transition focus:border-accent-deep'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7 text-left">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
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
          className={`${field} ${nameError ? 'border-alert' : 'border-line'}`}
        />
        {nameError && <p className="mt-2 text-xs text-alert">{nameError}</p>}
      </div>

      {/* Attendance */}
      <div>
        <p className="mb-3 text-sm font-medium text-ink">{TEXT.statusQuestion}</p>
        <div className="space-y-2.5">
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
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-sm transition ${
                  selected
                    ? 'border-ink bg-ink text-card'
                    : 'border-line bg-white text-muted hover:border-ink hover:text-ink'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-card' : 'border-muted/50'
                  }`}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
        {attendingError && <p className="mt-2 text-xs text-alert">{attendingError}</p>}
      </div>

      {/* Headcount — only when attending */}
      {attending === true && (
        <div className="animate-fade-up">
          <label htmlFor="count" className="mb-2 block text-sm font-medium text-ink">
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
            className={`${field} ${countError ? 'border-alert' : 'border-line'}`}
          />
          {countError && (
            <p id="count-error" className="mt-2 text-xs text-alert">
              {countError}
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl bg-alert/10 px-4 py-3 text-center">
          <p className="text-sm font-medium text-alert">{TEXT.errorTitle}</p>
          <p className="mt-0.5 text-xs text-muted">{TEXT.errorSub}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`${KICKER} w-full rounded-2xl bg-ink py-5 text-card transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {status === 'sending' ? TEXT.submitting : status === 'error' ? TEXT.retry : TEXT.submit}
      </button>
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

  return (
    // overflow-x-clip is load-bearing: the starbursts are deliberately larger
    // than their sections and would otherwise widen the page.
    <div className="min-h-dvh overflow-x-clip bg-night">
      <div className="grain pointer-events-none fixed inset-0 text-card" />

      <main className="relative mx-auto w-full max-w-md px-5 pb-16 pt-10">
        {/* ---- 1. Cover ---- */}
        <section className="animate-fade-up relative">
          <Starburst className="animate-spin-slow absolute -top-16 left-1/2 h-[130%] w-[130%] -translate-x-1/2 text-accent/15" />

          <div className="relative flex justify-between">
            <p className={`${KICKER} text-accent`}>{TEXT.eyebrow}</p>
            <Bolt className="h-12 w-8 text-card/70" />
          </div>

          <div className="relative mt-10 text-center">
            <p className={`${DISPLAY} chrome text-[8.5rem] leading-[0.8] sm:text-[11rem]`}>
              {TEXT.titleAge}
            </p>
            <p className={`${DISPLAY} outlined mt-2 text-5xl sm:text-6xl`}>{CONFIG.firstName}</p>
            <p className={`${DISPLAY} mt-6 text-2xl text-accent sm:text-3xl`}>
              {TEXT.partyLabel}
            </p>
          </div>
        </section>

        {/* ---- 2. Greeting ---- */}
        <section className="mt-16">
          <Card className="text-center">
            <h2 className={`${DISPLAY} text-3xl`}>{TEXT.greetingTitle}</h2>
            <p className="font-serif text-3xl text-accent-deep italic">{TEXT.greetingScript}</p>
            <p className="mt-6 text-base leading-relaxed text-ink">{TEXT.inviteOccasion}</p>
            <p className="mt-3 text-sm text-muted">{TEXT.inviteNote}</p>
          </Card>

          {/* Date, asymmetric on purpose — the biggest thing on the page after 30 */}
          <div className="relative mt-14">
            <Starburst className="absolute -right-16 -top-10 h-64 w-64 text-card/10" />
            <div className="relative">
              <p className={`${DISPLAY} chrome text-[7rem] leading-[0.8] sm:text-[9rem]`}>
                {TEXT.dateDay}
              </p>
              <p className={`${DISPLAY} -mt-1 text-3xl sm:text-4xl`}>{TEXT.dateMonth}</p>
              <p className={`${DISPLAY} mt-3 text-xl text-accent`}>{TEXT.dateTime}</p>
              <p className={`${KICKER} mt-3 text-muted-dark`}>{TEXT.dateWeekday}</p>
            </div>
          </div>
        </section>

        {/* ---- 3. Location ---- */}
        <section className="mt-16">
          <h2 className={`${DISPLAY} text-4xl text-accent sm:text-5xl`}>{TEXT.locationTitle}</h2>
          <p className="mt-4 font-serif text-2xl text-card">{CONFIG.venueName}</p>
          <p className="mt-1 text-sm text-muted-dark">
            {CONFIG.venueCity}, {CONFIG.venueAddress}
          </p>

          <div className="mt-6 overflow-hidden rounded-[2rem]">
            <iframe
              src={mapEmbedUrl}
              title={CONFIG.venueName}
              loading="lazy"
              className="block h-72 w-full border-0"
            />
          </div>

          <p className={`${KICKER} mt-8 mb-4 text-center text-muted-dark`}>{TEXT.openIn}</p>
          <div className="grid grid-cols-2 gap-3">
            <AppLink href={yandexUrl} icon={<YandexNaviIcon />} label={TEXT.yandex} />
            <AppLink href={gmapsUrl} icon={<GoogleMapsIcon />} label={TEXT.gmaps} external />
          </div>
          <p className="mt-4 text-center text-[10px] text-muted">{TEXT.yandexHint}</p>

          <a
            href={mapPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${KICKER} mt-5 block w-full rounded-2xl border-2 border-card/25 py-4 text-center text-card transition hover:bg-card hover:text-ink`}
          >
            {TEXT.mapButton}
          </a>
        </section>

        {/* ---- 4. Wishes ---- */}
        <section className="mt-16">
          <h2 className={`${DISPLAY} text-4xl text-accent sm:text-5xl`}>{TEXT.wishesTitle}</h2>
          <Card className="mt-5 text-center">
            <p className="text-base leading-relaxed">{TEXT.wishesBody}</p>
          </Card>
        </section>

        {/* ---- 5. RSVP ---- */}
        <section className="mt-16">
          <h2 className={`${DISPLAY} text-4xl text-accent sm:text-5xl`}>{TEXT.formTitle}</h2>
          <Card className="mt-5">
            <p className="mb-8 text-center text-sm leading-relaxed text-muted">
              {TEXT.formDeadline}
            </p>
            <RsvpForm />
          </Card>
        </section>

        {/* ---- 6. Countdown ---- */}
        <section className="relative mt-20">
          <Starburst className="animate-spin-slow absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 text-accent/15" />
          <div className="relative">
            <Countdown />
          </div>
        </section>

        {/* ---- Footer ---- */}
        <footer className="mt-20 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-card/30 font-serif text-lg text-card/80">
            {CONFIG.monogram}
          </span>
          <p className={`${KICKER} mt-5 text-muted`}>
            {CONFIG.honoreeName} · {CONFIG.age}
          </p>
        </footer>
      </main>
    </div>
  )
}
