var fs = require('fs');

exports.upload = function(req, res){


var fileName = '',
    filePath = '/files/';
	fileName = req.files.upload.name;

	fs.readFile(req.files.upload.path, function(err, data){

				fs.writeFile(__dirname + '/public' + filePath + fileName,
					data,
					'utf8',
					function (err) {

					//if(!err){
						console.log('Uploaded');
						res.write("<script type=\"text/javascript\">window.parent.CKEDITOR.tools.callFunction(3,'" + filePath + fileName + "', '');</script>");
						res.end();

					//}
					//else {
					//	res.end();
					//}

				});

	});

};