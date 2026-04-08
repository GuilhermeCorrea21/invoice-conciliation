import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import TransactionPanel from "@/components/TransactionPanel";
import DropZone from "@/components/DropZone";
import type { ParsedTransaction } from "@/lib/parsePdf";

interface Transaction {
  id: string;
  code: string;
  type: string;
  value: string;
  date: string;
}
/*{ id: "12", code: "03LRS7", type: "Aéreo",    value: "14.411,32", date: "15/12/2025" }, 9.394,23*/
// Transações reais extraídas do extrato Itaú - Fatura 01/2026 - Leonardo C Brito (final 6627)
const initialPendingTransactions: Transaction[] = [
  { id: "27", code: "02U1UA", type: "Hotel",    value: "260,00",    date: "07/01/2026" },
  { id: "1",  code: "03LR7X", type: "Aéreo",    value: "2.965,36",  date: "15/12/2025" },
  { id: "2",  code: "03LS4N", type: "Aéreo",    value: "14.022,52", date: "15/12/2025" },
  { id: "3",  code: "03LS2Y", type: "Aéreo",    value: "5.930,72",  date: "15/12/2025" },
  { id: "4",  code: "03LROC", type: "Aéreo",    value: "9.394,30",  date: "15/12/2025" },
  { id: "5",  code: "03LS53", type: "Aéreo",    value: "10.516,89", date: "15/12/2025" },
  { id: "6",  code: "03LS5I", type: "Aéreo",    value: "3.741,34",  date: "15/12/2025" },
  { id: "7",  code: "03LR64", type: "Aéreo",    value: "5.930,72",  date: "15/12/2025" },
  { id: "8",  code: "03LRB4", type: "Aéreo",    value: "3.367,12",  date: "15/12/2025" },
  { id: "9",  code: "03LRSV", type: "Aéreo",    value: "3.741,34",  date: "15/12/2025" },
  { id: "10", code: "03LR3Y", type: "Aéreo",    value: "11.280,45", date: "15/12/2025" },
  { id: "11", code: "03LREI", type: "Aéreo",    value: "5.707,16",  date: "15/12/2025" },
  { id: "13", code: "03LRHM", type: "Aéreo",    value: "2.327,89",  date: "15/12/2025" },
  { id: "14", code: "03LVIO", type: "Aéreo",    value: "3.842,05",  date: "16/12/2025" },
  { id: "15", code: "03LYQL", type: "Aéreo",    value: "3.044,97",  date: "16/12/2025" },
  { id: "16", code: "03LVHZ", type: "Aéreo",    value: "26.894,35", date: "16/12/2025" },
  { id: "17", code: "03M16S", type: "Aéreo",    value: "1.527,20",  date: "17/12/2025" },
  { id: "18", code: "03M4SR", type: "Aéreo",    value: "2.504,97",  date: "17/12/2025" },
  { id: "19", code: "03M6AA", type: "Hotel",    value: "2.330,36",  date: "18/12/2025" },
  { id: "20", code: "03N1UI", type: "Aéreo",    value: "3.673,12",  date: "06/01/2026" },
  { id: "21", code: "03LR3Y", type: "Serviços", value: "88,23",     date: "06/01/2026" },
  { id: "22", code: "03LR3Y", type: "Serviços", value: "352,90",    date: "06/01/2026" },
  { id: "23", code: "03N4W4", type: "Hotel",    value: "2.340,00",  date: "06/01/2026" },
  { id: "24", code: "03N1UI", type: "Serviços", value: "65,00",     date: "07/01/2026" },
  { id: "25", code: "03N1UI", type: "Serviços", value: "90,00",     date: "07/01/2026" },
  { id: "26", code: "01B1UK", type: "Aéreo",    value: "655,70",    date: "07/01/2026" },
];

// Normaliza valor brasileiro para comparação: "1.234,56" → "123456"
const normalizeValue = (v: string) => v.replace(/\./g, "").replace(",", "");

const STORAGE_KEY_PENDING = "invoice-conciliation:pending";
const STORAGE_KEY_INVOICE = "invoice-conciliation:invoice";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// IDs válidos = somente os que constam em initialPendingTransactions
// Mapa id → dados canônicos da plataforma (fonte da verdade)
const initialById = new Map(initialPendingTransactions.map((t) => [t.id, t]));

