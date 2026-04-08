import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { parsePdfTransactions, type ParsedTransaction } from "@/lib/parsePdf";
import { parseXlsxTransactions } from "@/lib/parseXlsx";

interface DropZoneProps {
  onTransactionsParsed?: (transactions: ParsedTransaction[]) => void;
}

const DropZone = ({ onTransactionsParsed }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const processFile = useCallback(
    async (selected: File) => {
      setFile(selected);
      setStatus("idle");

      const isXlsx = selected.name.endsWith(".xlsx") || selected.name.endsWith(".xls");
      const isPdf  = selected.type.includes("pdf") || selected.name.endsWith(".pdf");

      if (!isPdf && !isXlsx) return;

      setStatus("loading");
      try {
        const transactions = isXlsx
          ? await parseXlsxTransactions(selected)
          : await parsePdfTransactions(selected);

        if (transactions.length === 0) {
          setStatus("error");
          setErrorMsg(
            isXlsx
              ? "Nenhuma transação encontrada no XLSX."
              : "Nenhuma transação ONF encontrada no PDF."
          );
        } else {
          setStatus("done");
          onTransactionsParsed?.(transactions);
        }
      } catch {
        setStatus("error");
        setErrorMsg(
          isXlsx
            ? "Erro ao ler o XLSX. Verifique se o arquivo é válido."
            : "Erro ao ler o PDF. Verifique se o arquivo é válido."
        );
      }
    },
    [onTransactionsParsed]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (
        droppedFile &&
        (droppedFile.type === "application/pdf" ||
          droppedFile.name.endsWith(".xlsx") ||
          droppedFile.name.endsWith(".xls"))
      ) {
        processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`mt-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-dropzone-border bg-dropzone-bg"
      }`}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf,.xlsx,.xls"
        className="hidden"
        onChange={handleFileInput}
      />

      {status === "loading" && (
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="text-sm">Lendo extrato PDF...</span>
        </div>
      )}

      {status === "done" && file && (
        <div className="flex items-center justify-center gap-3 text-foreground">
          <FileText size={24} className="text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              Transações ONF carregadas com sucesso
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle size={24} />
          <span className="text-sm">{errorMsg}</span>
        </div>
      )}

      {status === "idle" && !file && (
        <div className="flex flex-col items-center gap-2">
          <Upload size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste um arquivo <span className="font-semibold text-foreground">PDF</span> ou{" "}
            <span className="font-semibold text-foreground">XLSX</span> aqui, ou clique para
            selecionar
          </p>
        </div>
      )}

      {status === "idle" && file && (
        <div className="flex items-center justify-center gap-3 text-foreground">
          <FileText size={24} className="text-primary" />
          <span className="text-sm font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      )}
    </div>
  );
};

export default DropZone;
