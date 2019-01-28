var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017/";

app.get('/test', (req, res) => {
  res.send('Working')
})

app.get('/reg', (req, res) => {
  // TODO: regisration
  var login = req.query.login,
      password = req.query.password;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("polinka");
    var myobj = {
      login: login,
      password: password,
      coins: 100
    }
    dbo.collection("users").insertOne(myobj, function(err, result) {
      if (err) throw err;
      console.log("New user is added");
      res.send('{"type": "ok"}')
      db.close();
    });
  })
})

app.get('/login', (req, res) => {
  var login = req.query.login,
      password = req.query.password;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("polinka");
    dbo.collection("users").find().toArray(function(err, result) {
      var done = "bad";
      for (var i = 0; i < result.length; i++) {
        if(result[i].login == login && result[i].password == password){
          done = "ok"
          // res.send('{"auth": "ok"}')
        }else if (result[i].login == login && result[i].password !== password) {
          done = "bad_password"
          // res.send('{"auth": "bad_password"}')
        }
        if(i == result.length-1){
          res.send('{"auth": "'+done+'"}')
        }
      }
    })
  })
})

app.get('/create_task', (req, res) => {
  var customer = req.query.customer,
      problem_title = req.query.title,
      problem_description = req.query.description,
      coins = req.query.coins;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("polinka");
    var myobj = {
      customer: customer,
      problem_title: problem_title,
      problem_description: problem_description,
      coins: coins
    }
    dbo.collection("problem").insertOne(myobj, function(err, result) {
      if (err) throw err;
      console.log("New problem is added");
      res.send('{"type": "ok"}')
      db.close();
    });
  })
})

// app.get('/decide_task', (req, res) => {
//   var extend = req.query.extend,
//       problem = req.query.problem;
//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("polinka");
//     dbo.collection("problem").find().toArray(function(err, result) {
//       for (var i = 0; i < result.length; i++) {
//         if(result[i].problem_title == problem){
//           var my_problem = result[i];
//           // Начисляю чуваку
//           dbo.collection("users").find().toArray(function(err, result) {
//             for (var i = 0; i < result.length; i++) {
//               if(result[i].login == extend){
//                 var coins = result[i].coins + my_problem.coins;
//                 var myquery = { _id:  ObjectId(result[i]._id)}
//                 var newvalues = { $set: {coins: coins} };
//                 dbo.collection("users").updateOne(myquery, newvalues, function(err, resultMe) {
//                   if (err) throw err;
//                   // начислил чуваку
//                   // db.close();
//                 })
//               }else if (result[i].login == my_problem.customer) {
//                 var coins = result[i].coins - my_problem.coins;
//                 var myquery = { _id:  ObjectId(result[i]._id)};
//                 var newvalues = { $set: {coins: coins} };
//                 dbo.collection("users").updateOne(myquery, newvalues, function(err, resultMe) {
//                   if (err) throw err;
//                   // списал у чувака
//                   // db.close();
//                 })
//               }
//               if(i == result.length-1){
//                 dbo.collection("users").deleteOne(my_problem, function(err, resultMe) {
//                   if (err) throw err;
//                   // удалил задачу
//                   res.send('{"problem": "closed"}')
//                   db.close();
//                 })
//               }
//             }
//           })
//         }
//       }
//     })
//   })
// })

app.get('/decide_task', (req, res) => {
  var extend = req.query.extend,
      problem_title = req.query.problem_title;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("polinka");
    dbo.collection("problem").find().toArray(function(err, result) {
      for (var i = 0; i < result.length; i++) {
        if(result[i].problem_title == problem_title){
          var my_problem = result[i];
          dbo.collection("problem").deleteOne(result[i], function(err, qwe) {
            if (err) throw err;
            // удалил задачу
            dbo.collection("users").find().toArray(function(err, resultMe) {
              for (var j = 0; j < resultMe.length; j++) {
                if(resultMe[j].login == extend){
                  var coins = resultMe[j].coins + my_problem.coins;
                  var myquery = { _id:  ObjectId(resultMe[j]._id)}
                  var newvalues = { $set: {coins: coins} };
                  dbo.collection("users").updateOne(myquery, newvalues, function(err, resultRem) {
                    if (err) throw err;
                    dbo.collection("users").find().toArray(function(err, resultQ) {
                      for (var o = 0; o < resultQ.length; o++) {
                        if(resultQ[o].login == my_problem.customer){
                          var coins = resultMe[o].coins - my_problem.coins;
                          var myquery = { _id:  ObjectId(resultQ[o]._id)}
                          var newvalues = { $set: {coins: coins} };
                          dbo.collection("users").updateOne(myquery, newvalues, function(err, resultRem) {
                            if (err) throw err;
                            res.send('{"type": "ok"}')
                          })
                        }
                      }
                    })
                  })
                }
              }
            })
          })
        }
      }
    })
  })
})

app.get('/get_problems', (req, res) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("polinka");
    dbo.collection("problem").find().toArray(function(err, result) {
      res.send(JSON.stringify(result))
    })
  })
})

app.listen(1488, () => {
  console.log('Backend is listening on port 1488');
})
