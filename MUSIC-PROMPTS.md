# Music prompts — Apex Truck Tire

Prompts for every place music would play: brand film / hero video, 30 s spot, vertical reel,
phone hold, end-card stinger — plus a full original song and a phone-number jingle. Written for
Suno, Udio, Stable Audio and ElevenLabs Music; each prompt is self-contained once you paste in the
shared blocks below. Same idea as `IMAGE-PROMPTS.md`.

## How to use

1. **Paste the `SOUND` block into every prompt** where it says `[SOUND]`. It is the sonic version of
   the photography brief: cool, dark bed, one warm orange accent.
2. **Instrumental vs song.** M-cues are instrumentals — turn on the tool's *instrumental* switch (Suno,
   Udio) or say "no vocals" (Stable Audio, ElevenLabs). S-cues take the lyrics in Part B.
3. **Two prompt sizes.** Each cue has a *short style line* (Suno / Udio "style" field, ≈ 200 chars
   works everywhere) and a *long brief* for tools that read a paragraph (Stable Audio, ElevenLabs,
   Udio "manual" mode). Use whichever the tool wants; don't paste both.
4. **No artist names.** Every major generator rejects or ignores them. The prompts describe the sound
   instead; keep it that way when you edit.
5. **Generate 4–6 takes per cue and judge the first 8 seconds** — that is all a pre-roll ad or a reel
   gets. For beds, ask for *loopable* and check the loop point in Audacity / your DAW; generators
   rarely land it perfectly, so trim to a bar line.
6. **Get stems** (Suno and Udio both export them on paid plans). The voice-over editor needs drums /
   bass / melody separated to duck under narration.
7. **Commercial use needs a paid plan** on every generator (free tiers are personal-use). Confirm the
   plan's licence before anything airs or goes into a paid ad.
8. **Loudness targets:** web / social −14 to −16 LUFS integrated, −1 dBTP; broadcast spot −24 LUFS
   (ATSC A/85) or whatever the station sends you; hold music quieter and mono (see M4).

---

## Shared blocks

### SOUND — paste wherever a prompt says `[SOUND]`

```
Dark, cinematic, slow-burn. 86–90 BPM, half-time feel, D minor. Low-key and high-contrast like a
night photograph: the bed is cool and dark — deep clean sub bass, a baritone electric guitar with
light tremolo and short spring reverb, sparse dry drums (heavy kick, rimshot, no crash cymbals), a
quiet analog synth pad — and the only warm element is one accent that rises under the hook: a low
overdriven guitar swell or a Hammond-style organ pad, like a sodium lamp coming on. Percussion has
a mechanical, metallic character: air-ratchet clicks, an impact-wrench rattle, lug nuts dropping on
steel, a tire rolling on wet concrete used as texture. Confident and unhurried — a truck that is
already moving, not a chase. Dry mix, tight low end, lots of headroom, sits under a voice-over
without fighting it. No EDM drops, no risers, no trap hi-hats, no orchestral trailer hits, no
ukulele, no hand-claps, no corporate-motivational pop, no lo-fi beats, no autotune.
```

### NEGATIVE — for tools with a negative / "exclude styles" field (Suno has one)

```
EDM, dubstep, trap, drill, lo-fi hip hop, epic orchestral, trailer braam, riser, drop, ukulele,
whistling, hand claps, glockenspiel, corporate pop, bro-country party, reggaeton, autotune, vocal
chops, cheerful, uplifting, wedding, children, 8-bit, vaporwave
```

### Vibe in words (for briefing a human composer or picking a licensed track)

The night-freeway scene in a crime drama, not the car chase. A baritone guitar through a clean amp
with tremolo on. Southern-rock swagger with the party taken out. Industrial percussion made from
shop tools. A diesel at idle is the tempo reference. The feeling is *someone competent is on the way.*

---

## Part A — Instrumental cues

### M1 · Brand bed — 90 s, loopable (hero video, brand film, any long-form)

Short style line:

```
dark cinematic slow-burn, 88 bpm half-time, baritone electric guitar with tremolo, sub bass, sparse dry drums, metallic industrial percussion, analog pad, night highway, confident, instrumental, loopable
```

Long brief:

```
Instrumental, 90 seconds, seamlessly loopable. [SOUND] Structure: 0:00–0:15 diesel-idle drone and a
single air-ratchet click pattern, the sub bass fades in; 0:15–0:45 the baritone guitar states a
four-note motif over the kick and rimshot, very sparse; 0:45–1:05 the warm organ/overdrive accent
rises once under the motif and falls away; 1:05–1:30 back to the stripped bed so the end loops
cleanly into the start. No melody busy enough to fight a voice-over. Keep the arrangement mostly
below 3 kHz so narration sits on top.
```

