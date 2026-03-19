/**
 * ROTC Attendance rules:
 * - Max 3 absences allowed per semester (15 training days).
 * - 4 absences = "Warning" (Running for Drop)
 * - 5+ absences = "Dropped"
 * - 3 excused absences = 1 equivalent regular absence in total count.
 */

const EXCUSED_PER_EQUIVALENT = 3;
const WARNING_THRESHOLD = 4;
const DROPPED_THRESHOLD = 5;

/**
 * Compute equivalent absences: regular absences + floor(excused_count / 3)
 */
function computeEquivalentAbsences(absentCount, excusedCount) {
  const equivalentFromExcused = Math.floor(excusedCount / EXCUSED_PER_EQUIVALENT);
  return absentCount + equivalentFromExcused;
}

/**
 * Get status from total equivalent absences.
 */
function getStatus(equivalentAbsences) {
  if (equivalentAbsences >= DROPPED_THRESHOLD) return 'Dropped';
  if (equivalentAbsences >= WARNING_THRESHOLD) return 'Warning';
  return 'Normal';
}

/**
 * Recompute totals and status for a cadet from their attendance rows.
 * @param {Array<{status: string}>} records - e.g. [{ status: 'Present' }, { status: 'Absent' }, ...]
 */
function computeCadetTotals(records) {
  let absent = 0;
  let excused = 0;
  for (const r of records) {
    if (r.status === 'Absent') absent++;
    else if (r.status === 'Excused') excused++;
  }
  const equivalentAbsences = computeEquivalentAbsences(absent, excused);
  const status = getStatus(equivalentAbsences);
  return { total_absences: absent, excused_count: excused, equivalent_absences: equivalentAbsences, status };
}

module.exports = {
  EXCUSED_PER_EQUIVALENT,
  WARNING_THRESHOLD,
  DROPPED_THRESHOLD,
  computeEquivalentAbsences,
  getStatus,
  computeCadetTotals,
};
