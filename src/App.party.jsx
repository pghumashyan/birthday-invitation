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
  lat: 40.1983,
  lon: 44.49,

  venueName: 'Florence Restaurant',
  venueCity: 'Երևան',
  googleMapsQuery: 'Florence Restaurant Yerevan',

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
  titleTop: 'Ցոլակ Խաչատրյանի',
  titleAge: '30',
  titleBottom: 'ամյակը',
  dateLabel: 'Ամսաթիվ',
  // Kept short so it stays on one line at 390px. The weekday rides along with
  // the time on the second line instead.
  dateValue: 'Սեպտեմբերի 28',
  timeValue: 'երկուշաբթի · 17:30',
  placeLabel: 'Վայրը',
  countdownOver: 'Տոնը սկսվեց 🎉',
  units: ['օր', 'ժամ', 'րոպե', 'վայրկյան'],
  yandex: 'Բացել Yandex Navigator-ում',
  yandexHint: 'Պահանջվում է Yandex Navigator հավելվածը',
  gmaps: 'Բացել Google Maps-ում',
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
  successGoing: 'Շնորհակալություն! Սպասում ենք Ձեզ 🎉',
  successGoingSub: 'Ձեր պատասխանը գրանցված է։',
  successNotGoing: 'Ափսոս, կկարոտենք Ձեզ',
  successNotGoingSub: 'Շնորհակալություն պատասխանի համար։',
  people: 'հոգի',
  errorTitle: 'Չհաջողվեց ուղարկել',
  errorSub: 'Ստուգեք ինտերնետ կապը և փորձեք կրկին։',
  retry: 'Կրկին փորձել',
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
      <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 px-6 py-5 text-center backdrop-blur-xl">
        <p className="font-serif text-2xl font-bold text-white">{TEXT.countdownOver}</p>
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
      {parts.map((value, i) => (
        <div
          key={TEXT.units[i]}
          className="rounded-2xl border border-white/15 bg-white/10 px-1 py-3 text-center backdrop-blur-xl sm:py-4"
        >
          <div className="font-serif text-2xl font-bold tabular-nums text-white sm:text-3xl">
            {String(value).padStart(2, '0')}
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-wide text-white/60 sm:text-xs">
            {TEXT.units[i]}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ============================================================================
 * Hero photo with monogram fallback
 * ==========================================================================*/
function HeroPhoto() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44">
      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-fuchsia-500 via-violet-400 to-amber-300 opacity-90 blur-[2px]" />
      <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white/20 bg-violet-950">
        {failed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-800 to-fuchsia-700">
            <span className="font-serif text-4xl font-bold text-white/90 sm:text-5xl">
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
      <div className="animate-fade-up rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl">
        <div className="text-5xl">{result.attending ? '🎂' : '💛'}</div>
        <h3 className="mt-4 font-serif text-xl font-bold text-white">
          {result.attending ? TEXT.successGoing : TEXT.successNotGoing}
        </h3>
        <p className="mt-2 text-sm text-white/70">
          {result.attending ? TEXT.successGoingSub : TEXT.successNotGoingSub}
        </p>
        {result.attending && (
          <p className="mt-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
            {result.totalCount} {TEXT.people}
          </p>
        )}
      </div>
    )
  }

  const inputBase =
    'w-full rounded-2xl border bg-white/5 px-4 py-3.5 text-white placeholder-white/35 outline-none transition focus:border-fuchsia-400/70 focus:bg-white/10 focus:ring-2 focus:ring-fuchsia-400/30'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/80">
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
          className={`${inputBase} ${nameError ? 'border-rose-400/70' : 'border-white/15'}`}
        />
        {nameError && <p className="mt-1.5 text-sm text-rose-300">{nameError}</p>}
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
                className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition ${
                  selected
                    ? 'border-transparent bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/25'
                    : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {attendingError && <p className="mt-1.5 text-sm text-rose-300">{attendingError}</p>}
      </div>

      {/* Headcount — only when attending */}
      {attending === true && (
        <div className="animate-fade-up">
          <label htmlFor="count" className="mb-2 block text-sm font-medium text-white/80">
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
            className={`${inputBase} ${countError ? 'border-rose-400/70' : 'border-white/15'}`}
          />
          {countError && (
            <p id="count-error" className="mt-1.5 text-sm text-rose-300">
              {countError}
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-rose-200">{TEXT.errorTitle}</p>
          <p className="mt-0.5 text-xs text-rose-200/70">{TEXT.errorSub}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-4 font-serif text-base font-bold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0b0616]">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 animate-drift rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div
          className="absolute -right-20 top-40 h-72 w-72 animate-drift rounded-full bg-violet-600/30 blur-3xl"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-72 w-72 animate-drift rounded-full bg-amber-500/20 blur-3xl"
          style={{ animationDelay: '-9s' }}
        />
      </div>

      <main className="relative mx-auto w-full max-w-lg px-5 pb-16 pt-14 sm:pt-20">
        {/* Hero */}
        <header className="animate-fade-up text-center">
          <p className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium tracking-[0.2em] text-white/70 uppercase backdrop-blur">
            {TEXT.eyebrow}
          </p>

          <HeroPhoto />

          <h1 className="mt-7 font-serif text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {TEXT.titleTop}
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-400 bg-clip-text text-5xl text-transparent sm:text-6xl">
              {TEXT.titleAge}
            </span>
            <span className="text-3xl sm:text-4xl">-{TEXT.titleBottom}</span>
          </h1>

          <Countdown />
        </header>

        {/* Event details */}
        <section
          className="animate-fade-up mt-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl" aria-hidden>
              📅
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
                {TEXT.dateLabel}
              </p>
              <p className="mt-0.5 font-serif text-lg font-bold text-white">{TEXT.dateValue}</p>
              <p className="text-sm text-white/70">{TEXT.timeValue}</p>
            </div>
          </div>

          <div className="my-5 h-px bg-white/15" />

          <div className="flex items-start gap-4">
            <span className="text-2xl" aria-hidden>
              📍
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
                {TEXT.placeLabel}
              </p>
              <p className="mt-0.5 font-serif text-lg font-bold text-white">{CONFIG.venueName}</p>
              <p className="text-sm text-white/70">{CONFIG.venueCity}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 space-y-3">
            <a
              href={yandexUrl}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.99]"
            >
              <span aria-hidden>🧭</span>
              {TEXT.yandex}
            </a>
            <p className="text-center text-xs text-white/40">{TEXT.yandexHint}</p>

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.99]"
            >
              <span aria-hidden>🗺️</span>
              {TEXT.gmaps}
            </a>
          </div>
        </section>

        {/* RSVP */}
        <section
          className="animate-fade-up mt-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className="font-serif text-xl font-bold text-white">{TEXT.formTitle}</h2>
          <p className="mt-1 mb-6 text-sm text-white/60">{TEXT.formSubtitle}</p>
          <RsvpForm />
        </section>

        <footer className="mt-10 text-center text-xs text-white/30">
          {CONFIG.honoreeName} · {CONFIG.age}
        </footer>
      </main>
    </div>
  )
}
