import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import axios from 'axios';
const m = []

for (let i = 0; i < 3; i++) {
    console.log("getting " + (i+1))
    const response = await axios.post(
        'https://graphql.anilist.co/',
        {
            'query': '\n    {\n      Page(page:' + (i + 1) + ', perPage: 500){\n        media (sort:POPULARITY_DESC, isAdult: false){      \n          title {\n            english\n           \tromaji            \n          }\n          id\n          characters(sort:FAVOURITES_DESC, perPage: 5){\n            nodes{\n              id\n              name {\n                full\n              }\n              image{\n                large\n              }\n            }\n          }      \n        }\t\n      }\n  }',
            'variables': {}
        },
        {
            headers: {
                'accept': '/',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            }
        }
    );
    m.push(...response.data.data.Page.media)

}
const jsonData = JSON.stringify(m, null, 2);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../animechars.json');

try {
    await writeFile(filePath, jsonData);
    console.log('Successfully wrote to ../animechars.json');
} catch (err) {
    console.error('Error writing to file', err);
    process.exit(1)
}
