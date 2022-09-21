const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://admin-kazim:test123@cluster0.rkx7a2k.mongodb.net/bankDB?retryWrites=true&w=majority');

const client = {
    name: String,
    email: String,
    address: String, 
    number: Number,
    balance: Number
}

const transaction = {
    sender: String,
    senderName: String,
    receiver: String,
    receiverName: String,
    amount: Number
}

const Client = new mongoose.model('Client', client);
const Transaction = new mongoose.model('Transaction', transaction);

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

app.get('/transactions', function(req, res) {
    Transaction.find(function(err, foundData) {
        if(!err) {
            console.log(foundData);
            res.render('transactions', {
                transactionList: foundData,
            })
        }
    });
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
    var senderName = "";
    var receiverName = "";
    
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

        Client.findOne({_id: senderId}, function(err, foundData) {
            if(!err) {
                senderName = foundData.name;

                Client.findOne({_id: req.body.id}, function(errr, foundDataa) {
                    if(!errr) {
                        receiverName = foundDataa.name;
        
                        const transaction = new Transaction ({
                            sender: senderId,
                            senderName: senderName,
                            receiver: req.body.id,
                            receiverName: receiverName,
                            amount: amount
                        })
                        transaction.save();
                    }
                });
            }
        });



        res.render('status');
    }
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is live.");
});