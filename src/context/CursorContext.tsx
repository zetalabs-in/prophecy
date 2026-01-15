"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CursorContextType {
    cursorText: string;
    setCursorText: (text: string) => void;
    cursorVariant: "default" | "magnetic" | "button";
    setCursorVariant: (variant: "default" | "magnetic" | "button") => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
    const [cursorText, setCursorText] = useState("");
    const [cursorVariant, setCursorVariant] = useState<"default" | "magnetic" | "button">("default");

    return (
        <CursorContext.Provider value={{ cursorText, setCursorText, cursorVariant, setCursorVariant }}>
            {children}
        </CursorContext.Provider>
    );
}

export function useCursor() {
    const context = useContext(CursorContext);
    if (context === undefined) {
        throw new Error("useCursor must be used within a CursorProvider");
    }
    return context;
}
