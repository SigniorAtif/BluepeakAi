import type { Metadata } from "next";
import { ctas, heads } from "@/content/site";
import Page from "@/components/Page";
import PageHead from "@/components/PageHead";
import WorkFilter from "@/components/WorkFilter";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Work",
  description: "Websites and demos for law, healthcare, hospitality, retail and industrial businesses.",
};

export default function Work() {
  return (
    <Page>
      <PageHead head={heads.work} />
      <section className="bp-sec bp-sec-tight">
        <WorkFilter />
      </section>
      <CtaBand head={ctas.work} />
    </Page>
  );
}
