import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative flex h-[100dvh] flex-col justify-center gap-6 px-4 py-4 overflow-hidden">
      <header className="space-y-3">
        <h1 className="game-title text-5xl font-semibold text-slate-50">
          Hey, buddy!
        </h1>
        <h3 className="game-subtitle max-w-xl text-3xl text-slate-200">
          Ready for a new study session?
        </h3>
      </header>

      <Link
        to="/home"
        className="game-button game-button-primary bounce-soft inline-flex min-h-[64px] w-full items-center justify-start px-8 py-4 text-3xl font-semibold transition"
      >
        Start Quest
      </Link>
    </div>
  );
};

export default Home;
