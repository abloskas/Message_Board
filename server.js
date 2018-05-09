var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');

//session
const flash = require('express-flash');
app.use(flash());
var session = require('express-session');
app.use(session({
  secret: 'keyboardkittehohhhhhhyyeaaaahhhhh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

//mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_dashboard');

var CommentSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter a name"], minlength: [6, "min length 6 characters"]},
    comment: { type: String, required: [true, "Please enter a comment"], minlength: [10," min length 10 characters"]}
})
mongoose.model('Comment', CommentSchema); 
var Comment = mongoose.model('Comment');

var MessageSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter a name"], minlength: [6, "min length 6 characters"]},
    message: { type: String, required: [true, "Please enter a message"], minlength: [10," min length 10 characters"]},
    comments: [CommentSchema]
})
mongoose.model('Message', MessageSchema); 
var Message = mongoose.model('Message');

// Use native promises
mongoose.Promise = global.Promise;

app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');


// Routes

// index get route
app.get('/', function(req, res) {
    Message.find({}, function(err, messages) {
        res.render('index', {messages: messages});
    })  
})

// messages post route
app.post('/', function(req, res) {
    console.log("POST DATA", req.body);
    var message = new Message();
    message.name= req.body.name
    message.message = req.body.message 
    message.comments = [];
    message.save(function(err) {
      console.log("hello");
      if(err) {
        console.log("Error: ", err)
      for(var key in err.errors){
          req.flash('errors', err.errors[key].message);
      }
        res.redirect("/");
      } else { 
        res.redirect('/');
      }
    })
  })  

  // comments post route
  app.post('/comment/:id', function(req, res) {
    console.log("POST DATA", req.body);
        Message.findById({_id: req.params.id}, function(err, message){
             if(err){
                console.log("We have an error!", err);
                for(var key in err.errors){
                    req.flash('errors', err.errors[key].message);
                }
             }
             else {
                console.log("We have success!!");
                message.comments.push(({name: req.body.name, comment: req.body.comment}));
                message.save(function(err){
                    res.redirect("/");
                })
            }
      })
})
      
// Setting our Server to Listen on Port: 8000

app.listen(8000, function() {
    console.log("listening on port 8000");
})