const Index = () => {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(() => {
    const storedPending = loadFromStorage<Transaction[]>(STORAGE_KEY_PENDING, []);
    const storedInvoice = loadFromStorage<Transaction[]>(STORAGE_KEY_INVOICE, []);

    // IDs já rastreados em qualquer coluna
    const trackedIds = new Set([
      ...storedPending.map((t) => t.id),
      ...storedInvoice.map((t) => t.id),
    ]);

    // Pendentes do storage com dados atualizados + IDs novos que ainda não foram rastreados
    const fromStorage = storedPending.flatMap((t) => {
      const canonical = initialById.get(t.id);
      return canonical ? [canonical] : [];
    });
    const untracked = initialPendingTransactions.filter((t) => !trackedIds.has(t.id));

    return [...fromStorage, ...untracked];
  });
  const [invoiceTransactions, setInvoiceTransactions] = useState<Transaction[]>(() => {
    const stored = loadFromStorage<Transaction[]>(STORAGE_KEY_INVOICE, []);
    return stored.flatMap((t) => {
      const canonical = initialById.get(t.id);
      return canonical ? [canonical] : [];
    });
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pendingTransactions));
  }, [pendingTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INVOICE, JSON.stringify(invoiceTransactions));
  }, [invoiceTransactions]);
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<"pending" | "invoice" | null>(null);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const invoiceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (invoiceDropdownRef.current && !invoiceDropdownRef.current.contains(e.target as Node)) {
        setShowInvoiceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const invoiceList = [
    { id: "473115", period: "Jan/2026", value: "R$ 140.090,21", status: "Aberta" },
    { id: "437968", period: "Dez/2025", value: "R$  15.803,81", status: "Paga"  },
    { id: "401234", period: "Nov/2025", value: "R$  22.450,00", status: "Paga"  },
    { id: "368901", period: "Out/2025", value: "R$  18.320,75", status: "Paga"  },
  ];

  const toggle = (
    set: Set<string>,
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string
  ) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setFn(next);
  };

  const handleMoveSelected = () => {
    if (selectedPending.size > 0) {
      const moving = pendingTransactions.filter((t) => selectedPending.has(t.id));
      setPendingTransactions((prev) => prev.filter((t) => !selectedPending.has(t.id)));
      setInvoiceTransactions((prev) => [...prev, ...moving]);
      setSelectedPending(new Set());
    }
    if (selectedInvoice.size > 0) {
      const moving = invoiceTransactions.filter((t) => selectedInvoice.has(t.id));
      setInvoiceTransactions((prev) => prev.filter((t) => !selectedInvoice.has(t.id)));
      setPendingTransactions((prev) => [...prev, ...moving]);
      setSelectedInvoice(new Set());
    }
  };

  const handleDragStart = (id: string, from: "pending" | "invoice") => {
    setDraggingId(id);
    setDraggingFrom(from);
  };

  const handleDrop = (to: "pending" | "invoice") => {
    if (!draggingId || draggingFrom === to) return;

    if (draggingFrom === "pending") {
      const tx = pendingTransactions.find((t) => t.id === draggingId);
      if (tx) {
        setPendingTransactions((prev) => prev.filter((t) => t.id !== draggingId));
        setInvoiceTransactions((prev) => [...prev, tx]);
      }
    } else {
      const tx = invoiceTransactions.find((t) => t.id === draggingId);
      if (tx) {
        setInvoiceTransactions((prev) => prev.filter((t) => t.id !== draggingId));
        setPendingTransactions((prev) => [...prev, tx]);
      }
    }

    setDraggingId(null);
    setDraggingFrom(null);
  };

  const handleTransactionsParsed = (parsed: ParsedTransaction[]) => {
    const logs: string[] = [];
    const usedParsedIndices = new Set<number>();

    // 0. Checar se alguma transação do arquivo já está na fatura
    const alreadyInvoiceIndices = new Set<number>();
    parsed.forEach((p, i) => {
      const alreadyInInvoice = invoiceTransactions.some(
        (t) =>
          normalizeValue(t.value) === normalizeValue(p.value) ||
          p.code.toUpperCase().includes(t.code.toUpperCase())
      );
      if (alreadyInInvoice) {
        alreadyInvoiceIndices.add(i);
        usedParsedIndices.add(i);
        logs.push(`already:Transação ${p.code}#${p.type} já está na fatura`);
      }
    });

    // 1. Correspondência por valor exato
    const matched: Transaction[] = [];
    const remaining: Transaction[] = [];

    for (const tx of pendingTransactions) {
      const idx = parsed.findIndex(
        (p, i) => !usedParsedIndices.has(i) && normalizeValue(p.value) === normalizeValue(tx.value)
      );
      if (idx !== -1) {
        matched.push(tx);
        usedParsedIndices.add(idx);
      } else {
        remaining.push(tx);
      }
    }

    // 2. Para pendentes sem correspondência, checar se o código do arquivo contém o código da plataforma
    //    (ex: "ONF*AER*03LRHM" contém "03LRHM") → valor divergente
    const divergentParsedIndices = new Set<number>();

    for (const tx of remaining) {
      const idx = parsed.findIndex(
        (p, i) =>
          !usedParsedIndices.has(i) &&
          !divergentParsedIndices.has(i) &&
          p.code.toUpperCase().includes(tx.code.toUpperCase())
      );
      if (idx !== -1) {
        divergentParsedIndices.add(idx);
        logs.push(
          `Valor divergente em "${tx.code}#${tx.type}": plataforma: R$ ${tx.value} — documento enviado: R$ ${parsed[idx].value}`
        );
      }
    }

    // 3. Parsed sem nenhuma correspondência → apenas log, não entram na fatura
    const unmatched = parsed.filter(
      (_, i) => !usedParsedIndices.has(i) && !divergentParsedIndices.has(i)
    );

    logs.push(
      ...unmatched.map(
        (p) => `Transação "${p.code}#${p.type} – R$ ${p.value} - ${p.date}" não foi encontrada na plataforma Onfly`
      )
    );

    setPendingTransactions(remaining);
    setInvoiceTransactions([...matched]);
    setImportLogs(logs);
    setSelectedPending(new Set());
    setSelectedInvoice(new Set());
  };

  const totalInvoice = invoiceTransactions
    .reduce((sum, t) => {
      const num = parseFloat(t.value.replace(/\./g, "").replace(",", "."));
      return sum + (isNaN(num) ? 0 : num);
    }, 0)
    .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-foreground">Editar fatura #473115</h1>
          <div className="flex items-center gap-1 text-xs mt-1">
            <a href="#" className="text-link hover:underline">Home</a>
            <span className="text-muted-foreground">/</span>
            <div className="relative" ref={invoiceDropdownRef}>
              <button
                onClick={() => setShowInvoiceDropdown((v) => !v)}
                className="flex items-center gap-0.5 text-link hover:underline"
              >
                Faturas
                <ChevronDown size={12} className={`transition-transform ${showInvoiceDropdown ? "rotate-180" : ""}`} />
              </button>
              {showInvoiceDropdown && (
                <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded border border-border bg-card shadow-md">
                  {invoiceList.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => setShowInvoiceDropdown(false)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent text-foreground border-b border-border last:border-b-0"
                    >
                      <span>
                        <span className="font-medium">#{inv.id}</span>
                        <span className="text-muted-foreground ml-1">— {inv.period}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">{inv.value}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          inv.status === "Aberta"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {inv.status}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Editar</span>
          </div>
        </div>

        {/* Panels */}
        <div
          className="flex items-start gap-4"
          onDragEnd={() => { setDraggingId(null); setDraggingFrom(null); }}
        >
          <TransactionPanel
            title="Transações pendentes"
            transactions={pendingTransactions}
            onToggle={(id) => toggle(selectedPending, setSelectedPending, id)}
            selected={selectedPending}
            onDragStart={(id) => handleDragStart(id, "pending")}
            onDrop={() => handleDrop("pending")}
          />

          <div className="flex items-center justify-center pt-48">
            <button
              onClick={handleMoveSelected}
              disabled={selectedPending.size === 0 && selectedInvoice.size === 0}
              className="text-link hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight size={20} />
            </button>
          </div>

          <TransactionPanel
            title="Transações da fatura"
            transactions={invoiceTransactions}
            onToggle={(id) => toggle(selectedInvoice, setSelectedInvoice, id)}
            selected={selectedInvoice}
            highlighted
            onDragStart={(id) => handleDragStart(id, "invoice")}
            onDrop={() => handleDrop("invoice")}
          />
        </div>

        {/* Drop Zone */}
        <DropZone onTransactionsParsed={handleTransactionsParsed} />

        {/* Import Logs */}
        {importLogs.length > 0 && (
          <div className="mt-4 border border-border rounded bg-card">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-xs font-semibold text-foreground">
                Log de importação — {importLogs.length} ocorrênci{importLogs.length === 1 ? "a" : "as"}
              </span>
              <button
                onClick={() => setImportLogs([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
              </button>
            </div>
            <ul className="max-h-40 overflow-y-auto divide-y divide-border">
              {importLogs.map((msg, i) => {
                const isAlready = msg.startsWith("already:");
                const text = isAlready ? msg.slice("already:".length) : msg;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2 px-4 py-2 text-xs ${
                      isAlready
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm font-medium text-foreground">
            Cartão com final 6627 — Valor R$ {totalInvoice}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (invoiceTransactions.length === 0) return;
                setPendingTransactions((prev) => [...prev, ...invoiceTransactions]);
                setInvoiceTransactions([]);
                setSelectedInvoice(new Set());
              }}
              disabled={invoiceTransactions.length === 0}
              className="px-5 py-2 text-sm font-medium border border-border text-muted-foreground rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Limpar fatura
            </button>
            <button className="px-5 py-2 text-sm font-medium border border-destructive text-destructive rounded hover:bg-destructive/10 transition-colors">
              Cancelar
            </button>
            <button
              className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              onClick={() =>
                Swal.fire({
                  icon: "success",
                  title: "Fatura editada com sucesso",
                  confirmButtonText: "OK",
                })
              }
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
