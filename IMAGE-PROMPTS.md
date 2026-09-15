# Image generation prompts — Apex Truck Tire website

Prompts for every photo slot on the site, plus extras. Each prompt is self-contained
once you paste in the shared blocks below.

## How to use

1. **Attach two reference images to every truck prompt:**
   - the phone photo of truck #15 in the warehouse (the yellow service truck)
   - the logo: `files (2)/apex-wordmark-on-light-1200h.png` (black wordmark, orange apex — this is the on-yellow version)
2. **Paste the `STYLE` block at the end of every prompt** and the `TRUCK` block into every truck prompt where it says `[TRUCK]`.
3. **Aspect ratios are fixed by the site** (see the slot map at the bottom). If your tool can't do the exact ratio, generate the nearest wider ratio and crop — never stretch.
4. **Logo reality check.** Text-to-image models will not reproduce a specific logo from words alone. What works:
   - *Image-editing models* (ChatGPT image editing, Gemini image editing, Flux Kontext, etc.): attach the photo + logo PNG and say "replace the door logo with the attached logo". This is the best route for the truck shots.
   - *Midjourney / pure text-to-image*: use the photo as an image/omni reference for the truck, accept that the door decal will come out as an approximation, and **also generate the "blank door" variant** (T0) so you can composite the real PNG in Photoshop/Figma. Same for the phone number — put it on in post; generated digits get mangled.
   - Never let the generator invent "APEX" lettering on its own — it will misspell it. Either the attached PNG or nothing.
5. Generate at least 2K on the long edge; the hero-adjacent slots are displayed up to ~1100 px wide on desktop.

---

## Shared blocks

### STYLE — append to every prompt

```
Photorealistic editorial photograph, full-frame camera, 35mm–50mm lens, natural film grain, no HDR.
Low-key, high-contrast lighting. Shadows are cool and desaturated (deep blue-black, near #0b0f14);
the only warm color comes from signal-orange work lights, amber beacons and sodium-vapor lamps
(around #ff6b1a) and from the truck's yellow paint. Muted, cinematic, slightly underexposed —
it must sit comfortably on a near-black website. No text, captions, watermarks, signage lettering
or extra logos anywhere except the attached Apex logo where the prompt asks for it. No one looks
at the camera unless stated. Real commercial-truck details: 22.5-inch steel wheels, 10-stud
hub-piloted hubs, 11R22.5-size tires, correct dual-wheel spacing.
```

### TRUCK — paste wherever a prompt says `[TRUCK]`

```
THE TRUCK — match the attached reference photo exactly: a late-2000s Ford Super Duty regular cab
(F-250/F-350 body) with a utility service body. Two-tone paint: white roof and upper cab, safety-yellow
doors, fenders and service body. Drop-down compartment doors along both bed sides, diamond-plate top
rails, a white tubular ladder rack over the cab and bed with a single amber beacon light on it. A black
fleet number "15" on the front fender behind the wheel arch, a small round orange convex mirror on the
front fender, plain silver steel wheels with center caps, single rear wheels, extended tow mirrors.
On the front door, REMOVE the old circular logo and replace it with the attached APEX TRUCK TIRE
wordmark, applied as a flat matte vinyl decal centered on the door, about 22 inches wide: black block
letters "APEX" whose A has its top cut off and filled orange, with "TRUCK TIRE" in spaced capitals
beneath. Reproduce that decal exactly as attached; do not redraw or restyle the letters.
```

### NEGATIVE — for tools that accept a negative prompt

```
cartoon, illustration, 3D render, CGI, plastic look, oversaturated, HDR glow, bright blue daytime sky,
stock-photo smile, extra wheels, extra doors, deformed truck, duplicate truck, misspelled text,
gibberish lettering, random logos, watermark, blurry, low resolution, motion smear on the subject
```

---

## Part A — Truck images (use the reference photo + logo PNG)

### T0 · Blank-door master (for compositing the real logo)

Use: base plate for any shot where you want to place the PNG logo yourself. Ratio: **3:2**, crop later.

```
Full side-profile photograph of a service truck, camera at wheel-hub height, lens perfectly level with
the truck so the body has no keystone distortion. [TRUCK] — EXCEPT the front door is clean bare yellow
paint with NO logo or lettering of any kind; leave the door panel empty and evenly lit so a decal can be
added later. The truck sits in a clean concrete shop bay at dusk with the roll-up door open behind it;
a wall-mounted work light rakes across the body from the front-left so the compartment doors and
diamond plate show texture. Subtle reflection on the floor. Entire truck in frame with a little
breathing room front and back.
```

