import * as XLSX from 'xlsx';
import type { ParsedTransaction } from './parsePdf';

type SheetConfig = {
  type: string;
  codeCol: number;
  dateCol: number;
  valueCol: number;
};

const SHEET_CONFIG: Record<string, SheetConfig> = {
  'Aéreo':                       { type: 'Aéreo',    codeCol: 0, dateCol: 1, valueCol: 11 },
  'Cobranças adicionais aéreo':  { type: 'Serviços', codeCol: 0, dateCol: 1, valueCol: 6  },
  'Hoteis':                      { type: 'Hotel',    codeCol: 0, dateCol: 1, valueCol: 11 },
};

function cleanValue(raw: string): string {
  // "R$ 2.327,89" → "2.327,89"
  return String(raw).replace(/R\$\s*/i, '').trim();
}

function cleanDate(raw: string): string {
  // "15/12/2025 11:20" → "15/12/2025"
  return String(raw).split(' ')[0].trim();
}

export async function parseXlsxTransactions(file: File): Promise<ParsedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const transactions: ParsedTransaction[] = [];

  for (const sheetName of wb.SheetNames) {
    const config = SHEET_CONFIG[sheetName];
    if (!config) continue;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const code  = String(row[config.codeCol] ?? '').trim();
      const value = cleanValue(String(row[config.valueCol] ?? ''));
      const date  = cleanDate(String(row[config.dateCol] ?? ''));

      if (!code || !value) continue;

      transactions.push({
        id: `xlsx-${sheetName}-${i}-${Date.now()}`,
        code,
        type: config.type,
        value,
        date,
      });
    }
  }

  return transactions;
}
