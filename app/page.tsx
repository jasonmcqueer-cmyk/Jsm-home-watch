"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarRange,
  Check,
  ClipboardCheck,
  ConciergeBell,
  KeyRound,
  Loader2,
  Mail,
  Menu,
  Phone,
  ShieldCheck,
  Trees,
  UserCheck,
  Users,
  X,
} from "lucide-react";

const CONTACT_EMAIL = "jsmhomewatch@yahoo.com";

const trustBadges = [
  {
    icon: ShieldCheck,
    title: "Fully Insured Business",
    detail: "Professional coverage on every visit",
  },
  {
    icon: UserCheck,
    title: "Background-Checked",
    detail: "Owners and employees are screened",
  },
  {
    icon: Users,
    title: "References Available",
    detail: "Ask about nearby owners we serve",
  },
  {
    icon: Award,
    title: "Community Reputation",
    detail: "Restaurant owners with local roots",
  },
];

const serviceCategories = [
  {
    icon: ClipboardCheck,
    title: "Home Watch & Property Inspection",
    items: [
      {
        text: "Scheduled interior and exterior checks with written inspection checklists",
      },
      {
        text: "Date- and time-stamped photo updates sent after every visit",
      },
      {
        text: "Mailbox checks, package retrieval, and secure key-handling procedures",
      },
      {
        text: "Walk-throughs for real estate sales when listing agents are unavailable",
      },
      {
        text: "Immediate alerts and visual documentation if any issue arises",
      },
    ],
  },
  {
    icon: Trees,
    title: "Grounds & Exterior Care",
    items: [
      {
        name: "Lawn Care & Maintenance",
        text: "Seasonal mowing, trimming, and yard upkeep",
      },
      {
        name: "Snow Removal",
        text: "Clearing driveways, walkways, and entryways",
      },
      {
        name: "Window Cleaning",
        text: "Interior and exterior glass cleaning",
      },
      {
        name: "Power Washing",
        text: "Exterior siding, decks, patios, and driveways",
      },
    ],
  },
  {
    icon: KeyRound,
    title: "Turnkey Airbnb & Short-Term Rental Co-Hosting",
    items: [
      {
        name: "Full Co-Hosting",
        text: "End-to-end guest communication and inquiry management",
      },
      {
        name: "Turnover Management",
        text: "Professional cleaning scheduling, inspections, and supply restocking",
      },
      {
        name: "Fee & Booking Administration",
        text: "Managing nightly rates, cleaning fees, and guest support",
      },
    ],
  },
  {
    icon: ConciergeBell,
    title: "Concierge & Arrival Prep",
    items: [
      {
        name: "Arrival Stocking",
        text: "Pre-arrival grocery, beverage, and household supply delivery",
      },
      {
        name: "Vendor Supervision",
        text: "Meeting local contractors and supervising work on site",
      },
      {
        name: "Trusted Local Contractor Network",
        text: "Access to service partners for specialized maintenance",
      },
    ],
  },
];

const monthlyFeatures = [
  "Any mix of home watch, grounds, co-hosting, and concierge care",
  "Flexible month-to-month scheduling",
  "Written checklists and stamped photos after visits",
  "Immediate alerts when something is wrong",
  "Pause around your travel calendar",
];

const yearlyFeatures = [
  "Everything in monthly service",
  "Priority scheduling in every season",
  "Pre-season open, close, and arrival prep",
  "Snow, lawn, and exterior care on a set cadence",
  "Dedicated notes for vendors, cleaners, and guests",
  "Best value for vacation homes and Airbnbs",
];

type PropertyType = "primary" | "vacation" | "airbnb" | "";
type PlanType = "monthly" | "yearly" | "";

type FormState = {
  name: string;
  email: string;
  phone: string;
  propertyType: PropertyType;
  plan: PlanType;
  message: string;
};

type RequestSentDetail = {
  ok?: boolean;
  email?: string;
  error?: string;
  errors?: Partial<Record<keyof FormState, string>>;
};

declare global {
  interface Window {
    jsmOnRequestSent?: (detail: RequestSentDetail) => void;
  }
}

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  propertyType: "",
  plan: "",
  message: "",
};

