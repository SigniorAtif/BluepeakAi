import { describe, expect, it } from "vitest";
import { buildEnquiry, enquiryText } from "@/lib/whatsapp";

describe("enquiryText", () => {
  it("writes every field the visitor filled in, in the order they read the form", () => {
    const text = enquiryText({
      name: "Riya Patel",
      email: "riya@example.com",
      business: "Patel Sweets",
      service: "website",
      budget: "25-50k",
      details: "A site for our two shops with a cake order form.",
    });

    expect(text).toBe(
      [
        "Hi BluePeakAI, I'd like to discuss a project.",
        "",
        "Name: Riya Patel",
        "Email: riya@example.com",
        "Business: Patel Sweets",
        "Service: Business website",
        "Budget: ₹25,000–₹50,000",
        "",
        "A site for our two shops with a cake order form.",
      ].join("\n"),
    );
  });

  it("leaves out the optional lines the visitor skipped", () => {
    const text = enquiryText({
      name: "Dev",
      email: "dev@example.com",
      business: "   ",
      service: "multiple",
      details: "Not sure where to start.",
    });

    expect(text).toBe(
      [
        "Hi BluePeakAI, I'd like to discuss a project.",
        "",
        "Name: Dev",
        "Email: dev@example.com",
        "Service: Multiple services / not sure yet",
        "",
        "Not sure where to start.",
      ].join("\n"),
    );
  });
});

describe("buildEnquiry", () => {
  it("opens a chat with BluePeakAI's number, carrying the message intact", () => {
    const url = new URL(
      buildEnquiry({ name: "A & B", email: "ab@example.com", service: "chatbot", budget: "1l-plus", details: "Line one\nLine two?" }),
    );

    expect(url.origin + url.pathname).toBe("https://wa.me/919510225364");
    expect(url.searchParams.get("text")).toBe(
      [
        "Hi BluePeakAI, I'd like to discuss a project.",
        "",
        "Name: A & B",
        "Email: ab@example.com",
        "Service: AI chatbot",
        "Budget: ₹1,00,000+",
        "",
        "Line one\nLine two?",
      ].join("\n"),
    );
  });
});
