import { waLink } from "@/content/site";

/** Their main channel, always one tap away. Quiet until hovered. */
export default function ChatChip() {
  return (
    <a href={waLink()} target="_blank" rel="noopener noreferrer" className="bp-chat js-i-fade" aria-label="Chat with BluePeakAI on WhatsApp">
      <i aria-hidden />
      <span>Chat on WhatsApp</span>
    </a>
  );
}
