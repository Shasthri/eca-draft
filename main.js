var express = require('express');
var faker = require('faker');
var app = express();
var fs = require('fs');
var http = require('http');
var util = require('util');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.json());

// List All Tickets [GET]
app.get('/tickets', function (req, res) {

  var tickets = {} // empty Object
  tickets['_items'] = []; // empty Array

  var i;
  for (i = 0; i < 5; i++) {
    var id = faker.random.uuid();
    var data = {
      "customer": faker.company.companyName().toUpperCase(),
      "status": "Resolved",
      "product": faker.commerce.productName(),
     "_id": id,
     "_updated": faker.date.past(),
     "summary": faker.lorem.sentences(),
      "_links": {
        "self": {
          "href": "tickets/" + id,
          "title": "Ticket"
        }
      },
      "_created": faker.date.past(),
      "ticketID": faker.random.number(),
      "_etag": faker.random.uuid(),
      "subject": faker.lorem.sentence()
    };
    tickets["_items"].push(data);
  }
  tickets["_links"] = {
                        "self": {
                          "href": "tickets",
                          "title": "tickets"
                        },
                        "parent": {
                          "href": "/",
                          "title": "home"
                        }
                      };
  tickets["_meta"] = {
                       "max_results": 25,
                       "total": 5,
                       "page": 1
                     };
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(tickets) );
})

// Create a New Ticket [POST]
app.post('/', function (req, res) {

  console.log('Create new ticket. Request body: ', req.body);
  //Create new ticket....

  var id = faker.random.uuid();
  var currentDate = new Date(Date.now()).toLocaleString();
  var result = {
      "_updated": currentDate,
      "_links": {
          "self": {
            "href": "tickets/" + id,
            "title": "Ticket"
          }
        },
        "_created": currentDate,
        "_status": "OK",
        "_id": id,
        "_etag": faker.random.uuid()
      };

  res.setHeader('Location', '/tickets/' + id);
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(result));

})

//Update a Ticket [PATCH /tickets/{id}]
app.patch('/tickets/:id', function (req, res) {
  var id = req.params.id;
  console.log('Update ticket. Id: ', id);
  console.log('Update ticket. Request body: ', req.body);
  //Update ticket....

  var etag = faker.random.uuid();
  var result = {
    "_updated": new Date(Date.now()).toLocaleString(),
     "_links": {
       "self": {
         "href": "tickets/" + id,
         "title": "Ticket"
       }
     },
     "_created": faker.date.past(),
     "_status": "OK",
     "_id": id,
     "_etag": etag
   };

  res.setHeader('ETag', etag);
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(result));
})

// Update an incident [POST /incidents/{id}]
app.post('/incidents/:id', function (req, res) {
  var id = req.params.id;
  console.log('Update incident. Id: ', id);
  console.log('Update incident. Request body: ', req.body);
  //Update incident....

  var result = { "status": "Resolved" };

  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(result));
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
