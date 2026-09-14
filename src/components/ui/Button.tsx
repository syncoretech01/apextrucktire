import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 font-display font-bold uppercase tracking-[0.08em] transition-[transform,background-color,color,box-shadow] duration-(--dur-sm) ease-out-quint select-none whitespace-nowrap [font-stretch:110%] active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none rounded-sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hot shadow-glow-accent hover:shadow-[0_0_0_1px_rgb(255_138_61/0.5),0_16px_48px_-8px_rgb(255_107_26/0.6)]",
  secondary:
    "bg-surface-2 text-ink border border-line-strong hover:border-steel hover:bg-surface-3",
  ghost: "bg-transparent text-ink-2 hover:text-ink hover:bg-steel-dim",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.8125rem]",
  lg: "h-14 px-7 text-[0.875rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type CommonProps = { variant?: Variant; size?: Size; children: ReactNode; className?: string };

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function PhoneIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M6.6 3h3l1.7 4.2-2.1 1.6a12 12 0 0 0 6 6l1.6-2.1L21 14.4v3a2.6 2.6 0 0 1-2.8 2.6C9.8 19.4 4.6 14.2 4 5.8A2.6 2.6 0 0 1 6.6 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
