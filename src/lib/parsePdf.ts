import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export interface ParsedTransaction {
  id: string;
  code: string;
  type: string;
  value: string;
  date: string;
}

export async function parsePdfTransactions(file: File): Promise<ParsedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const lines = await extractLinesByYPosition(pdf);
  return parseOnfTransactions(lines);
}

async function extractLinesByYPosition(pdf: pdfjs.PDFDocumentProxy): Promise<string[]> {
  const result: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Group text items by Y coordinate (rounded to 3px to merge items on same visual row)
    const rows = new Map<number, Array<{ x: number; text: string }>>();

    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, text: item.str });
    }

    // Sort rows top-to-bottom (PDF y increases upward, so descending y = top to bottom)
    const sortedRows = [...rows.entries()]
      .sort(([a], [b]) => b - a)
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((i) => i.text)
          .join(' ')
      );

    result.push(...sortedRows);
  }

  return result;
}

// Strip encargo/fee text that leaks from the right column of the PDF two-column layout.
// e.g. "ONF *AER*03LRHM 2.327,89 Multa por atraso 2,00 % 0,00" → "ONF *AER*03LRHM 2.327,89"
function stripEncargos(line: string): string {
  return line
    .replace(/Multa por atraso.*/i, '')
    .replace(/Juros de atraso.*/i, '')
    .replace(/Juros de mora.*/i, '')
    .replace(/IOF de financiamento.*/i, '')
    .trim();
}

function parseOnfTransactions(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  for (const rawLine of lines) {
    const line = stripEncargos(rawLine);
    if (!line.toUpperCase().includes('ONF')) continue;

    // Extract all Brazilian currency values (e.g., 1.234,56 or 89,90)
    const valueMatches = [...line.matchAll(/\d{1,3}(?:\.\d{3})*,\d{2}/g)];
    if (valueMatches.length === 0) continue;
    // Use the last value on the line (typically the transaction amount)
    const value = valueMatches[valueMatches.length - 1][0];

    // Extract date (DD/MM or DD/MM/YYYY)
    const dateMatch = line.match(/(\d{2}\/\d{2}(?:\/\d{2,4})?)/);
    const rawDate = dateMatch?.[1] ?? '';
    // For DD/MM dates: December belongs to the previous year (2025); other months to 2026
    const date =
      rawDate && rawDate.split('/').length === 2
        ? `${rawDate}/${rawDate.startsWith('12/') ? '2025' : '2026'}`
        : rawDate;

    // Extract the ONF block: from "ONF" until the last occurrence of the value
    const onfIndex = line.toUpperCase().indexOf('ONF');
    const valueIndex = line.lastIndexOf(value);
    const onfBlock = line.substring(onfIndex, valueIndex).trim() || 'ONF';

    // Code: "ONF" + full next token (preserving complete booking reference)
    const codeMatch = onfBlock.match(/ONF\s*([A-Z0-9*_-]+)?/i);
    const onfSuffix = codeMatch?.[1] ?? '';
    const code = onfSuffix ? `ONF${onfSuffix}` : 'ONF';

    // Description: everything after the first token following ONF
    const descMatch = onfBlock.match(/ONF\s*\S*\s+(.*)/i);
    const type = descMatch?.[1]?.trim() || onfBlock;

    transactions.push({
      id: `pdf-${Date.now()}-${transactions.length}`,
      code,
      type,
      value,
      date,
    });
  }

  return transactions;
}
