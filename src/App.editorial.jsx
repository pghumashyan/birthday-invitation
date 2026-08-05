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

  // Venue coordinates — used to build the Yandex Navigator route link.
  // These come from the restaurant's Yandex Maps listing. requirements.txt gave
  // 40.1983 / 44.4900, which sits ~830 m away — far enough to drop a guest on
  // the wrong street. Worth confirming once on a map before sending the link.
  lat: 40.194364,
  lon: 44.481653,

  venueName: 'Florence Restaurant',
  venueCity: 'Երևան',
  // Guests taking a taxi need an address they can read out loud — not everyone
  // taps a map button. Set to '' to hide this line.
  venueAddress: 'Բարբյուսի փող. 64/2',
  googleMapsQuery: 'Florence Restaurant, Barbusse 64/2, Yerevan',

  // Drop your photo at public/tsolak.jpg. If the file is missing, the page
  // falls back to a monogram instead of showing a broken image.
  photo: '/tsolak.jpg',
  monogram: 'ՑԽ',

  honoreeName: 'Ցոլակ Խաչատրյան',
  age: 30,

  // Sanity guard on the headcount field so a typo like "100" can't quietly
  // wreck your table booking. Raise it if you expect big families.
  maxGuests: 30,
}

const TEXT = {
  eyebrow: 'Հրավեր',
  // The page says WHEN and WHERE everywhere else. This is the bit that says
  // WHAT — without it a guest opening a cold link has to infer the occasion.
  inviteLead: 'Սիրով հրավիրում ենք Ձեզ',
  inviteOccasion: 'Ցոլակ Խաչատրյանի 30-ամյակի տոնակատարությանը',
  inviteNote: 'Ուրախ կլինենք այս հատուկ օրը նշել Ձեզ հետ միասին։',
  titleTop: 'Ցոլակ Խաչատրյանի',
  titleAge: '30',
  titleBottom: 'ամյակը',
  dateLabel: 'Ամսաթիվ',
  // Kept short so it stays on one line at 390px. The weekday rides along with
  // the time on the second line instead.
  dateValue: 'Սեպտեմբերի 28',
  timeValue: 'երկուշաբթի · 17:30',
  placeLabel: 'Վայրը',
  countdownLabel: 'Մնաց',
  countdownOver: 'Տոնը սկսվեց',
  units: ['օր', 'ժամ', 'րոպե', 'վայրկյան'],
  yandex: 'Yandex Navigator',
  yandexHint: 'Պահանջվում է Yandex Navigator հավելվածը',
  gmaps: 'Google Maps',
  formTitle: 'Հաստատեք Ձեր մասնակցությունը',
  formSubtitle: 'Խնդրում ենք պատասխանել մինչև սեպտեմբերի 11-ը',
  nameLabel: 'Անուն Ազգանուն',
  namePlaceholder: 'Օր․՝ Արամ Հակոբյան',
  nameError: 'Խնդրում ենք նշել Ձեր անունը',
  statusError: 'Խնդրում ենք ընտրել տարբերակներից մեկը',
  going: 'Գալիս եմ',
  notGoing: 'Չեմ կարող գալ',
  countLabel: 'Քանի՞ հոգով եք գալու (ներառյալ Ձեզ)',
  countError: 'Մուտքագրեք միայն թիվ՝ առնվազն 1',
  countMaxError: `Առավելագույնը ${CONFIG.maxGuests} հոգի`,
  submit: 'Ուղարկել',
  submitting: 'Ուղարկվում է…',
  successGoing: 'Շնորհակալություն',
  successGoingSub: 'Ձեր պատասխանը գրանցված է։ Սպասում ենք Ձեզ։',
  successNotGoing: 'Ափսոս, կկարոտենք Ձեզ',
  successNotGoingSub: 'Շնորհակալություն պատասխանի համար։',
  people: 'հոգի',
  errorTitle: 'Չհաջողվեց ուղարկել',
  errorSub: 'Ստուգեք ինտերնետ կապը և փորձեք կրկին։',
  retry: 'Կրկին փորձել',
}

/* Shared type treatments — tracked-out small caps are the spine of this design. */
const LABEL = 'text-[10px] uppercase tracking-[0.28em] text-muted'
/* Long questions stay sentence case: tracked caps are for two or three words,
   and set an entire question that way it becomes unreadable and overflows at
   360px. */