### M2 · 30-second spot (pre-roll, radio bed, YouTube)

Short style line:

```
dark cinematic, 88 bpm half-time, baritone guitar tremolo, sub bass, heavy kick and rimshot, industrial metallic percussion, one warm organ swell, hard stop ending, instrumental
```

Long brief:

```
Instrumental, exactly 30 seconds, arranged to a timeline. [SOUND] 0:00–0:03 a diesel idle and one
impact-wrench rattle, no music yet (the voice-over opens here); 0:03 the sub bass and kick enter on
a downbeat; 0:03–0:20 the baritone motif under narration, sparse; 0:20–0:27 the warm organ accent
rises to the hook and the drums fill out slightly; 0:27 everything hits one final low note and
stops dead; 0:27–0:30 only the tail: a tire hiss and an air-brake release. Ends in silence at 0:30.
```

### M3 · 15-second vertical reel (Instagram / TikTok / Facebook)

Short style line:

```
dark gritty cinematic, 90 bpm half-time, baritone guitar, sub bass, impact wrench and lug nut percussion, short warm swell, punchy, instrumental, 15 seconds
```

Long brief:

```
Instrumental, 15 seconds. [SOUND] Starts on the downbeat — no intro, the kick and sub bass hit at
0:00 with an impact-wrench rattle as the pickup. Four-note baritone motif twice, the warm swell
lands at 0:10, a hard stop at 0:14 with a lug nut dropping on steel as the last sound. Mono-
compatible; the low end must still read on a phone speaker, so double the sub with a low baritone
note.
```

### M4 · Phone hold music — 3 min loop (dispatch line)

Phone lines are 8 kHz mono. Sub bass vanishes, cymbals turn to hiss, silence over two seconds makes
callers think the line dropped. This cue is the same identity, made to survive a telephone codec.

Short style line:

```
calm dark cinematic, 84 bpm, baritone electric guitar with tremolo, warm organ pad, soft kick, mid-range focused, no cymbals, no sub bass, steady, instrumental, loopable, hold music
```

Long brief:

```
Instrumental, 3 minutes, seamlessly loopable, for telephone hold. [SOUND] but with these changes:
no sub bass (bass lives an octave up, played on the baritone guitar), no metallic hits, no cymbals,
no silence longer than one beat, no sudden dynamics. The mix is centred in the 300 Hz–3 kHz band,
mono. Keep the baritone motif and the tremolo, add the warm organ pad continuously at low level so
there is always something playing. Steady, unhurried, reassuring — the caller is on the shoulder
at 3 a.m. and this must sound like the truck is coming.
```

### M5 · Logo stinger — 2–3 s (end card, video sign-off)

```
Sound design, 2.5 seconds, no melody. [SOUND] One impact-wrench rattle (three fast pulses), then a
single low D on the baritone guitar and sub bass together, struck once and let ring for one second,
then a short tire hiss as the tail. Dry, tight, ends in silence.
```

---

## Part B — Song

### S1 · "Already Rolling" — full song (~3:00)

The hero headline is the hook. Written as a slow desert blues-rock track, baritone male vocal,
gritty and understated — a working song, not a jingle. Suno: put the style line in *Style*, the
lyrics in *Lyrics*, and add the NEGATIVE block in *Exclude styles*. Udio: same lyrics, style as tags.

Short style line:

```
slow-burn desert blues rock, 88 bpm half-time, deep gritty baritone male vocal, understated delivery, baritone electric guitar with tremolo and spring reverb, sub bass, sparse heavy drums, mechanical metallic percussion, night highway, dark, confident, no autotune
```

Long brief (ElevenLabs Music / Udio manual):

```
A song with vocals, about 3 minutes. [SOUND] Lead vocal: a deep baritone, male, rough-edged and
plainspoken, close-miked, half-spoken in the verses, sung on the chorus, never belted. Sparse
backing vocal on the last word of each chorus line only. Structure follows the lyric tags. The
bridge is spoken over the bed. Ends on the spoken last line, then diesel and a tire hiss.
```

Lyrics:

