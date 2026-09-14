"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, svg, ANIME_EASE, MS } from "@/lib/motion/anime";
import { prefersReducedMotion } from "@/lib/motion/useReducedMotion";
import {
  EMPTY_FIELDS,
  SERVICE_TYPE_LABELS,
  URGENCY_LABELS,
  inquiryFields,
  inquirySchema,
  type InquiryFields,
  type ServiceType,
  type Urgency,
} from "@/lib/inquirySchema";
import { SITE } from "@/lib/site";
import { track, trackConversion } from "@/lib/analytics";
import { Button, ButtonLink, PhoneIcon, ArrowIcon } from "@/components/ui/Button";
import { RadioCards, TextArea, TextField } from "./fields";
import { renderTurnstile, type TurnstileHandle } from "./turnstile";

type Errors = Partial<Record<keyof InquiryFields | "form", string>>;
type Status = "idle" | "submitting" | "success" | "error";
type StepId = "need" | "contact" | "send" | "emergency";

const SERVICE_OPTIONS: { value: ServiceType; label: string; description: string }[] = [
  { value: "roadside", label: "Roadside", description: "Blowout, flat, stranded truck" },
  { value: "purchase", label: "Tire purchase", description: "New, retread, by position" },
  { value: "installation", label: "Installation", description: "Shop or yard, mount & torque" },
  { value: "other", label: "Something else", description: "Inspection, fleet program, question" },
];
const URGENCY_OPTIONS: { value: Urgency; label: string; description: string; accent?: boolean }[] = [
  { value: "emergency", label: "Emergency", description: "Truck is down now", accent: true },
  { value: "today", label: "Today", description: "Before end of day" },
  { value: "week", label: "This week", description: "Schedule it" },
  { value: "quote", label: "Quote only", description: "Pricing and availability" },
];

/**
 * Multi-step inquiry form. Emergency selection collapses to phone + location.
 * Validation: shared Zod schema, per-step on "Next", per-field on blur after
 * first touch. Errors never clear the form. Success is an in-place state.
 */
