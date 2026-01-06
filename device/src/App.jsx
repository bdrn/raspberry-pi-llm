import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Start from "./pages/Start";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
        <main className="mx-auto flex h-full max-w-5xl px-2 py-2">
          <div className="w-full">
            <Routes>
              <Route path="/" element={<Start />} />
              <Route path="/home" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