### T1 · Roadside call on the freeway shoulder — `services/roadside.jpg` (16:11)

Alt text on the site: *"Service truck on the freeway shoulder at night with work lights on a downed tractor-trailer."*

```
Night, 2 a.m., on the shoulder of Interstate 10 in the Inland Empire. [TRUCK] is parked at an angle
behind a stopped tractor-trailer (white dry-van trailer, tandem axles), nose toward the trailer, amber
beacon on and throwing pulses of orange across the wet asphalt. Two LED work lights on the rack light
the trailer's rear tandem where a technician in a hi-vis reflective vest and hard hat kneels with a
long breaker bar at the outer dual, a new 11R22.5 tire leaning against the truck beside him. Three
orange traffic cones and a reflective triangle trail behind the truck toward the camera. Long-exposure
red taillight streaks of passing traffic in the far lane. Sodium lamps and the dark silhouette of the
San Gabriel foothills in the distance. Camera low, behind the cones, 35mm, truck and trailer filling
the right two-thirds of the frame. Composition leaves the left third darker for text overlay.
```

### T2 · The service truck, lit and ready — `why/truck.jpg` (16:10)

Alt text on the site currently says *"with crane and tire rack"*; the real truck has a ladder rack and no crane — update the alt text in `WhyApex.tsx` to match this photo.

```
Three-quarter front view of [TRUCK] from the driver's side, camera at knee height, 35mm, at blue hour
in the Apex yard on Slover Ave. in Bloomington, CA. Headlights on low beam, amber beacon lit, both rack
work lights on and aimed forward-down so the yellow hood and door decal read clearly. Behind the truck:
a chain-link fence, a stack of new commercial truck tires on a pallet, a low industrial building, the
last band of orange dusk over a dark ridge. Ground is damp concrete with light reflections. The Apex
decal on the door is sharp and fully readable. Nobody in frame.
```

### T3 · The yard at dusk — `why/yard.jpg` (4:5, portrait)

```
Portrait-orientation photograph of the Apex Truck Tire yard at dusk, Bloomington, California, Inland
Empire. Three identical service trucks — each is [TRUCK], fleet numbers may differ — parked in a neat
row, angled toward the camera, beacons off, the nearest truck's door decal clearly visible. Between and
behind them: pallets of new commercial tires, a small forklift, a corrugated-steel shop building with
one bay door open and warm light spilling out, tall sodium yard lights just switching on, and a dark
mountain ridge under a fading orange-to-navy sky. Vertical composition with the sky occupying the top
third. Clean, ordered, industrial; conveys a real working yard, not a showroom.
```

### T4 · Clean side profile (about / social) — 16:10 or 3:2

A proper re-shoot of the reference photo.

```
Straight side-profile photograph of [TRUCK], camera at hub height and dead level, inside a clean tire
warehouse. Behind the truck, orange steel pallet racking holds rows of commercial truck tires stacked
on their treads; the racking runs out of frame on both sides. Overhead high-bay lights plus one large
softbox from camera-left give even, flattering light on the yellow body so the door decal is crisp with
no glare. Polished dark concrete floor with a soft reflection of the truck. Entire truck in frame with
small margins. Calm, catalog-quality, but still moody and dark at the edges.
```

### T5 · Door decal close-up — 1:1 or 4:5

```
Tight photograph of the driver's door of [TRUCK], filling the frame with the yellow door panel and the
Apex decal, camera slightly off-axis (about 20°) so the door shows a soft gradient of reflected dusk
sky. Light dust and small honest stone chips on the paint, a faint water streak below the mirror; the
decal itself is clean and perfectly legible. The chrome door handle and the edge of the tow mirror
frame the shot. Shallow depth of field, decal in sharp focus.
```

### T6 · Night yard service at a customer's fleet — 16:11 (alt for `services/install.jpg`)

```
Night in a trucking company yard in Fontana, CA. [TRUCK] is parked alongside a long row of parked white
dry-van trailers, work lights on, beacon lit. A technician in a hi-vis vest kneels at a trailer's tandem
axle with a calibrated torque wrench on the outer dual; a second new tire and a floor jack rated for a
loaded trailer sit beside him, and the removed worn tire lies flat on the ground. Long shadows from the
truck's work lights, cool sodium light from the yard's mast lights, a fine mist in the air. Camera at
ground level looking down the row of trailers so they recede into darkness. Everything in the truck's
bed is orderly — strapped tires, an impact gun, a hose reel.
```

