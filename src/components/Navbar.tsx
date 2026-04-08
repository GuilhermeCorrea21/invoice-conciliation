import { ChevronDown, LayoutDashboard, Building2, BookOpen, Package, FileText, QrCode, DollarSign, Code } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "DASHBOARDS" },
  { icon: Building2, label: "EMPRESAS" },
  { icon: BookOpen, label: "PLANOS" },
  { icon: Package, label: "PRODUTOS" },
  { icon: FileText, label: "FATURAS", hasDropdown: true },
  { icon: QrCode, label: "ÁREA PIX" },
  { icon: DollarSign, label: "COTAÇÕES" },
  { icon: Code, label: "LOGS" },
];

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between bg-nav px-6 py-3 border-b border-border shadow-sm">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-bold italic">
          <span className="text-nav-brand">Fin</span>
          <span className="text-nav-foreground">Hub</span>
        </span>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded"
            >
              <item.icon size={14} />
              {item.label}
              {item.hasDropdown && <ChevronDown size={12} />}
            </button>
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
