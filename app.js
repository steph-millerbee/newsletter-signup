require("dotenv").config();

const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
const server = process.env.SERVER;


mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: server,
});


app.use(express.static("public")); //static files are placed in the "public" folder in order to be rendered on a website
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html")
});

app.post("/", function(req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        }
      }
    ]
  };
  
  const jsonData = JSON.stringify(data);

  const url = "https://" + server + ".api.mailchimp.com/3.0/lists/" + audienceId;

  const options = {
    method: "POST",
    auth: "stephanie8:" + process.env.MAILCHIMP_API_KEY
  }

  const request = https.request(url, options, function(response) {

    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
  });

  request.write(jsonData);
  request.end();
  
});

app.post("/failure", function(req, res) {
  res.redirect("/");
})

app.listen(process.env.PORT || 3000, function() { //listening on heroku port and local host port 3000 simultaneously so we can test run code
  console.log("Server is running on port 3000")
});

//the procfile contains the commands of code that are to be run by the host server  