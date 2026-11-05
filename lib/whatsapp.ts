import { budgets, enquiryServices, waLink, type BudgetId, type EnquiryServiceId } from "@/content/site";

export type Enquiry = {
  name: string;
  email: string;
  business?: string;
  service: EnquiryServiceId;
  budget?: BudgetId;
  details: string;
};

const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) => list.find((x) => x.id === id)?.label ?? id;

/** The message the contact form hands to WhatsApp. The live preview on /contact shows exactly this. */
export function enquiryText(e: Enquiry): string {
  const business = e.business?.trim();
  return [
    "Hi BluePeakAI, I'd like to discuss a project.",
    "",
    `Name: ${e.name.trim()}`,
    `Email: ${e.email.trim()}`,
    business ? `Business: ${business}` : null,
    `Service: ${label(enquiryServices, e.service)}`,
    e.budget ? `Budget: ${label(budgets, e.budget)}` : null,
    "",
    e.details.trim(),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** A wa.me link that opens a chat with BluePeakAI, the message filled in for the visitor to review and send. */
export function buildEnquiry(e: Enquiry): string {
  return waLink(enquiryText(e));
}
