# batch-resizer
A very simple batch image resizer using npm sharp and exif-parser modules. This utility will apply exif rotation data to the resized image.


## Basic Usage

### Setup
1. ensure [node.js](https://nodejs.org/en/download/) is installed
2. open command prompt in this repo's folder and type ```npm install``` to install dependencies

## Use
1. Place images for resize in ```Input``` folder
2. Double click ```ResizeAll.bat```
3. Resized images found in ```Small``` folder

Size can be changed by modifying ```ResizeAll.bat```


## Node Usage

node batchResize <-i> imagePath <-p> prefix <-o> outImagePath <-s> image height size
