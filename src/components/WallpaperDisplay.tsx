"use client";

import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { cn } from "@/lib/utils";

interface WallpaperDisplayProps {
    svgContent: string | null;
    loading: boolean;
    quote?: string;
}

export default function WallpaperDisplay({ svgContent, loading, quote }: WallpaperDisplayProps) {
    const handleDownload = async () => {
        if (!svgContent) return;

        try {
            const response = await fetch("/api/convert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ svg: svgContent }),
            });

            if (!response.ok) {
                console.error("Failed to convert image");
                alert("Failed to save image. Please try again.");
                return;
            }

            const blob = await response.blob();
            // Force the blob to be image/png
            const imageBlob = new Blob([blob], { type: "image/png" });
            const url = URL.createObjectURL(imageBlob);
            const timestamp = new Date().getTime();
            const a = document.createElement("a");
            a.href = url;
            a.download = `prophecy-wallpaper-${timestamp}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            alert("An error occurred while saving.");
        }
    };

    return (
        <div className="relative flex h-[600px] w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl md:h-[700px] md:max-w-md">
            {loading ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-white/50" />
                    <p className="text-sm uppercase tracking-widest text-white/50 animate-pulse">Divining...</p>
                </div>
            ) : svgContent ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full w-full flex-col items-center"
                >
                    <div
                        className="h-full w-full overflow-hidden rounded-2xl border border-white/5 shadow-inner flex items-center justify-center p-2"
                    >
                        <div
                            className="h-full w-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{
                                __html: svgContent.replace('<svg', '<svg style="width: 100%; height: 100%; object-fit: contain;"')
                            }}
                        />
                    </div>

                    <div className="mt-6 flex w-full gap-4">
                        <MagneticButton
                            className="flex-1 rounded-full border border-white/20 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            onClick={handleDownload}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Download size={16} /> Save
                            </span>
                        </MagneticButton>
                        <MagneticButton
                            className="flex-1 rounded-full border border-white/20 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Share2 size={16} /> Share
                            </span>
                        </MagneticButton>
                    </div>
                </motion.div>
            ) : (
                <div className="text-center text-white/20">
                    <p>Awaiting Prophecy...</p>
                </div>
            )}
        </div>
    );
}
