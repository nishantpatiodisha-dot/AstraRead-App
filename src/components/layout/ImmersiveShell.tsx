"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface ImmersiveShellProps {
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function ImmersiveShell({ children, rightAction }: ImmersiveShellProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Minimal header: back button + dark mode toggle */}
      <header
        className="sticky top-0 z-30 flex h-12 items-center justify-between border-b px-4 backdrop-blur-md"
        style={{
          backgroundColor: theme === "dark" ? "rgba(17, 19, 17, 0.85)" : "rgba(234, 237, 228, 0.85)",
          borderColor: "var(--color-border)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
          id="immersive-back-button"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2">
          {rightAction}
          <Link
            href="/"
            className="text-sm font-medium"
            style={{ color: "var(--color-text-accent)" }}
          >
            AstraRead
          </Link>
          <button
            onClick={toggleTheme}
            className="ml-2 grid size-8 place-items-center rounded-lg transition-colors"
            style={{
              color: "var(--color-text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="w-full px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
