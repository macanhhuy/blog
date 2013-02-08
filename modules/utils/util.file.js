var fs = require('fs'),
formidable = require('formidable')
, sys = require('sys')
, c = require('../../config')
,a = require('./util.array')
,mongoose = require('mongoose');
//models
var models = require('../../models/models');
var File = models.fileManager();


exports.delete = function(req, filename){
	var filePath = '/files/',
		folder = req.headers.referer.split('/');

// if(folder[folder.length-1]!=="filemanager"&&req.body.func=='fm'){
// 	filePath += folder[folder.length-1]+ '/';
// }
	if(filename.indexOf('.')>0){
			fs.unlink(c.config.staticContentPath + filePath  + filename, function(err){
				if(err){
					console.log(err);
					req.flash('error', err);
				}
				else {
					console.log('file ' + filename + ' has removed');
				}
			});
	}
	else{

		fs.rmdir(c.config.staticContentPath + filePath  + filename, function(err){

				if(err){
					console.log(err);
					req.flash('error', err);
				}
				else {
					console.log('folder ' + filename + ' has removed');
				}


		});
		
// 		fs.readdir(c.config.staticContentPath + filePath  + filename, function(err, data){
// console.log(data);
				// if(!data){
				// 			fs.rmdir(c.config.staticContentPath + filePath  + filename);
				// }
				// else {
				// 	console.log('Cannot delete this folder');
				// 	req.flash('error', 'Cannot delete this folder');
				// }

    // });

	}


}
exports.newfolder = function(req){
	var parent = '';
	


	fs.mkdir(c.config.staticContentPath + '/files/'  + parent+ req.body.foldername, '0777', function(err){
			  if(err){
			  	console.log(err);
          console.log('Cannot create folder ' + req.body.foldername);
      }
      else{
				var info = req.body;
						  var values = {
							name: req.body.foldername,
						    parent: parent||null,
						    type: 'folder',
						    folder:true,
						   	created: new Date()};

						var files = new File(values);

						  files.save(function(err) {
						    console.log(err);
						   
						  });


      }
	});

}
exports.upload = function(req, res){


var fileName = '',
    filePath = '/files/';
	fileName = req.files.upload.name;
var folder = req.headers.referer.split('/');

// if(folder[folder.length-1]!=="filemanager"&&req.body.func=='fm'){
// 	filePath += folder[folder.length-1]+ '/';
// }
console.log(req);
	fs.readFile(req.files.upload.path, function(err, data){

				fs.writeFile(c.config.staticContentPath + filePath  + fileName,
					data,
					'utf8',
					function (err) {

					if(!err){
						var info = req.files.upload;
						  var values = {
							name: info.name,
						    parent: mongoose.Schema.Types.ObjectId('5114a15ee50c4f7307000002'),
						    type: info.type,
						    folder:false,
						    size: info.size,
							created: new Date()};

						var files = new File(values);

						  files.save(function(err) {

						  });


						if(req.body.func=='fm'){
							res.redirect(req.headers.referer);

						}
						else{
							res.write("<script type=\"text/javascript\">window.parent.CKEDITOR.tools.callFunction(3,'" + filePath + fileName + "', '');</script>");

						}
						res.end();

					}
					else {
            console.log(err);

						res.end();
					}

				});

	});


}

// HTTP content getter.
exports.get = function(obj, callBack){

	if(obj.action === 'list'){
		fs.readdir(c.config.staticContentPath + '/files', function(err, data){
			callBack(data);
		});
	} else if(obj.action === 'delete'){

		var name = obj.params.name;

		fs.unlink(c.config.staticContentPath + '/files/' + name, function(err, data){

			if(err){
				console.log(err);
				callBack(data);
			} else {
				callBack(data);
			}
		});
	} else {
		callBack({foo: 'page'});
	}
};


exports.getFiles = function(req, res){
		 exports.get({

          action: 'list',

          }
        ,
        function(data, cookie, isSucessful, message){
                      var headers = {};
// To Get a Cookie.
	var cookies = {};
	req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
	  var parts = cookie.split('=');
	  cookies[parts[0].trim()] = (parts[1] || '').trim();
	});
          // Set cookie if suplied.
          if(cookie){

            // Set headers.
            headers = {
              'content-type': 'text/json',
              'Location': '/',
              'Set-Cookie': cookie.key + '=' + cookie.value,
            };

            //var Cookies = require("cookies");
            //var c = new Cookies(req, resp, {});

          } else {

            // Set headers.
            headers = {
              'content-type': 'text/json'
            };
          }

          // Set defaults.
          if(typeof isSucessful === 'undefined'){
            isSucessful = true;
          }

          if(typeof message === 'undefined'){
            message = '';
          }

          res.writeHead(200, headers);
          res.write(JSON.stringify({
            isSucessful: isSucessful,
            message: message,
            data: data
          }));
          res.end();
});

}