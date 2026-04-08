import { useState } from "react";
import { Search } from "lucide-react";

interface Transaction {
  id: string;
  code: string;
  type: string;
  value: string;
  date: string;
}

interface TransactionPanelProps {
  title: string;
  transactions: Transaction[];
  onToggle: (id: string) => void;
  selected: Set<string>;
  highlighted?: boolean;
  onDragStart?: (id: string) => void;
  onDrop?: () => void;
}

const TransactionPanel = ({ title, transactions, onToggle, selected, highlighted, onDragStart, onDrop }: TransactionPanelProps) => {
  const [filter, setFilter] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const filtered = transactions.filter((t) =>
    `${t.code} ${t.type} ${t.value} ${t.date}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <input
          type="text"
          placeholder="Filtrar aqui"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-[260px] pl-9 pr-3 py-2 text-sm border border-border rounded bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
        onDrop={() => { setIsDragOver(false); onDrop?.(); }}
        className={`border rounded overflow-y-auto h-[380px] bg-card transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : highlighted
            ? "border-destructive"
            : "border-border"
        }`}
      >
        {filtered.map((t) => (
          <label
            key={t.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              onDragStart?.(t.id);
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent cursor-grab active:cursor-grabbing border-b border-border last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selected.has(t.id)}
              onChange={() => onToggle(t.id)}
              className="rounded border-border"
            />
            <span>
              {t.code}#{t.type} – R$ {t.value} - {t.date}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TransactionPanel;
