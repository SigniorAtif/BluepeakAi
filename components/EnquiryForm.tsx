"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, CheckCheck, Copy } from "lucide-react";
import { budgets, contact, enquiryNote, enquiryServices, type BudgetId, type EnquiryServiceId } from "@/content/site";
import { buildEnquiry, enquiryText } from "@/lib/whatsapp";
import { glide } from "./motion";

/*
 * The project enquiry. Nothing is sent anywhere: the form writes a WhatsApp message, the bubble
 * shows that exact message as you type, and Send opens WhatsApp with it filled in.
 */
export default function EnquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [service, setService] = useState<EnquiryServiceId | "">("");
  const [budget, setBudget] = useState<BudgetId | "">("");
  const [details, setDetails] = useState("");

  const blank = "…";
  const preview = enquiryText({
    name: name || blank,
    email: email || blank,
    business,
    service: (service || blank) as EnquiryServiceId,
    budget: budget || undefined,
    details: details || blank,
  });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    window.open(buildEnquiry({ name, email, business, service, budget: budget || undefined, details }), "_blank", "noopener,noreferrer");
  };

  return (
    <form className="bp-form" onSubmit={send}>
      <div className="bp-form-grid">
        <label className="bp-field-in">
          <span>Name</span>
          <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="bp-field-in">
          <span>Email</span>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="bp-field-in wide">
          <span>
            Business <em>optional</em>
          </span>
          <input autoComplete="organization" value={business} onChange={(e) => setBusiness(e.target.value)} />
        </label>
      </div>

      <Pills legend="What do you need?" name="service" items={enquiryServices} value={service} onChange={setService} required />
      <Pills legend="Budget" optional name="budget" items={budgets} value={budget} onChange={setBudget} />

      <label className="bp-field-in wide">
        <span>About the project</span>
        <textarea required rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What you want to improve, any links, and when you'd like to start." />
      </label>

      <div className="bp-wa" aria-live="polite">
        <div className="bp-wa-top">
          <span className="bp-wa-av" aria-hidden>
            B
          </span>
          <span>
            <b>BluePeakAI</b>
            <small>{contact.phone}</small>
          </span>
          <span className="bp-mono">Preview</span>
        </div>
        <div className="bp-wa-bubble">
          <pre>{preview}</pre>
          <span className="bp-wa-meta">
            now <CheckCheck size={14} />
          </span>
        </div>
      </div>

      <div className="bp-form-foot">
        <button type="submit" className="bp-btn primary lg">
          Open in WhatsApp <ArrowUpRight size={17} className="nudge" />
        </button>
        <p>{enquiryNote}</p>
      </div>
    </form>
  );
}

function Pills<T extends string>({
  legend,
  name,
  items,
  value,
  onChange,
  required,
  optional,
}: {
  legend: string;
  name: string;
  items: readonly { id: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <fieldset className="bp-pills">
      <legend>
        {legend} {optional && <em>optional</em>}
      </legend>
      <div>
        {items.map((x) => (
          <label key={x.id} data-on={value === x.id ? "1" : "0"}>
            <input type="radio" name={name} value={x.id} checked={value === x.id} onChange={() => onChange(x.id)} required={required} className="sr-only" />
            {value === x.id && <motion.span layoutId={`bp-pill-${name}`} className="bp-pill-fill" transition={glide} />}
            <span>{x.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Copies the email address, and says so for a moment. */
export function CopyEmail() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {}
  };
  return (
    <button type="button" className="bp-iconbtn" onClick={copy} aria-label={done ? "Email copied" : "Copy email address"}>
      {done ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}
