/*
 * Every word and link on the site, in one place. The facts come from bluepeakai.in as it stood in
 * November 2026, trimmed for rhythm; nothing here is invented. Swapping a demo link for a
 * subdomain later is a one-line change in `projects`.
 */

export const brand = {
  name: "BluePeakAI",
  tagline: "Ideas that automate.",
  tagline2: "Strategies that grow.",
  founder: "Ayushi Krunal Shah",
  founderShort: "Ayushi Shah",
  url: "https://bluepeakai.in",
  city: "Vadodara, Gujarat, India",
  coords: "22.31°N 73.18°E",
  reach: "Vadodara · working with Indian and international businesses",
  sign: "Built for better business growth.",
};

export const contact = {
  email: "ai.bluepeak@gmail.com",
  phone: "+91 95102 25364",
  wa: "919510225364",
  social: [
    { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@BusinessByAyushi" },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/ayushi-shah-a05116354" },
    { id: "instagram", label: "Instagram", href: "https://www.instagram.com/businessby_ayushi" },
  ],
};

export const waLink = (text = "Hi BluePeakAI, I'd like to discuss a project.") =>
  `https://wa.me/${contact.wa}?text=${encodeURIComponent(text)}`;

export type PageId = "home" | "services" | "work" | "why-us" | "about" | "contact";

export const pages: { id: PageId; href: string; label: string }[] = [
  { id: "home", href: "/", label: "Home" },
  { id: "services", href: "/services", label: "Services" },
  { id: "work", href: "/work", label: "Work" },
  { id: "why-us", href: "/why-us", label: "Why us" },
  { id: "about", href: "/about", label: "About" },
  { id: "contact", href: "/contact", label: "Contact" },
];

export type ServiceId = "websites" | "automation" | "whatsapp" | "social" | "connected";

export const services: {
  id: ServiceId;
  short: string;
  kicker: string;
  title: string;
  line: string;
  lead: string;
  note?: string;
  points: string[];
}[] = [
  {
    id: "websites",
    short: "Websites & landing pages",
    kicker: "Digital presence",
    title: "Business websites & landing pages",
    line: "Responsive sites that explain your value, earn trust and turn visitors into enquiries.",
    lead: "Your website should do more than look good. It should make your offer clear, earn trust and guide the right visitors to a useful next step.",
    points: [
      "Responsive multi-page business websites",
      "Campaign and lead-generation landing pages",
      "Service, portfolio and product catalogue pages",
      "Contact forms and WhatsApp enquiry journeys",
      "On-page SEO foundations and launch support",
    ],
  },
  {
    id: "automation",
    short: "AI automation",
    kicker: "Intelligent workflows",
    title: "AI automation & chatbots",
    line: "Practical agents, chatbots and workflows that cut repetitive work and speed up replies.",
    lead: "AI where it creates practical value: answering common questions, routing enquiries and taking repetitive admin off your team.",
    points: [
      "AI chatbot and FAQ experiences",
      "Lead qualification and enquiry routing",
      "Workflow automation between supported tools",
      "AI assistants designed for defined business tasks",
      "Planning, testing and handover documentation",
    ],
  },
  {
    id: "whatsapp",
    short: "WhatsApp systems",
    kicker: "Customer communication",
    title: "WhatsApp systems",
    line: "Lead capture, reminders and follow-ups that keep your team close to customers.",
    lead: "Make it easy for customers to reach you, and for your team to keep conversations moving.",
    note: "API-based messaging depends on platform approval and the applicable messaging rules.",
    points: [
      "Click-to-WhatsApp enquiry journeys",
      "Lead capture and structured enquiry details",
      "Reminder and follow-up workflow design",
      "WhatsApp Business Platform integrations where suitable",
      "Human handoff and clear conversation paths",
    ],
  },
  {
    id: "social",
    short: "Social media",
    kicker: "Brand visibility",
    title: "Social media strategy & content",
    line: "Strategy, content, reels, publishing and reporting that keep your brand consistent.",
    lead: "A more consistent brand presence, with content planned around your audience, your offer and your goals.",
    points: [
      "Content strategy and monthly planning",
      "Creative concepts, captions and reels",
      "Publishing and engagement support",
      "Performance reporting and next-step recommendations",
      "Brand consistency across your social channels",
    ],
  },
  {
    id: "connected",
    short: "Connected journeys",
    kicker: "Connected experiences",
    title: "Connected business journeys",
    line: "Your website, enquiries and customer conversations, brought together into one journey.",
    lead: "Bring your digital presence and customer processes together, instead of treating every tool as a separate project.",
    points: [
      "Website-to-WhatsApp enquiry flows",
      "CRM and lead-management integrations",
      "Automation discovery and process mapping",
      "Custom scope based on your current tools",
    ],
  },
];

