import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, Building2, BookOpen, Package, FileText, QrCode, DollarSign, Code } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "DASHBOARDS" },
  { icon: Building2, label: "EMPRESAS" },
  { icon: BookOpen, label: "PLANOS" },
  { icon: Package, label: "PRODUTOS" },
  { icon: FileText, label: "FATURAS", dropdown: [{ label: "Listagem de faturas", path: "/faturas" }] },
  { icon: QrCode, label: "ÁREA PIX" },
  { icon: DollarSign, label: "COTAÇÕES" },
  { icon: Code, label: "LOGS" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="flex items-center justify-between bg-nav px-6 py-3 border-b border-border shadow-sm">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-bold italic">
          <span className="text-nav-brand">Fin</span>
          <span className="text-nav-foreground">Hub</span>
        </span>
        <div className="flex items-center gap-1" ref={ref}>
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded"
              >
                <item.icon size={14} />
                {item.label}
                {item.dropdown && (
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${openMenu === item.label ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {item.dropdown && openMenu === item.label && (
                <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded border border-border bg-card shadow-md">
                  {item.dropdown.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => { setOpenMenu(null); navigate(option.path); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-accent transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button className="flex items-center gap-2 bg-nav-brand text-primary-foreground px-4 py-2 rounded text-xs font-bold">
        GUILHERME CORRÊA
        <ChevronDown size={14} />
      </button>
    </nav>
  );
};

export default Navbar;
