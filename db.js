var mysql = require('mysql2');
var db = mysql.createConnection({
    host: "localhost",
    user: "root", //sesuaikan dengan username di laptop km
    password: "simbolon", //sesuaikan dengan password di laptop km
    database: "crud_nodejs" //nama database yang kita buat tadi
});
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
module.exports = db;
