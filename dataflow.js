const fs = require("fs");
const tf = require('@tensorflow/tfjs');
const {loadFrozenModel} = require("@tensorflow/tfjs-converter");
const tfjs = require("@tensorflow/tfjs-node");
const Canvas = require("canvas");
const knn = require("@tensorflow-models/knn-classifier");
const request = require("request");
const http = require("http");
const fetch = require("node-fetch");

async function load(url, size = 224) {
 return new Promise(function(resolve, reject) {
   let callback = (err, data) => {
    // return;
    // console.log("hi");
    if (err) {
     // console.log(err);
     reject(err);
     throw err;
    }
    // console.log(data);
    const img = new Canvas.Image()
    // img.onload = () => ctx.drawImage(img, 0, 0)
    img.onload = () => {
     // console.log("hello");
     // resolve(img);
     
     let foo = new Canvas(size, size);
     let context = foo.getContext("2d");
     // context.drawImage(img, 0, 0, img.width / 4, img.height / 4);
     context.drawImage(img, 0, 0, size, size);

     resolve(foo);
    }
    img.onerror = (err) => { 
     // console.log("hi");
     // console.log(err);
     reject(err);
     // throw err;
    }
    img.src = data;
    // console.log(img);
   };

   // console.log(url);
   fs.readFile(url, callback);
 });
}

async function image(url, size = 224) {
 // normalization based on 
 // https://github.com/tensorflow/tensorflow/blob/master/tensorflow/examples/label_image/label_image.py#L38
 let img = await load(url, size);

 let input = tf.fromPixels(img).asType("float32").expandDims();

 const mean = 0;
 const std = 255;
   
 return tf.div(tf.sub(input, mean), std);
 
 return reshapedInput;
}

class DataFlow {
 constructor(model, weights) {
  this.classifier = knn.create();
  this.model = model;
  this.weights = weights;
 }

 async load() {
  this.model = await loadFrozenModel(this.model, this.weights);
 }

 async addExample(url, label) {
  let id = this.model.execute({
    images: await image(url)
   });
  this.classifier.addExample(id, label);
 }

 async predict(url) {
  let query = await this.model.execute({
    images: await image(url)
   });

  let prediction = await this.classifier.predictClass(query);
  // this.classifier.similarities(query).print();
  // console.log(prediction);
  return prediction;
 }
}

module.exports = {
 DataFlow: DataFlow,
 load: load,
 image: image
};
