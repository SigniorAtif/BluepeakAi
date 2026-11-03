import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Field from "@/components/Field";
import ChatChip from "@/components/ChatChip";
import { graph } from "@/lib/graph";
import { fieldLayout } from "@/lib/field-layout";
import { cookies } from "next/headers";
import PrototypeBar from "@/components/PrototypeBar";
import { VariantProvider } from "@/components/variant";
import { VARIANT_COOKIE, asVariant } from "@/components/variant-shared";

// Laid out once per server process; the simulation is deterministic.
const graphs = graph();
const units = fieldLayout(graphs);

/*
 * Every page shares this frame, so the field, the nav and the footer never remount between pages:
 * the field glides to its new spot while the page content swaps under a view transition.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const variant = asVariant((await cookies()).get(VARIANT_COOKIE)?.value);
  return (
    <VariantProvider value={variant}>
    <div className="bp-site" style={{ position: "relative" }}>
      <Field graphs={graphs} units={units} />
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <ChatChip />
      <PrototypeBar />
    </div>
    </VariantProvider>
  );
}
