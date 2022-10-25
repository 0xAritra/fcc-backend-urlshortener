require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const bodyParser = require("body-parser")
const dns = require("dns")

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())

app.use("/public", express.static(`${process.cwd()}/public`))

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" })
})

app.use(bodyParser.urlencoded({ extended: false }))

let count = 0
const idToLink = {}
const LinkToId = {}

app.post("/api/shorturl/", function (req, res) {
  let url = req.body.url
  const regex = /^https?:\/\//
  if (!regex.test(url)) {
    res.json({ error: "Invalid URL" })
    return
  }
  url = new URL(url)
  dns.lookup(url.hostname, (err, addresses) => {
    if (err) res.json({ error: "Invalid Hostname" })
    else {
      if (LinkToId[url])
        res.json({
          original_url: url,
          short_url: LinkToId[url],
        })
      // for existing urls
      else {
        count++
        idToLink[count] = url
        LinkToId[url] = count
        res.json({ original_url: url, short_url: count })
      }
    }
  })
})

app.get("/api/shorturl/:id", function (req, res) {
  const url = idToLink[req.params.id]
  if (url) res.status(301).redirect(url)
  else res.json({ error: "No short URL found for the given input" })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
