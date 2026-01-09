import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  const location = useLocation();

  const linkBase =
    "relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors";

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/60 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-slate-100 uppercase">
          <span>Study Buddy</span>
          <img src={logo} alt="Study Buddy logo" className="w-13 h-12" />
        </div>
        <nav className="flex gap-2 text-xs text-slate-300">
          <Link
            to="/"
            className={`${linkBase} ${
              isActive("/")
                ? "bg-slate-900 text-slate-50 shadow-sm"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            Dashboard
            {isActive("/") && (
              <span className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-sky-400" />
            )}
          </Link>
          <Link
            to="/topics"
            className={`${linkBase} ${
              isActive("/topics")
                ? "bg-slate-900 text-slate-50 shadow-sm"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            Topics
            {isActive("/topics") && (
              <span className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-sky-400" />
            )}
          </Link>
          <Link
            to="/settings"
            className={`${linkBase} ${
              isActive("/settings")
                ? "bg-slate-900 text-slate-50 shadow-sm"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            Settings
            {isActive("/settings") && (
              <span className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-sky-400" />
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
