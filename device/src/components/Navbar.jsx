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
    <header className="app-topbar sticky top-0 z-20">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="game-title flex items-center gap-2 text-sm theme-text">
          <span>Study Buddy</span>
          <img src={logo} alt="Study Buddy logo" className="w-13 h-12" />
        </div>
        <nav className="flex gap-2 text-xs text-[var(--theme-muted)]">
          <Link
            to="/"
            className={`${linkBase} ${
              isActive("/")
                ? "theme-surface text-[var(--theme-text)]"
                : "hover:text-[var(--theme-text)] hover:bg-white/5"
            }`}
          >
            Dashboard
            {isActive("/") && (
              <span className="theme-accent-bg absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full" />
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
