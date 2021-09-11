const express = require('express')
const path = require('path')
const mongo = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const fs = require('fs')

const PORT = 3000
var credentials = null

try {
    credentials = JSON.parse(fs.readFileSync("credentials.json"))
} catch(err) {
    console.log("Error in credentials file", err)
}

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    console.log("Loaded homepage")
    res.sendFile(path.join(__dirname, 'html', 'index.html'))
})

app.get("/style.css", (req, res) => {
    console.log("Loaded CSS file")
    res.sendFile(path.join(__dirname, 'styles', "style.css"))
})

app.get("/assets/:fileName", (req, res) => {
    console.log("Loaded image file")
    res.sendFile(path.join(__dirname, 'assets', req.params.fileName))
})

app.post("/login", (req, res) => {
    if(req.body.username === '' || req.body.password === '') {
        res.send("Please enter mandatory values")
    }
    console.log("Trying to login for username " + req.body.username)
    mongo.connect(credentials.dbUrl, (err, db) => {
        if(err) {
            console.log("Unable to connect to database")
            res.send("Unable to login, please try again later")
            throw err
        }
        console.log("Connection successful")
        var dbHome = db.db('home')
        dbHome.collection("accounts").findOne({username: req.body.username}, (err, result) => {
            if(err) throw err
            if(result === undefined) {
                res.send(`Unable to find any user with username ${req.body.username}`)
                return
            }
            console.log("Found user " + req.body.username)
            if(result.password === req.body.password) {
                res.send("Successfully logged in")
            } else {
                res.send("Incorrect password")
            }
            db.close()
        })
    })
})

require('./register')(app, path, mongo, credentials.dbUrl)
require('./resetPassword')(app, path, mongo, credentials.dbUrl)

app.listen(PORT, () => {
    console.log("Got a hit for localhost default URL")
})