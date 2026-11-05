import { legal } from "@/content/site";
import Page from "./Page";

/** Privacy and terms: short, plain, and marked as drafts until BluePeakAI signs them off. */
export default function LegalPage({ doc }: { doc: keyof typeof legal }) {
  const d = legal[doc];
  return (
    <Page>
      <article className="bp-legal">
        <p className="bp-eyebrow">
          <i />
          {d.updated}
        </p>
        <h1 className="bp-title">{d.title}</h1>
        {d.blocks.map((b, i) => (
          <section key={b.h}>
            <span className="bp-steps-n">0{i + 1}</span>
            <h2>{b.h}</h2>
            <p>{b.p}</p>
          </section>
        ))}
      </article>
    </Page>
  );
}
