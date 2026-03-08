import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Clock, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "ഹോം" },
  { path: "/tracker", icon: BookOpen, label: "ട്രാക്കർ" },
  { path: "/history", icon: Clock, label: "ഹിസ്റ്ററി" },
  { path: "/profile", icon: User, label: "പ്രൊഫൈൽ" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
