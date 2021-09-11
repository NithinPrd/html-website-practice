module.exports = function(app, path, mongo, dburl) {
    app.get('/register', (req,res) => {
        console.log("Loaded homepage")
        res.sendFile(path.join(__dirname, 'html', 'register.html'))
    })

    app.post('/register', (req,res) => {
        console.log(`Registering user with username ${req.body.username}`)
        var isError = false
        mongo.connect(dburl, async (err, db) => {
            if(err) {
                console.log('Unable to connect to database: ' + err)
                throw err
            }
            var dbHome = db.db('home')
            var result = await dbHome.collection("accounts").findOne({username: req.body.username}, (err, result) => {
                if(err) {
                    throw err
                }
                if(result == undefined) {
                    return
                } else {
                    res.send(`Username ${req.body.username} already exists`)
                    isError = true
                }
                db.close()
                return
            })
            if(!isError) {
                result = await dbHome.collection("accounts").findOne({email: req.body.email}, (err, result) => {
                    if(err) {
                        throw err
                    }
                    if(result == undefined) {
                        return
                    } else {
                        res.send(`Username ${req.body.username} already exists`)
                        isError = true
                    }
                    db.close()
                    return
                })
            }
            if(!isError) {
                result = await dbHome.collection("accounts").insertOne(createObject(req.body), (err, response) => {
                    if(err) throw err
                    res.send(`Successfully registered as new user! Your username is ${req.body.username}`)
                    db.close()
                })
            }
        })
    })
}

function createObject(requestObject) {
    return {
        username: requestObject.username,
        firstName: requestObject.firstName,
        lastName: requestObject.lastName,
        email: requestObject.email,
        password: requestObject.password,
        isDeprecated: false
    }
}

