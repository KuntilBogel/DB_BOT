import axios from 'axios'
import { load } from 'cheerio'
import * as fs from 'fs'
let pageToFetches = []

let a = await axios.get(`https://www.cademedia.com/jawaban-tebak-gambar`, {
  headers: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9,id;q=0.8,ar;q=0.7',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'priority': 'u=0, i',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  }
})
let $ = load(a.data)
$(".wp-block-list").each((i, el) => {
  $(el).find("li").each((i, el) => {
    pageToFetches.push($(el).find('a').attr("href"))
  })
})

let index = 0
let ard = []

for (const x of pageToFetches) {
//   if (!x.endsWith("-1")) continue;
  const { data } = await axios.get(x, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9,id;q=0.8,ar;q=0.7',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'priority': 'u=0, i',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    }
  })
  const $ = load(data)
  $('span, .code-block').remove()
  $('[id^="ezoic-pub-ad-placeholder-"]').remove()
  
  $('.wp-block-image').each((i, el) => {
    const main = $(el)
    let jwbn = '',
        desc = ''
    const prevText = main.prev().text()
    const nextText = main.next().text()
    if (prevText.toLowerCase().startsWith("jawaban")) {
      jwbn = prevText.split(": ").slice(1).join(" ").trim()
    } else {
      jwbn = nextText.split(": ").slice(1).join(" ").trim()
    }
    if (!prevText.toLowerCase()) {
      console.log(main.prev())
    }
    if (prevText.toLowerCase().startsWith("gambar")) {
      desc = prevText.trim()
    } else if (nextText.toLowerCase().startsWith("gambar")){
      desc = nextText.trim()
    }
    ard.push({
      index: index++,
      img: main.find('img').attr('data-ezsrc'),
      jawaban: jwbn,
      deskripsi: desc
    })
  })
}

// Uncomment one of these to see the result
// console.log(JSON.stringify(ard, null, 2))
fs.writeFileSync("tebakgambar.json", JSON.stringify(ard, null, 2))