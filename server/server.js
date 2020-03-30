const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser')
const w2v = require('word2vec')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

let m

w2v.loadModel('./covid_word2vec.txt', (err, model) => {
    m = model
})

app.get('/', (req, res) => {
    let word = req.query.word
    let n = req.query.n
    data = m.mostSimilar(word, n)
    res.send(data)
})

app.listen(8080, () => console.log('listening...'))
