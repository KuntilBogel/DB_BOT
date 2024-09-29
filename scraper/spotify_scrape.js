import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { configDotenv } from "dotenv";
configDotenv()

import axios from "axios";
import { faker } from "@faker-js/faker";
import useragent from "useragent";
import fs from 'fs'

const UA = faker.internet.userAgent()
const parsed = useragent.parse(UA)

let ID = process.env.SPOTIFY_CLIENTID,
  SECRET = process.env.SPOTIFY_CLIENTSECRET,
  RTOKEN = process.env.SPOTIFY_REFRESHTOKEN,
  ATOKEN = ""

const getRefreshToken = async () => {
  console.time("Getting Access Token from RefreshToken")
  const url = "https://accounts.spotify.com/api/token";

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(ID + ':' + SECRET)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: RTOKEN,
      client_id: ID
    }),
  }
  const body = await fetch(url, payload);
  const response = await body.json();
  ATOKEN = "Bearer " + response.access_token
  console.timeEnd("Getting Access Token from RefreshToken")
  return response
}

await getRefreshToken()

console.time("Doing Request")
const { data: response } = await axios.get('https://charts-spotify-com-service.spotify.com/auth/v0/charts/artist-global-weekly/latest', {
  headers: {
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9,id;q=0.8',
    'app-platform': 'Browser',
    'authorization': ATOKEN,
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'origin': 'https://charts.spotify.com',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://charts.spotify.com/',
    'sec-ch-ua': `"${parsed.family}";v="${parsed.major}"`,
    'sec-ch-ua-mobile': /mobile|android|iphone|ipad/i.test(UA) ? '?1' : '?0',
    'sec-ch-ua-platform': `"${parsed.os.family}"`,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'spotify-app-version': '0.0.0.production',
    'user-agent': UA,
  }
});
console.timeEnd("Doing Request")

console.time("Mapping response")
let newdata = response.entries.map((x) => {
  return {
    artistName: x.artistMetadata.artistName,
    artistImage: x.artistMetadata.displayImageUri, 
    currentRank: x.chartEntryData.currentRank
  }
})
console.timeEnd("Mapping response")

console.time("Parsing Path")
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = join(__dirname, '../topartist.json');
console.timeEnd("Parsing Path")

console.time("Saving Data")
fs.writeFileSync(filePath, JSON.stringify(newdata, "", "  "))
console.timeEnd("Saving Data")