### T7 · Truck rolling out on the corridor — 16:9 or 21:9 (banner / "Dispatch" step)

```
Rear three-quarter photograph of [TRUCK] driving away from the camera on a dark freeway on-ramp at
night, shot from the shoulder with a slow shutter so the road and guardrail streak while the truck stays
sharp (panning shot). Amber beacon lit, brake lights and marker lights glowing, the truck's spare tires
visible strapped in the bed under the ladder rack. Green freeway guide signs overhead with the lettering
blurred and illegible. City lights of the Inland Empire spread out below the ramp. Dark, urgent,
purposeful.
```

### T8 · The right tire on board — 4:5 or 1:1

```
Photograph looking down into the open bed of [TRUCK] from the rear corner, at night under a single
work light. Four new commercial truck tires — steer rib, drive lug and trailer rib treads visible — stand
upright and are ratchet-strapped to the bed rails; a torque wrench in an open case, a 33 mm impact
socket, a tire iron and an air hose are laid out on the diamond-plate. Sidewall lettering is out of focus
and illegible. Yellow compartment doors on both sides frame the composition. Hard, raking light, deep
shadows, orange spill from the beacon.
```

---

## Part B — Other website images (no truck required)

### N1 · Tire warehouse — `services/sales.jpg` (16:11)

Alt text: *"Rows of new commercial truck tires racked in the Apex warehouse."*

```
Photograph inside a commercial tire warehouse at night: long orange steel pallet racks, three tiers
high, filled with hundreds of new 22.5-inch truck tires stacked on their sides, treads facing the aisle
so the rib and lug patterns read as texture. A single technician in a dark work shirt walks away down
the aisle rolling one tire, back to camera. Cool overhead high-bay light, warm sodium spill from a bay
door at the far end, dark concrete floor with tire-rubber scuffs. Wide 35mm shot down the aisle with
strong one-point perspective; all sidewall brand lettering blurred and unreadable. Feels well-stocked
and organized.
```

### N2 · Torque wrench on the wheel — `services/install.jpg` (16:11)

Alt text: *"Technician torquing lug nuts on a truck wheel with a calibrated wrench."*

```
Photograph, waist-level, of a technician's gloved hands pulling a long calibrated click-type torque
wrench on a lug nut of a 22.5-inch steel truck wheel, 10-stud hub-piloted pattern, fresh drive tire
with deep lug tread. The wrench arm runs diagonally across the frame. An orange retorque tag hangs from
a neighboring nut. Shop setting: dark concrete, the edge of a red bottle jack, a wheel chock, a chalk
mark on the tire. Single hard work light from upper-left, everything else falling into shadow. Sharp on
the wrench head and nut; the technician's face is out of frame.
```

### N3 · Torque detail — `why/detail.jpg` (1:1)

Alt text: *"Close-up of a calibrated torque wrench on a wheel nut."*

```
Macro photograph, square composition: the head of a calibrated torque wrench seated on a 33 mm flanged
lug nut on a steel truck wheel, filling the frame. Brushed-steel wrench, matte black wheel paint with
light wear around the stud holes, one thin orange retorque tag tied to the adjacent nut. Extremely
shallow depth of field, focus on the nut flange and socket, a single warm highlight on the steel. Dark
background. No visible text on the wrench.
```

### N4 · Dispatch is a person — 3:2 (differentiator 01)

```
Photograph of a dispatcher at a small desk in a dim office at night, seen from three-quarters behind
and to the side so their face is partly visible but not looking at camera, headset on, one hand on a
desk phone. Two monitors glow: one shows a dark map of Southern California freeways with a few points of
light (no legible labels), the other a spreadsheet blur. A window behind shows the yard's sodium lights.
Coffee mug, a paper log sheet, a two-way radio. Warm monitor light on the face, cool blue-black room.
Calm and attentive, not frantic.
```

### N5 · Tread-depth check — 1:1 or 4:5

```
Close-up photograph of a technician's hand pressing a steel tread-depth gauge into the center groove of
a commercial drive tire with deep block tread. The gauge's scale is visible but not readable. Rubber
grain, a few embedded pebbles, a chalk tally mark on the sidewall. Single raking light from the side
makes the tread blocks cast long shadows. Dark, tactile, precise.
```

### N6 · Retread casing inspection — 16:11

