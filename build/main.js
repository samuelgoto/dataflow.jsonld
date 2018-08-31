// Initialize Firebase
var config = {
 apiKey: "AIzaSyBPI7s0SNoxkVJff12DbzRMWbMOu-fIVuU",
 authDomain: "class-f751c.firebaseapp.com",
 databaseURL: "https://class-f751c.firebaseio.com",
 projectId: "class-f751c",
 storageBucket: "",
 messagingSenderId: "52068356773"
};
firebase.initializeApp(config);
let db = firebase.database();

class Database {
 static write(key, value) {
  return new Promise(function(resolve, reject) {
    db.ref(key).set(value, function (error) {
      if (error) {
       reject();
       return;
      }
      resolve(value);
     });     
  });
 }

 static read(key) {
  return new Promise(function(resolve, reject) {
    db.ref(key).once("value").then(function(snapshot) {
      // console.log(snapshot.val());
      resolve(snapshot.val());
     });
  });
 }
}

// Database.write("foo", "hello");
// Database.read("foo").then(value => console.log(value));

// Database.write("/classes/coke", {hello2: "world"});
// Database.read("/classes/").then(value => console.log(value));
// db.ref("/classes/").orderByKey().once("value");
async function list() {
 let classes = await Database.read("/classes/");
 // console.log(classes);
 let ul = document.getElementById("classes");
 
 for (let clazz in classes) {
  let li = document.createElement("li");
  li.innerHTML = `<a href="class.html#${clazz}">${clazz}</a>`;
  ul.appendChild(li);
 }
 // console.log("hello world");
}

const {Flickr} = module;

async function instructions(message) {
 document.getElementById("instructions").innerHTML = message;
}

async function go() {
 let query = prompt("Enter a query to search over flickr");
 
 if (!query) {
  alert(`invalid query [${query}]`);
  return;
 }

 document.getElementById("go").setAttribute("enabled", "labeling");

 let photos = await new Flickr().search(query, 300);
 // console.log(photos);

 if (photos.length < 10) { 
  alert(`Not enough examples found on flickr (${photos.length}). Search something else.`);
  document.getElementById("go").removeAttribute("enabled");
  return;
 }

 let i = 0;
       
 let image = (index) => {
  document.getElementById("image").src = photos[index];
  
  instructions(`
               <br>Image ${index} out of ${photos.length}.
               <br>Press 'J' if this image matches what you want to trigger on and 'K' if it doesnt. 
               <br>ESC to leave the training.
               <br>
          `);

  document.getElementById("result").innerText = `
{
  "@context": "http://w3c.org/ns/ar",
  "@type": "TrackedObject",
  "@id": "${document.location.href}/${query}",
  "name": "${query}",
  "positive": ${JSON.stringify(good, undefined, 4)},
  "negative": ${JSON.stringify(bad, undefined, 4)}
}
`;

 };

 let good = [];
 let bad = [];

 image(i);

 async function keyboard(e) {
  // e.keyCode == 27 is ESC
  let char = String.fromCharCode(e.keyCode);

  if (char == "J" || char == "K") {
   let bucket = char == "J" ? good : bad;
   bucket.push(photos[i]);
   i++;
   image(i);
  }

  if (e.keyCode == 27 || i == photos.length) {
   document.getElementById("go").removeAttribute("enabled");
   document.body.removeEventListener("keydown", keyboard);

   let clazz = document.location.hash.substring(1);
   let current = await Database.read("/classes/" + clazz) || [];
   // console.log(current);
   let examples = current.concat(good);
   await Database.write("/classes/" + clazz, examples);
   render(clazz, examples);
  }
 }
  
 document.body.addEventListener("keydown", keyboard);
}

// go();

async function load(url) {
 let img = document.getElementById("image");
 let canvas = document.getElementById("canvas");
 return new Promise(function(resolve, reject) {
   img.src = url;
   img.onload = function() {
    let context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, 224, 224);
    resolve(canvas);
   }
 });
}

let {DataFlow} = module;
const url = "../test/mobilenet-features/";
let dataflow = new DataFlow(
                            url + "tensorflowjs_model.pb", 
                            url + "weights_manifest.json");

async function run(examples) {
 document.getElementById("go").setAttribute("enabled", "training");
 // let data = JSON.parse(document.getElementById("result").value);

 instructions("loading the embedding");

 await dataflow.load();

 instructions("loading positive examples into the KNN");

 for (let photo of examples) {
  let bin = await load(photo);
  // console.log(bin);
  await dataflow.addExample(bin, 0);
 }

 // instructions("loading negative examples into the KNN");

 // for (let photo of data.negative) {
 //  let bin = await load(photo);
 // console.log(bin);
 //  await dataflow.addExample(bin, 1);
 // }

 instructions("loading web camera");
 
 // console.log(leo);
 // let anna = await dataflow.addExample(await load("/test/anna.jpg"), 1);
 // console.log(anna);
 
 // let prediction = await dataflow.predict(await load("/test/anna2.jpg"));
 // console.log(prediction);
 // prediction.print();
 await infer(examples);
}

