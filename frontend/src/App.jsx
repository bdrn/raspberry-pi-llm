import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Settings from "./pages/Settings";
import api from "./api";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("game");
  const [themeStatus, setThemeStatus] = useState("idle");

  const applyTheme = (value) => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = value;
    }
  };

  const allowedThemes = useMemo(
    () => ["game", "minimal-dark", "minimal-light"],
    []
  );

  useEffect(() => {
    let isMounted = true;
    const fetchTheme = async () => {
      try {
        const response = await api.get("/settings");
        const nextTheme = response.data?.settings?.theme || "game";
        if (isMounted && allowedThemes.includes(nextTheme)) {
          setTheme(nextTheme);
          applyTheme(nextTheme);
        }
      } catch (error) {
        console.error("Failed to load theme settings:", error);
      }
    };
    fetchTheme();
    return () => {
      isMounted = false;
    };
  }, [allowedThemes]);

  const handleThemeChange = async (nextTheme) => {
    if (!allowedThemes.includes(nextTheme)) return;
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setThemeStatus("saving");
    try {
      await api.put(
        "/settings",
        { theme: nextTheme },
        { headers: { "Content-Type": "application/json" } }
      );
      setThemeStatus("saved");
      setTimeout(() => setThemeStatus("idle"), 1500);
    } catch (error) {
      console.error("Failed to update theme:", error);
      setThemeStatus("error");
    }
  };

  return (
    <Router>
      <div className="game-shell min-h-screen">
        <Navbar />
        <main className="mx-auto flex max-w-5xl px-4 pb-10 pt-8">
          <div className="w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/topics" element={<Topics />} />
              <Route
                path="/settings"
                element={
                  <Settings
                    theme={theme}
                    themeStatus={themeStatus}
                    onThemeChange={handleThemeChange}
                  />
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
