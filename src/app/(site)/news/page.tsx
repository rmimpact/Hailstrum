import type { Metadata } from "next";

import { LatestPosts } from "@/components/latest-posts";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "News",
  description:
    "Build notes, test flights and milestones from the Hailstrum team in Sydney.",
};

export default function NewsPage() {
  return (
    <>
      <section className="border-b border-line bg-bg-subtle">
        <div className="container-page py-16 md:py-20">
          <Reveal>
            <Badge>Build log</Badge>
            <h1 className="mt-5 max-w-3xl text-[2.25rem] leading-[1.08] tracking-[-0.03em] md:text-[3.25rem]">
              What we’re building, as we build it.
            </h1>
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-body">
              Test flights, print failures, CFD runs and the occasional
              milestone. Day-to-day photos go up on{" "}
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-ink underline underline-offset-4"
              >
                {company.instagramHandle}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-page">
          <LatestPosts />
        </div>
      </section>
    </>
  );
}