const FORM_DRAFT_KEY = "jsm-request-draft";

function readDraft(): FormState {
  if (typeof window === "undefined") return emptyForm;
  try {
    const raw = sessionStorage.getItem(FORM_DRAFT_KEY);
    if (!raw) return emptyForm;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...emptyForm, ...parsed };
  } catch {
    return emptyForm;
  }
}

function writeDraft(next: FormState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(next));
}

const goldButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 font-bold text-forest-deep shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c99200] hover:shadow-md";

function Logo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="JSM Home Watch & Property Care Services"
      className={className}
    />
  );
}

function MichiganMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 84"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M8 28c6-4 16-8 28-7 8 .6 16 4 20 8l-4 5c-8-2-16-2-28 0-6 1-12 0-16-2z" />
      <path d="M26 38c8-2 18-1 26 4 5 4 8 12 7 22-1 8-5 16-12 20-6 3-12 2-16-2-3-6-5-14-7-22-2-8 0-16 2-22z" />
    </svg>
  );
}

function RequestCta({
  className,
  children,
  plan = "",
  onOpen,
}: {
  className: string;
  children: ReactNode;
  plan?: PlanType;
  onOpen: (plan?: PlanType) => void;
}) {
  return (
    <a
      href="#request-service"
      data-open-request="true"
      {...(plan ? { "data-plan": plan } : {})}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onOpen(plan);
      }}
    >
      {children}
    </a>
  );
}

function snapshotForm(formEl: HTMLFormElement | null): FormState {
  const data = formEl ? new FormData(formEl) : null;
  return {
    name: String(data?.get("name") || ""),
    email: String(data?.get("email") || ""),
    phone: String(data?.get("phone") || ""),
    propertyType: (String(data?.get("propertyType") || "") ||
      "") as FormState["propertyType"],
    plan: (String(data?.get("plan") || "") || "") as FormState["plan"],
    message: String(data?.get("message") || ""),
  };
}

function persistLiveDraft(formEl: HTMLFormElement | null) {
  const next = snapshotForm(formEl);
  if (
    !next.name &&
    !next.email &&
    !next.phone &&
    !next.message &&
    !next.propertyType &&
    !next.plan
  ) {
    return;
  }
  writeDraft(next);
}

