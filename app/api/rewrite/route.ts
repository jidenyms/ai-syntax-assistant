import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const instructions: Record<string, string> = {
  concise: "Make the text substantially more concise while preserving every essential point.",
  tone: "Improve clarity, flow, grammar, and tone. Make it polished, confident, and professional without sounding robotic.",
  examples: "Strengthen the text by adding one or two specific, relevant examples. Do not invent unverifiable personal facts.",
  elaborate: "Expand the text with useful detail, stronger transitions, and deeper explanation while avoiding filler.",
  simplify: "Rewrite the text in plain, accessible English using shorter sentences and simpler vocabulary.",
  summarize: "Create a compact, accurate summary containing only the most important ideas.",
};

export async function POST(request: Request) {
  try {
    const { text, action } = (await request.json()) as { text?: string; action?: string };

    if (!text?.trim() || !action || !instructions[action]) {
      return NextResponse.json({ error: "Please provide text and choose a valid action." }, { status: 400 });
    }
    if (text.length > 12000) {
      return NextResponse.json({ error: "Please keep documents under 12,000 characters." }, { status: 400 });
    }
    const response = await generateText({
      model: gateway(process.env.OPENAI_MODEL || "openai/gpt-5-mini"),
      system:
        "You are Syntax AI, an expert writing editor. Return only the revised text—no headings, commentary, quotation marks, or markdown fences. Preserve the writer's meaning and language unless the requested action requires a change.",
      prompt: `${instructions[action]}\n\nTEXT TO EDIT:\n${text}`,
    });

    const output = response.text?.trim();
    if (!output) throw new Error("The model returned an empty response.");
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Rewrite request failed", error);
    return NextResponse.json({ error: "Syntax AI could not process this request. Please try again." }, { status: 500 });
  }
}
