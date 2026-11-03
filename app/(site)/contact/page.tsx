import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { brand, contact, faqs, heads, waLink } from "@/content/site";
import Page from "@/components/Page";
import PageHead from "@/components/PageHead";
import EnquiryForm, { CopyEmail } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell BluePeakAI what you're building. Message on WhatsApp, email, or send a project enquiry.",
};

export default function Contact() {
  return (
    <Page>
      <section className="bp-contact">
        <div className="bp-contact-l">
          <PageHead head={heads.contact} />
        </div>

        <div className="bp-contact-r">
          <ul className="bp-details">
            <li>
              <MessageCircle size={18} />
              <span>
                <small className="bp-mono">WhatsApp</small>
                <a href={waLink()} target="_blank" rel="noopener noreferrer">
                  {contact.phone} <ArrowUpRight size={14} />
                </a>
              </span>
            </li>
            <li>
              <Mail size={18} />
              <span>
                <small className="bp-mono">Email</small>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </span>
              <CopyEmail />
            </li>
            <li>
              <MapPin size={18} />
              <span>
                <small className="bp-mono">Location</small>
                <span>
                  {brand.city}. <span className="faint">Working with Indian and international businesses.</span>
                </span>
              </span>
            </li>
          </ul>

          <div className="bp-sechead">
            <span className="bp-kicker">Project enquiry</span>
            <p>Fill this in and your details become a WhatsApp message for you to review and send.</p>
          </div>
          <EnquiryForm />
        </div>
      </section>

      <section className="bp-sec bp-split">
        <div className="bp-sechead bp-sticky">
          <span className="bp-kicker">A few quick answers</span>
          <h2 className="bp-h2">Before we get started.</h2>
        </div>
        <div className="bp-faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <span aria-hidden className="bp-faq-x" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Page>
  );
}
