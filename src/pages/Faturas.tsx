import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const invoices = [
  {
    id: "473115",
    empresa: "Lundbeck Brasil Ltda",
    cartao: "6627",
    periodo: "Jan/2026",
    emissao: "11/01/2026",
    vencimento: "26/01/2026",
    valor: "R$ 140.090,21",
    status: "Aberta",
  },
];

const Faturas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-foreground">Listagem de faturas</h1>
          <div className="flex items-center gap-1 text-xs mt-1">
            <a href="#" className="text-link hover:underline">Home</a>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Faturas</span>
          </div>
        </div>

        <div className="border border-border rounded bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3 text-left">Fatura</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Cartão</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Emissão</th>
                <th className="px-4 py-3 text-left">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-b-0 hover:bg-accent transition-colors"
                >
                  <td className="px-4 py-3 font-medium">#{inv.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.empresa}</td>
                  <td className="px-4 py-3 text-muted-foreground">Final {inv.cartao}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.periodo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.emissao}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.vencimento}</td>
                  <td className="px-4 py-3 text-right font-medium">{inv.valor}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate("/")}
                      className="text-xs text-link hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Faturas;