function fillEmptyFieldsFromDraft(formEl: HTMLFormElement | null) {
  if (!formEl) return;
  const draft = readDraft();
  (Object.keys(emptyForm) as (keyof FormState)[]).forEach((key) => {
    const value = draft[key];
    if (!value) return;
    const field = formEl.elements.namedItem(key);
    if (
      field &&
      field instanceof HTMLElement &&
      "value" in field &&
      !String((field as HTMLInputElement).value || "").trim()
    ) {
      (field as HTMLInputElement).value = value;
    }
  });
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [planHint, setPlanHint] = useState<PlanType>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [sendError, setSendError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sentTo, setSentTo] = useState("");

  const planLabel =
    planHint === "monthly"
      ? "Monthly Watch"
      : planHint === "yearly"
        ? "Yearly Watch"
        : "Not specified";

  function validate(next: FormState) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!next.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (next.phone.replace(/\D/g, "").length < 10) {
      nextErrors.phone = "Enter a 10-digit phone number.";
    }
    if (!next.propertyType) {
      nextErrors.propertyType = "Select a property type.";
    }
    if (next.message.trim().length < 10) {
      nextErrors.message = "Tell us a bit about the property or what you need.";
    }
    return nextErrors;
  }

  async function sendRequest(formEl?: HTMLFormElement | null) {
    const sending = window as Window & { __jsmSending?: boolean };
    if (sending.__jsmSending) return;

    const host =
      formEl ||
      (document.getElementById("request-service-form") as HTMLFormElement | null);
    const snapshot = snapshotForm(host);

    const nextErrors = validate(snapshot);
    setErrors(nextErrors);
    setSendError("");
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    sending.__jsmSending = true;
    setStatus("submitting");
    const payload = {
      name: snapshot.name.trim(),
      email: snapshot.email.trim(),
      phone: snapshot.phone.trim(),
      propertyType: snapshot.propertyType,
      plan: snapshot.plan,
      message: snapshot.message.trim(),
      website: honeypot,
    };

    const propertyLabel =
      snapshot.propertyType === "primary"
        ? "Primary Home"
        : snapshot.propertyType === "vacation"
          ? "Vacation Home"
          : snapshot.propertyType === "airbnb"
            ? "Airbnb"
            : snapshot.propertyType;
    const selectedPlan =
      snapshot.plan === "monthly"
        ? "Monthly Watch"
        : snapshot.plan === "yearly"
          ? "Yearly Watch"
          : "Not specified";
    const subject =
      snapshot.plan === "monthly"
        ? "Monthly Home Watch Request"
        : snapshot.plan === "yearly"
          ? "Yearly Home Watch Request"
          : "Home Watch Service Request";

    try {
      const saveResponse = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      const savePayload = (await saveResponse.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!saveResponse.ok || !savePayload.ok) {
        setStatus("error");
        setSendError(
          savePayload.error ||
            `We couldn't send that just now. Email ${CONTACT_EMAIL} directly.`,
        );
        return;
      }

      void fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          "Property Type": propertyLabel,
          "Service Plan": selectedPlan,
          message: payload.message,
          _subject: subject,
          _template: "table",
          _captcha: "false",
        }),
      }).catch(() => undefined);

      setSentTo(snapshot.email);
      setHoneypot("");
      setPlanHint("");
      sessionStorage.removeItem(FORM_DRAFT_KEY);
      setFormKey((current) => current + 1);
      setStatus("success");
    } catch {
      setStatus("error");
      setSendError(
        `We couldn't send that just now. Email ${CONTACT_EMAIL} directly.`,
      );
    } finally {
      sending.__jsmSending = false;
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    await sendRequest(event.currentTarget);
  }

  function scrollToId(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function getDialog() {
    return document.getElementById(
      "request-service",
    ) as HTMLDialogElement | null;
  }

  function closeModal() {
    const dialog = getDialog();
    if (dialog?.open) dialog.close();
    setSendError("");
    if (status === "success") {
      setStatus("idle");
      setSentTo("");
    }
  }

  function requestService(plan: PlanType = "") {
    setMenuOpen(false);
    setErrors({});
    setSendError("");
    setStatus("idle");
    if (status === "success") {
      setSentTo("");
    }
    if (plan) setPlanHint(plan);
    const dialog = getDialog();
    try {
      if (dialog && !dialog.open) dialog.showModal();
    } catch {
      dialog?.setAttribute("open", "");
    }
  }

  useEffect(() => {
    const formEl = document.getElementById(
      "request-service-form",
    ) as HTMLFormElement | null;
    fillEmptyFieldsFromDraft(formEl);
    const persist = () => persistLiveDraft(formEl);
    formEl?.addEventListener("input", persist);
    formEl?.addEventListener("change", persist);
    return () => {
      formEl?.removeEventListener("input", persist);
      formEl?.removeEventListener("change", persist);
    };
  }, [formKey]);

  useEffect(() => {
    window.jsmOnRequestSent = (detail) => {
      if (detail.errors) setErrors(detail.errors);
      else setErrors({});
      if (detail.ok) {
        setSentTo(detail.email || "");
        setHoneypot("");
        setPlanHint("");
        sessionStorage.removeItem(FORM_DRAFT_KEY);
        setFormKey((current) => current + 1);
        setStatus("success");
        return;
      }
      if (detail.errors) {
        setStatus("error");
        setSendError(
          detail.error || "Please complete the highlighted fields so we can follow up.",
        );
        return;
      }
      setStatus("error");
      setSendError(detail.error || "");
    };
    return () => {
      delete window.jsmOnRequestSent;
    };
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-forest-deep/95 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="flex items-center rounded-xl bg-cream px-2 py-1"
            onClick={(event) => {
              event.preventDefault();
              scrollToId("top");
            }}
          >
            <Logo className="h-12 w-auto sm:h-16" />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide md:flex">
            <a
              href="#services"
              className="transition hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </a>
            <a
              href="#plans"
              className="transition hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              Plans
            </a>
            <a href="#contact" className="transition hover:text-gold">
              Contact
            </a>
            <RequestCta
              onOpen={requestService}
              className={goldButtonClass}
            >
              Request Service
              <ArrowRight className="h-4 w-4" />
            </RequestCta>
          </nav>

          <button
            type="button"
            className="inline-flex rounded-md p-2 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <a
                href="#services"
                className="rounded-md px-2 py-2 hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#plans"
                className="rounded-md px-2 py-2 hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                Plans
              </a>
              <a
                href="#contact"
                className="rounded-md px-2 py-2 hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </a>
              <RequestCta
                onOpen={requestService}
                className={`mt-1 ${goldButtonClass} py-3`}
              >
                Request Service
              </RequestCta>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top" className="flex-1">
        <section
          className="relative min-h-[92vh] overflow-hidden bg-forest-deep bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-lakefront.png')" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-deep/45 via-forest/35 to-forest-deep/92" />
          <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
            <div className="max-w-3xl text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/70 bg-forest-deep/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm sm:text-sm">
                <MichiganMark className="h-6 w-5 text-gold" />
                Serving Northern Michigan
              </div>
              <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-wide text-white sm:text-5xl lg:text-6xl">
                Peace of Mind While You&apos;re Away
              </h1>
              <p className="mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
                Professional Home Watch &amp; Property Care for lakefront lodges,
                cottages, and year-round homes across Northern Michigan.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <RequestCta
                  onOpen={requestService}
                  className={`${goldButtonClass} pointer-events-auto px-7 py-3.5 text-sm tracking-wide uppercase`}
                >
                  Request Service
                  <ArrowRight className="h-4 w-4" />
                </RequestCta>
                <RequestCta
                  onOpen={requestService}
                  className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/80 px-7 py-3.5 text-sm font-bold tracking-wide text-white uppercase transition hover:-translate-y-0.5 hover:bg-white hover:text-forest-deep"
                >
                  Get in Touch
                </RequestCta>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-forest text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.title} className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">
                      {badge.title}
                    </p>
                    <p className="text-sm text-white/80">{badge.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="services" className="scroll-mt-24 bg-cream px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-bold tracking-[0.22em] text-lake uppercase">
              Core Services
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-forest sm:text-4xl">
              Full-service care for Northern Michigan homes
            </h2>
            <p className="mt-4 max-w-2xl text-base text-forest/75 sm:text-lg">
              Home watch, grounds, co-hosting, and concierge support — all
              available on flexible monthly or yearly plans.
            </p>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {serviceCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <article
                    key={category.title}
                    className="rounded-2xl border border-forest/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lake/10 text-lake">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold text-forest sm:text-2xl">
                      {category.title}
                    </h3>
                    <ul className="mt-5 flex flex-col gap-3">
                      {category.items.map((item) => (
                        <li
                          key={`${category.title}-${item.name ?? item.text}`}
                          className="flex items-start gap-3 text-sm leading-relaxed text-forest/75"
                        >
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-lake" />
                          <span>
                            {item.name ? (
                              <>
                                <span className="font-semibold text-forest">
                                  {item.name}:
                                </span>{" "}
                                {item.text}
                              </>
                            ) : (
                              item.text
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-gold/40 bg-white px-6 py-6 text-center sm:px-10">
              <p className="text-sm font-bold tracking-[0.18em] text-lake uppercase">
                Flexible monthly or yearly service
              </p>
              <p className="mt-2 text-base text-forest/75">
                Every offering below can be scheduled month-to-month or as a
                year-round plan. Written agreements, inspection checklists, and
                stamped photos come with the watch.
              </p>
              <a
                href="#plans"
                className="mt-4 inline-flex items-center justify-center gap-2 font-semibold text-forest hover:text-lake"
              >
                Compare plans
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-6 rounded-2xl bg-forest px-6 py-8 text-center text-white sm:px-10">
              <p className="text-sm font-bold tracking-[0.2em] text-gold uppercase">
                Complete care for every property
              </p>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 text-lg font-semibold sm:flex-row sm:gap-8">
                <span>Primary Homes</span>
                <span className="hidden h-1.5 w-1.5 rounded-full bg-gold sm:block" />
                <span>Vacation Homes</span>
                <span className="hidden h-1.5 w-1.5 rounded-full bg-gold sm:block" />
                <span>Airbnbs</span>
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="scroll-mt-24 bg-mist px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-bold tracking-[0.22em] text-lake uppercase">
              Service Plans
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-forest sm:text-4xl">
              Flexible monthly or yearly service
            </h2>
            <p className="mt-4 max-w-2xl text-base text-forest/75 sm:text-lg">
              Home watch, grounds, Airbnb co-hosting, and concierge care can all
              run on a monthly or yearly plan. We&apos;ll match the mix to how
              you use the property.
            </p>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <article className="flex flex-col rounded-3xl border border-forest/10 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-forest">
                    <CalendarRange className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-forest">
                      Monthly Watch
                    </h3>
                    <p className="text-sm text-forest/65">
                      Month-to-month care while you travel
                    </p>
                  </div>
                </div>
                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {monthlyFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-lake" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <RequestCta
                  plan="monthly"
                  onOpen={requestService}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest px-6 py-3 text-sm font-bold text-forest uppercase transition hover:-translate-y-0.5 hover:bg-forest hover:text-white hover:shadow-md"
                >
                  Request monthly service
                  <ArrowRight className="h-4 w-4" />
                </RequestCta>
              </article>

              <article className="relative flex flex-col rounded-3xl border-2 border-gold bg-forest p-8 text-white shadow-xl">
                <span className="absolute -top-3 right-8 rounded-full bg-gold px-4 py-1 text-xs font-bold tracking-wide text-forest-deep uppercase">
                  Best for seasonal owners
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <BadgeCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold">
                      Yearly Watch
                    </h3>
                    <p className="text-sm text-white/70">
                      Dependable property care in every season
                    </p>
                  </div>
                </div>
                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {yearlyFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <RequestCta
                  plan="yearly"
                  onOpen={requestService}
                  className={`mt-8 ${goldButtonClass} px-6 py-3 text-sm uppercase`}
                >
                  Request yearly service
                  <ArrowRight className="h-4 w-4" />
                </RequestCta>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-cream px-4 py-16 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-3xl bg-forest px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.22em] text-gold uppercase">
                Ready when you are
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Have someone on the property while you&apos;re away.
              </h2>
              <p className="mt-3 max-w-xl text-white/80">
                Request service and we&apos;ll follow up to set a visit schedule.
                Or email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-gold underline-offset-2 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
            <RequestCta
              onOpen={requestService}
              className={`${goldButtonClass} shrink-0 px-7 py-3.5 text-sm uppercase`}
            >
              Request Service
              <ArrowRight className="h-4 w-4" />
            </RequestCta>
          </div>
        </section>
      </main>

      <footer className="bg-forest-deep text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <div className="inline-block rounded-xl bg-cream px-3 py-2">
              <Logo className="h-16 w-auto" />
            </div>
            <p className="mt-4 text-sm text-white/75">
              JSM Home Watch &amp; Property Care Services — peace of mind while
              you&apos;re away.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
              Contact
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 flex items-center gap-2 text-sm hover:text-gold"
            >
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
              <Phone className="h-4 w-4" />
              Reach us by email to schedule a call
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
              Service area
            </p>
            <p className="mt-3 text-sm text-white/75">
              Serving Northern Michigan — primary homes, vacation homes, and
              Airbnbs.
            </p>
            <p className="mt-4 text-xs font-bold tracking-[0.16em] text-white/80 uppercase">
              Fully insured · Background-checked · References available
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/55">
          © {new Date().getFullYear()} JSM Home Watch &amp; Property Care
          Services. All rights reserved.
        </div>
      </footer>

      <dialog
        id="request-service"
        aria-labelledby="request-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
        onClose={() => {
          setSendError("");
          if (status === "success") {
            setStatus("idle");
            setSentTo("");
          }
        }}
      >
        <div className="flex max-h-[92vh] w-full flex-col overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-forest/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-lake uppercase">
                  Request Service
                </p>
                <h2
                  id="request-title"
                  className="mt-1 font-display text-2xl font-bold text-forest"
                >
                  Tell us about the property
                </h2>
              </div>
              <a
                href="#top"
                data-close-request="true"
                onClick={(event) => {
                  event.preventDefault();
                  closeModal();
                }}
                className="rounded-full p-2 text-forest/60 transition hover:bg-cream hover:text-forest"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </a>
            </div>

            <div
              id="request-success-panel"
              hidden={status !== "success"}
              className="px-5 py-10 text-center sm:px-6"
            >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold text-forest">
                  Request received
                </h3>
                <p className="mt-3 text-sm text-forest/75">
                  Thanks. We have your request
                  {sentTo ? ` and will follow up at ${sentTo}` : ""}. If you
                  don&apos;t hear back, email{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-semibold text-lake"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
                <a
                  href="#top"
                  data-close-request="true"
                  onClick={(event) => {
                    event.preventDefault();
                    closeModal();
                  }}
                  className={`mt-6 ${goldButtonClass} px-7 py-3 text-sm uppercase`}
                >
                  Done
                </a>
            </div>
            <form
              key={formKey}
              id="request-service-form"
              data-react="ready"
              onSubmit={onSubmit}
              hidden={status === "success"}
              className="overflow-y-auto px-5 py-5 sm:px-6"
              noValidate
            >
              {planHint ? (
                <p className="mb-5 rounded-xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm font-semibold text-forest">
                  You&apos;re requesting {planLabel}. Complete the form and
                  we&apos;ll follow up with scheduling.
                </p>
              ) : (
                <p className="mb-5 hidden" aria-hidden="true" />
              )}

              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input
                    name="botcheck"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-forest">Name</span>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    defaultValue=""
                    className="rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                    placeholder="Your full name"
                  />
                  {errors.name ? (
                    <span className="text-sm text-red-700">{errors.name}</span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-forest">Email</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue=""
                    className="rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                    placeholder="you@email.com"
                  />
                  {errors.email ? (
                    <span className="text-sm text-red-700">{errors.email}</span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-forest">
                    Phone Number
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue=""
                    className="rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                    placeholder="(231) 555-0148"
                  />
                  {errors.phone ? (
                    <span className="text-sm text-red-700">{errors.phone}</span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-forest">
                    Property Type
                  </span>
                  <select
                    name="propertyType"
                    defaultValue=""
                    className="rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                  >
                    <option value="">Select one</option>
                    <option value="primary">Primary Home</option>
                    <option value="vacation">Vacation Home</option>
                    <option value="airbnb">Airbnb</option>
                  </select>
                  {errors.propertyType ? (
                    <span className="text-sm text-red-700">
                      {errors.propertyType}
                    </span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-forest">
                    Service Plan
                  </span>
                  <select
                    name="plan"
                    defaultValue=""
                    onChange={(event) =>
                      setPlanHint(event.target.value as PlanType)
                    }
                    className="rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                  >
                    <option value="">Not sure yet</option>
                    <option value="monthly">Monthly Watch</option>
                    <option value="yearly">Yearly Watch</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-forest">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows={4}
                    defaultValue=""
                    className="resize-y rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                    placeholder="Tell us about the property, travel schedule, and anything we should know."
                  />
                  {errors.message ? (
                    <span className="text-sm text-red-700">{errors.message}</span>
                  ) : null}
                </label>
              </div>

              {status === "error" && sendError ? (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  {sendError}
                </p>
              ) : null}

              {status === "error" && !sendError ? (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  Please complete the highlighted fields so we can follow up.
                </p>
              ) : null}

              <p
                id="request-send-status"
                hidden
                className="mt-5 rounded-xl border border-gold bg-gold/25 px-4 py-3 text-sm font-semibold text-forest"
              />

              <button
                type="button"
                data-send-request="true"
                onClick={() => void sendRequest()}
                className={`mt-6 w-full ${goldButtonClass} px-6 py-3.5 text-sm tracking-wide uppercase`}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    Send service request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
        </div>
      </dialog>
    </div>
  );
}
