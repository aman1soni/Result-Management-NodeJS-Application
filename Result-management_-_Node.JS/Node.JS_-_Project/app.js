const express = require('express')
const mysql = require('mysql')
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const session = require('express-session');
var cors = require('cors')
const app = express()

app.use(bodyParser.json());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//for connection with mysql
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root', /* MySQL User */
    password: 'root', /* MySQL Password */
    database: 'stu_teach_results' /* MySQL Database */
});

conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected with App...');
});


//set ejs view-engine
app.set('view engine', 'ejs')

//settings for body parsing and for use json
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(methodOverride('_method'))
app.use(cors());

//used to get index page
app.get('/', (req, res) => {
    res.render('index')
})


// </----------------teacher-routes-------------------->

app.get('/teacher', (req, res) => {
    res.render('teacherLogin')
})

app.post('/teacher/auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        conn.query('SELECT * FROM teacherdata WHERE name = ? AND password = ?', [username, password], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                req.session.loggedin = true;
                req.session.username = username;
                // Redirect to home page
                return res.redirect('/teacher/result-dashboard');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            // res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }

})

app.get('/teacher/result-dashboard', function (req, res) {
    // If the user is loggedin
    if (req.session.loggedin) {
        let sqlQuery = "SELECT * FROM results";
        let query = conn.query(sqlQuery, (err, results) => {
            if (err) throw err;
            res.render('result-dashboard', { data: results })
        });

    } else {
        // Not logged in
        res.send('Please login to view this page!');
    }
});

app.get('/teacher/result-dashboard/edit/:rollno', function (req, res) {
    // If the user is loggedin
    if (req.session.loggedin) {
        let sqlQuery = "SELECT * FROM results WHERE roll_no=" + req.params.rollno;

        let query = conn.query(sqlQuery, (err, result) => {
            if (err) throw err;
            let data = Object.assign({}, ...result);
            data.dob = new Date(data.dob).toISOString().split('T')[0]
            res.render('edit-result', { result: data });
        });

    } else {
        // Not logged in
        res.send('Please login to view this page!');
    }
});

app.put('/teacher/result-dashboard/update/:rollno', function (req, res) {
    // If the user is loggedin
    if (req.session.loggedin) {
        let sqlQuery = "UPDATE results SET stu_name='" + req.body.stu_name + "', dob='" + req.body.dob + "', score='" + req.body.score + "' WHERE roll_no=" + req.params.rollno;
        conn.query(sqlQuery, (err, result) => {
            if (err) throw err;
            return res.redirect('/teacher/result-dashboard');
        });

    } else {
        // Not logged in
        res.send('Please login to view this page!');
    }
});

app.get('/teacher/result-dashboard/delete/:rollno', function (req, res) {
    // If the user is loggedin
    if (req.session.loggedin) {
        let sqlQuery = "DELETE FROM results WHERE roll_no=" + req.params.rollno + "";

        let query = conn.query(sqlQuery, (err, results) => {
            if (err) throw err;
            return res.redirect('/teacher/result-dashboard');

        });
    } else {
        // Not logged in
        res.send('Please login to view this page!');
    }
});

app.get('/teacher/result-dashboard/add-result', function (req, res) {
    // If the user is loggedin
    if (req.session.loggedin) {
        res.render('add-result')
    } else {
        // Not logged in
        res.send('Please login to view this page!');
    }
});



app.post('/teacher/result-dashboard/add-result', function (req, res) {
    // If the user is loggedin
    if (req.session.loggedin) {
        let sqlQuery = "INSERT INTO results SET ?";
        conn.query(sqlQuery, req.body, (err, results) => {
            if (err) throw err;
            return res.redirect('/teacher/result-dashboard');
        });
    } else {
        // Not logged in
        res.send('Please login to view this page!');
    }
});

// </----------------student-routes----------------->

app.get('/student', (req, res) => {
    res.render('stuLogin')
})

app.post('/student/search-result', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        conn.query('SELECT * FROM studata WHERE name = ? AND password = ?', [username, password], function (error, results, fields) {
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                req.session.loggedin = true;
                req.session.username = username;
                // Redirect to home page
                res.render('search-result');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }

})

app.post('/student/search-result/result', (req, res) => {
    let rollno = req.body.rollno;
    let dob = req.body.dob;
    if (rollno && dob) {
        conn.query('SELECT * FROM results WHERE roll_no = ? AND dob = ?', [rollno, dob], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            if (results.length > 0) {
                let data = Object.assign({}, ...results);
                res.render('result', { result: data })
            } else {

            }
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }

})

//server runs on port 4000
app.listen(4000, () => {
    console.log('Server started on port 4000...');
});
