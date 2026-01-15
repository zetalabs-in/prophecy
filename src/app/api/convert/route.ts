import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
    try {
        const { svg } = await req.json();

        if (!svg) {
            return NextResponse.json(
                { error: "SVG content is required" },
                { status: 400 }
            );
        }

        const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

        return new NextResponse(pngBuffer as any, {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": `attachment; filename="prophecy-${Date.now()}.png"`,
            },
        });
    } catch (error: any) {
        console.error("Error converting SVG to PNG:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
