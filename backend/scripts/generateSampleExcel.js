/**
 * Generates sample_attendance.xlsx for testing upload.
 * Column A = Name, B-P = Day 1-15 with Present/Absent/Excused.
 */
const XLSX = require('xlsx');
const path = require('path');

const headers = ['Name', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14', 'Day 15'];
const statuses = ['Present', 'Absent', 'Excused'];

const rows = [
  ['Cadet Alpha', 'Present', 'Present', 'Present', 'Absent', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present'],
  ['Cadet Bravo', 'Present', 'Present', 'Excused', 'Excused', 'Excused', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present'],
  ['Cadet Charlie', 'Present', 'Absent', 'Absent', 'Absent', 'Absent', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present'],
  ['Cadet Delta', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present'],
];

const data = [headers, ...rows];
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
const outPath = path.join(__dirname, '..', 'sample_attendance.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Created', outPath);
