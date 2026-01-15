import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import satori from 'satori';

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
            Act as a spiritual curator.
            Generate a UNIQUE, powerful quote from the **${currentSource}**.
            
            Theme/Mode: **${currentMode}**. 
            Visual Style: ${currentStyleInstruction}
            
            Random Seed: ${seed}
            Maximum length: 30 words.
            
            STRICT INSTRUCTION:
            Return ONLY a raw JSON object. No markdown, no "\`\`\`json" wrappers, no intro text, no labels like "Theme: ".
            
            JSON Structure:
            { 
              "quote": "The exact text of the verse or quote.", 
              "author": "Name of Author & Reference (e.g. John 1:5)" 
            }
            
            Ensure "author" contains ONLY the source name / reference, nothing else.
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

    // Load Font (Cinzel)
    const fontPath = path.join(process.cwd(), 'src/fonts/Cinzel-Regular.ttf');
    const fontBuffer = fs.readFileSync(fontPath);

    // Satori Template (React JSX)
    // We use a large flex container with the style's visual properties
    const svg = await satori(
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: currentStyle.bg,
                position: 'relative',
            }}
        >
            {/* Border Frame */}
            <div
                style={{
                    position: 'absolute',
                    top: 60,
                    left: 60,
                    right: 60,
                    bottom: 60,
                    border: `4px solid ${currentStyle.accent}`,
                    opacity: 0.5,
                }}
            />

            {/* Content Container */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '70%',
                }}
            >
                {/* Quote */}
                <p
                    style={{
                        margin: 0,
                        padding: 0,
                        fontSize: 84,
                        fontFamily: 'Cinzel',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: currentStyle.text,
                        textAlign: 'center',
                    }}
                >
                    "{quote}"
                </p>

                {/* Separator */}
                <div
                    style={{
                        marginTop: 80,
                        marginBottom: 60,
                        width: 120,
                        height: 6,
                        backgroundColor: currentStyle.accent,
                        borderRadius: 3,
                    }}
                />

                {/* Author */}
                <p
                    style={{
                        margin: 0,
                        fontSize: 42,
                        fontFamily: 'Cinzel',
                        fontWeight: 400,
                        letterSpacing: 2,
                        color: currentStyle.sub,
                        textTransform: 'uppercase',
                        textAlign: 'center',
                    }}
                >
                    {author}
                </p>
            </div>

            {/* Footer */}
            <p
                style={{
                    position: 'absolute',
                    bottom: 120,
                    fontSize: 32,
                    fontFamily: 'sans-serif',
                    letterSpacing: 8,
                    color: currentStyle.text,
                    opacity: 0.3,
                    margin: 0,
                }}
            >
                PROPHECY
            </p>
        </div>,
        {
            width,
            height,
            fonts: [
                {
                    name: 'Cinzel',
                    data: fontBuffer,
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Cinzel',
                    data: fontBuffer,
                    weight: 700,
                    style: 'normal',
                }
            ],
        }
    );

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
