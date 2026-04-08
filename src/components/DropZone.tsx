import { useState, useCallback } from "react";
import { Upload, FileText } from "lucide-react";

const DropZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
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
      {file ? (
        <div className="flex items-center justify-center gap-3 text-foreground">
          <FileText size={24} className="text-primary" />
          <span className="text-sm font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste um arquivo <span className="font-semibold text-foreground">PDF</span> ou{" "}
            <span className="font-semibold text-foreground">XLSX</span> aqui, ou clique para selecionar
          </p>
        </div>
      )}
    </div>
  );
};

export default DropZone;
