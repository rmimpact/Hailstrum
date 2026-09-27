import type { Metadata } from "next";

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
import {
  company,
  projections,
  roadmap,
  team,
  traction,
  type StageStatus,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "The team behind Hailstrum Robotics, our six-stage roadmap, and where the company is today.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero />
      <Story />
      <Roadmap />
      <Team />
      <Numbers />
    </>
  );
}

function PageHero() {
  return (
    <section className="border-b border-line bg-bg-subtle">
      <div className="container-page py-16 md:py-20">
        <Reveal>
          <Badge>About</Badge>
          <h1 className="mt-5 max-w-3xl text-[2.25rem] leading-[1.08] tracking-[-0.03em] md:text-[3.25rem]">
            One airframe, and a stubborn engineering problem.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-body">
            Hailstrum started at {company.university} in 2023 as a research
            question: why is last-mile delivery still the most expensive part of
            shipping, and what would it take for an aircraft to beat a van on
            cost? Two years of research later, we are building the answer.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Story() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <SectionHeading eyebrow="Our story" title="Research first, then metal" />
          <div className="mt-6 space-y-5 prose-body">
            <p>
              We spent two years — October 2023 to October 2025 — on the
              unglamorous part: understanding the real limitations of current
              drone technology and the operational challenges logistics
              businesses actually face. Not the pitch-deck version. The
              route-economics version.
            </p>
            <p>
              What came out of it was narrow and specific. Delivery drones don’t
              fail on ambition, they fail on energy budget. So rather than start
              with an airframe and hope, we started with propulsion efficiency
              and built outward: a wing so the aircraft isn’t fighting gravity
              the whole flight, a propeller matched to its cruise condition, and
              a GNC stack that treats energy as something to plan around.
            </p>
            <p>
              We prototype and manufacture out of UTS ProtoSpace in Sydney, and
              we post most of what we build — including the parts that
              fail — on{" "}
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              .
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <Card className="p-7 md:p-8">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Where we are
            </h3>
            <ul className="mt-6 space-y-6">
              {traction.map((item) => (
                <li key={item.title}>
                  <p className="font-display text-base font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-body">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

const STAGE_STYLES: Record<
  StageStatus,
  { dot: string; badge: string; label: string }
> = {
  complete: {
    dot: "bg-accent border-accent",
    badge: "bg-accent-soft text-accent-ink",
    label: "Complete",
  },
  current: {
    dot: "bg-surface border-accent ring-4 ring-accent-soft",
    badge: "bg-accent text-accent-contrast",
    label: "In progress",
  },
  upcoming: {
    dot: "bg-surface border-line-strong",
    badge: "bg-surface-2 text-ink-muted border border-line",
    label: "Planned",
  },
};

function Roadmap() {
  return (
    <Section tone="subtle">
      <Reveal>
        <SectionHeading
          eyebrow="Roadmap"
          title="Six stages from research to scale"
          body="Stage two never really closes — testing and refining is how the business stays alive, not a phase we pass through."
        />
      </Reveal>

      <ol className="mt-14 space-y-0">
        {roadmap.map((stage, i) => {
          const style = STAGE_STYLES[stage.status];
          const last = i === roadmap.length - 1;

          return (
            <Reveal key={stage.number} as="li" delay={i * 70}>
              <div className="grid grid-cols-[auto_1fr] gap-x-6">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 rounded-full border-2 ${style.dot}`}
                  />
                  {!last && (
                    <span
                      aria-hidden="true"
                      className="w-px flex-1 bg-line-strong"
                    />
                  )}
                </div>

                <div className={last ? "pb-0" : "pb-10"}>
                  <div className="-mt-1 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg">
                      <span className="tabular-nums text-ink-muted">
                        Stage {stage.number}
                      </span>
                      <span className="mx-2 text-ink-muted">·</span>
                      {stage.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  <p className="mt-1.5 font-display text-xs uppercase tracking-[0.1em] text-ink-muted">
                    {stage.window}
                  </p>
                  <p className="mt-3 max-w-2xl leading-relaxed text-ink-body">
                    {stage.body}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}

function Team() {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="The team"
          title="Co-founders"
          body="Second-year engineering students at UTS, building this around coursework, mostly at night."
        />
      </Reveal>

      <div className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {team.map((person, i) => (
          <Reveal key={person.name} delay={i * 80}>
            <Card hover className="h-full">
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-display text-base font-semibold text-accent-ink"
              >
                {person.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <h3 className="mt-5 text-base">{person.name}</h3>
              <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.1em] text-accent-ink">
                {person.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-body">
                {person.detail}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Numbers() {
  return (
    <Section tone="navy">
      <Reveal>
        <SectionHeading
          eyebrow="The model"
          title="Where this goes if it works"
          body="Figures below are projections from our ten-year model, not results. We are pre-revenue."
        />
      </Reveal>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {projections.map((item, i) => (
          <Reveal key={item.label} delay={i * 80}>
            <Stat
              value={item.value}
              label={item.label}
              note={item.note}
            />
          </Reveal>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <ButtonLink href="/contact" variant="subtle">
          Request the full deck
          <ArrowRight />
        </ButtonLink>
      </div>
    </Section>
  );
}
