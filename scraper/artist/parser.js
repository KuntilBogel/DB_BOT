import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import axios from "axios";
import { faker } from "@faker-js/faker";
import useragent from "useragent";
import fs from 'fs';

const a = `ariana grande, kanye west, lana del rey, sza, justin bieber, drake, adele, miley cyrus, laufey, mitski, jennie, jungkook, billie eilish, sabrina carpenter, beyonce, nicki minaj, lizzo, cardi b, zayn malik, dua lipa, zendaya, leonardo dicaprio, taylor swift, jisoo, benedict cumberbatch, ice spice, katy perry, kylie jenner, kim kardashian, jenna ortega, dwayne johnson, timothee chalamet, lil nas x, marilyn monroe, rose, emma watson, brad pitt, will smith, lisa, jackie chan, angelina jolie, anne hathaway, selena gomez, camilla cabello, shawn mendes, wonyoung, lionel messi, cristiano ronaldo, ed sheeran, gordon ramsay, shakira, michael jackson, lady gaga, bruno mars, taehyung, chris pratt, gigi hadid, bella hadid, rihanna, madonna, doja cat, demi lovato, tom holland, dove cameron, madison beer, jimin, olivia rodrigo, travis scott, britney spears, melanie martinez, chris hemsworth, michelle yeoh, adriana lima, donatella versace, harry styles, troye sivan, millie bobby brown, cillian murphy, robert downey jr, hanni, aurora, cha eunwoo, eminem`;

// Define suffixes that should be fully uppercase
const suffixes = ['jr', 'sr', 'ii', 'iii', 'iv', 'v'];

// Parsing Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = join(__dirname, '../beta_artist.json');

// Function to process each word
const processWord = (word) => {
    if (suffixes.includes(word.toLowerCase())) {
        return word.toUpperCase();
    } else if (word.includes('-')) {
        return word
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('-');
    } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
};

// Function to process each name
const processName = (name) => {
    return name
        .split(' ')
        .map(processWord)
        .join(' ');
};

// Processing Names
const formattedNames = a.split(", ").map(processName);

// Saving Data
try {
    fs.writeFileSync(filePath, JSON.stringify(formattedNames, null, "  "));
    console.log("Names have been successfully formatted and saved.");
} catch (error) {
    console.error("Error writing to file:", error);
}