export const process4 = [
  { t: "Discover", d: "Understand your business, audience, goals and current challenges." },
  { t: "Strategy", d: "Agree the right scope, priorities and success criteria." },
  { t: "Build", d: "Create the experience, workflows and integrations your project needs." },
  { t: "Launch & grow", d: "Launch carefully, learn from feedback, plan the next improvement." },
];

export const process5 = [
  { t: "Discover", d: "We talk through your business, audience, needs and what success should look like." },
  { t: "Strategy", d: "We define the scope, priorities, timeline and quote together." },
  { t: "Build", d: "We design and develop the agreed solution, reviewing key decisions along the way." },
  { t: "Launch", d: "We check the experience, prepare the handover and coordinate the launch." },
  { t: "Grow", d: "We find useful next improvements as your needs and feedback change." },
];

export const deliveryProcess = [
  { t: "Discovery call", d: "Share your business, your current challenges and what you want to improve." },
  { t: "Tailored proposal", d: "Receive a recommended scope, timeline, deliverables and quote." },
  { t: "Collaborative delivery", d: "Review the work at agreed milestones, with decisions kept visible." },
  { t: "Launch and next steps", d: "Prepare the handover and discuss any ongoing support separately." },
];

export const reasons = [
  {
    k: "Strategy first",
    t: "We start with the why.",
    d: "Before choosing tools or visuals, we learn your audience, offer, bottlenecks and goals. The scope is shaped around the problem, not technology for its own sake.",
  },
  {
    k: "Connected thinking",
    t: "Your digital presence should work together.",
    d: "Website, lead capture, WhatsApp and social content are planned as parts of one customer journey, not as separate tasks.",
  },
  {
    k: "Clear communication",
    t: "No mystery around the process.",
    d: "Deliverables, responsibilities, timelines and pricing are agreed before the build. You get one point of contact and a say in the important decisions.",
  },
  {
    k: "Practical by design",
    t: "Useful beats complicated.",
    d: "Solutions that fit your needs and resources. We explain trade-offs, avoid needless complexity and keep maintenance in mind.",
  },
  {
    k: "Built to evolve",
    t: "Launch is a beginning, not a magic trick.",
    d: "We help you find sensible next improvements as your business and customer feedback develop. Results depend on execution, market conditions and continued effort.",
  },
  {
    k: "Founder-led care",
    t: "Work directly with the founder.",
    d: "Discuss the brief, priorities and creative direction with Ayushi herself, an attentive partner rather than a chain of contacts.",
  },
];

export const values = ["Thoughtful design", "Practical automation", "Transparent scope", "Responsive experience", "Customer-first journeys"];

export type Industry = "law" | "health" | "hospitality" | "retail" | "industrial";

export const industries: { id: Industry; label: string }[] = [
  { id: "law", label: "Law & professional services" },
  { id: "health", label: "Healthcare" },
  { id: "hospitality", label: "Hospitality" },
  { id: "retail", label: "Retail & lifestyle" },
  { id: "industrial", label: "Industrial" },
];

