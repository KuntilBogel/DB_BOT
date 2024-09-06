import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Sample data to be written to the test.json file
const data = {
    name: "Test Name",
    description: "This is a test JSON file",
    version: "1.0.0"
};

// Convert the JavaScript object into a JSON string
const jsonData = JSON.stringify(data, null, 2);

// Get the current directory name (__dirname equivalent in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the path to ../test.json (parent directory of current file)
const filePath = join(__dirname, '../test.json');

// Write the JSON string to the file
try {
    await writeFile(filePath, jsonData);
    console.log('Successfully wrote to ../test.json');
} catch (err) {
    console.error('Error writing to file', err);
}
