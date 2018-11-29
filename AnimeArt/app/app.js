const express = require('express');
var path = require('path');
var mysql = require('mysql');
//database connections
var con = mysql.createConnection({
    host: "mysql-server-1.macs.hw.ac.uk",
    user: "wcw3",
    password: "abcwcw3354",
    database: "db_order_system"

});

const app = express();
app.use(express.static('public'))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//route for index
app.get('/', function (req, res) {
    con.query("SELECT * FROM products", function (err, result, fields) {
        if (err)
            res.redirect('/');
        console.log(result);
        res.render('index', { data: result });
    });
});

//route for product details
app.get('/product/:id/', function (req, res) {
    let id = req.params.id;
    con.query("SELECT * FROM products where id=" + id, function (err, result, fields) {
        if (result.length > 0 && err == null) {
            res.render('product-details', { data: result });
        } else {
            res.redirect('/');
        }
    });
});

//route for order details
app.post('/orders', function (req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let address = req.body.address;
    let qty = req.body.qty;
    let orderid = generateorderid();
    if (id == "" || name == "" || address == "" || qty == "") {
        res.redirect('/product/' + id);
    } else {
        con.query("SELECT * FROM products where id=" + id, function (err, result, fields) {
            let total = qty * result[0].price;
            var sql = "INSERT INTO orders (orderno,product_id,name, address,qty,total) VALUES ('" + orderid + "','" + id + "','" + name + "','" + address + "','" + qty + "','" + total + "')";
            con.query(sql, function (err, result) {
                if (err == null) {
                    res.redirect('/order-details/' + orderid);
                }
                else {
                    res.redirect('/');
                }
            });
        });
    }
});


//route for index
app.get('/order-details/:id', function (req, res) {
    console.log("sdadsa");
    let id = req.params.id;
    con.query("SELECT o.orderno,o.name,o.address,o.total FROM orders as o INNER JOIN products as p ON o.product_id=p.id where o.orderno='" + id + "'", function (err, result, fields) {
        if (result.length > 0 && err == null) {
            res.render('orderdetails', { order: result });
        }
        else {
            res.redirect('/');
        }
    });
});

app.get('*', function (req, res) {
    res.redirect('/');
});

// generate random order number
function generateorderid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//port
app.listen(3354, function () {
    console.log("App is running on 3354");
})
