import { writeFile } from 'fs/promises';
import { join } from 'path';

const data = {
    name: "Test Name",
    description: "This is a test JSON file",
    version: "1.0.0"
};

const jsonData = JSON.stringify(data, null, 2);

const filePath = join(import.meta.url, '../test.json').replace('file://', '');

try {
    await writeFile(filePath, jsonData);
    console.log('Successfully wrote to ../test.json');
} catch (err) {
    console.error('Error writing to file', err);
}