/** `kind` is their own word for each project: a concept, a demo, or a live client site. */
export type Project = {
  id: string;
  name: string;
  industry: Industry;
  sector: string;
  kind: "Concept" | "Demo" | "Live site";
  headline: [string, string];
  about: string;
  tags: [string, string];
  href: string;
  shot: string;
};

export const projects: Project[] = [
  {
    id: "meridian",
    name: "Meridian Cross Law Firm",
    industry: "law",
    sector: "Legal",
    kind: "Concept",
    headline: ["Clarity for", "complex matters."],
    about: "A law-firm site that communicates professional credibility, outlines legal services and makes enquiries straightforward.",
    tags: ["Legal services", "Lead enquiries"],
    href: "https://meridian-cross-law-firm-1.vercel.app/",
    shot: "/work/meridian.webp",
  },
  {
    id: "smile",
    name: "My Smile Dental Clinic",
    industry: "health",
    sector: "Dental care",
    kind: "Concept",
    headline: ["A brighter smile", "starts here."],
    about: "A clinic site that introduces dental services, builds patient confidence and guides visitors toward an appointment.",
    tags: ["Clinic services", "Appointments"],
    href: "https://my-smile-dental-clinic.vercel.app/",
    shot: "/work/smile.webp",
  },
  {
    id: "restaurant",
    name: "The Restaurant",
    industry: "hospitality",
    sector: "Restaurant",
    kind: "Concept",
    headline: ["A table worth", "coming back to."],
    about: "Menu discovery, venue imagery, guest reviews and a reservation-focused customer journey.",
    tags: ["Menu & gallery", "Reservations"],
    href: "https://restaurant-gamma-ivory.vercel.app/",
    shot: "/work/restaurant.webp",
  },
  {
    id: "leela",
    name: "Leela Jewellery",
    industry: "retail",
    sector: "Jewellery",
    kind: "Concept",
    headline: ["Timeless pieces.", "Personal meaning."],
    about: "Collections presented in an elegant visual style, helping shoppers explore featured pieces.",
    tags: ["Collections", "Product showcase"],
    href: "https://leela-jewellery.vercel.app/",
    shot: "/work/leela.webp",
  },
  {
    id: "glizz",
    name: "Glizz Beauty School",
    industry: "retail",
    sector: "Beauty education",
    kind: "Demo",
    headline: ["Learn your craft.", "Own your artistry."],
    about: "Courses, training opportunities and enquiry paths for aspiring beauty professionals.",
    tags: ["Courses", "Training enquiries"],
    href: "https://glizz-beauty-school-demo.vercel.app/",
    shot: "/work/glizz.webp",
  },
  {
    id: "jaynarayan",
    name: "Jay Narayan Marble & Ceramic",
    industry: "industrial",
    sector: "Marble & ceramic",
    kind: "Concept",
    headline: ["Surfaces that", "shape spaces."],
    about: "Marble and ceramic options presented clearly, helping customers discover the right product.",
    tags: ["Product catalogue", "Materials"],
    href: "https://jay-narayan-marble-ceramic.vercel.app/",
    shot: "/work/jaynarayan.webp",
  },
  {
    id: "suresh",
    name: "Suresh Enterprise",
    industry: "industrial",
    sector: "Industrial",
    kind: "Live site",
    headline: ["Made for industry.", "Built on trust."],
    about: "An industrial business site with a product catalogue and a direct WhatsApp enquiry path.",
    tags: ["Product catalogue", "WhatsApp enquiries"],
    href: "https://sureshenterprise.in/",
    shot: "/work/suresh.webp",
  },
  {
    id: "bakery",
    name: "Blush & Batter",
    industry: "hospitality",
    sector: "Bakery",
    kind: "Concept",
    headline: ["A little sweetness", "in every detail."],
    about: "A warm, product-led bakery site with a cake-booking flow.",
    tags: ["Bakery showcase", "Cake bookings"],
    href: "https://bakery-mu-eosin.vercel.app/",
    shot: "/work/bakery.webp",
  },
];

