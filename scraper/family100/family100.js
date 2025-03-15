import axios from "axios";
import fs from "fs";
/*
async function fetchAndRemoveDuplicates(url) {
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    const uniqueQuestions = new Map();
    
    data.forEach(item => {
      if (!uniqueQuestions.has(item.soal)) {
        uniqueQuestions.set(item.soal, item);
      }
    });
    
    const result = Array.from(uniqueQuestions.values());
    fs.writeFileSync("old.json", JSON.stringify(result, null, 2));
    console.log("Data saved to new.json");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const url = "https://raw.githubusercontent.com/YangJunMing12/family100-database/main/family100.json";
fetchAndRemoveDuplicates(url);
*/
// Please manually remov the 18+ q
async function mergeWithSoalTxt() {
    try {
      const jsonData = JSON.parse(fs.readFileSync("old.json", "utf-8"));
      // Read the file, trim each line, and filter out empty ones.
      const lines = fs.readFileSync("soal.txt", "utf-8")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
  
      // Process each pair of lines: first for question, second for answers.
      for (let i = 0; i < lines.length; i += 2) {
        if (lines[i] && lines[i + 1]) {
          const soal = lines[i];
          const jawaban = lines[i + 1].split(";-;").map(j => j.trim());
          jsonData.push({ soal, jawaban });
        }
      }
  
      fs.writeFileSync("new.json", JSON.stringify(jsonData, null, 2));
      console.log("Merged data saved to new.json");
    } catch (error) {
      console.error("Error merging data:", error);
    }
  }
  
async function fixCapitalization() {
    try {
      const jsonData = JSON.parse(fs.readFileSync("new.json", "utf-8"));
      
      jsonData.forEach(item => {
        item.soal = item.soal.replace(/\b\w/g, c => c.toUpperCase());
        item.jawaban = item.jawaban.map(j => j.replace(/\b\w/g, c => c.toUpperCase()));
      });
      
      fs.writeFileSync("new.json", JSON.stringify(jsonData, null, 2));
      console.log("Capitalization fixed in new.json");
    } catch (error) {
      console.error("Error fixing capitalization:", error);
    }
  }
  await mergeWithSoalTxt()
  await fixCapitalization()