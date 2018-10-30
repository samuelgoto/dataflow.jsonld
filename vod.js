function script(src, type = "application/javascript", props) {
 let script = document.createElement("script");
 script.type = type;
 script.src = src;
 for (let prop in props) {
  script.setAttribute(prop, props[prop]);
 }
 return script;
}
function link(src, rel = "stylesheet") {
 let el = document.createElement("link");
 el.rel = rel;
 el.href = src;
 return el;
}
async function require(src) {
 return new Promise(function(resolve, reject) {
   // console.log(typeof el);
   let el = typeof src == "string" ? script(src) : src;
   el.onload = () => resolve();
   el.onerror = () => reject();
   // console.log(el);
   document.head.appendChild(el);
   
   if (el.type == "text/babel") {
    resolve();
   }
 });
}

async function deps() {
 // console.log("starting");
 await require("https://unpkg.com/react@16.3.0/umd/react.production.min.js");
 await require("https://unpkg.com/react-dom@16.3.0/umd/react-dom.production.min.js");
 await require("https://unpkg.com/@material-ui/core/umd/material-ui.development.js");
 await require("https://unpkg.com/babel-standalone@6.26.0/babel.js");
 await require(link("https://fonts.googleapis.com/css?family=Roboto:300,400,500"));
 await require(link("https://fonts.googleapis.com/icon?family=Material+Icons"));

 let base = window.location.href;
 document.querySelectorAll("script").forEach(script => {
   if (!script.src.endsWith("vod.js")) {
    return;
   }
   base = script.src;
  });

 // console.log(base);

 await require(script(new URL("polyfill.js", base), "text/babel", {
     "data-plugins": "transform-decorators-legacy"
 }));
 

 Babel.transformScriptTags();
 // console.log("done");
}

deps();