export const featured = ["bakery", "suresh", "restaurant"];

export const founderStory = [
  "I'm Ayushi Krunal Shah, founder of BluePeakAI, a digital solutions business in Vadodara, Gujarat.",
  "I started it on a simple belief: businesses deserve practical digital tools that help them communicate better, work smarter and make room to grow.",
  "My work spans business websites, landing pages, AI chatbots, WhatsApp workflows and social media. The aim is to pair the right strategy with careful execution, so a business looks better online and its customers are looked after better.",
  "Every project starts with understanding the business, not with picking a technology. I keep the process collaborative, clear and focused on the problem that matters most.",
];

export const promise = "Clear communication, practical solutions, and scope agreed before work begins.";

export const faqs = [
  {
    q: "How is pricing decided?",
    a: "By scope, features, integrations and timeline. We go through your requirements on a call and send a tailored quote.",
  },
  {
    q: "What are your payment terms?",
    a: "50% in advance to start, and the balance before launch. Domain and hosting are billed separately.",
  },
  {
    q: "Do you work with businesses outside India?",
    a: "Yes. BluePeakAI works with Indian and international clients. Scope and how we communicate are agreed before work begins.",
  },
  {
    q: "Can you connect WhatsApp automation?",
    a: "We can plan click-to-WhatsApp journeys and, where it fits, integrations through supported business APIs. What's possible depends on the platform's approval and your use case.",
  },
];

export const enquiryServices = [
  { id: "website", label: "Business website" },
  { id: "landing", label: "Landing page" },
  { id: "automation", label: "AI automation" },
  { id: "chatbot", label: "AI chatbot" },
  { id: "whatsapp", label: "WhatsApp system" },
  { id: "social", label: "Social media" },
  { id: "multiple", label: "Multiple services / not sure yet" },
] as const;

export const budgets = [
  { id: "call", label: "Prefer to discuss on a call" },
  { id: "under-25k", label: "Under ₹25,000" },
  { id: "25-50k", label: "₹25,000–₹50,000" },
  { id: "50k-1l", label: "₹50,000–₹1,00,000" },
  { id: "1l-plus", label: "₹1,00,000+" },
  { id: "intl", label: "International / another currency" },
] as const;

export type EnquiryServiceId = (typeof enquiryServices)[number]["id"];
export type BudgetId = (typeof budgets)[number]["id"];

/** Each inner page's opening: a kicker, a headline in two tones, and a lede. Their words. */
export type Head = { kicker: string; title: [string, string]; lede: string };

export const heads: Record<"services" | "work" | "why-us" | "about" | "contact", Head> = {
  services: {
    kicker: "Our services",
    title: ["Build a stronger digital business", "from the ground up."],
    lede: "Choose the support you need today, or combine services into one connected system. Every engagement starts with a conversation about your goals.",
  },
  work: {
    kicker: "Selected work",
    title: ["Digital experiences", "for businesses with ambition."],
    lede: "Websites and demos across different industries, each designed around its audience, its offer and the next step it wants customers to take.",
  },
  "why-us": {
    kicker: "Why BluePeakAI",
    title: ["Not just a vendor.", "A growth-minded partner."],
    lede: "Strategy, design and practical technology together: a sharper online presence, more thoughtful replies to customers, and systems that grow with you.",
  },
  about: {
    kicker: "About BluePeakAI and its founder",
    title: ["Good technology should make", "business feel simpler."],
    lede: "BluePeakAI brings digital experiences, AI-powered workflows and customer communication together, to help businesses move forward with clarity.",
  },
  contact: {
    kicker: "Let's talk",
    title: ["Tell us what you're building.", "We'll help map the next step."],
    lede: "Share a little about your business and goals. We'll use it to start a useful conversation and talk through a tailored quote on a call.",
  },
};