```
Photograph of a technician in a dark shop inspecting a bare truck-tire casing mounted on a rotating
inspection spreader stand, the casing pulled open so the inner liner is visible, a bright handheld
inspection lamp raking across the liner surface. The technician leans in with a marking crayon. Behind:
racks of buffed casings with their tread removed, showing the pale under-tread, and a row of finished
retreads with fresh black lug tread. Cool overhead light, warm lamp glow on the liner. Conveys
scrutiny and quality control.
```

### N7 · Steer / drive / trailer trio — 3:1 or 16:9 (Tire Positions section)

```
Dark studio product photograph of three new 11R22.5 commercial truck tires standing upright side by
side on a black reflective floor, evenly spaced, each rotated slightly toward the camera to show tread
face and sidewall: left, a steer tire with straight circumferential ribs; center, a drive tire with
deep open-shoulder lug blocks; right, a trailer tire with shallow ribs and a reinforced shoulder. Rim
light from behind on each tire outlining the tread, one soft key from the front-left, no visible brand
lettering on the sidewalls. Near-black background with a faint orange gradient low on the horizon.
Plenty of empty space above the tires for headings.
```

### N8 · The corridor at night — 21:9 or 16:9 (Service Area banner)

```
Elevated photograph from an overpass of Interstate 10 near Bloomington, California at night, looking
down the freeway toward San Bernardino: multiple lanes of red taillight streaks and white headlight
streaks from a long exposure, several semi-trucks visible as sharp silhouettes with marker lights, green
overhead guide signs with the lettering blurred into unreadable shapes, distribution warehouses and
sodium yard lights lining both sides, a dark mountain ridge on the horizon under a navy sky. Very wide
composition. Cinematic, cool, with orange sodium accents.
```

### N9 · Technician portrait — 4:5

```
Environmental portrait of a truck-tire technician, mid-30s to 40s, weathered hands, wearing a dark
work shirt with a plain hi-vis vest, standing beside a stack of commercial tires in the open shop bay at
dusk, arms relaxed, looking slightly past the camera with a calm, direct expression (no smile for the
camera). Shallow depth of field, warm bay light on one side of the face, cool dusk on the other.
Honest, unposed, no branding on the clothing.
```

### N10 · Loaded trailer tandem at the dock — 16:11

```
Low-angle photograph of the rear tandem axles of a loaded dry-van trailer backed to a loading dock at
night, close on the dual wheels: four 22.5-inch tires on steel wheels, mud flaps, air lines, the
underride guard. A little brake dust, wet ground with reflections, a dock light casting hard orange
light across the treads, everything else in cool shadow. Sharp texture on the rubber and steel. No
readable DOT numbers or brand names.
```

### N11 · Photo-based Open Graph image (optional) — 1200×630

The site currently generates `public/og.png` from the brand PNGs + hero poster (`node scripts/brand-assets.mjs`). Use this only if you want a photographic OG instead.

```
Wide 1.91:1 photograph of [TRUCK] in three-quarter front view at night in the yard, beacon lit, work
lights on, positioned in the RIGHT half of the frame and facing left. The LEFT half of the frame is
deliberately empty: dark wet concrete fading to near-black, with only a soft orange glow from the
truck's lights — clean negative space for a logo and headline to be overlaid later. Nothing else in
the left half. Keep the truck fully sharp and the door decal readable.
```

---

## Slot map

| Slot | File | Ratio | Prompt |
|---|---|---|---|
| Roadside service card | `public/images/services/roadside.jpg` | 16:11 | T1 |
| Tire sales card | `public/images/services/sales.jpg` | 16:11 | N1 |
| Installation card | `public/images/services/install.jpg` | 16:11 | N2 (or T6) |
| Why Apex — yard | `public/images/why/yard.jpg` | 4:5 | T3 |
| Why Apex — truck | `public/images/why/truck.jpg` | 16:10 | T2 |
| Why Apex — detail | `public/images/why/detail.jpg` | 1:1 | N3 |
| Open Graph (optional photo version) | `public/og.png` | 1200×630 | N11 |
| Extras (about, social, section banners) | — | as noted | T4, T5, T7, T8, N4–N10 |

The hero is a procedural 3D exploded wheel (`components/hero/`), not a photo — no prompt needed there.

After dropping in real photos, update the alt text in `src/lib/content.ts` (services) and
`src/components/sections/WhyApex.tsx` (why section) so it describes what's actually in the picture.
