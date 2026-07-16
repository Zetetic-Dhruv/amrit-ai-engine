import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const root = process.cwd();
const rows = [
  { "Village Name": "Anandpur", "Q1.1": "No", "Q2.1": "Yes", "Q3.1": "No", "Q4.1": "Yes", "Q5.1": "No", "Q6.1": "Yes" },
  { "Village Name": "Bhairavpur", "Q1.1": "Yes", "Q2.1": "No", "Q3.1": "Yes", "Q4.1": "No", "Q5.1": "Yes", "Q6.1": "No" },
];
const blank = [{ "Village Name": "", "Q1.1": "Yes", "Q2.1": "Yes", "Q3.1": "Yes", "Q4.1": "Yes", "Q5.1": "Yes", "Q6.1": "Yes" }];

function writeWorkbook(target, data) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), "Village Survey");
  XLSX.writeFile(workbook, target);
}

writeWorkbook(path.join(root, "fixtures", "sample-village-survey.xlsx"), rows);
writeWorkbook(path.join(root, "public", "templates", "village-survey-template.xlsx"), blank);
console.log("Generated the sample survey and downloadable template.");
