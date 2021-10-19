const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')

const errorController = require('./controllers/error');
const User = require('./models/user');

const corsOptions = {
    origin: "https://cse341-walker-ecommerce.herokuapp.com/",
    optionsSuccessStatus: 200
};

const PORT = process.env.PORT || 3000; // So we can run on heroku || (OR) localhost:5000

const app = express();

// *********** Mongo and Heroku stuff ***********
app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

const uriObj = require('./util/url');
const MONGODB_URL = process.env.MONGODB_URL || uriObj.uri;
// *********** End of Mongo and Heroku stuff ***********

const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'ecommerce-sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        // console.log("No user");
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            // console.log(user);
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/favicon.ico', (req, res, next) => {
    // Just to avoid the second request for the favicon
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next()
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// 404 error
app.use(errorController.get404);

mongoose
    .connect(MONGODB_URL)
    .then( result => {
        app.listen(PORT);
    })
    .catch(err => {
        console.log(err);
    });
