
// Use Express
var express = require("express");
// Use body-parser
var bodyParser = require("body-parser");
// Use MongoDB
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
// The database variable
var database;
// The apartments collection
var APARTMENTS_COLLECTION = "apartments_master";

// Create new instance of the express server
var app = express();

var cors = require('cors')
var moment = require('moment')

var md5 = require('md5');
var jwt = require('jsonwebtoken');


// Define the JSON parser as a default way 
// to consume and produce data through the 
// exposed APIs
// console.log("bodypraseeeeee",bodyParser)
app.use(cors());

app.use(bodyParser.json());


// Create link to Angular build directory
// The `ng build` command will save the result
// under the `dist` folder.
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));
// Local database URI.
const LOCAL_DATABASE = "mongodb://localhost:27017/apartments";
// Local port.
const LOCAL_PORT = 8080;

// Init the server
mongodb.MongoClient.connect(process.env.MONGODB_URI || LOCAL_DATABASE,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }, function (error, client) {

        // Check if there are any problems with the connection to MongoDB database.
        if (error) {
            console.log(error);
            process.exit(1);
        }

        // Save database object from the callback for reuse.
        database = client.db();
        console.log("Database connection done.");

        // Initialize the app.
        var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
            var port = server.address().port;
            console.log("App now running on port", port);
        });
    });

/*  "/api/status"
 *   GET: Get server status
 *   PS: it's just an example, not mandatory
 */
app.get("/api/status", function (req, res) {
    res.status(200).json({ status: "UP" });
});

/*  "/api/apartments"
 *  GET: finds all apartments
 */
app.get("/api/apartments", function (req, res) {
    ensureToken(req,res);
    database.collection(APARTMENTS_COLLECTION).find({}).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json({ "primary": data });
        }
    });
});

/*  "/api/apartments"
 *   POST: creates a new apartment
 */
app.post("/api/apartments", function (req, res) {
    var apartment = req.body;
    //     manageError(res, "Invalid apartment input", "Name is mandatory.", 400);
    database.collection(APARTMENTS_COLLECTION).insertOne(apartment, function (err, doc) {
        if (err) {
            manageError(res, err.message, "Failed to create new apartment.");
        } else {
            res.status(200).json({ status: { code: "SUCCESS", message: "Apartment Created Successfully" } });
        }
    });
    // }
});

/*  "/api/apartments"
 *   PUT: update a new apartment
 */
app.put("/api/apartments", function (req, res) {
    var apartment = req.body;
    var apartmentId = { "ApartmentId": req.body['ApartmentId'] };
    var updateApartment = { $set: apartment };

    console.log("apartmentId", apartmentId)

    //     manageError(res, "Invalid apartment input", "Name is mandatory.", 400);
    database.collection(APARTMENTS_COLLECTION).updateOne(apartmentId, updateApartment, function (err, doc) {
        if (err) {
            manageError(res, err.message, "Failed to create new apartment.");
        } else {
            res.status(200).json({ status: { code: "SUCCESS", message: "Apartment Updated Successfully" } });
        }
    });
    // }
});

/*  "/api/apartments/:id"
 *   DELETE: deletes apartment by id
 */
app.delete("/api/apartments/:id", function (req, res) {
    if (req.params.id.length > 24 || req.params.id.length < 24) {
        manageError(res, "Invalid apartment id", "ID must be a single String of 12 bytes or a string of 24 hex characters.", 400);
    } else {
        database.collection(APARTMENTS_COLLECTION).deleteOne({ _id: new ObjectID(req.params.id) }, function (err, result) {
            if (err) {
                manageError(res, err.message, "Failed to delete apartment.");
            } else {
                res.status(200).json(req.params.id);
            }
        });
    }
});

// Errors handler.
function manageError(res, reason, message, code) {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}


app.get("/api/apartments/:id", function (req, res) {
    console.log("req.params.id", req.params.id)
    database.collection(APARTMENTS_COLLECTION).findOne({ "ApartmentId": req.params.id }, function (err, doc) {
        if (err) {
            manageError(res, err.message, "Failed to create new apartment.");
        } else {
            res.status(200).json({ primary: doc, status: { code: "SUCCESS", message: "Apartment Created Successfully" } });
        }
    });
});


app.post("/api/signup", function (req, res) {
    console.log("signup1",signup)

    var signup = req.body;
    let ApartmentId = 'APSGMVDS' + Math.floor((Math.random() * 99999) + 1);
    signup['Password'] = md5(signup['Password']);
    signup['ConfirmPassword'] = md5(signup['ConfirmPassword']);
    signup['ApartmentId'] = ApartmentId;
    console.log("signup2",signup)
    if (signup['Password'] === signup['ConfirmPassword']) {
        database.collection("sign_up").insertOne(signup, function (err, doc) {
            if (err) {
                manageError(res, err.message, "Failed to create new apartment.");
            } else {
                res.status(200).json({ status: { code: "SUCCESS", message: "Signup Created Successfully" } });
            }
        });
    } else {
        manageError(res, "Password and ConfirmPassword are not matching", "Password and ConfirmPassword are not matching", 400);

    }

});


app.post("/api/login", function (req, res) {
    var login = req.body;
//   here login.ApartmentName is apartmentid
    database.collection("sign_up").findOne({ "ApartmentId": login.ApartmentName, "Password": md5(login.Password) }, function (err, doc) {
        if (doc !== null) {
            const token = jwt.sign({ login }, 'my_sceret_key');

            res.status(200).json({ "token": token,"ApartmentName": doc.ApartmentName});
        } else {
            manageError(res, "invalid Credentials", "invalid Credentials");
            
        }
    });
});

app.get("/api/signup", function (req, res) {
    // ensureToken(req,res);
    database.collection("sign_up").find({},{ projection: { _id: 0, ApartmentName: 1, ApartmentId: 1 } }).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json({ "primary": data });
        }
    });
});


  function ensureToken(req, res) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        return req.token
    } else {
        res.sendStatus(403)
    }
}