import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Field from "@/components/Field";
import ChatChip from "@/components/ChatChip";
import SmoothScroll from "@/components/SmoothScroll";
import { graph } from "@/lib/graph";
import { fieldLayout } from "@/lib/field-layout";
import { VariantProvider } from "@/components/variant";

// Laid out once per server process; the simulation is deterministic.
const graphs = graph();
const units = fieldLayout(graphs);

/*
 * Every page shares this frame, so the field, the nav and the footer never remount between pages:
 * the field glides to its new spot while the page content swaps under a view transition.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <VariantProvider value="a">
    <div className="bp-site" style={{ position: "relative" }}>
      <Field graphs={graphs} units={units} />
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <ChatChip />
      <SmoothScroll />
    </div>
    </VariantProvider>
  );
}
