import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  let FinalData = [];
  
  for (let i = 0; i < 20; i++) {
    try {
      const { data } = await axios.get("https://www.wordiebox.com/api/words?country=indonesian&number=300");
      const newWords = data.map(item => item.Word);
      FinalData = [...new Set(FinalData.concat(newWords))];
      console.log(i)
    } catch (err) {
      console.error(`Error fetching data on iteration ${i}:`, err);
    }
  }
  
  try {
    const rawData = fs.readFileSync(path.join(__dirname, "raw.txt"), 'utf8');
    const pp = rawData.split(',').map(word => word.trim());
    FinalData = [...new Set(FinalData.concat(pp))];
  } catch (err) {
    console.error('Error reading raw.txt:', err);
  }
  
  fs.writeFileSync(
    path.join(__dirname, "susunkata.json"),
    JSON.stringify(FinalData, null, 2)
  );
  
  console.log('FinalData saved to susunkata.json');
})();
