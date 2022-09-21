const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/bankDB');

const client = {
    name: String,
    email: String,
    address: String, 
    number: Number,
    balance: Number
}

const Client = new mongoose.model('Client', client);

var senderId = "";
var amount = 0;

app.get('/', function(req, res) {
    res.render("home");
});

app.get('/customers', function(req, res) {
    Client.find(function(err, foundData) {
        res.render('customers', {
            customers: foundData,
            task: "Get Details"
        });
    })
});

app.get('/customers/:customerName', function(req, res) {
    Client.findOne({name: req.params.customerName}, function(err, foundData) {
        res.render("details", {
            customer: foundData,
        });
    })
});

app.post('/customers', function(req, res) {
    senderId = req.body.sender;
    amount = req.body.amount;
    Client.find(function(err, foundData) {
        res.render('customers', {
            customers: foundData,
            task: "Transfer"
        });
    })
});

app.post("/action", function(req, res) {
    if (req.body.action === "Get Details") {
        Client.findOne({_id: req.body.id}, function(err, foundData) {
            res.redirect("/customers/" + foundData.name);
        })
    } else {
        Client.updateOne({_id: senderId}, {$inc: {balance: -amount}}, function(err) {
            if (err) {
                console.log(err);
            }
        });
        Client.updateOne({_id: req.body.id}, {$inc: {balance: amount}}, function(err) {
            if (err) {
                console.log(err);
            }
        });
        res.render('transaction');
    }
});

app.listen(3000, function() {
    console.log("Server is live at port 3000.");
});