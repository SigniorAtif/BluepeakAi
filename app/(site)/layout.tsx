import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Field from "@/components/Field";
import ChatChip from "@/components/ChatChip";
import PrototypeBar from "@/components/PrototypeBar";

/*
 * Every page shares this frame, so the field, the nav and the footer never remount between pages:
 * the field glides to its new spot while the page content swaps under a view transition.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bp-site" style={{ position: "relative" }}>
      <Field />
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <ChatChip />
      <PrototypeBar />
    </div>
  );
}
