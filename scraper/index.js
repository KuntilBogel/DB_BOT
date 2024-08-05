import fs from 'fs'
let data = []
const text = fs.readFileSync("./textraw.txt", "utf-8").split("\n")
text.forEach(x => {
    let nen = x.split(" = ")
    data.push({
        // "pertanyaan": nen[0].split(", "),
        "pertanyaan": nen[0],
        "jawaban": nen[1].toUpperCase()
    })
    // console.log(, ))
})
fs.writeFileSync("./parsedtextraw.json", JSON.stringify(data, null, 2))
