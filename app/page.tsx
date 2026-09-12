"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarRange,
  Camera,
  Check,
  CloudLightning,
  Home,
  Mail,
  Menu,
  Phone,
  ShieldCheck,
  Snowflake,
  Trees,
  Users,
  Wrench,
  X,
} from "lucide-react";

const CONTACT_EMAIL = "jsmhomewatch@yahoo.com";

const services = [
  {
    icon: Home,
    title: "Scheduled Home Checks",
    description:
      "Interior and exterior walkthroughs on a cadence that matches how often you travel — so small issues never become expensive surprises.",
  },
  {
    icon: Snowflake,
    title: "Seasonal & Vacation Home Care",
    description:
      "Open, close, and watch over Northern Michigan homes through freeze-up, thaw, and peak summer occupancy.",
  },
  {
    icon: CloudLightning,
    title: "Storm & Exterior Checks",
    description:
      "After high wind, heavy snow, or hard rain, we inspect roofs, trees, shoreline, and entry points and send you what we find.",
  },
  {
    icon: Wrench,
    title: "Vendor & Maintenance Access",
    description:
      "We meet contractors, let in service techs, and keep a clear record of who was on the property while you are away.",
  },
  {
    icon: Camera,
    title: "Photo Updates",
    description:
      "Every visit includes dated photos so you can see the property — docks, interiors, and grounds — without making the drive.",
  },
  {
    icon: Building2,
    title: "Complete Home Watch",
    description:
      "One dependable watch for primary homes, vacation homes, and Airbnbs. Same care, tailored to how each property is used.",
  },
];

const monthlyFeatures = [
  "Flexible month-to-month checks",
  "Photo update after every visit",
  "Storm-response exterior walkthroughs",
  "Vendor meet-and-greet as needed",
  "Pause around your travel calendar",
];

