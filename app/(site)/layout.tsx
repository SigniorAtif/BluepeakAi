import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Field from "@/components/Field";
import ChatChip from "@/components/ChatChip";
import { cookies } from "next/headers";
import PrototypeBar from "@/components/PrototypeBar";
import { VariantProvider } from "@/components/variant";
import { VARIANT_COOKIE, asVariant } from "@/components/variant-shared";

/*
 * Every page shares this frame, so the field, the nav and the footer never remount between pages:
 * the field glides to its new spot while the page content swaps under a view transition.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const variant = asVariant((await cookies()).get(VARIANT_COOKIE)?.value);
  return (
    <VariantProvider value={variant}>
    <div className="bp-site" style={{ position: "relative" }}>
      <Field />
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <ChatChip />
      <PrototypeBar />
    </div>
    </VariantProvider>
  );
}
