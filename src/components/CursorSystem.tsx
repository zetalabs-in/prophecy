"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursor } from "@/context/CursorContext";
import { cn } from "@/lib/utils";

export default function CursorSystem() {
    const { cursorVariant } = useCursor();
    const [isHovering, setIsHovering] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);
        };

        window.addEventListener("mousemove", moveCursor);
        return () => {
            window.removeEventListener("mousemove", moveCursor);
        };
    }, [mouseX, mouseY]);

    useEffect(() => {
        if (cursorVariant === "magnetic" || cursorVariant === "button") {
            setIsHovering(true);
        } else {
            setIsHovering(false);
        }
    }, [cursorVariant]);

    return (
        <>
            {/* Spotlight Effect - Fixed to Viewport, follows mouse */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-0 h-full w-full"
                style={{
                    background: `radial-gradient(600px at ${cursorX.get() + 16}px ${cursorY.get() + 16}px, rgba(255, 255, 255, 0.05), transparent 80%)`,
                }}
            />

            {/* Main Cursor */}
            <motion.div
                className={cn(
                    "pointer-events-none fixed left-0 top-0 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm",
                    isHovering ? "h-16 w-16 bg-white/10" : "h-4 w-4"
                )}
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
                <div className={cn("h-1 w-1 rounded-full bg-white", isHovering ? "opacity-0" : "opacity-100")} />
            </motion.div>
        </>
    );
}
