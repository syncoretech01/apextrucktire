"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

/* ------------------------------------------------------------------------ */
/* Shared field primitives: label, control, animated error, aria wiring     */
/* ------------------------------------------------------------------------ */

const control =
  "w-full rounded-sm border bg-base-0 px-4 py-3 text-body text-ink placeholder:text-ink-4 transition-[border-color,box-shadow] duration-(--dur-sm) focus:outline-none focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgb(255_107_26/0.25)]";

export function FieldError({ id, message }: { id: string; message?: string }) {
  // grid-rows trick gives a smooth height transition without measuring
  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows,opacity] duration-(--dur-md) ease-out-quint ${message ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      aria-hidden={message ? undefined : true}
    >
      <p className="min-h-0 overflow-hidden text-small text-accent-hot">
        <span className="block pt-1.5">{message}</span>
      </p>
    </div>
  );
}

type BaseProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const errId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-small font-medium text-ink-2">
        <span>{label}</span>
        {optional && <span className="text-micro text-ink-4">Optional</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, error ? errId : null].filter(Boolean).join(" ") || undefined}
        className={`${control} ${error ? "border-accent-hot" : "border-line-strong hover:border-steel"}`}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-micro text-ink-4">
          {hint}
        </p>
      )}
      <FieldError id={errId} message={error} />
    </div>
  );
}

export function TextArea({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-small font-medium text-ink-2">
        <span>{label}</span>
        {optional && <span className="text-micro text-ink-4">Optional</span>}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, error ? errId : null].filter(Boolean).join(" ") || undefined}
        className={`${control} min-h-32 resize-y ${error ? "border-accent-hot" : "border-line-strong hover:border-steel"}`}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-micro text-ink-4">
          {hint}
        </p>
      )}
      <FieldError id={errId} message={error} />
    </div>
  );
}

type RadioOption<T extends string> = { value: T; label: string; description?: string; icon?: ReactNode; accent?: boolean };

export function RadioCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: {
  name: string;
  legend: string;
  options: RadioOption<T>[];
  value: T | "";
  onChange: (v: T) => void;
  error?: string;
  columns?: 2 | 4;
}) {
  const errId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? errId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="mb-3 text-small font-medium text-ink-2">{legend}</legend>
      <div className={`grid gap-2 ${columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
        {options.map((o) => {
          const checked = value === o.value;
          const id = `${name}-${o.value}`;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={`group/opt relative flex cursor-pointer items-start gap-3 rounded-sm border p-3.5 transition-[border-color,background-color] duration-(--dur-sm) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                checked
                  ? o.accent
                    ? "border-accent bg-accent-dim"
                    : "border-steel bg-surface-2"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-pill border ${
                  checked ? (o.accent ? "border-accent" : "border-steel-2") : "border-steel"
                }`}
                aria-hidden="true"
              >
                <span className={`size-2 rounded-pill transition-transform duration-(--dur-sm) ${checked ? "scale-100" : "scale-0"} ${o.accent ? "bg-accent" : "bg-steel-2"}`} />
              </span>
              <span className="min-w-0">
                <span className={`block font-display text-[0.9rem] font-bold uppercase tracking-[0.06em] [font-stretch:105%] ${checked && o.accent ? "text-accent" : "text-ink"}`}>
                  {o.label}
                </span>
                {o.description && <span className="mt-0.5 block text-micro text-ink-3">{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={errId} message={error} />
    </fieldset>
  );
}
