import type { ReactNode } from "react";
import { Reveal } from "@/lib/motion/Reveal";

type Props = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg";
};

export function SectionHeader({ eyebrow, title, lead, align = "left", className = "", size = "lg" }: Props) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-[52rem] ${className}`}>
      <Reveal as="p" className="eyebrow mb-4 text-accent">
        {eyebrow}
      </Reveal>
      <Reveal as="h2" mode="lines" className={`display-tight ${size === "lg" ? "text-display-lg" : "text-display-md"} text-ink`}>
        {title}
      </Reveal>
      {lead && (
        <Reveal as="p" className="mt-6 max-w-[40rem] text-lead text-ink-2" delay={0.1}>
          {lead}
        </Reveal>
      )}
    </div>
  );
}
