"use client";

import { useSyncExternalStore } from "react";
import { gsap } from "@/lib/motion/gsap";
import { DUR, EASE } from "@/lib/motion/tokens";
import { track } from "@/lib/analytics";

/**
 * Opt-in background music, one player shared by every SoundToggle button.
 * Nothing is fetched or played until a visitor presses a toggle: the element
 * is created on the first press, so the page never autoplays and never
 * downloads 2.4 MB for people who don't want it.
 *
 * Track: exported by `node scripts/audio.mjs` from ../generated-audio/
 * (brief: MUSIC-PROMPTS.md → M1). /audio/* is served immutable, so a new
 * track needs a new filename here too.
 */
const TRACK = "/audio/already-rolling-brand-bed.mp3";
/** Bed level under the page; the file is already normalised to -18 LUFS. */
const LEVEL = 0.7;

export type SoundState = {
  /** Visitor intent — what the toggle shows as pressed. */
  on: boolean;
};

const OFF: SoundState = { on: false };
let state: SoundState = OFF;
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function set(next: SoundState) {
  state = next;
  listeners.forEach((l) => l());
}

function player(): HTMLAudioElement {
  if (audio) return audio;
  const a = new Audio(TRACK);
  a.loop = true;
  a.preload = "auto";
  a.volume = 0;
  a.addEventListener("error", () => set(OFF));
  // Pause in a background tab, resume when the visitor comes back (they opted in).
  document.addEventListener("visibilitychange", () => {
    if (!state.on) return;
    if (document.hidden) a.pause();
    else void start(a);
  });
  audio = a;
  return a;
}

function start(a: HTMLAudioElement) {
  return a
    .play()
    .then(() => {
      gsap.killTweensOf(a);
      gsap.to(a, { volume: LEVEL, duration: DUR.lg, ease: EASE.out });
    })
    .catch(() => set(OFF)); // autoplay policy or decode failure — stay off, honestly
}

export function toggleSound() {
  const a = player();
  const on = !state.on;
  set({ on });
  track("sound_toggle", { on });
  if (on) {
    void start(a);
  } else {
    gsap.killTweensOf(a);
    gsap.to(a, { volume: 0, duration: DUR.md, ease: EASE.out, onComplete: () => a.pause() });
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = () => state;
const getServerSnapshot = () => OFF;

/** Current sound state. SSR-safe (off on the server). */
export function useSound(): SoundState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
