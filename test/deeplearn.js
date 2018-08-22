const fs = require("fs");
const Assert = require("assert");

const tf = require('@tensorflow/tfjs');
const {loadFrozenModel} = require("@tensorflow/tfjs-converter");
require("@tensorflow/tfjs-node");
const canvas = require("canvas");

const {IMAGENET_CLASSES} = require("./imagenet_classes.js");

async function load(url) {
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

      let foo = new canvas(224, 224);
      let context = foo.getContext("2d");
      // context.drawImage(img, 0, 0, img.width / 4, img.height / 4);
      context.drawImage(img, 0, 0, 224, 224);

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
    let img = await load("./test/eiffel.jpg");
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

  async function image(url) {
   let img = await load(url);

   let input = tf.fromPixels(img);
   const PREPROCESS_DIVISOR = tf.scalar(255 / 2);
   
   const preprocessedInput = tf.div(tf.sub(input.asType('float32'), 
                                           PREPROCESS_DIVISOR),PREPROCESS_DIVISOR);
   const reshapedInput =
    preprocessedInput.reshape([1, ...preprocessedInput.shape]);

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

