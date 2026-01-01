import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex min-h-[480px] flex-col justify-center gap-10 px-6 py-8">
      <header className="space-y-3">
        <h1 className="text-5xl font-semibold tracking-tight text-slate-50">
          Hey, buddy!
        </h1>
        <h3 className="max-w-xl text-2xl text-slate-200">
          Ready for a new study session?
        </h3>
      </header>

      <Link
        to="/home"
        className="inline-flex min-h-[72px] w-full items-center justify-start bg-transparent px-10 py-6 text-3xl font-semibold text-slate-50 shadow-[0_0_18px_rgba(56,189,248,0.9)] transition animate-pulse"
      >
        Let's Go! 
      </Link>
    </div>
  );
};

export default Home;
