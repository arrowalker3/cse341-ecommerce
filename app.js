const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000; // So we can run on heroku || (OR) localhost:5000

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const rootDir = require('./util/path');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/favicon.ico', (req, res, next) => {
    // Just to avoid the second request for the favicon
})

app.use('/admin', adminData.routes);
app.use(shopRoutes);

// 404 error
app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page Not Found', path: ''});
});

app.listen(PORT);