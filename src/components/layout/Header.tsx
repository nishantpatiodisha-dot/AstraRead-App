"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { Moon, Sun, User } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

interface HeaderProps {
  title?: string;
  icon?: React.ReactNode;
}

export default function Header({ title, icon }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 lg:px-6 backdrop-blur-xl bg-[var(--color-bg)]/80"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-2 pl-12 lg:pl-0">
        {icon && (
          <span style={{ color: "var(--color-text-accent)" }}>
            {icon}
          </span>
        )}
        {title && (
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h2>
        )}
      </div>

      {/* Right: Theme toggle + user */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="grid size-9 place-items-center rounded-lg transition-colors"
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
          id="theme-toggle"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Show when="signed-in">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "size-9",
              }
            }} 
          />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button
              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: "var(--color-bg-hover)",
                color: "var(--color-text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-accent-muted)";
                e.currentTarget.style.color = "var(--color-text-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                e.currentTarget.style.color = "var(--color-text-primary)";
              }}
            >
              Sign in
            </button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}
