import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from 'sharp';

async function generateProphecy(params: { apiKey: string, style?: string, source?: string, mode?: string }) {
    const { apiKey, style, source, mode } = params;

    if (!apiKey) {
        throw new Error("Gemini API Key is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
        generationConfig: {
            temperature: 1.2,
            topP: 0.95,
            topK: 40,
        }
    });

    // Define style-specific prompt instructions (Visual Vibe)
    const styleInstructions: Record<string, string> = {
        mystic: "Visual Vibe: Ancient, Magical, Enigmatic. Focus on mystery and spiritual depth.",
        minimalist: "Visual Vibe: Serene, Holy, Simple, Clear. Focus on clarity, peace, and fundamental truths.",
        obsidian: "Visual Vibe: Strong, Solid, Unshakable. Focus on endurance, strength, and power.",
        crimson: "Visual Vibe: Urgent, Powerful, Intense. Focus on warning, passion, or sacrifice.",
        retro: "Visual Vibe: Sci-fi, Visionary, Cybernetic. Focus on visions of the future and cosmic scale."
    };

    const currentStyleInstruction = styleInstructions[style as string] || styleInstructions["mystic"];

    // Defaults
    const currentSource = source || "Bible";
    const currentMode = mode || "Prophecy";

    // Step 1: Generate the Quote using Gemini
    const seed = Math.floor(Math.random() * 1000000);
    const prompt = `
            Act as a spiritual scholar and curator.
            Generate a UNIQUE, powerful quote from the **${currentSource}**.
            
            Theme/Mode: **${currentMode}**. 
            (Ensure the quote specifically relates to ${currentMode}).
            
            Style Context: ${currentStyleInstruction}
            
            Random Seed: ${seed}
            Maximum length: 30 words.
            
            Return a JSON object with:
            - "quote": The text of the verse/sloka.
            - "author": The specific reference (e.g., "Isaiah 40:1", "Surah Al-Sharh 94:5", "Bhagavad Gita 2.47").
            
            Example JSON: { "quote": "Your quote text here.", "author": "Book Reference 1:1" }
            DO NOT return markdown code blocks, just the raw JSON string.
        `;

    let quote = "";
    let author = "";

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/```json/g, "").replace(/```/g, "");
        try {
            const parsed = JSON.parse(text);
            quote = parsed.quote;
            author = parsed.author;
        } catch (e) {
            quote = text;
            author = currentSource;
        }
    } catch (error) {
        console.error("Gemini Quote Generation Error:", error);
        // Generic Fallback
        quote = "The light shines in the darkness, and the darkness has not overcome it.";
        author = "John 1:5";
    }

    // Step 2: Generate SVG Template Programmatically
    const width = 1320;
    const height = 2868;

    const styles: Record<string, { bg: string, text: string, accent: string, font: string, sub: string }> = {
        mystic: {
            bg: "radial-gradient(circle at center, #2d1b4e 0%, #000000 100%)",
            text: "#ffffff",
            accent: "#a855f7",
            sub: "#d8b4fe",
            font: "serif"
        },
        minimalist: {
            bg: "#f3f4f6",
            text: "#1f2937",
            accent: "#9ca3af",
            sub: "#6b7280",
            font: "sans-serif"
        },
        obsidian: {
            bg: "#09090b",
            text: "#e4e4e7",
            accent: "#27272a",
            sub: "#a1a1aa",
            font: "sans-serif"
        },
        crimson: {
            bg: "linear-gradient(to bottom, #450a0a, #000000)",
            text: "#fecaca",
            accent: "#7f1d1d",
            sub: "#f87171",
            font: "serif"
        },
        retro: {
            bg: "linear-gradient(to bottom, #1e1b4b, #2e1065)",
            text: "#22d3ee",
            accent: "#d946ef",
            sub: "#c084fc",
            font: " monospace"
        }
    };

    const currentStyle = styles[style as string] || styles["mystic"];

    // Helper to wrap text for SVG
    const wrapText = (text: string, maxCharsPerLine: number) => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            if (currentLine.length + 1 + words[i].length <= maxCharsPerLine) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const quoteLines = wrapText(quote, 20); // Wrap at ~20 chars for large text
    const quoteTspans = quoteLines.map((line, i) =>
        `<tspan x="${width / 2}" dy="${i === 0 ? 0 : '1.2em'}">${line}</tspan>`
    ).join("");

    // SVG Template - Native SVG Text (No foreignObject)
    const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" style="fill: ${currentStyle.bg};" />
            <rect x="60" y="60" width="${width - 120}" height="${height - 120}" fill="none" stroke="${currentStyle.accent}" stroke-width="4" opacity="0.5" />

            <!-- Main Quote -->
            <text x="${width / 2}" y="${height * 0.35}" text-anchor="middle" fill="${currentStyle.text}" font-family="${currentStyle.font === 'serif' ? 'serif' : 'sans-serif'}" font-size="84" font-weight="700">
                ${quoteTspans}
            </text>

            <!-- Separator Line -->
            <rect x="${(width - 120) / 2}" y="${height * 0.35 + (quoteLines.length * 100) + 40}" width="120" height="6" fill="${currentStyle.accent}" rx="3" />

            <!-- Author -->
            <text x="${width / 2}" y="${height * 0.35 + (quoteLines.length * 100) + 140}" text-anchor="middle" fill="${currentStyle.sub}" font-family="${currentStyle.font === 'serif' ? 'serif' : 'sans-serif'}" font-size="42" font-weight="400" letter-spacing="2" text-transform="uppercase">
                ${author}
            </text>
            
            <!-- Footer -->
            <text x="${width / 2}" y="${height - 150}" text-anchor="middle" fill="${currentStyle.text}" opacity="0.3" font-family="sans-serif" font-size="32" letter-spacing="8">PROPHECY</text>
        </svg>
        `.trim();

    return { svg, quote };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const apiKey = searchParams.get("apiKey") || "";
        const style = searchParams.get("style") || "";
        const source = searchParams.get("source") || "";
        const mode = searchParams.get("mode") || "";
        const format = searchParams.get("format") || "png"; // Default to png for shortcuts

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required" }, { status: 400 });
        }

        const { svg, quote } = await generateProphecy({ apiKey, style, source, mode });

        // If JSON is explicitly requested (e.g. for Frontend Preview)
        if (format === 'json') {
            return NextResponse.json({ svg, quote });
        }

        // Default: Return PNG (for Shortcuts/Download)
        const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

        return new NextResponse(pngBuffer as any, {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": `attachment; filename = "prophecy-${Date.now()}.png"`,
                "Content-Length": pngBuffer.length.toString(),
            }
        });

    } catch (error: any) {
        console.error("Error generating prophecy (GET):", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
