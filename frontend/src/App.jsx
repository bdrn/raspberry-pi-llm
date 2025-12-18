import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PairDevice from "./pages/PairDevice";

function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        <Navbar />

        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pair" element={<PairDevice />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
