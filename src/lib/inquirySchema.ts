// zod/mini: same runtime, functional API, tree-shakes to a few KB in the client bundle.
import * as z from "zod/mini";

/**
 * Inquiry schema — shared by the client (inline validation) and the server
 * (authoritative validation). The server never trusts client validation.
 */
export const SERVICE_TYPES = ["roadside", "purchase", "installation", "other"] as const;
export const URGENCIES = ["emergency", "today", "week", "quote"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
export type Urgency = (typeof URGENCIES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  roadside: "Roadside emergency",
  purchase: "Tire purchase",
  installation: "Installation / mounting",
  other: "Something else",
};
export const URGENCY_LABELS: Record<Urgency, string> = {
  emergency: "Emergency — now",
  today: "Today",
  week: "This week",
  quote: "Quote only",
};

/** Digits only, 10–15 (US/NANP + international without formatting). */
export const phoneDigits = (v: string) => v.replace(/[^\d]/g, "");

const text = (max: number) => z.string().check(z.trim(), z.maxLength(max, `Keep this under ${max} characters.`));

export const inquiryFields = z.object({
  name: text(80),
  company: text(120),
  phone: z.string().check(
    z.trim(),
    z.maxLength(32, "That phone number is too long."),
    z.refine((v) => {
      const d = phoneDigits(v);
      return d.length >= 10 && d.length <= 15;
    }, "Enter a phone number with area code."),
  ),
  email: z.union([z.literal(""), z.email("Enter a valid email or leave it blank.").check(z.maxLength(254))]),
  location: text(200),
  serviceType: z.enum(SERVICE_TYPES, { message: "Pick a service type." }),
  urgency: z.enum(URGENCIES, { message: "Pick an urgency." }),
  message: text(2000),
});

export type InquiryFields = z.infer<typeof inquiryFields>;

/**
 * Cross-field rules: emergencies need phone + location only; everything else
 * needs a name so a human can be addressed in the reply.
 */
export const inquirySchema = inquiryFields.check(
  z.superRefine((v, ctx) => {
    if (v.urgency === "emergency") {
      if (!v.location) ctx.addIssue({ code: "custom", path: ["location"], message: "Where is the truck? Mile marker, exit, or cross street." });
      return;
    }
    if (!v.name) ctx.addIssue({ code: "custom", path: ["name"], message: "Tell us who to ask for." });
  }),
);

/** Wire format: fields + anti-bot extras. */
export const inquiryPayload = z.object({
  fields: inquiryFields,
  /** Honeypot: must be empty. Named to look real to bots. */
  website: z._default(z.optional(z.string().check(z.maxLength(200))), ""),
  turnstileToken: z.string().check(z.minLength(1), z.maxLength(4096)),
});
export type InquiryPayload = z.infer<typeof inquiryPayload>;

export const EMPTY_FIELDS: InquiryFields = {
  name: "",
  company: "",
  phone: "",
  email: "",
  location: "",
  serviceType: "roadside",
  urgency: "emergency",
  message: "",
};
