"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import WallpaperDisplay from "@/components/WallpaperDisplay";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState("");

  // Configuration State
  const [selectedStyle, setSelectedStyle] = useState("mystic");
  const [selectedSource, setSelectedSource] = useState("Bible");
  const [selectedMode, setSelectedMode] = useState("Prophecy");
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only showing URL client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const styles = [
    { id: "mystic", label: "Mystic", color: "bg-purple-500" },
    { id: "minimalist", label: "Minimalist", color: "bg-gray-200" },
    { id: "obsidian", label: "Obsidian", color: "bg-gray-900" },
    { id: "crimson", label: "Crimson", color: "bg-red-900" },
    { id: "retro", label: "Retro", color: "bg-cyan-500" },
  ];

  const sources = ["Bible", "Quran", "Bhagavad Gita"];
  const modes = ["Prophecy", "Motivation", "Love", "Inspiration", "Success Mantra", "Peace"];

  const handleGenerate = async () => {
    if (!apiKey) return;
    setLoading(true);
    setSvgContent(null);

    try {
      // Build query string
      const params = new URLSearchParams({
        apiKey,
        style: selectedStyle,
        source: selectedSource,
        mode: selectedMode,
        format: "json" // Request JSON for preview
      });

      const res = await fetch(`/api/generate?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.svg) {
        setSvgContent(data.svg);
        setCurrentQuote(data.quote);
      } else {
        alert("Failed to divine: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-auto bg-black p-4 text-white selection:bg-purple-500/30">
      <div className="z-10 flex w-full max-w-7xl flex-col gap-12 py-10 lg:flex-row lg:items-start lg:justify-center">

        {/* Left Column: Title & Form */}
        <div className="flex w-full flex-col items-center lg:w-1/2 lg:max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-5xl font-bold text-transparent md:text-7xl tracking-tighter">
              Prophecy
            </h1>
            <p className="mt-4 text-white/50">
              Digital divination for your lockscreen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 flex w-full flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md"
          >
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/30">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/20 outline-none transition-all focus:border-purple-500/50 focus:bg-black/40"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/30">
                  Source Text
                </label>
                <div className="flex flex-wrap gap-2">
                  {sources.map((src) => (
                    <button
                      key={src}
                      onClick={() => setSelectedSource(src)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${selectedSource === src
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/30">
                  Mode / Vibe
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none transition-all focus:border-purple-500/50 focus:bg-black/40"
                >
                  {modes.map(mode => (
                    <option key={mode} value={mode} className="bg-black text-white">{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/30">
                Aesthetic Style
              </label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${selectedStyle === s.id
                      ? "border-white bg-white/10 text-white"
                      : "border-white/10 bg-transparent text-white/50 hover:border-white/30 hover:text-white"
                      }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <MagneticButton
              className="group relative mt-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white transition-transform active:scale-95 shadow-lg shadow-purple-500/25"
              onClick={handleGenerate}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 py-4 font-bold tracking-wide">
                {loading ? (
                  "Divining..."
                ) : (
                  <>
                    <Sparkles size={18} className="fill-white" />
                    Invoke Prophecy
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </MagneticButton>

            {/* API Shortcut Section */}
            <div className="mt-6 w-full rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/30">
                  Automation Shortcut
                </label>
                <span className="text-[10px] text-red-400/80">Contains API Key</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2">
                <code
                  suppressHydrationWarning
                  className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-xs text-white/50 font-mono"
                >
                  {mounted ?
                    `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/generate?apiKey=${apiKey || 'KEY'}&style=${selectedStyle}&source=${selectedSource}&mode=${selectedMode}&format=png`
                    : 'Loading...'}
                </code>
                <button
                  onClick={() => {
                    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                    const url = `${origin}/api/generate?apiKey=${apiKey}&style=${selectedStyle}&source=${selectedSource}&mode=${selectedMode}&format=png`;
                    navigator.clipboard.writeText(url);
                    alert("Copied to clipboard! USE WITH CAUTION.");
                  }}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-[10px] text-white/30">
                Use this URL in iPhone Shortcuts ("Get Contents of URL") to generate wallpapers automatically.
              </p>
            </div>

          </motion.div>

        </div>

        {/* Right Column: Preview */}
        <div className="flex w-full justify-center lg:w-1/2 lg:sticky lg:top-10">
          <WallpaperDisplay svgContent={svgContent} loading={loading} quote={currentQuote} />
        </div>

      </div>
    </main >
  );
}
