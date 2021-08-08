module.exports = function(app, path) {
    app.get('/register', (req,res) => {
        console.log("Loaded homepage")
        res.sendFile(path.join(__dirname, 'html', 'register.html'))
    })
}