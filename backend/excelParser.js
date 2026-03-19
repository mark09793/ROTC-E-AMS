const XLSX = require('xlsx');
const { computeCadetTotals } = require('./attendanceLogic');

const TRAINING_DAYS_COUNT = 15;
const STATUS_VALUES = ['Present', 'Absent', 'Excused'];

/**
 * Normalize cell value to a valid status.
 * Excel coding for this system:
 * - "1" = Present
 * - "A" = Absent
 * - "E" = Excused
 * - blank = upcoming training day (no record yet, not counted)
 */
function normalizeStatus(val) {
  if (val == null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (s === '1') return 'Present';
  if (lower === 'present' || lower === 'p') return 'Present';
  if (lower === 'excused' || lower === 'e') return 'Excused';
  if (lower === 'absent' || lower === 'a') return 'Absent';
  return null;
}

/**
 * Parse uploaded Excel file.
 * Expected layout: Row 1 = headers. Column A = Cadet Name, Columns B..P (or 2..16) = Day 1..15.
 * Or: Row 1 = dates/headers, Row 2+ = name in first col, then status per day.
 */
function parseExcelBuffer(buffer) {
  if (!buffer || buffer.length === 0) throw new Error('File is empty');
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  } catch (e) {
    throw new Error('Invalid or corrupted Excel file. Use .xlsx or .xls format.');
  }
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) throw new Error('Excel file has no sheets');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('First sheet could not be read');
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

  if (!data.length) throw new Error('Sheet is empty');

  // First row = headers. Column A = name, Columns B..P = Day 1..15
  const headers = Array.isArray(data[0]) ? data[0] : [data[0]];
  const nameCol = 0;
  const dayColStart = 1;
  const maxDays = Math.max(0, (headers.length || 1) - 1);
  const dayCount = Math.min(TRAINING_DAYS_COUNT, maxDays);
  if (dayCount === 0) throw new Error('Excel must have at least 2 columns: Names (A) and Training Day 1 (B)');

  const cadets = [];
  const dates = []; // optional date headers for display

  for (let c = 0; c < dayCount; c++) {
    const h = headers[dayColStart + c];
    dates.push(h != null ? String(h) : `Day ${c + 1}`);
  }

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const name = row[nameCol] != null ? String(row[nameCol]).trim() : '';
    if (!name) continue;

    const records = [];
    for (let c = 0; c < dayCount; c++) {
      const status = normalizeStatus(row[dayColStart + c]);
      records.push({ dayNumber: c + 1, status, dateLabel: dates[c] });
    }

    // Only count days that already occurred (status not null)
    const totals = computeCadetTotals(records.filter((r) => r.status));
    cadets.push({
      name,
      dates,
      records,
      ...totals,
    });
  }

  return { cadets, dates, dayCount };
}

module.exports = { parseExcelBuffer, TRAINING_DAYS_COUNT, normalizeStatus };
