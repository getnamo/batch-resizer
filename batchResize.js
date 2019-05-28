const sharp = require('sharp');
const fs = require('fs');
let imageFolder = './';	//default if not specified
let outFolder = './small/';
let prefix = '';
let height = 1000;

//Resize image, applying exif rotation

function fileName(path){
	return path.split('\\').pop().split('/').pop();
}

function exifRotate(imagePath, resultCallback){
	fs.readFile(imagePath, (err, imageData) =>{
		let parser = require('exif-parser').create(imageData);
		let exif = parser.parse();
		//console.log(exif);

		let sharpImage = sharp(imagePath);
		let returnSharpImage = sharpImage;

		if (exif && exif.tags && exif.tags.Orientation) {
			switch (exif.tags.Orientation) {
				case 1: // Horizontal (normal)
					// do nothing
					break;
				case 2: // Mirror horizontal
					returnSharpImage = sharpImage.flip();
				break;
				case 3: // Rotate 180
					returnSharpImage = sharpImage.rotate(180);
					break;
				case 4: // Mirror vertical
					returnSharpImage = sharpImage.flop();
					break;
				case 5: // Mirror horizontal and rotate 270 CW
					returnSharpImage = sharpImage.rotate(-90).flip();
					break;
				case 6: // Rotate 90 CW
					returnSharpImage = sharpImage.rotate(90);
					break;
				case 7: // Mirror horizontal and rotate 90 CW
					returnSharpImage = sharpImage.rotate(90).flip();
					break;
				case 8: // Rotate 270 CW
					returnSharpImage = sharpImage.rotate(90);
					break;
				default:
				break;
			}
		}
		resultCallback(null, returnSharpImage);
	});	
}

function rotateImage(imagePath){
	console.log(imagePath);


	
	exifRotate(imagePath, (err, data) =>{
		data.resize(height)
		.toBuffer()
		.then( data => {
			//console.log(data);
			let outputPath = outFolder + prefix + fileName(imagePath);
			fs.writeFile(outFolder + prefix + fileName(imagePath), data, (err) =>{
				console.log(outputPath + " saved.");
			});
		});
	});
	
}

function forEachImageInDir(path, forEachCallback)
{
	fs.readdir(path, (err, files) => {
		if(!files) {
			console.log('no files found at ' + imageFolder);
			return;
		}
		console.log('Found ' + files.length + ' files.');

		files.forEach(file => {
			if(!(file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))){
				return;
			}
			forEachCallback(file);
		});
	});
}

let argMap = {};
class ArgFunction {
	constructor(method, requiresArgs){
		this.method = method;
		this.requiresArgs = requiresArgs;
	}
}

argMap['-i'] = new ArgFunction(function(path){
	imageFolder = path;
	console.log('path set to ' + path);
}, true);
argMap['-p'] = new ArgFunction(function(inPrefix){
	prefix = inPrefix;
	console.log('prefix set to ' + inPrefix);
}, true);
argMap['-o'] = new ArgFunction(function(outPath){
	outFolder = outPath;
	console.log('out set to ' + outPath);
}, true);
argMap['-s'] = new ArgFunction(function(inHeight){
	height = Number(inHeight);
	console.log('height set to ' + height);
}, true);
argMap['-h'] = new ArgFunction(function(){
	console.log('(Defaults: -i ./ <-p> f_)');
	console.log('Usage:');
	console.log('\tnode batchResize <-i> imagePath <-p> prefix <-o> outImagePath <-s> image height size');
}, false);

//Parse process args
function Main()
{
	let nextIsCommandArg = false;
	let command = undefined;
	process.argv.forEach(function (val, index, array) {
		//console.log(index + ': ' + val);
		
		let argFunction = argMap[val];
		if(argFunction)
		{
			if(!argFunction.requiresArgs)
			{
				argFunction.method();
			}
			else
			{
				nextIsCommandArg = true;
				command = argFunction;
			}
		}
		else if (nextIsCommandArg)
		{
			nextIsCommandArg = false;
			command.method(val);
		}
	});

	if(process.argv.length == 2)
	{
		argMap['-h'].method();
		return;
	}

	//Now process the flipping
	forEachImageInDir(imageFolder, imagePath =>
	{
		console.log('resizing image: ' + imageFolder + imagePath)
		rotateImage(imageFolder + imagePath);
	});
}

Main();