// train();

async function screenshot() {
 let video = document.getElementById("camera");
 let canvas = document.getElementById("canvas");
 let context = canvas.getContext("2d");
 context.drawImage(video, 0, 0, 224, 224);
 return canvas;
}

async function infer(examples) {
 document.getElementById("go").setAttribute("enabled", "true");
 let video = document.getElementById("camera");

 let stream = await navigator.mediaDevices.getUserMedia({video: true});
 camera.srcObject = stream;

 // let data = JSON.parse(document.getElementById("result").value);
 let image = document.getElementById("image");

 async function predict() {
  let bin = await screenshot();
  let prediction = await dataflow.predict(bin);
  let scores = await prediction.data();
  console.log(scores);

  let best = [];
  scores.map((score, i) => {
    best[i] = {score: score, i: i};
   });
          
  best.sort((a, b) => (b.score - a.score));

  // console.log(best);

  // displays the closest image
  let image = document.getElementById("image");
  image.src = examples[best[0].i];
  image.style.opacity = best[0].score;
  
  instructions(`cosine distance = ${best[0].score}%`);

  setTimeout(predict, 250);
 }

 video.onloadeddata = async function() {
  predict();
 }
}

async function classify(classes) {
 document.getElementById("go").setAttribute("enabled", "training");

 instructions("loading the embedding");
 
 await dataflow.load();

 instructions("loading examples into the KNN");

 console.log(classes);

 let labels = [];
 let max = 50;
 for (let clazz in classes) {
  // console.log(clazz);
  labels.push({
    name: clazz,
    examples: classes[clazz].slice(0, Math.min(max, classes[clazz].length))
   });
 }

 for (let i = 0; i < labels.length; i++) {
  let label = labels[i];
  // console.log(label.name);
  for (let j = 0; j < label.examples.length; j++) {
   instructions(`loading examples of "${label.name}" [${j} of ${label.examples.length}].`);

   let photo = label.examples[j];
   // console.log(photo);

   let bin = await load(photo);
   await dataflow.addExample(bin, i);
  }
 };

 instructions("loading web camera");

 await nearest(labels);
}

async function nearest(labels) {
 document.getElementById("go").setAttribute("enabled", "true");
 let video = document.getElementById("camera");

 let stream = await navigator.mediaDevices.getUserMedia({video: true});
 camera.srcObject = stream;

 let image = document.getElementById("image");

 async function predict() {
  let bin = await screenshot();
  let {classes, distances} = await dataflow.classify(bin);
  
  let label = labels[classes.classIndex].name;
  let confidence = classes.confidences[classes.classIndex];
  instructions(`I am ${confidence.toFixed(2)}% sure that this is a "${label}"`);

  // let distances = await dataflow.predict(bin);
  let scores = await distances.data();

  let best = [];
  scores.map((score, i) => {
    best[i] = {score: score, i: i};
   });
          
  best.sort((a, b) => (b.score - a.score));

  let images = [
                document.getElementById("image"),
                document.getElementById("image2"),
                document.getElementById("image3"),
  ];

  images[0].height = 244;
  images[1].height = 244;
  images[2].height = 244;

  for (let q = 0; q < 3; q++) {
   let index = best[q].i;
   let score = best[q].score;
   let p = index;
   for (let i = 0; i < labels.length; i++) {
    if (p < labels[i].examples.length) {
     images[q].src = labels[i].examples[p];
     images[q].style.opacity = score;
     break;
    }
    p -= labels[i].examples.length;
   }
  }

  setTimeout(predict, 255);
 }

 video.onloadeddata = async function() {
  predict();
 }
}

async function register() {
 console.log("registering");
 //let credentials = new FederatedCredential({
 //  id: "",
 //  name: "Sam Goto",
 //  provider: "https://sgo.to",
 //  iconURL: "https://pbs.twimg.com/profile_images/920758039325564928/vp0Px4kC_bigger.jpg"
 // });

 const credentials = new PasswordCredential({
   id: "reader",
   name: "Arnelle Balane",
   password: "myawesomepassword",
   iconURL: "https://pbs.twimg.com/profile_images/920758039325564928/vp0Px4kC_bigger.jpg"
  });

 // console.log(cred);

 let result = await navigator.credentials.store(credentials);
 console.log(result);
}

async function signin() {
 console.log("signing in");
 let result = await navigator.credentials.get({
   password: true,
   federated: {
    providers: ["https://sgo.to"]
   }
  });
 console.log(result);
}
