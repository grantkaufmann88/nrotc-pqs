import fs from "fs";
import path from "path";


export function loadPQS() {
// Loads small excerpts to keep prompts tiny. Edit data/pqs-fa25.json
const file = path.join(process.cwd(), "data", "pqs-fa25.json");
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
return data; // [{ id, title, expectation, excerpt }]
}


export function randomPQS() {
const all = loadPQS();
return all[Math.floor(Math.random() * all.length)];
}