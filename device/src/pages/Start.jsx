import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex h-[100dvh] flex-col justify-center gap-6 px-4 py-4 overflow-hidden">
      <header className="space-y-3">
        <h1 className="text-5xl font-semibold tracking-tight text-slate-50">
          Hey, buddy!
        </h1>
        <h3 className="max-w-xl text-3xl text-slate-200">
          Ready for a new study session?
        </h3>
      </header>

      <Link
        to="/home"
        className="inline-flex min-h-[64px] w-full items-center justify-start bg-transparent px-8 py-4 text-4xl font-semibold text-slate-50 shadow-[0_0_18px_rgba(56,189,248,0.9)] transition animate-pulse"
      >
        Let's Go! 
      </Link>
    </div>
  );
};

export default Home;
