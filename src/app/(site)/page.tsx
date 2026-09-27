import Link from "next/link";

import { AircraftSchematic } from "@/components/aircraft-schematic";
import { EfficiencyChart } from "@/components/efficiency-chart";
import { LatestPosts } from "@/components/latest-posts";
import { Reveal } from "@/components/reveal";
import {
  ArrowRight,
  Badge,
  ButtonLink,
  Card,
  Section,
  SectionHeading,
  Stat,
} from "@/components/ui";
import { company, mission, problem, stork, traction } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TractionStrip />
      <Problem />
      <Mission />
      <Aircraft />
      <Efficiency />
      <News />
      <ClosingCta />
    </>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand wash behind the fold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 34rem at 78% -12%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="container-page pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <Badge>Early stage · {company.university}</Badge>

            <h1 className="mt-6 text-[2.5rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem] lg:text-[3.75rem]">
              Autonomous logistics,
              <br />
              <span className="text-accent-ink">engineered for range.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-body md:text-[1.125rem]">
              Hailstrum is building the Guidance, Navigation and Control stack —
              and the airframe around it — that makes drone freight cheaper than
              a van. We start where most of the energy is lost: propulsion.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/technology">
                See the technology
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Work with us
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              {stork.specs.slice(0, 3).map((spec) => (
                <div key={spec.label}>
                  <dt className="sr-only">{spec.label}</dt>
                  <dd>
                    <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                      {spec.value}
                      <span className="ml-0.5 text-sm text-accent">
                        {spec.unit}
                      </span>
                    </p>
                    <p className="mt-1 text-xs leading-snug text-ink-muted">
                      {spec.label}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="rounded-card border border-line bg-surface p-4 shadow-soft md:p-6">
              <AircraftSchematic className="w-full text-ink" />
            </div>
            <p className="mt-3 text-center font-display text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
              Stork · hybrid VTOL logistics platform
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- traction -------------------------------- */

function TractionStrip() {
  return (
    <section className="border-y border-line bg-bg-subtle py-8">
      <div className="container-page">
        <ul className="grid gap-6 sm:grid-cols-3">
          {traction.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              <div>
                <p className="font-display text-sm font-semibold text-ink">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-ink-muted">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------- problem -------------------------------- */

function Problem() {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow={problem.eyebrow}
          title={problem.heading}
          body={problem.body}
        />
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {problem.points.map((point, i) => (
          <Reveal key={point.label} delay={i * 90}>
            <Card className="h-full">
              <p className="font-display text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-accent-ink">
                {point.stat}
              </p>
              <p className="mt-3 font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
                {point.label}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-body">
                {point.detail}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------- mission -------------------------------- */

function Mission() {
  return (
    <Section tone="navy">
      <Reveal>
        <SectionHeading
          eyebrow={mission.eyebrow}
          title={mission.heading}
          onNavy
        />
      </Reveal>

      <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-navy-line bg-navy-line md:grid-cols-3">
        {mission.items.map((item, i) => (
          <Reveal key={item.number} delay={i * 90} className="bg-navy p-7">
            <p className="font-display text-sm font-semibold tracking-[0.1em] text-on-navy-accent">
              {item.number}
            </p>
            <h3 className="mt-4 text-lg !text-on-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-navy-muted">
              {item.body}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------- aircraft -------------------------------- */

function Aircraft() {
  return (
    <Section tone="subtle">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={stork.eyebrow}
            title={stork.heading}
            body={stork.subheading}
          />

          <ul className="mt-9 space-y-5">
            {stork.features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-2 h-px w-6 shrink-0 bg-accent"
                />
                <div>
                  <h3 className="text-base">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-body">
                    {feature.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <ButtonLink href="/technology" variant="outline" className="mt-9">
            How it works
            <ArrowRight />
          </ButtonLink>
        </Reveal>

        <Reveal delay={120}>
          <Card className="grid grid-cols-2 gap-8 p-8">
            {stork.specs.map((spec) => (
              <Stat
                key={spec.label}
                value={spec.value}
                unit={spec.unit}
                label={spec.label}
              />
            ))}
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------- efficiency -------------------------------- */

function Efficiency() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Where the energy goes"
            title="Most of a drone's battery is spent on propulsion."
            body="So that is where we started. Our first programme optimises a propeller past 80% propulsion efficiency using CFD and aerodynamic modelling, then validates it on our own thrust rig. Every point of efficiency becomes range or payload."
          />
          <ButtonLink href="/technology" variant="outline" className="mt-8">
            Read the engineering
            <ArrowRight />
          </ButtonLink>
        </Reveal>

        <Reveal delay={120}>
          <Card className="p-6 md:p-7">
            <EfficiencyChart />
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ----------------------------------- news ---------------------------------- */

function News() {
  return (
    <Section tone="subtle">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Build log"
          title="What we're working on"
          className="!max-w-xl"
        />
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 font-display text-sm font-medium text-accent-ink hover:underline"
        >
          All updates
          <ArrowRight />
        </Link>
      </div>

      <div className="mt-10">
        <LatestPosts limit={3} />
      </div>
    </Section>
  );
}

/* ----------------------------------- cta ----------------------------------- */

function ClosingCta() {
  return (
    <Section tone="navy">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-[1.75rem] !text-on-navy md:text-[2.25rem]">
          Moving freight, hiring, or funding hard engineering?
        </h2>
        <p className="mt-4 text-on-navy-muted">
          We’re looking for logistics operators to test with, and for people who
          want to build autonomous aircraft in Sydney.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact">Get in touch</ButtonLink>
          <ButtonLink href={company.instagram} variant="on-navy" external>
            Follow the build
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
