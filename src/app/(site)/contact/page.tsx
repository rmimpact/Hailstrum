import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { Badge, Card } from "@/components/ui";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Hailstrum team about pilots, partnerships, investment or joining us in Sydney.",
};

export default function ContactPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <Badge>Contact</Badge>
            <h1 className="mt-5 text-[2.25rem] leading-[1.08] tracking-[-0.03em] md:text-[2.75rem]">
              Let’s talk.
            </h1>
            <p className="mt-5 leading-relaxed text-ink-body">
              We’re especially keen to hear from logistics operators willing to
              run a pilot, and from engineers who want to build autonomous
              aircraft in Sydney.
            </p>

            <dl className="mt-10 space-y-6">
              {company.email && (
                <div>
                  <dt className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Email
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={`mailto:${company.email}`}
                      className="text-[0.9375rem] text-accent-ink underline underline-offset-4"
                    >
                      {company.email}
                    </a>
                  </dd>
                </div>
              )}

              <div>
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Instagram
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={company.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.9375rem] text-accent-ink underline underline-offset-4"
                  >
                    {company.instagramHandle}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Based at
                </dt>
                <dd className="mt-1.5 text-[0.9375rem] text-ink-body">
                  {company.university}
                  <br />
                  {company.location}
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={120}>
            <Card className="p-7 md:p-9">
              <ContactForm />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
