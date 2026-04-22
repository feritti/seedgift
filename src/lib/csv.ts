/**
 * RFC 4180 CSV helpers. Kept tiny and dependency-free.
 */

/**
 * Escape a single field: wrap in double quotes (with internal " doubled) if the
 * value contains a comma, double quote, or newline. Null / undefined → empty.
 */
export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : value instanceof Date
          ? value.toISOString()
          : JSON.stringify(value);
  if (/[,"\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvColumn<T> {
  /** Column header written at the top of the CSV. */
  header: string;
  /** Value extractor; receives a row and returns the cell value (any primitive or Date). */
  get: (row: T) => unknown;
}

/** Turn an array of rows into a CSV string (LF line endings). */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((c) => escapeCsvField(c.header)).join(",");
  if (rows.length === 0) return headerLine + "\n";
  const dataLines = rows.map((r) =>
    columns.map((c) => escapeCsvField(c.get(r))).join(",")
  );
  return [headerLine, ...dataLines].join("\n") + "\n";
}

/** yyyymmdd date stamp for filenames. */
export function csvDateStamp(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Build a Response that triggers a browser download of CSV content. */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
