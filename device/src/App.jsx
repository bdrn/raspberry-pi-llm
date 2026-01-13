import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import SideMenu from "./components/SideMenu";
import StreakBadge from "./components/StreakBadge";
import TimerHud from "./components/TimerHud";
import { TimerProvider } from "./context/TimerContext";
import Home from "./pages/Home";
import Standby from "./pages/Standby";
import Timer from "./pages/Timer";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const AppShell = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const location = useLocation();
  const isStandby =
    location.pathname === "/" || location.pathname.startsWith("/standby");

  return (
    <TimerProvider>
      <div className="game-shell h-[100dvh] overflow-hidden text-slate-50">
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
                    className="menu-toggle game-button game-button-secondary rounded-full px-4 py-2 text-[10px] font-semibold text-slate-100"
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
                <Route path="/timer" element={<Timer />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
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
