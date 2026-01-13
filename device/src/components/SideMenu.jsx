import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Home", path: "/home" },
  { label: "Timer", path: "/timer" },
  { label: "Dashboard", path: "/dashboard" },
];

const SideMenu = ({ onToggle }) => {
  const location = useLocation();

  return (
    <aside className="flex w-52 flex-col gap-6 border-r border-slate-800/80 bg-slate-950/70 px-4 py-6">
      <div className="space-y-2">
        <p className="game-title text-lg text-slate-100">Study Buddy</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Command Deck
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-3">
        {menuItems.map((item) => {
          const isActive =
            item.path === "/home"
              ? location.pathname === "/home"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`game-button flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "game-button-primary text-slate-900"
                  : "game-button-secondary text-slate-100"
              }`}
            >
              <span className="tracking-[0.2em]">{item.label}</span>
              <span className="text-lg">{isActive ? ">>" : ">"}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        to="/standby"
        className="menu-toggle game-button game-button-secondary rounded-2xl px-4 py-3 text-xs text-slate-100"
      >
        Sleep
      </Link>
    </aside>
  );
};

export default SideMenu;
