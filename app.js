const express = require("express");
const app = express();
const mongo = require("mongodb");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require('cors');
const router = require("./src/Routes/router");
const mongoose = require("mongoose")


const MongoClient = mongo.MongoClient;

dotenv.config();
const PORT = process.env.PORT || 5000;
const mongourl = "mongodb+srv://test:test123@cluster0.wy6xk.mongodb.net/Zomato?retryWrites=true&w=majority";
let db;
mongoose.connect(mongourl, {
    useNewUrlParser : true,
})
// const connection = mongoose.connection;
.then(data => {
    console.log("Mongoose Connected...");
})
.catch(err => {
    console.log("Connection failed...");
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


app.use('/', router)

app.get("/", (req, res) => {
    res.json({
        msg: "Welcome to ExpressJs"
    })
});

app.get("/location", (req, res) => {
    db.collection("location").find().toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    });
});


//***** Restaurant as per loa ******/
// app.get("/restaurants/:id", (req,res) => {
//     var stateId = Number(req.params.id);
//     db.collection("restaurants").find({state_id : stateId}).toArray((err,result) => {
//         if (err) throw err;
//         res.json(result);
//     })
// });

app.get("/restaurants", (req, res) => {
    let stateId = Number(req.query.state_id);
    let mealId = Number(req.query.meal_id);
    let query = {}

    /****** Restaurant wrt to query (state_id) *******/
    if (stateId && mealId) {
        query = { state_id: stateId, "mealTypes.mealtype_id": mealId };
    }

    /****** Restaurant wrt to query (state_id) *******/
    else if (stateId) {
        query = { state_id: stateId }
    }

    /****** Restaurant wrt to query (meal_id) *******/
    else if (mealId) {
        query = { "mealTypes.mealtype_id": mealId }
    }
    // console.log("restId", stateId);
    db.collection("restaurants").find(query).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
});


// /********** Filter ********/
app.get('/filter/:mealId', (req, res) => {
    let mealId = Number(req.params.mealId);
    let cuisineId = Number(req.query.cuisine);
    let hcost = Number(req.query.hcost);
    let lcost = Number(req.query.lcost);
    let sort = { cost: 1 };
    let skip = 0;
    let limit = 1000000;


    let query = {};

    if (lcost && hcost && cuisineId) {
        query = {
            $and: [{ cost: { $gt: lcost, $lt: hcost } }],
            "cuisines.cuisine_id": cuisineId,
            "mealTypes.mealtype_id": mealId
        }
    }
    else if (lcost && hcost) {
        query = {
            $and: [{ cost: { $gt: lcost, $lt: hcost } }],
            "mealTypes.mealtype_id": mealId
        }
    }
    else if (req.query.skip && req.query.limit) {
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }

    else if (req.query.sort) {
        sort = { cost: req.query.sort };
    }

    else if (cuisineId) {
        query = { "cuisines.cuisine_id": cuisineId, "mealTypes.mealtype_id": mealId }
    }
    else if (mealId) {
        query = { "mealTypes.mealtype_id": mealId }
    }

    db.collection('restaurants').find(query).sort(sort).skip(skip).limit(limit).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})


// List of all mealtypes
app.get('/mealType', (req, res) => {
    db.collection("mealType").find().toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

// Restaurant Details
app.get('/details/:id', (req, res) => {
    let restId = Number(req.params.id);

    db.collection("restaurants").find({ restaurant_id: restId }).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

// Menu wrt to Restaurant
app.get('/menu/:id', (req, res) => {
    let restId = Number(req.params.id);

    db.collection('menu').find({ restaurant_id: restId }).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

// Get Order list
app.get("/orders", (req, res) => {
    let email = req.query.email;
    let query = {};

    if (email) {
        query = { "email": email }
    }
    db.collection('orders').find(query).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})


// Place Orders
app.post("/placeOrder", (req, res) => {
    // console.log(req.body);

    db.collection('orders').insert(req.body, (err, result) => {
        if (err) throw err;
        res.json({
            msg: "Order Added"
        })
    })
})

// Restaurant wrt to id by Post request
app.post("/menuItem", (req, res) => {
    // console.log(req.body);
    db.collection('menu').find({ menu_id: { $in: req.body } }).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
});

// Delete Order list
app.delete('/deleteOrder', (req, res) => {
    db.collection('orders').remove({}, (err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

// Update Order
app.put('/updateOrder/:id', (req, res) => {
    let orderId = mongo.ObjectId(req.params.id);
    let status = req.query.status ? req.query.status : 'Pending';
    // console.log(status);

    db.collection("orders").updateOne(
        { _id: orderId },
        {$set: {
                "status": status,
                "bank_name": req.body.bank_name,
                "bank_status": req.body.bank_status
            }
        }, (err, result) => {
            if (err) throw err;
            res.json(`Status Updated to ${status}`);
        }
    )
})

app.post('/register', (req,res) => {
    db.collection("users").insertOne(req.body, (err,result) => {
        if (err) throw err;
        res.json(result)
    })
})

app.post('/login', (req,res) => {
    let name = req.body.name 
    let email = req.body.email
    console.log(email);
    
    db.collection("users").findOne({name : name, email : email}).toArray((err,result) => {
        if (err) throw err;
        res.json(result);
    })
})

MongoClient.connect(mongourl, (err, client) => {
    if (err) {
        console.log("Error While Connecting" + err);
    } else {
        db = client.db("Zomato");
        console.log("Database Connected...");
    }
})

app.listen(PORT, () => {
    console.log(`Application is running on http://localhost:${PORT}`);
});