```
[Intro — diesel idle, baritone guitar, no drums]

[Verse 1]
Three a.m. on the Ten, loaded to the line
Warehouse lights on the left, mountains on the right
Felt it let go past Cedar, heard it before I knew
Flashers on the shoulder now — one thing left to do

[Pre-Chorus]
One ring, then a voice that knows the corridor
Three questions, that's it — and the truck's out the door

[Chorus]
Blown tire, loaded trailer — we're already rolling
Amber light on a yellow truck, coming up the shoulder
Tire's on the rack, no second trip, no holding
Three a.m. or three p.m. — we're already rolling

[Verse 2]
Dispatch is a person, not a voice reading lines
Knows the Sixty from the Fifteen, knows the yards and the signs
Every stud to spec, every number on the sheet
One truck or forty trucks — same price on the street

[Pre-Chorus]
One ring, then a voice that knows the corridor
Three questions, that's it — and the truck's out the door

[Chorus]
Blown tire, loaded trailer — we're already rolling
Amber light on a yellow truck, coming up the shoulder
Tire's on the rack, no second trip, no holding
Three a.m. or three p.m. — we're already rolling

[Bridge — spoken, low, over the bed, drums drop out]
Slover Avenue. One yard. One number.
The hands that put it on
are the hands that pick up the phone.

[Guitar break — baritone motif, organ swell rises]

[Chorus — full, backing vocal on the last word of each line]
Blown tire, loaded trailer — we're already rolling
Amber light on a yellow truck, coming up the shoulder
Tire's on the rack, no second trip, no holding
Three a.m. or three p.m. — we're already rolling

[Outro — drums stop, guitar rings out]
(spoken) We're already rolling.
[diesel fades, tire hiss, air brake]
```

Cuts: the 60 s radio edit is Intro (4 bars) → Verse 1 → Pre-Chorus → Chorus → spoken outro line.
The 30 s version is Pre-Chorus → Chorus → spoken outro line, replacing M2 if you want a sung spot.

Local references in the lyric are real and on purpose: the Ten (I-10), Cedar (the Bloomington exit),
the Sixty and the Fifteen, Slover Ave. If any of those change, change the lyric — nothing else on
the site names them.

Optional: a lot of owner-operators and yard crews on the corridor are Spanish-speaking. If you want
a Spanish or bilingual version, ask the tool for the same style with the chorus in Spanish (keep
"we're already rolling" as the hook in English — it's the headline on the site), and have someone
who speaks Spanish check the line before it airs.

### S2 · Phone-number jingle — 15–20 s (radio tag, end of spot)

Digits sung slowly, one per beat, otherwise generators smear them. Verify the number by ear on
every take before use — never trust it by reading the tool's transcript.

Short style line:

```
gritty blues rock jingle, 88 bpm half-time, baritone male vocal, baritone guitar, sub bass, kick and rimshot, short, clean ending, no autotune
```

Lyrics:

```
[Verse — sung, plain]
Blown tire, loaded trailer? We're already rolling.
Apex Truck Tire — Bloomington, twenty-four seven.

[Number — one digit per beat, slow, clear]
Eight — seven — seven,
five — one — two,
oh — three — oh — one.

[Tag — spoken]
Apex Truck Tire. One yard. One number.
```

---

## Licensed-track fallback

If you'd rather license than generate, these are the search terms and filters that land on the
same sound in Artlist, Epidemic Sound or Musicbed:

- **Genres:** cinematic, industrial, desert rock, blues rock, "dark ambient rock"
- **Moods:** confident, gritty, determined, tense-calm, brooding — *exclude* epic, uplifting,
  inspiring, corporate, happy
- **Instruments:** baritone guitar, electric guitar tremolo, sub bass, percussion, organ
- **Tempo:** 80–95 BPM; **vocals:** instrumental for M-cues
- Preview the first 8 seconds only; if it opens with a riser, a clap, or a whistle, skip it.

---

## Slot map

| Slot | Cue | Length | Notes |
|---|---|---|---|
| Site background (opt-in Sound toggle) + brand film / hero video | M1 | 90 s loop | **Live:** `../generated-audio/already-rolling-brand-bed.mp3` → `node scripts/audio.mjs` → `public/audio/`. Off by default; never autoplays |
| 30 s spot — YouTube pre-roll, radio bed | M2 or S1 30 s cut | 30 s | Timeline in the prompt leaves 0:00–0:03 for the VO to open |
| Vertical reel — IG / TikTok / FB | M3 | 15 s | Phone-speaker safe; starts on the downbeat |
| Phone hold — (877) 512-0301 | M4 | 3 min loop | Mono, 8 kHz-safe, no gaps |
| End card / sign-off | M5 | 2.5 s | Pair with the on-dark wordmark |
| Full song — YouTube, shop playlist, socials | S1 | ~3 min | Get stems for the 60 s / 30 s cuts |
| Radio tag with the number | S2 | 15–20 s | Check the digits by ear, every take |

On the website the track is strictly opt-in: browsers block autoplay with sound, and a fleet
manager at a desk at 2 p.m. does not want a guitar riff. The Sound toggle in the header (left of the 877
call button) is the only thing that starts it, and nothing is downloaded
until it is pressed. To swap the track: drop the new source in `../generated-audio/`, add it to
`scripts/audio.mjs` under a new filename, run the script, and point `src/lib/sound.ts` at it.
