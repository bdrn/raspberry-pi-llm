import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import SideMenu from "./components/SideMenu";
import StreakBadge from "./components/StreakBadge";
import TimerHud from "./components/TimerHud";
import PopQuizOverlay from "./components/PopQuizOverlay";
import { PopQuizProvider } from "./context/PopQuizContext";
import { TimerProvider } from "./context/TimerContext";
import Home from "./pages/Home";
import Standby from "./pages/Standby";
import Timer from "./pages/Timer";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Dashboard from "./pages/Dashboard";
import PopQuizSettings from "./pages/PopQuizSettings";
import "./App.css";
import api from "./api";

const AppShell = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [theme, setTheme] = useState("game");
  const location = useLocation();
  const isStandby =
    location.pathname === "/" || location.pathname.startsWith("/standby");
  const isPopQuizBlocked =
    isStandby ||
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/pop-quiz");

  useEffect(() => {
    let isMounted = true;
    const applyTheme = (value) => {
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = value;
      }
    };
    const fetchTheme = async () => {
      try {
        const response = await api.get("/settings");
        const nextTheme = response.data?.settings?.theme || "game";
        if (isMounted && nextTheme !== theme) {
          setTheme(nextTheme);
          applyTheme(nextTheme);
        }
      } catch (error) {
        console.error("Failed to sync theme settings:", error);
      }
    };
    applyTheme(theme);
    fetchTheme();
    const intervalId = setInterval(fetchTheme, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [theme]);

  return (
    <TimerProvider>
      <PopQuizProvider isBlocked={isPopQuizBlocked}>
        <div className="game-shell h-[100dvh] overflow-hidden theme-text">
          <main className="flex h-full">
            {!isStandby && isMenuOpen ? (
              <SideMenu onToggle={() => setIsMenuOpen(false)} />
            ) : null}
            <div className="flex flex-1 flex-col overflow-hidden">
              {!isStandby ? (
                <div className="app-topbar">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      className="menu-toggle game-button game-button-secondary rounded-full px-4 py-2 text-[10px] font-semibold"
                    >
                      {isMenuOpen ? "Hide Menu" : "Show Menu"}
                    </button>
                    <div className="flex flex-1 justify-center">
                      <TimerHud />
                    </div>
                    <StreakBadge />
                  </div>
                </div>
              ) : null}
              <div className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Standby />} />
                  <Route path="/standby" element={<Standby />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/pop-quiz" element={<PopQuizSettings />} />
                  <Route path="/timer" element={<Timer />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
        <PopQuizOverlay />
      </PopQuizProvider>
    </TimerProvider>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
