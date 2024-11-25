// configure modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');  
const app = express();
const bcrypt = require('bcrypt');
const { findUserName } = require('./script');

// use ejs layout
app.use(expressLayouts);
app.set('view engine', 'ejs');

// reach static files
app.use(express.static('public'));
// port
const port = 5175;

// middleware
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        layout: 'layouts/container'
    })
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userData = findUserName(username , password);
    // check if user is not exist
    if (!userData) {
        return res.status(401).json({ message: 'Invalid username or password' });
    };

    // check if password is correct
    const isPasswordValid = bcrypt.compareSync(password , userData.hashedPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
    };

    res.json({message : "login successfull"})
})

app.listen(port , (err, res) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`Server running on port localhost:${port}`);
    }
});