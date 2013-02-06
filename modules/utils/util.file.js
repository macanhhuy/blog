var fs = require('fs'),
formidable = require('formidable')
, sys = require('sys')
, c = require('../../config')
,a = require('./util.array');;

exports.upload = function(req, res){


var fileName = '',
    filePath = '/files/';
	fileName = req.files.upload.name;

	fs.readFile(req.files.upload.path, function(err, data){

				fs.writeFile(c.config.staticContentPath + '/files/'  + fileName,
					data,
					'utf8',
					function (err) {

					if(!err){
						console.log('Uploaded');
						res.write("<script type=\"text/javascript\">window.parent.CKEDITOR.tools.callFunction(3,'" + filePath + fileName + "', '');</script>");
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
              'content-type': 'text/html',
              'Location': '/',
              'Set-Cookie': cookie.key + '=' + cookie.value,
            };

            //var Cookies = require("cookies");
            //var c = new Cookies(req, resp, {});

          } else {

            // Set headers.
            headers = {
              'content-type': 'text/html'
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