export function InquiryForm() {
  const [fields, setFields] = useState<Omit<InquiryFields, "urgency"> & { urgency: Urgency | "" }>({ ...EMPTY_FIELDS, urgency: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<StepId>("need");
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tsToken, setTsToken] = useState<string | null>(null);
  const started = useRef(false);
  const submitted = useRef(false);
  const stepEl = useRef<HTMLDivElement>(null);
  const tsEl = useRef<HTMLDivElement>(null);
  const tsHandle = useRef<TurnstileHandle | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const isEmergency = fields.urgency === "emergency";
  const steps: StepId[] = useMemo(() => (isEmergency ? ["need", "emergency"] : ["need", "contact", "send"]), [isEmergency]);
  const stepIndex = steps.indexOf(step);

  // --- form token (same-site CSRF + min time-to-submit) --------------------
  useEffect(() => {
    let cancelled = false;
    fetch("/api/form-token", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { token?: string } | null) => {
        if (!cancelled && d?.token) setToken(d.token);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // --- drop-off instrumentation ------------------------------------------
  useEffect(() => {
    const onHide = () => {
      if (started.current && !submitted.current && document.visibilityState === "hidden") {
        track("form_step_dropoff", { step, emergency: isEmergency });
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [step, isEmergency]);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("form_start", {});
  };

  // --- validation ---------------------------------------------------------
  const validateField = useCallback(
    (key: keyof InquiryFields, value: string): string | undefined => {
      const shape = inquiryFields.def.shape[key];
      const r = shape.safeParse(value);
      if (!r.success) return r.error.issues[0]?.message;
      // cross-field rules
      if (key === "location" && fields.urgency === "emergency" && !value.trim()) return "Where is the truck? Mile marker, exit, or cross street.";
      if (key === "name" && fields.urgency && fields.urgency !== "emergency" && !value.trim()) return "Tell us who to ask for.";
      return undefined;
    },
    [fields.urgency],
  );

  const set = (key: keyof InquiryFields) => (value: string) => {
    markStarted();
    setFields((f) => ({ ...f, [key]: value }));
    if (touched.has(key)) setErrors((e) => ({ ...e, [key]: validateField(key, value) }));
  };
  const blur = (key: keyof InquiryFields) => () => {
    setTouched((t) => new Set(t).add(key));
    setErrors((e) => ({ ...e, [key]: validateField(key, fields[key] as string) }));
  };

  const validateStep = (s: StepId): boolean => {
    const next: Errors = {};
    if (s === "need") {
      if (!fields.serviceType) next.serviceType = "Pick a service type.";
      if (!fields.urgency) next.urgency = "How soon do you need it?";
    }
    if (s === "contact") {
      for (const k of ["name", "company", "phone", "email", "location"] as const) {
        const m = validateField(k, fields[k]);
        if (m) next[k] = m;
      }
    }
    if (s === "emergency") {
      for (const k of ["phone", "location"] as const) {
        const m = validateField(k, fields[k]);
        if (m) next[k] = m;
      }
    }
    if (s === "send") {
      const m = validateField("message", fields.message);
      if (m) next.message = m;
    }
    setErrors((e) => ({ ...e, ...next }));
    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      const el = stepEl.current?.querySelector<HTMLElement>(`[id="${firstKey}"], [name="${firstKey}"]`);
      el?.focus();
      announce(next[firstKey as keyof Errors] ?? "Some fields need attention.");
      return false;
    }
    return true;
  };

  const announce = (msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  };

  // --- step transitions ---------------------------------------------------
  const transition = (to: StepId, dir: 1 | -1) => {
    const el = stepEl.current;
    if (!el || prefersReducedMotion()) {
      setStep(to);
      return;
    }
    animate(el, {
      opacity: [1, 0],
      translateX: [0, -18 * dir],
      duration: MS.sm,
      ease: ANIME_EASE.snap,
      onComplete: () => {
        setStep(to);
        requestAnimationFrame(() => {
          animate(el, { opacity: [0, 1], translateX: [18 * dir, 0], duration: MS.md, ease: ANIME_EASE.out });
        });
      },
    });
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    const next = steps[stepIndex + 1];
    if (!next) return;
    track("form_step", { step: next, index: stepIndex + 1, emergency: isEmergency });
    transition(next, 1);
    setTimeout(() => stepEl.current?.querySelector<HTMLElement>("input, textarea, [role=radio]")?.focus(), MS.sm + 60);
  };
  const goBack = () => {
    const prev = steps[stepIndex - 1];
    if (prev) transition(prev, -1);
  };

  // --- Turnstile on the final step ----------------------------------------
  const finalStep = step === "send" || step === "emergency";
  useEffect(() => {
    if (!finalStep || !tsEl.current) return;
    let alive = true;
    setTsToken(null);
    renderTurnstile(
      tsEl.current,
      (t) => alive && setTsToken(t),
      () => alive && setTsToken(null),
      () => alive && setTsToken(null),
    )
      .then((h) => {
        if (alive) tsHandle.current = h;
        else h.remove();
      })
      .catch(() => {
        if (alive) setFormError(`We couldn't load the spam check. Please call ${SITE.phone.primary.display}.`);
      });
    return () => {
      alive = false;
      tsHandle.current?.remove();
      tsHandle.current = null;
    };
  }, [finalStep]);

  const waitForTs = () =>
    new Promise<string>((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (tsToken) return resolve(tsToken);
        const fresh = tsTokenRef.current;
        if (fresh) return resolve(fresh);
        if (Date.now() - start > 8000) return reject(new Error("turnstile_timeout"));
        setTimeout(tick, 120);
      };
      tick();
    });
  const tsTokenRef = useRef<string | null>(null);
  useEffect(() => {
    tsTokenRef.current = tsToken;
  }, [tsToken]);

  // --- submit -------------------------------------------------------------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!validateStep(step)) return;
    const full = inquirySchema.safeParse(fields);
    if (!full.success) {
      const next: Errors = {};
      for (const i of full.error.issues) next[String(i.path[0]) as keyof Errors] = i.message;
      setErrors((prev) => ({ ...prev, ...next }));
      return;
    }
    setStatus("submitting");
    setFormError(null);
    track("form_submit", { emergency: isEmergency, service: fields.serviceType });

    try {
      const turnstileToken = await waitForTs();
      const res = await fetch("/api/inquiry", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", "x-form-token": token ?? "" },
        body: JSON.stringify({ fields: full.data, website: honeypot.current?.value ?? "", turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; fields?: Record<string, string>; code?: string };
      if (res.ok && data.ok) {
        submitted.current = true;
        setStatus("success");
        track("form_success", { emergency: isEmergency, service: fields.serviceType });
        trackConversion("form");
        return;
      }
      if (data.fields) setErrors((prev) => ({ ...prev, ...data.fields }));
      if (data.code === "expired") {
        const r = await fetch("/api/form-token", { credentials: "same-origin", cache: "no-store" }).then((x) => x.json()).catch(() => null);
        if (r?.token) setToken(r.token);
      }
      setFormError(data.message ?? `Something went wrong. Please call ${SITE.phone.primary.display}.`);
      setStatus("error");
      track("form_error", { status: res.status });
      tsHandle.current?.reset();
      setTsToken(null);
    } catch {
      setFormError(`We couldn't send that. Please call ${SITE.phone.primary.display} — a person answers 24/7.`);
      setStatus("error");
      track("form_error", { status: 0 });
      tsHandle.current?.reset();
      setTsToken(null);
    }
  };

  if (status === "success") return <SuccessPanel emergency={isEmergency} email={fields.email} />;

  return (
    <form onSubmit={onSubmit} noValidate className="relative" aria-describedby="form-status">
      <div ref={liveRef} id="form-status" className="sr-only" aria-live="assertive" aria-atomic="true" />

      <Progress steps={steps} index={stepIndex} emergency={isEmergency} />

      {/* Emergency shortcut: always one thumb away while filling the form */}
      {isEmergency && (
        <div className="mb-6 flex flex-col gap-3 rounded-sm border border-accent/50 bg-accent-dim p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink-2">
            <strong className="text-ink">Fastest is the phone.</strong> Dispatch answers 24/7 and can roll a truck while you type.
          </p>
          <ButtonLink href={SITE.phone.primary.href} size="md" onClick={() => track("click_to_call", { location: "form_emergency", number: SITE.phone.primary.e164 })}>
            <PhoneIcon />
            Call {SITE.phone.primary.display}
          </ButtonLink>
        </div>
      )}

      <div ref={stepEl} className="will-change-[opacity,transform]">
        {step === "need" && (
          <div className="space-y-7">
            <RadioCards<ServiceType>
              name="serviceType"
              legend="What do you need?"
              options={SERVICE_OPTIONS}
              value={fields.serviceType}
              onChange={(v) => {
                markStarted();
                setFields((f) => ({ ...f, serviceType: v }));
                setErrors((e) => ({ ...e, serviceType: undefined }));
              }}
              error={errors.serviceType}
            />
            <RadioCards<Urgency>
              name="urgency"
              legend="How soon?"
              options={URGENCY_OPTIONS}
              value={fields.urgency}
              onChange={(v) => {
                markStarted();
                setFields((f) => ({ ...f, urgency: v }));
                setErrors((e) => ({ ...e, urgency: undefined, name: undefined, location: undefined }));
                if (v === "emergency") track("form_step", { step: "emergency_path", index: 0, emergency: true });
              }}
              error={errors.urgency}
              columns={4}
            />
          </div>
        )}

        {step === "contact" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="name" label="Your name" autoComplete="name" value={fields.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} error={errors.name} maxLength={80} />
            <TextField id="company" label="Company / fleet" autoComplete="organization" value={fields.company} onChange={(e) => set("company")(e.target.value)} onBlur={blur("company")} error={errors.company} optional maxLength={120} />
            <TextField id="phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={fields.phone} onChange={(e) => set("phone")(e.target.value)} onBlur={blur("phone")} error={errors.phone} hint="We text the tech's ETA to this number." maxLength={32} />
            <TextField id="email" label="Email" type="email" inputMode="email" autoComplete="email" value={fields.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} error={errors.email} optional hint="For the written quote or invoice." maxLength={254} />
            <TextField id="location" label="Truck / trailer location or ZIP" autoComplete="off" value={fields.location} onChange={(e) => set("location")(e.target.value)} onBlur={blur("location")} error={errors.location} optional hint="Yard address, dock, or the ZIP we'd come to." maxLength={200} className="sm:col-span-2" />
          </div>
        )}

        {step === "emergency" && (
          <div className="space-y-5">
            <TextField
              id="phone"
              label="Phone we can call back right now"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={fields.phone}
              onChange={(e) => set("phone")(e.target.value)}
              onBlur={blur("phone")}
              error={errors.phone}
              maxLength={32}
              autoFocus
            />
            <TextField
              id="location"
              label="Where is the truck?"
              autoComplete="off"
              placeholder="I-10 eastbound past Cherry Ave, right shoulder"
              value={fields.location}
              onChange={(e) => set("location")(e.target.value)}
              onBlur={blur("location")}
              error={errors.location}
              hint="Freeway + direction + exit or mile marker. A landmark works."
              maxLength={200}
            />
            <TextField id="name" label="Name (optional)" autoComplete="name" value={fields.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} error={errors.name} optional maxLength={80} />
          </div>
        )}

        {step === "send" && (
          <div className="space-y-6">
            <TextArea
              id="message"
              label="Anything else we should know?"
              value={fields.message}
              onChange={(e) => set("message")(e.target.value)}
              onBlur={blur("message")}
              error={errors.message}
              optional
              hint="Tire size, positions, quantity, load, timing — whatever helps us come prepared."
              maxLength={2000}
            />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-sm border border-line bg-surface p-4 text-small sm:grid-cols-4">
              <Summary label="Need" value={SERVICE_TYPE_LABELS[fields.serviceType]} />
              <Summary label="When" value={fields.urgency ? URGENCY_LABELS[fields.urgency] : "—"} />
              <Summary label="Phone" value={fields.phone} />
              <Summary label="Name" value={fields.name || fields.company || "—"} />
            </dl>
          </div>
        )}
      </div>

      {/* Honeypot — visually hidden, not aria-hidden'd out of the tab order by accident */}
      <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input ref={honeypot} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {/* Turnstile mounts on the final step */}
      {finalStep && <div ref={tsEl} className="mt-5 min-h-0 empty:hidden" />}

      {formError && (
        <div role="alert" className="mt-5 rounded-sm border border-accent/50 bg-accent-dim px-4 py-3 text-small text-ink">
          {formError}{" "}
          <a href={SITE.phone.primary.href} className="font-semibold text-accent underline underline-offset-4">
            Call {SITE.phone.primary.display}
          </a>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {stepIndex > 0 && (
            <Button type="button" variant="ghost" size="md" onClick={goBack}>
              ← Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!finalStep ? (
            <Button type="button" size="lg" variant="secondary" onClick={goNext}>
              Continue
              <ArrowIcon className="size-[1em]" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={status === "submitting"} aria-busy={status === "submitting"}>
              {status === "submitting" ? "Sending…" : isEmergency ? "Send to dispatch" : "Send request"}
              {status !== "submitting" && <ArrowIcon className="size-[1em]" />}
            </Button>
          )}
        </div>
      </div>
      <p className="mt-4 text-micro text-ink-4">
        Protected by Cloudflare Turnstile. No account, no newsletter — we only use this to get back to you.
      </p>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="tech-label text-ink-4">{label}</dt>
      <dd className="mt-0.5 truncate text-ink-2">{value}</dd>
    </div>
  );
}

function Progress({ steps, index, emergency }: { steps: StepId[]; index: number; emergency: boolean }) {
  const labels: Record<StepId, string> = { need: "Need", contact: "Contact", send: "Send", emergency: "Send" };
  const pct = ((index + 1) / steps.length) * 100;
  return (
    <div className="mb-8">
      <ol className="flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.12em]" aria-label="Form progress">
        {steps.map((s, i) => (
          <li key={s} className={i <= index ? "text-ink" : "text-ink-4"} aria-current={i === index ? "step" : undefined}>
            {String(i + 1).padStart(2, "0")} {labels[s]}
          </li>
        ))}
      </ol>
      <div className="mt-3 h-px w-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div className={`h-px transition-[width] duration-(--dur-lg) ease-out-expo ${emergency ? "bg-accent" : "bg-steel-2"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SuccessPanel({ emergency, email }: { emergency: boolean; email: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    el.focus();
    if (prefersReducedMotion()) return;
    const path = el.querySelector<SVGPathElement>("[data-check]");
    if (path) {
      const [d] = svg.createDrawable(path);
      if (d) animate(d, { draw: ["0 0", "0 1"], duration: MS.lg, ease: ANIME_EASE.out, delay: MS.xs });
    }
    animate(el.querySelectorAll("[data-in]"), { opacity: [0, 1], translateY: [10, 0], delay: (_, i) => MS.md + (i ?? 0) * 90, duration: MS.lg, ease: ANIME_EASE.out });
  }, []);
  return (
    <div ref={root} tabIndex={-1} className="rounded-sm border border-line bg-surface p-8 outline-none md:p-10" role="status" aria-live="polite">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-accent)" strokeOpacity="0.4" />
          <path data-check d="M14 25 l7 7 l13 -15" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="display-tight text-display-sm text-ink">{emergency ? "Dispatch has it." : "Got it."}</p>
      </div>
      <p className="mt-5 text-body text-ink-2" data-in>
        {emergency
          ? "Your location and callback number are in front of dispatch. If your phone hasn't rung within a few minutes, call — a person answers around the clock."
          : "A tire specialist will get back to you during shop hours, usually within the hour. If it can't wait, the phone is faster."}
        {email ? " A confirmation is on its way to your inbox." : ""}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center" data-in>
        <ButtonLink href={SITE.phone.primary.href} size="lg" onClick={() => track("click_to_call", { location: "form_success", number: SITE.phone.primary.e164 })}>
          <PhoneIcon className="size-[1.1em]" />
          Call {SITE.phone.primary.display}
        </ButtonLink>
        <a href={SITE.phone.local.href} className="font-mono text-[0.75rem] tracking-[0.06em] text-ink-3 hover:text-ink">
          Direct line {SITE.phone.local.display}
        </a>
      </div>
    </div>
  );
}
