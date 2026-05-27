import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = ({ theme, themeStatus, onThemeChange }) => {
  const [profile, setProfile] = useState({
    name: "Student User",
    email: "student@example.com",
    school: "State University",
  });
  const [deviceCode, setDeviceCode] = useState("");

  const themes = useMemo(
    () => [
      {
        id: "game",
        name: "Game Mode",
        description: "Neon energy to match the Study Buddy device.",
      },
      {
        id: "minimal-dark",
        name: "Minimal Dark",
        description: "Low-glow, high-contrast focus for night study.",
      },
      {
        id: "minimal-light",
        name: "Minimal Light",
        description: "Paper-like, bright layout for daytime sessions.",
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        
        <h1 className="game-title text-3xl font-semibold theme-text">
          Settings
        </h1>
        <p className="max-w-2xl text-sm theme-muted">
          Manage profile details, pick a theme, and pair your Study Buddy
          device.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
                Theme
              </h2>
              <span className="text-xs theme-subtle">
                {themeStatus === "saving"
                  ? "Saving..."
                  : themeStatus === "saved"
                  ? "Saved"
                  : themeStatus === "error"
                  ? "Save failed"
                  : "Synced with device"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {themes.map((option) => {
                const isActive = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onThemeChange(option.id)}
                    className={`theme-surface flex h-full flex-col items-start rounded-2xl px-4 py-4 text-left transition ${
                      isActive ? "theme-ring" : ""
                    }`}
                    aria-pressed={isActive}
                  >
                    <p className="text-sm font-semibold theme-text">
                      {option.name}
                    </p>
                    <p className="mt-2 text-xs theme-muted">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
              Device pairing
            </h2>
            <p className="mt-3 text-sm theme-muted">
              Pair your Study Buddy hardware to sync quizzes and themes.
            </p>
            <div className="mt-4 space-y-3">
              <label className="space-y-2 text-xs uppercase tracking-[0.2em] theme-muted">
                Pairing code
                <input
                  type="text"
                  value={deviceCode}
                  onChange={(event) => setDeviceCode(event.target.value)}
                  placeholder="SB-0000"
                  className="theme-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </label>
              <Button variant="default" size="sm">
                Pair device
              </Button>
              <p className="text-xs theme-subtle">
                Pairing is mocked for now and will not contact hardware.
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.22em] theme-muted">
              Security
            </h2>
            <p className="mt-3 text-sm theme-muted">
              Session status and account recovery settings will appear here.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Reset password
              </Button>
              <Button variant="ghost" size="sm">
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Settings;
