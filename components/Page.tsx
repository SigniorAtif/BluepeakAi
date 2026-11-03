import { ViewTransition } from "react";

/** A page's content: it blurs out to the left as you leave and rises in as you arrive. */
export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="bp-page-in" exit="bp-page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