/** The closing band on each page. */
export const ctas: Record<"home" | "services" | "work" | "why-us" | "about", Head> = {
  home: {
    kicker: "Have a project in mind?",
    title: ["Let's make your next move", "your smartest one."],
    lede: "Tell us what you want to improve. We'll talk through your goals, suggest a practical direction and share a tailored quote on a call.",
  },
  services: {
    kicker: "Start with a conversation",
    title: ["Not sure what", "your business needs?"],
    lede: "We'll understand how you work first and recommend a practical scope. Pricing is discussed on a call once we understand the project.",
  },
  work: {
    kicker: "Your next project",
    title: ["Let's build something", "worth showing."],
    lede: "Tell us what your business needs. We'll map the right approach around your customers, goals and scope.",
  },
  "why-us": {
    kicker: "Let's build with intention",
    title: ["Your next stage deserves", "a better system."],
    lede: "Tell us where you want to go. We'll help you explore a practical first step, without pressure or exaggerated promises.",
  },
  about: {
    kicker: "Work with BluePeakAI",
    title: ["Have an idea you want", "to bring to life?"],
    lede: "Let's talk through the opportunity and work out a practical next step.",
  },
};

export const difference = {
  kicker: "The difference",
  title: ["Built around your business,", "not a one-size-fits-all package."] as [string, string],
  lede: "Good work starts with the right questions. We focus on what your customers need, what your team can maintain and what makes sense for your stage of growth.",
};

export const pointOfView = {
  kicker: "Our point of view",
  line: "Technology should create momentum.",
  rest: "Not a pile of tools. Not complexity for its own sake. Just the right digital experience and systems for the next stage of your business.",
};

export const founderHead: [string, string] = ["Building with curiosity.", "Growing with purpose."];
export const founderCoda = "Through BluePeakAI, I keep exploring how technology and entrepreneurship can come together to solve practical business challenges.";

export const enquiryNote =
  "This form doesn't store or email your details. It opens WhatsApp with your message filled in; review it and press Send. You can also email us directly.";

/** Drafts for BluePeakAI to review before launch. Only what the site and their FAQ already say. */
export const legal = {
  privacy: {
    title: "Privacy",
    updated: "Draft, November 2026",
    blocks: [
      { h: "What this site collects", p: "Nothing about you is stored by this site. There are no analytics, no tracking pixels and no advertising cookies." },
      { h: "The enquiry form", p: "The form never sends your details to us or to a server. It builds a WhatsApp message in your browser and opens WhatsApp, where you review it and choose whether to send it." },
      { h: "WhatsApp and email", p: "Messages you send on WhatsApp are handled under Meta's terms and privacy policy. Emails you send reach our Gmail inbox and are handled under Google's. We use what you send only to reply and discuss your project." },
      { h: "Preferences", p: "Your theme and accent choice are kept in your own browser's local storage so the site remembers them. They never leave your device." },
      { h: "Questions", p: `Write to ${contact.email} about anything on this page.` },
    ],
  },
  terms: {
    title: "Terms",
    updated: "Draft, November 2026",
    blocks: [
      { h: "Scope and quotes", p: "Every project is scoped and quoted individually, after a call about your requirements. Deliverables, responsibilities, timelines and pricing are agreed before the build begins." },
      { h: "Payment", p: "50% in advance to start, and the balance before launch. Domain and hosting are billed separately." },
      { h: "Projects on this site", p: "The work shown here includes concepts, demos and live client sites, each labelled as such. Links open sites hosted elsewhere." },
      { h: "Results", p: "We build carefully and plan sensible next steps, but results depend on execution, market conditions and continued effort. Nothing on this site is a guarantee of business outcomes." },
      { h: "WhatsApp automation", p: "What is possible with WhatsApp business APIs depends on the platform's approval and your use case, and is confirmed during scoping." },
    ],
  },
};
