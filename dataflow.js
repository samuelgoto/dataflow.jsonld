// const fs = require("fs");
const tf = require('@tensorflow/tfjs');
const {loadFrozenModel} = require("@tensorflow/tfjs-converter");
// const Canvas = require("canvas");
const knn = require("@tensorflow-models/knn-classifier");
// const request = require("request");
// const http = require("http");
// const fetch = require("node-fetch");

async function image(bin, size = 224) {
 // normalization based on 
 // https://github.com/tensorflow/tensorflow/blob/master/tensorflow/examples/label_image/label_image.py#L38
 // let img = await load(url, size);

 let input = tf.fromPixels(bin).asType("float32").expandDims();

 const mean = 0;
 const std = 255;
   
 return tf.div(tf.sub(input, mean), std);
 
 return reshapedInput;
}

class DataFlow {
 constructor(graph, weights) {
  this.classifier = knn.create();
  this.graph = graph;
  this.weights = weights;
 }

 async load() {
  this.model = await loadFrozenModel(this.graph, this.weights);
 }

 async addExample(bin, label) {
  let id = await this.model.execute({
    images: await image(bin)
   });
  this.classifier.addExample(id, label);
  return id;
 }

 async predict(bin) {
  let query = await this.model.execute({
    images: await image(bin)
   });

  // let prediction = await this.classifier.predictClass(query);
  return this.classifier.similarities(query);
 }

 async classify(bin) {
  let query = await this.model.execute({
    images: await image(bin)
   });

  return await this.classifier.predictClass(query);
 }
}

module.exports = {
 DataFlow: DataFlow,
 image: image
};
