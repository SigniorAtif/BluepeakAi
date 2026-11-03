import { ViewTransition } from "react";
import PageReveal from "./PageReveal";

/**
 * A page's content. On an in-app navigation the old page lifts away and fades (view transition),
 * and the new page's headline rises line by line (PageReveal).
 */
export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="bp-page-in" exit="bp-page-out" default="none">
      <div>
        <PageReveal />
        {children}
      </div>
    </ViewTransition>
  );
}
