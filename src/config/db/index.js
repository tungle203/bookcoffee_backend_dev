const mysql = require('mysql2');

//create database connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'THANHtung2003',
    database: 'dahttt',
});

//connect to database
module.exports = connection;