const QUESTION = 'block text-xs text-muted'
const RULE = 'h-px w-full bg-rule'

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
      <p className="text-center font-serif text-2xl font-normal italic text-gold">
        {TEXT.countdownOver}
      </p>
    )
  }

  return (
    <div>
      <p className={`${LABEL} text-center`}>{TEXT.countdownLabel}</p>
      <div className="mt-4 flex justify-center">
        {parts.map((value, i) => (
          <div
            key={TEXT.units[i]}
            className={`px-4 text-center sm:px-7 ${i > 0 ? 'border-l border-rule' : ''}`}
          >
            <div className="font-serif text-3xl font-normal tabular-nums text-ink sm:text-4xl">
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted">
              {TEXT.units[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
 * Hero portrait — arch crop, the classic invitation shape
 * ==========================================================================*/
function HeroPortrait() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="mx-auto w-44 sm:w-52">
      <div className="relative aspect-3/4 overflow-hidden rounded-t-full border border-rule bg-paper-deep">
        {failed ? (
          <div className="flex h-full w-full items-end justify-center pb-10">
            <span className="font-serif text-4xl font-light tracking-[0.1em] text-muted">
              {CONFIG.monogram}
            </span>
          </div>
        ) : (
          <img
            src={CONFIG.photo}
            alt={CONFIG.honoreeName}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
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
  const countError =
    attending === true && (submitted || touched.count) ? countErrorFor(count) : ''
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
      <div className="animate-fade-up py-6 text-center">
        <p className="font-serif text-3xl font-normal text-ink">
          {result.attending ? TEXT.successGoing : TEXT.successNotGoing}
        </p>
        <div className="mx-auto my-6 h-px w-16 bg-gold" />
        <p className="text-sm text-muted">
          {result.attending ? TEXT.successGoingSub : TEXT.successNotGoingSub}
        </p>
        {result.attending && (
          <p className={`${LABEL} mt-6 text-gold`}>
            {result.totalCount} {TEXT.people}
          </p>
        )}
      </div>
    )
  }

  // Underlined fields rather than boxes — quieter, and it keeps the page
  // reading as a printed card instead of a web form.
  const field =
    'w-full border-0 border-b bg-transparent px-0 py-3 font-serif text-lg text-ink placeholder-muted/40 outline-none transition focus:border-ink'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {/* Name */}
      <div>
        <label htmlFor="name" className={LABEL}>
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
          className={`${field} ${nameError ? 'border-alert' : 'border-rule'}`}
        />
        {nameError && <p className="mt-2 text-xs text-alert">{nameError}</p>}
      </div>

      {/* Attendance toggle */}
      <div>
        <div className="grid grid-cols-2 gap-3">
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
                className={`border px-3 py-4 text-[11px] uppercase tracking-[0.16em] transition ${
                  selected
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule text-muted hover:border-ink hover:text-ink'
                }`}
              >
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
          <label htmlFor="count" className={QUESTION}>
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
            className={`${field} ${countError ? 'border-alert' : 'border-rule'}`}
          />
          {countError && (
            <p id="count-error" className="mt-2 text-xs text-alert">
              {countError}
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="border border-alert/40 px-4 py-3 text-center">
          <p className="text-sm text-alert">{TEXT.errorTitle}</p>
          <p className="mt-0.5 text-xs text-muted">{TEXT.errorSub}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full border border-ink bg-ink py-4 text-[11px] uppercase tracking-[0.24em] text-paper transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
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

  const navLink =
    'block w-full border border-rule py-4 text-center text-[11px] uppercase tracking-[0.2em] text-ink transition hover:border-ink hover:bg-ink hover:text-paper'

  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto w-full max-w-md px-7 pb-20 pt-14 sm:pt-20">
        {/* Hero */}
        <header className="animate-fade-up text-center">
          <p className={LABEL}>{TEXT.eyebrow}</p>
          <div className={`${RULE} animate-rule-in mt-5 mb-10`} />

          <HeroPortrait />

          <h1 className="mt-10">
            <span className="block font-serif text-2xl font-normal text-ink sm:text-3xl">
              {TEXT.titleTop}
            </span>
            <span className="mt-4 block font-serif text-8xl font-light leading-none text-ink sm:text-9xl">
              {TEXT.titleAge}
            </span>
            <span className="mt-3 block text-[11px] uppercase tracking-[0.4em] text-gold">
              {TEXT.titleBottom}
            </span>
          </h1>
        </header>

        <div className={`${RULE} my-12`} />

        {/* What this actually is */}
        <section className="animate-fade-up text-center">
          <p className="text-sm text-muted">{TEXT.inviteLead}</p>
          <p className="mt-3 font-serif text-xl leading-relaxed text-ink">
            {TEXT.inviteOccasion}
          </p>
          <div className="mx-auto my-7 h-px w-12 bg-gold" />
          <p className="text-sm leading-relaxed text-muted">{TEXT.inviteNote}</p>
        </section>

        <div className={`${RULE} my-12`} />

        <Countdown />

        <div className={`${RULE} my-12`} />

        {/* Event details */}
        <section className="animate-fade-up space-y-10 text-center">
          <div>
            <p className={LABEL}>{TEXT.dateLabel}</p>
            <p className="mt-3 font-serif text-2xl font-normal text-ink">{TEXT.dateValue}</p>
            <p className="mt-1 text-sm text-muted">{TEXT.timeValue}</p>
          </div>

          <div>
            <p className={LABEL}>{TEXT.placeLabel}</p>
            <p className="mt-3 font-serif text-2xl font-normal text-ink">{CONFIG.venueName}</p>
            {CONFIG.venueAddress && (
              <p className="mt-1 text-sm text-muted">{CONFIG.venueAddress}</p>
            )}
            <p className="mt-1 text-sm text-muted">{CONFIG.venueCity}</p>
          </div>

          <div className="space-y-3 pt-2">
            <a href={yandexUrl} className={navLink}>
              {TEXT.yandex}
            </a>
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className={navLink}>
              {TEXT.gmaps}
            </a>
            <p className="pt-1 text-[10px] tracking-wide text-muted/70">{TEXT.yandexHint}</p>
          </div>
        </section>

        <div className={`${RULE} my-12`} />

        {/* RSVP */}
        <section className="animate-fade-up">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-xl font-normal text-ink">{TEXT.formTitle}</h2>
            <p className="mt-2 text-sm text-muted">{TEXT.formSubtitle}</p>
          </div>
          <RsvpForm />
        </section>

        <div className={`${RULE} mt-16 mb-6`} />
        <footer className={`${LABEL} text-center`}>
          {CONFIG.honoreeName} · {CONFIG.age}
        </footer>
      </main>
    </div>
  )
}
