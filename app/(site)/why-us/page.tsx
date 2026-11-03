import type { Metadata } from "next";
import { ctas, deliveryProcess, difference, heads, pointOfView, reasons, values } from "@/content/site";
import Page from "@/components/Page";
import PageHead from "@/components/PageHead";
import Marquee from "@/components/Marquee";
import ScrollWords from "@/components/ScrollWords";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Why us",
  description: "Strategy first, connected thinking, clear communication, and direct work with the founder.",
};

export default function WhyUs() {
  return (
    <Page>
      <PageHead head={heads["why-us"]} />

      <section className="bp-sec bp-split">
        <div className="bp-sechead bp-sticky">
          <span className="bp-kicker">{difference.kicker}</span>
          <h2 className="bp-h2">
            {difference.title[0]} <span className="dim">{difference.title[1]}</span>
          </h2>
          <p>{difference.lede}</p>
        </div>
        <ol className="bp-reasons">
          {reasons.map((r, i) => (
            <li key={r.k} className="bp-rise">
              <span className="bp-reasons-k">
                0{i + 1} / {r.k}
              </span>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="bp-marquee-wrap bp-sec-gap" aria-hidden>
        <Marquee items={values} />
      </div>

      <section className="bp-sec bp-pov">
        <span className="bp-kicker">{pointOfView.kicker}</span>
        <h2 className="bp-pov-line">{pointOfView.line}</h2>
        <ScrollWords text={pointOfView.rest} className="bp-pov-rest" />
      </section>

      <section className="bp-sec">
        <div className="bp-sechead">
          <span className="bp-kicker">A straightforward process</span>
          <h2 className="bp-h2">Know what happens next.</h2>
        </div>
        <ol className="bp-ribbon">
          {deliveryProcess.map(({ t, d }, i) => (
            <li key={t}>
              <span className="bp-ribbon-dot" />
              <span className="bp-steps-n">0{i + 1}</span>
              <span className="bp-steps-t">{t}</span>
              <span className="bp-steps-d">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <CtaBand head={ctas["why-us"]} />
    </Page>
  );
}
