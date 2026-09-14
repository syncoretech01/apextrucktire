"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

const InquiryForm = dynamic(() => import("./InquiryForm").then((m) => m.InquiryForm), {
  ssr: false,
  loading: () => <Skeleton />,
});

/**
 * Defers the form chunk (schema, anime.js, Turnstile glue) until the section
 * is within ~700px of the viewport, keeping it out of the initial bundle.
 * The skeleton always shows the phone number, so a stranded driver is never
 * waiting on JavaScript.
 */
export function FormLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{mount ? <InquiryForm /> : <Skeleton />}</div>;
}

function Skeleton() {
  return (
    <div className="min-h-[28rem] animate-pulse" aria-busy="true" aria-live="polite">
      <div className="mb-8 h-px w-full bg-line" />
      <div className="space-y-3">
        <div className="h-4 w-40 rounded-xs bg-surface-2" />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-16 rounded-sm bg-surface-2" />
          <div className="h-16 rounded-sm bg-surface-2" />
          <div className="h-16 rounded-sm bg-surface-2" />
          <div className="h-16 rounded-sm bg-surface-2" />
        </div>
      </div>
      <p className="mt-8 text-small text-ink-3">
        Loading the form. Truck down right now? Call{" "}
        <a href={SITE.phone.primary.href} className="font-semibold text-accent underline underline-offset-4">
          {SITE.phone.primary.display}
        </a>
        .
      </p>
    </div>
  );
}
