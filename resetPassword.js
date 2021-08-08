module.exports = function(app, path, mongo, dburl) {
    app.get('/reset-password', (req,res) => {
        console.log("Loaded homepage")
        res.sendFile(path.join(__dirname, 'html', 'resetPassword.html'))
    })

    async function sendHomePage(res) {
        console.log('Redirecting back to home page')
        await new Promise(resolve => setTimeout(resolve, 5000))
        res.sendFile(path.join(__dirname, 'html', 'index.html'))
    }

    app.post('/reset-password', (req, res) => {
        console.log("Received request to reset the password")
        const username = req.body.username
        const password = req.body.new_password
        if(username === '' || password === '') {
            res.send("Please enter mandatory values")
        }
        mongo.connect(dburl, (err, db) => {
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
                    res.send(`Unable to find any user with username ${username}`)
                    return
                }
                var update = { $set : { password: password } }
                console.log("Found user " + username)
                dbHome.collection("accounts").updateOne({username: username}, update, function(err) {
                    if(err) {
                        console.log(`Error occurred while updating password for user ${username} :: ${err}`)
                        res.send('Error occurred while updating password, please try again later')
                        throw err
                    }
                    res.send('Successfully updated password')
                    db.close()
                    sendHomePage(res)
                })
            })
        })
    })
}