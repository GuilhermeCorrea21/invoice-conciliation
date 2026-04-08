import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import TransactionPanel from "@/components/TransactionPanel";
import DropZone from "@/components/DropZone";

const pendingTransactions = [
  { id: "1", code: "03ZAII", type: "Flight", value: "1.363,22", date: "07/04/2026" },
  { id: "2", code: "03ZAEL", type: "Flight", value: "1.686,10", date: "07/04/2026" },
];

const invoiceTransactions = [
  { id: "3", code: "03U42U", type: "Flight", value: "1.155,50", date: "04/03/2026" },
  { id: "4", code: "03ULJY", type: "Flight", value: "845,78", date: "06/03/2026" },
  { id: "5", code: "03UYT4", type: "Flight", value: "4.237,66", date: "10/03/2026" },
  { id: "6", code: "03UYUS", type: "Flight", value: "489,76", date: "10/03/2026" },
  { id: "7", code: "03U45U", type: "Flight", value: "1.615,98", date: "04/03/2026" },
  { id: "8", code: "03W46H", type: "Flight", value: "994,14", date: "13/03/2026" },
  { id: "9", code: "03W46S", type: "Hotel", value: "698,07", date: "13/03/2026" },
  { id: "10", code: "03UYW9", type: "Hotel", value: "6.010,20", date: "10/03/2026" },
];

const Index = () => {
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setFn(next);
  };

  const totalInvoice = "16.047,09";

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
            <a href="#" className="text-link hover:underline">Faturas</a>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Editar</span>
          </div>
        </div>

        {/* Panels */}
        <div className="flex items-start gap-4">
          <TransactionPanel
            title="Transações pendentes"
            transactions={pendingTransactions}
            onToggle={(id) => toggle(selectedPending, setSelectedPending, id)}
            selected={selectedPending}
          />

          <div className="flex items-center justify-center pt-48">
            <button className="text-link hover:text-primary transition-colors">
              <ArrowLeftRight size={20} />
            </button>
          </div>

          <TransactionPanel
            title="Transações da fatura"
            transactions={invoiceTransactions}
            onToggle={(id) => toggle(selectedInvoice, setSelectedInvoice, id)}
            selected={selectedInvoice}
            highlighted
          />
        </div>

        {/* Drop Zone */}
        <DropZone />

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm font-medium text-foreground">
            Cartão com final 8618 — Valor R$ {totalInvoice}
          </p>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 text-sm font-medium border border-destructive text-destructive rounded hover:bg-destructive/10 transition-colors">
              Cancelar
            </button>
            <button className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
