// Module dependencies
var express = require('express'),
    mysql = require('mysql'),
    connect = require('connect');

// Application initialization
var connection = mysql.createConnection({
    host: 'cwolf.cs.sonoma.edu',
    user: 'jedison',
    password: '3948820'
});

var app = express();

// Database setup
    connection.query('USE jedison', function (err) {
        if (err) throw err;
        connection.query('CREATE TABLE IF NOT EXISTS testUsers('
        	+ 'Email VARCHAR(30)'
            + 'PRIMARY KEY,'
		    + 'FName VARCHAR(30),'
            + 'LName VARCHAR(30),'
            + 'Instrument VARCHAR(30)'
	        + ')', function (err) {
	            if (err) throw err;
	        }
        );
    });

// Configuration
app.use(connect.bodyParser());

app.use(express.static(__dirname + '/public'));

// Main route sends our HTML file
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/createuser', function (req, res) {
    res.sendfile(__dirname + '/createuser.html');
});

app.get('/getuser', function (req, res) {
    res.sendfile(__dirname + '/getuser.html');
});

// Update MySQL database
app.post('/getuser', function (req, res) {
    console.log("/getuser post: " + req.body);
    console.log("/getuser Email: " + req.body.Email);
    connection.query('select * from testUsers where Email = ?', req.body.Email,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Email: ' + result[0].Email + '<br />' +
                    'First Name: ' + result[0].FName + '<br />' +
		  	        'Last Name: ' + result[0].LName + '<br />' +
                    'Instrument: ' + result[0].Instrument + '<br />'
		        );
		    }
		    else
		        res.send('User does not exist.');
		});
});

// get user via GET (same code as app.post('/user') above)
app.post('/getuser/user', function (req, res) {
    console.log(req.body);
    // get user by email
    console.log("/getuser/user Email: " + req.body.Email);
    if (typeof req.body.Email != 'undefined') {
        connection.query('select * from testUsers where Email = ?', req.body.Email,
            function (err, result) {
                console.log(result);
                if (result.length > 0) {
                    var responseHTML = '<html><head><title>All Users</title><link a href="/style.css" rel="stylesheet"></head><body>';
                    responseHTML += '<table class="users"><tr><th>Email</th><th>First Name</th><th>Last Name</th><th>Instrument</th></tr>';
                    responseHTML += '<tr><td>' + result[0].Email + '</td>' +
                                    '<td>' + result[0].FName + '</td>' +
                                    '<td>' + result[0].LName + '</td>' +
                                    '<td>' + result[0].Instrument + '</td>' +
                                    '</tr></table>';
                    responseHTML += '</body></html>';
                    res.send(responseHTML);
                }
                else
                    res.send('User does not exist.');
            }
        );
    }
    //get user by username    
    else if (typeof req.query.Email != 'undefined') {
        connection.query('select * from testUsers where Email = ?', req.query.Email,
            function (err, result) {
                console.log(result);
                if (result.length > 0) {
                    res.send('Name: ' + result[0].FName + result[0].LName + '<br />'
                );
                }
                else
                    res.send('User does not exist.');
            });
    }
    else {
        res.send('no data for user in request');
    }
});

// get all users in a <select>
app.post('/getuser/users/select', function (req, res) {
    console.log(req.body);
    connection.query('select * from testUsers',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<select id="user-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<option value="' + result[i].Email + '">' + result[i].Email + '</option>';
		        console.log(option);
		        responseHTML += option;
		    }
		    responseHTML += '</select>';
		    res.send(responseHTML);
		});
});

app.post('/createuser', function (req, res) {
    console.log(req.body);
    connection.query('INSERT INTO testUsers SET ?', req.body,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from testUsers where Email = ?', req.body.Email,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Email: ' + result[0].Email + '<br />' +
                    'First Name: ' + result[0].FName + '<br />' +
		  	        'Last Name: ' + result[0].LName + '<br />' +
                    'Instrument: ' + result[0].Instrument + '<br />'
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

// Begin listening
app.listen(8005);
console.log("Express server listening on port %d in %s mode", app.settings.env);
