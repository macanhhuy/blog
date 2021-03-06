
/**
 * Module dependencies.
 */

var express = require('express')
  , gzippo = require('gzippo')
  , routes = require('./routes')
  , crypto = require('crypto')
  , moment = require('moment')
  , cluster = require('cluster')
  , fs = require('fs')
  , os = require('os')

  , mongoose = require('mongoose');



var conf = {
  salt: 'rdasSDAg'
};
//models
var models = require('./models/models');

// utils
var utils = require('./modules/utils/utils')
	,file = require('./modules/utils/util.file');
// localization
var localization = require('./modules/localization/localization');

var app = module.exports = express.createServer();

//Connect to database
mongoose.connect('mongodb://localhost/blog');


//Models
var Post = models.postModel();

var User = models.userModel();

var File = models.fileManager();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'wasdsafeAD' }));
  app.use(gzippo.staticGzip(__dirname + '/public'));
  app.use(app.router);

});

app.configure('development', function(){
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  //app.use(express.errorHandler());
});

app.helpers({
  moment: moment
});

app.dynamicHelpers({
  user: function(req, res) {
    return req.session.user;
  },
  flash: function(req, res) {
    return req.flash();
  }
});
// Routes

function isUser(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'You must be user to access this page');
     res.redirect('/login');
   // next(new Error('You must be user to access this page'));

  }
}

app.error(function(err, req, res, next){
  if (err instanceof NotFound) {
    res.render('error/404.jade', { title: 'Not found 404' });
  } else {
    res.render('error/500.jade', { title: 'Error', error: err });
  }
});






// Listing
app.get('/', function(req, res) {
  var fields = { subject: 1, body: 1, tags: 1, slug: 1, created: 1, author: 1 };
// fs.readdir(__dirname + '/public/files/2013', function(err, data){
//   if(err){
//       fs.mkdir(__dirname + '/public/files/2013');
//   }
//   else{
//           console.log( data);
//   }

//     });




  Post.find({ state: 'published'}, fields, function(err, posts) {
    if (!err && posts) {
      res.render('index.jade', { title: 'My Blog', postList: posts });
    }
  });
});

app.get('/post/add', isUser, function(req, res) {
  res.render('add.jade', { title: 'Add new blog post '});
});

app.post('/post/add', isUser, function(req, res) {
  var values = {
      subject: req.body.subject
    , body: req.body.body
    , slug: utils.removeUTF8(req.body.subject)

    , tags: req.body.tags.split(',')
    , state: 'published'
    , created: new Date()
    , modified: new Date()
    , comments: []
    , author: {
        username: req.session.user.user
    }
  };
var post = new Post(values);

  post.save(function(err) {
    console.log(err, post);
    res.redirect('/');
  });

});
// Show post
// Route param pre condition
app.param('postid', function(req, res, next, id) {
  if (id.length != 24) throw new NotFound('The post id is not having correct length');
console.log(req);
  Post.findOne({ _id: req.params.postid }, function(err, post) {
    if (err) return next(new Error('Make sure you provided correct post id'));
    if (!post) return next(new Error('Post loading failed'));
    req.post = post;
    next();
  });
});

app.param('slug', function(req, res, next, slug) {
 if(slug.indexOf('.html')>0){
 	  Post.findOne({ slug: slug.replace('.html','')}, function(err, post) {
    if (err) return next(new Error('Make sure you provided correct post id'));
    if (!post) return next(new Error('Post loading failed'));
    req.post = post;
    next();
  });
 }

});


app.get('/post/edit/:postid', isUser, function(req, res) {
  res.render('edit.jade', { title: 'Edit post', blogPost: req.post } );
});

app.post('/post/edit/:postid', isUser, function(req, res) {
  Post.update({ _id: req.body.id }, {
    $set: {
        subject: req.body.subject
      , body: req.body.body
      , tags: req.body.tags.split(',')
      , modified: new Date()
    }}, function(err, post) {
      if (!err) {
        req.flash('info', 'Post has been sucessfully edited');
      }
      res.redirect('/');
    });
});

