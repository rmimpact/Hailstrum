import type { Metadata } from "next";

import { AircraftSchematic } from "@/components/aircraft-schematic";
import { EfficiencyChart } from "@/components/efficiency-chart";
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
import { projects, stork } from "@/lib/content";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "The Stork airframe, our high-efficiency propeller programme, and the GNC stack behind Hailstrum's autonomous logistics aircraft.",
};

export default function TechnologyPage() {
  return (
    <>
      <PageHero />
      <Airframe />
      <Propulsion />
      <Programmes />
      <Gnc />
    </>
  );
}

function PageHero() {
  return (
    <section className="border-b border-line bg-bg-subtle">
      <div className="container-page py-16 md:py-20">
        <Reveal>
          <Badge>Engineering</Badge>
          <h1 className="mt-5 max-w-3xl text-[2.25rem] leading-[1.08] tracking-[-0.03em] md:text-[3.25rem]">
            Range is an efficiency problem before it is a battery problem.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-body">
            Adding cells adds mass, and mass costs range — the returns stop
            quickly. The way to fly further is to waste less of the energy you
            already carry. That is what we build: an airframe that cruises on a
            wing, propulsion tuned to its operating point, and a control stack
            that flies the cheapest route rather than the shortest.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Airframe() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="The airframe"
            title={`${stork.name} — lift like a multirotor, cruise like a plane`}
            body="Pure multirotors burn their entire energy budget fighting gravity, which caps them at a few tens of kilometres. Fixed-wing aircraft cruise efficiently but need a runway at both ends — which last-mile delivery never has. Stork is a hybrid: rotors for vertical take-off and landing, a wing for the cruise in between."
          />

          <dl className="mt-10 grid grid-cols-2 gap-8">
            {stork.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="sr-only">{spec.label}</dt>
                <dd>
                  <Stat
                    value={spec.value}
                    unit={spec.unit}
                    label={spec.label}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <Card className="p-5 md:p-7">
            <AircraftSchematic className="w-full text-ink" />
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

function Propulsion() {
  return (
    <Section tone="subtle">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <Card className="p-6 md:p-8">
            <EfficiencyChart />
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading
            eyebrow="Propulsion"
            title="Past 80% propulsion efficiency"
            body="A propeller only works well across a narrow band of advance ratio — the relationship between how fast the aircraft moves forward and how fast the blade spins. Off-the-shelf props are compromises, designed for no particular aircraft, so they spend most of a flight off their best point."
          />

          <div className="mt-7 space-y-5 prose-body text-[0.9375rem]">
            <p>
              We design ours the other way round: pick the cruise condition
              first, then shape the blade for it using CFD and aerodynamic
              modelling. The modelled curve peaks at 86.0% — comfortably past
              our 80% design target — and, crucially, stays high across the band
              Stork actually cruises in.
            </p>
            <p>
              Modelling only counts once it survives contact with the air, so
              every candidate goes onto our own thrust rig and gets measured
              against the prediction before it flies.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Programmes() {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="Programmes"
          title="What we're actively building"
        />
      </Reveal>

      <div className="mt-12 space-y-6">
        {projects.map((project, i) => (
          <Reveal key={project.number} delay={i * 90}>
            <Card className="grid gap-8 p-7 md:grid-cols-[auto_1fr] md:p-9">
              <p className="font-display text-[3rem] font-semibold leading-none tracking-[-0.04em] text-accent-soft md:text-[4rem]">
                {project.number}
              </p>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl leading-snug">{project.title}</h3>
                  <Badge>{project.status}</Badge>
                </div>

                <p className="mt-3 leading-relaxed text-ink-body">
                  {project.body}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {project.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 text-sm leading-relaxed text-ink-body"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Gnc() {
  const layers = [
    {
      title: "Guidance",
      body: "Decides where the aircraft should go next — the route, the altitude, the energy plan. Optimising for cost per delivered kilogram rather than raw speed.",
    },
    {
      title: "Navigation",
      body: "Works out where the aircraft actually is, fusing GNSS with inertial sensing so position stays trustworthy when the signal degrades.",
    },
    {
      title: "Control",
      body: "Holds the aircraft on the plan through the transition between hover and wing-borne flight, which is where a hybrid VTOL is most fragile.",
    },
  ];

  return (
    <Section tone="navy">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="GNC"
            title="Reliability is the product"
            body="An autonomous aircraft carrying someone else's freight has to be predictable before it is impressive. Our embedded Guidance, Navigation and Control stack is the part a logistics operator is really buying."
          />
          <ButtonLink href="/contact" variant="subtle" className="mt-8">
            Talk to the team
            <ArrowRight />
          </ButtonLink>
        </Reveal>

        <Reveal delay={120}>
          <ol className="space-y-px overflow-hidden rounded-card border border-line bg-line">
            {layers.map((layer, i) => (
              <li key={layer.title} className="bg-bg-deep p-7">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-sm font-semibold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg !text-ink">{layer.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {layer.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}
