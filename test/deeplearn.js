const fs = require("fs");
const Assert = require("assert");

const tf = require('@tensorflow/tfjs');
const {loadFrozenModel} = require("@tensorflow/tfjs-converter");
require("@tensorflow/tfjs-node");
const canvas = require("canvas");

const {IMAGENET_CLASSES} = require("./imagenet_classes.js");

async function load(url, size = 224) {
 return new Promise(function(resolve, reject) {
   fs.readFile(url, (err, data) => {
     // return;
     // console.log("hi");
     if (err) {
      // console.log(err);
      reject(err);
      throw err;
     }
     // console.log(data);
     const img = new canvas.Image()
     // img.onload = () => ctx.drawImage(img, 0, 0)
     img.onload = () => {
      // console.log("hello");
      // resolve(img);

      let foo = new canvas(size, size);
      let context = foo.getContext("2d");
      // context.drawImage(img, 0, 0, img.width / 4, img.height / 4);
      context.drawImage(img, 0, 0, size, size);

      resolve(foo);
     }
     img.onerror = (err) => { 
      // console.log("hi");
      console.log(err);
      reject(err);
      // throw err;
     }
     img.src = data;
     // console.log(img);
    });
 });
}


describe("Deeplearn", function() {
  it.skip("training", async function() {
    // Train a simple model:
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 100, activation: 'relu', inputShape: [10]}));
    model.add(tf.layers.dense({units: 1, activation: 'linear'}));
    model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});

    const xs = tf.randomNormal([100, 10]);
    const ys = tf.randomNormal([100, 1]);

    let result = await model.fit(xs, ys, {
      epochs: 100,
      callbacks: {
       onEpochEnd: async (epoch, log) => {
        console.log(`Epoch ${epoch}: loss = ${log.loss}`);
       }
      }
     });
   });

  it.skip("core concepts", async function() {
    // 2x3 Tensor
    const shape = [2, 3]; // 2 rows, 3 columns
    tf.tensor([1.0, 2.0, 3.0, 10.0, 20.0, 30.0], shape).print();
    // Output: [[1 , 2 , 3 ],
    //          [10, 20, 30]]
    
    // The shape can also be inferred:
    tf.tensor([[1.0, 2.0, 3.0], [10.0, 20.0, 30.0]]).print();
    // Output: [[1 , 2 , 3 ],
    //          [10, 20, 30]]
    tf.zeros([3, 5]).print();

    const initialValues = tf.zeros([5]);
    const biases = tf.variable(initialValues); // initialize biases
    biases.print(); // output: [0, 0, 0, 0, 0]

    const updatedValues = tf.tensor1d([0, 1, 0, 1, 0]);
    biases.assign(updatedValues); // update values of biases
    biases.print(); // output: [0, 1, 0, 1, 0]

    const d = tf.tensor2d([[1.0, 2.0], [3.0, 4.0]]);
    d.square().print();

    const e = tf.tensor2d([[1.0, 2.0], [3.0, 4.0]]);
    const f = tf.tensor2d([[5.0, 6.0], [7.0, 8.0]]);

    const e_plus_f = e.add(f);
    e_plus_f.print();

    const sq_sum = e.add(f).square();
    sq_sum.print();


    // Define function
    function predict(input) {
     // y = a * x ^ 2 + b * x + c
     // More on tf.tidy in the next section
     return tf.tidy(() => {
       const x = tf.scalar(input);

       const ax2 = a.mul(x.square());
       const bx = b.mul(x);
       const y = ax2.add(bx).add(c);

       return y;
      });
    }

    // Define constants: y = 2x^2 + 4x + 8
    const a = tf.scalar(2);
    const b = tf.scalar(4);
    const c = tf.scalar(8);

    // Predict output for input of 2
    const result = predict(2);
    result.print(); // Output: 24


   });

  it.skip("image", async function() {
    let img = await load("./test/daisy.jpg", 299);
    console.log(img);

    const out = fs.createWriteStream(__dirname + '/test.jpeg');
    const stream = img.createJPEGStream();
    stream.pipe(out);
    out.on('finish', () =>  console.log('The JPEG file was created.'));
   });

  it("nasnet", async function() {
    // https://tfhub.dev/google/delf/1
    const MODEL_URL = "file://./test/nasnet/tensorflowjs_model.pb";
    const WEIGHTS_URL = "file://./test/nasnet/weights_manifest.json";
    const model = await loadFrozenModel(MODEL_URL, WEIGHTS_URL);

    let result = await model.execute({
      images: await image("./test/church.jpg")
     });

    console.log(getTopKClasses(result, 5));
   });

  it("flowers", async function() {
    // creating the model:
    // https://www.tensorflow.org/hub/tutorials/image_retraining
    //
    // converting it to the js model:
    // tensorflowjs_converter 
    //    --input_format=tf_frozen_model
    //    --output_node_names="final_result"
    //    --saved_model_tags=serve 
    //    /tmp/output_graph.pb foobar

    this.timeout(5000);

    const MODEL_URL = "file://./test/flowers/tensorflowjs_model.pb";
    const WEIGHTS_URL = "file://./test/flowers/weights_manifest.json";
    const model = await loadFrozenModel(MODEL_URL, WEIGHTS_URL);

    let result = await model.execute({
      Placeholder: await image("./test/daisy.jpg", 299)
     });

    // python benchmark:
    //
    // daisy 0.9980768
    // sunflowers 0.0010952335
    // dandelion 0.000464226
    // tulips 0.00028436302
    // roses 7.940252e-05

    result.print();

    // Indeces here mean:
    //
    // daisy
    // dandelion
    // roses
    // sunflowers
    // tulips
    // [[0.9983829, 0.0003967, 0.0000629, 0.0009483, 0.0002092],]
   });

  it.only("family", async function() {
    this.timeout(5000);

    const MODEL_URL = "file://./test/family/tensorflowjs_model.pb";
    const WEIGHTS_URL = "file://./test/family/weights_manifest.json";
    const model = await loadFrozenModel(MODEL_URL, WEIGHTS_URL);

    // 82% accuracy on training and 50% accuracy on validation
    let result = await model.execute({
      Placeholder: await image("./test/leo.jpg", 224)
     });

    result.print();

    result = await model.execute({
      Placeholder: await image("./test/anna.jpg", 224)
     });

    result.print();

    // Indeces here mean:
    //
    // anna
    // leo
   });

  it("resnet", async function() {
    this.timeout(5000);

    const MODEL_URL = "file://./test/resnet/tensorflowjs_model.pb";
    const WEIGHTS_URL = "file://./test/resnet/weights_manifest.json";
    const model = await loadFrozenModel(MODEL_URL, WEIGHTS_URL);

    let result = await model.execute({
      images: await image("./test/church.jpg")
     });

    console.log(getTopKClasses(result, 5));
   });

  it("pnasnet", async function() {
    this.timeout(10000);

    const MODEL_URL = "file://./test/pnasnet/tensorflowjs_model.pb";
    const WEIGHTS_URL = "file://./test/pnasnet/weights_manifest.json";
    const model = await loadFrozenModel(MODEL_URL, WEIGHTS_URL);

    let result = await model.execute({
      images: await image("./test/church.jpg", 331)
     });

    console.log(getTopKClasses(result, 5));
   });

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

  function getTopKClasses(logits, topK) {
   const predictions = tf.tidy(() => {
     return tf.softmax(logits);
    });

   const values = predictions.dataSync();
   predictions.dispose();

   let predictionList = [];
   for (let i = 0; i < values.length; i++) {
    predictionList.push({value: values[i], index: i});
   }
   predictionList = predictionList
    .sort((a, b) => {
      return b.value - a.value;
     })
    .slice(0, topK);
   
   return predictionList.map(x => {
     return {label: IMAGENET_CLASSES[x.index], value: x.value};
    });
  }

  it("mobilenet", async function() {
    // tensorflowjs_converter
    //    --input_format=tf_hub
    //    'https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/classification/1'
    //    mobilenet
    const MODEL_URL = "file://./test/mobilenet/tensorflowjs_model.pb";
    const WEIGHTS_URL = "file://./test/mobilenet/weights_manifest.json";
    const model = await loadFrozenModel(MODEL_URL, WEIGHTS_URL);

    let result = await model.execute({
      images: await image("./test/church.jpg")
     });

    console.log(getTopKClasses(result, 5));
   });


  function assertThat(x) {
   return {
    equalsTo(y) {
     Assert.equal(x.trim(), y.trim());
    }
   }
  }
 });