app.get('/post/delete/:postid', isUser, function(req, res) {
  Post.remove({ _id: db.ObjectId(req.params.postid) }, function(err, field) {
    if (!err) {
      req.flash('error', 'Post has been deleted');
    }
    res.redirect('/');
  });
});

app.get('/post/:slug', function(req, res) {
  res.render('show.jade', {
    title: 'Showing post - ' + req.post.subject,
    post: req.post
  });
});

// Add comment
app.post('/post/comment', function(req, res) {
  var data = {
      name: req.body.name
    , body: req.body.comment
    , created: new Date()
  };
  Post.update({ _id: req.body.id }, {
    $push: { comments: data }}, { safe: true }, function(err, field) {
      if (!err) {
        req.flash('success', 'Comment added to post');
      }
      res.redirect('/');
  });
});

// Login
app.get('/login', function(req, res) {
  res.render('login.jade', {
    title: 'Login user'
  });
});

app.get('/logout', isUser, function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.post('/login', function(req, res) {
  var select = {
      user: req.body.username
    , pass: crypto.createHash('sha256').update(req.body.password + conf.salt).digest('hex')
  };

  User.findOne(select, function(err, user) {
    if (!err && user) {
      // Found user register session
      req.session.user = user;
      res.redirect('/');
    } else {
      // User not found lets go through login again
      res.redirect('/login');
    }

  });
});

app.get('/user/add', isUser, function(req, res) {
  res.render('adduser.jade', {
    title: 'Add user'
  });
});

app.post('/user/add', isUser, function(req, res) {

  var values = {
      user: req.body.username
    , pass: crypto.createHash('sha256').update(req.body.password + conf.salt).digest('hex')
  };

User.findOne({user:req.body.username}, function(err, user){


   if (!user){
     db.user.insert(values, function(err, user) {
    console.log(err, user);

       res.redirect('/');
      });
   }
   else {
    req.flash('error', "Username exist!");
    res.redirect('/');
   }

});



});


//Upload
app.post('/upload',function(req, res){

file.upload(req, res);
});

//Upload
app.post('/files/delete',function(req, res){
  
for(var i=0;i<req.body.length;i++){
 
  file.delete(req, req.body[i]);

}
res.end();
});
//Upload
app.post('/files/newfolder',function(req, res){

    file.newfolder(req);
    res.redirect(req.headers.referer);
});

var crumbs = function(req, res, next){
    var crumbs = [];

    var parent = function(id){
        File
            .findOne()
            .where('_id', id)
            .exec(function(err, folder){
                if(folder) {
                    crumbs.push(folder.toObject());
                    parent(folder.parent);
                }else{
                    req.crumbs = crumbs.reverse();
                    next()
                }

            })
    };

    if(req.query.id){
        parent(req.query.id);
    }
    else next();
};

app.get('/filemanager',[crumbs], function(req, res) {


File.find().where('parent', req.query.id || null).sort({parent: 1, folder: -1}).exec(function(err, docs){
        if(docs){
res.render('upload.jade', {title: 'File Manager', allfiles: docs, id: req.query.id});
   
        }
        else{
          res.render('upload.jade', {title: 'No File', allfiles: [], id: req.query.id});
   
        }

      });




});

app.get('/filemanager/:folder', function(req, res) {




     fs.readdir(__dirname + '/public/files/'+req.params.folder, function(err, data){
      if(data){
res.render('upload.jade', { title: 'File Manager', allfiles: data});

      } else{
       
     res.render('upload.jade', { title: 'No File', allfiles: []});
   

      }

    });

});

// JSON FILE
app.get('/files', function(req, res){

  File.find().exec(function(err, docs){
        res.json(err || docs);
    })


});


//The 404
app.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

/**
 * Adding the cluster support
 */
if (cluster.isMaster) {
  // Be careful with forking workers
  for (var i = 0; i < os.cpus().length * 1; i++) {
    var worker = cluster.fork();
  }
} else {
  // Worker processes
  app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
}


