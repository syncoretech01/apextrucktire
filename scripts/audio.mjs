/**
 * Exports the site's background track from the full-quality source in
 * ../generated-audio (kept out of the repo's public/ folder, like the photos).
 * Re-run after replacing the source:
 *   node scripts/audio.mjs
 *
 * Needs ffmpeg on PATH (brew install ffmpeg). Two-pass EBU R128 loudness
 * normalisation to a background level (-18 LUFS, -1.5 dBTP), cover art and
 * tags stripped, 128 kb/s MP3 — plays everywhere, ~1 MB per minute. The
 * output filename is content-specific on purpose: /audio/* is served
 * immutable (next.config.ts), so a new track needs a new name.
 */
import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "..", "generated-audio");
const OUT = path.join(ROOT, "public", "audio");

/** { src, out, title } — keep `out` in sync with components/layout/SoundToggle.tsx */
const TRACKS = [
  { src: "already-rolling-brand-bed.mp3", out: "already-rolling-brand-bed.mp3", title: "Already Rolling (Brand Bed)" },
];

const TARGET = { I: -18, TP: -1.5, LRA: 9 };

await mkdir(OUT, { recursive: true });

for (const t of TRACKS) {
  const input = path.join(SRC, t.src);
  const output = path.join(OUT, t.out);

  // Pass 1 — measure. loudnorm prints its JSON summary on stderr.
  const { stderr } = await run("ffmpeg", [
    "-hide_banner", "-nostats", "-i", input, "-vn",
    "-af", `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json`,
    "-f", "null", "-",
  ]);
  const json = stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1);
  const m = JSON.parse(json);

  // Pass 2 — linear normalisation using the measured values, then encode.
  const filter =
    `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}` +
    `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
    `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=summary`;
  await run("ffmpeg", [
    "-hide_banner", "-nostats", "-y", "-i", input,
    "-vn", "-map_metadata", "-1",
    "-af", filter,
    "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "128k",
    "-metadata", `title=${t.title}`, "-metadata", "artist=Apex Truck Tire",
    "-id3v2_version", "3",
    output,
  ]);

  const { size } = await stat(output);
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", output]);
  console.log(
    `${t.out.padEnd(34)} ${Number(stdout).toFixed(1)} s  ${(size / 1024).toFixed(0)} kB  ` +
      `(source ${Number(m.input_i).toFixed(1)} LUFS / ${Number(m.input_tp).toFixed(1)} dBTP → ${TARGET.I} / ${TARGET.TP})`,
  );
}