const yearlyFeatures = [
  "Everything in monthly service",
  "Priority scheduling year-round",
  "Pre-season open and close visits",
  "Off-season exterior monitoring",
  "Dedicated notes for vendors and caretakers",
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

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  propertyType: "",
  plan: "",
  message: "",
};

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

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [modalOpen, setModalOpen] = useState(false);

  const planLabel =
    form.plan === "monthly"
      ? "Monthly Watch"
      : form.plan === "yearly"
        ? "Yearly Watch"
        : "Not specified";

  const mailtoHref = useMemo(() => {
    const propertyLabel =
      form.propertyType === "primary"
        ? "Primary Home"
        : form.propertyType === "vacation"
          ? "Vacation Home"
          : form.propertyType === "airbnb"
            ? "Airbnb"
            : "Not specified";

    const selectedPlan =
      form.plan === "monthly"
        ? "Monthly Watch"
        : form.plan === "yearly"
          ? "Yearly Watch"
          : "Not specified";

    const subject =
      form.plan === "monthly"
        ? "Monthly Home Watch Request"
        : form.plan === "yearly"
          ? "Yearly Home Watch Request"
          : "Home Watch Service Request";

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Property type: ${propertyLabel}`,
      `Service plan: ${selectedPlan}`,
      "",
      form.message,
    ].join("\n");

    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }, [form]);

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("success");
    window.location.href = mailtoHref;
  }

  function scrollToId(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function closeModal() {
    setModalOpen(false);
    if (typeof window !== "undefined" && window.location.hash === "#request-modal") {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }

  function requestService(plan: PlanType = "") {
    setMenuOpen(false);
    setErrors({});
    setStatus("idle");
    setForm((current) => ({ ...current, plan }));
    setModalOpen(true);
    if (typeof window !== "undefined" && window.location.hash !== "#request-modal") {
      window.location.hash = "request-modal";
    }
  }

  useEffect(() => {
    function syncFromHash() {
      setModalOpen(window.location.hash === "#request-modal");
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      document.getElementById("contact-name")?.focus();
    }, 40);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [modalOpen]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-forest-deep/95 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="flex items-center rounded-xl bg-cream px-2 py-1"
            onClick={() => scrollToId("top")}
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
              <a
                href="#request-modal"
                onClick={() => requestService()}
                className={goldButtonClass}
              >
                Request Service
                <ArrowRight className="h-4 w-4" />
              </a>
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
              <a
                href="#request-modal"
                onClick={() => requestService()}
                className={`mt-1 ${goldButtonClass} py-3`}
              >
                Request Service
              </a>
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
                <a
                  href="#request-modal"
                  onClick={() => requestService()}
                  className={`${goldButtonClass} pointer-events-auto px-7 py-3.5 text-sm tracking-wide uppercase`}
                >
                  Request Service
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#request-modal"
                  onClick={() => requestService()}
                  className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/80 px-7 py-3.5 text-sm font-bold tracking-wide text-white uppercase transition hover:-translate-y-0.5 hover:bg-white hover:text-forest-deep"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-forest text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
                  Insured
                </p>
                <p className="text-sm text-white/80">
                  Professional coverage on every visit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Users className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
                  References Available
                </p>
                <p className="text-sm text-white/80">
                  Ask about nearby property owners we serve
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Trees className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
                  Every Season
                </p>
                <p className="text-sm text-white/80">
                  Dependable property care year-round
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-24 bg-cream px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-bold tracking-[0.22em] text-lake uppercase">
              Core Services
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-forest sm:text-4xl">
              Professional home watch, done the Northern Michigan way
            </h2>
            <p className="mt-4 max-w-2xl text-base text-forest/75 sm:text-lg">
              Whether the house sits on the water or back in the woods, we keep
              a careful eye on it — then send you proof that everything is as it
              should be.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.title}
                    className="rounded-2xl border border-forest/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lake/10 text-lake">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold text-forest">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-forest/70">
                      {service.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 rounded-2xl bg-forest px-6 py-8 text-center text-white sm:px-10">
              <p className="text-sm font-bold tracking-[0.2em] text-gold uppercase">
                Complete home watch for every property
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
              Choose the cadence that matches how you use the property. We&apos;ll
              tailor visit frequency, vendor access, and photo updates after a
              short conversation.
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
                <a
                  href="#request-modal"
                  onClick={() => requestService("monthly")}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest px-6 py-3 text-sm font-bold text-forest uppercase transition hover:-translate-y-0.5 hover:bg-forest hover:text-white hover:shadow-md"
                >
                  Request monthly service
                  <ArrowRight className="h-4 w-4" />
                </a>
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
                <a
                  href="#request-modal"
                  onClick={() => requestService("yearly")}
                  className={`mt-8 ${goldButtonClass} px-6 py-3 text-sm uppercase`}
                >
                  Request yearly service
                  <ArrowRight className="h-4 w-4" />
                </a>
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
            <a
              href="#request-modal"
              onClick={() => requestService()}
              className={`${goldButtonClass} shrink-0 px-7 py-3.5 text-sm uppercase`}
            >
              Request Service
              <ArrowRight className="h-4 w-4" />
            </a>
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
              Insured · References available
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/55">
          © {new Date().getFullYear()} JSM Home Watch &amp; Property Care
          Services. All rights reserved.
        </div>
      </footer>

      <div
        id="request-modal"
        className={modalOpen ? "is-open" : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
      >
        <a
          href="#top"
          aria-label="Close request form"
          className="absolute inset-0"
          onClick={(event) => {
            event.preventDefault();
            closeModal();
          }}
        />
        <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
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

            <form
              onSubmit={onSubmit}
              className="overflow-y-auto px-5 py-5 sm:px-6"
              noValidate
            >
              {form.plan ? (
                <p className="mb-5 rounded-xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm font-semibold text-forest">
                  You&apos;re requesting {planLabel}. Complete the form and
                  we&apos;ll follow up with scheduling.
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-forest">Name</span>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
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
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
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
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
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
                    value={form.propertyType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        propertyType: event.target.value as PropertyType,
                      }))
                    }
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
                    value={form.plan}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        plan: event.target.value as PlanType,
                      }))
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
                    value={form.message}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    className="resize-y rounded-xl border border-forest/15 bg-cream px-4 py-3 outline-none ring-gold/40 transition focus:ring-2"
                    placeholder="Tell us about the property, travel schedule, and anything we should know."
                  />
                  {errors.message ? (
                    <span className="text-sm text-red-700">{errors.message}</span>
                  ) : null}
                </label>
              </div>

              {status === "success" ? (
                <p className="mt-5 rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest">
                  Thank you. Your email app should open with a message to{" "}
                  <strong>{CONTACT_EMAIL}</strong>. If it doesn&apos;t, send us a
                  note at that address and we&apos;ll be in touch.
                </p>
              ) : null}

              {status === "error" ? (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  Please complete the highlighted fields so we can follow up.
                </p>
              ) : null}

              <button
                type="submit"
                className={`mt-6 w-full ${goldButtonClass} px-6 py-3.5 text-sm tracking-wide uppercase`}
              >
                Send service request
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
      </div>
    </div>
  );
}
