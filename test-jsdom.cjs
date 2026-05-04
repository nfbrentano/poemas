const { JSDOM } = require("jsdom");
JSDOM.fromURL("https://nfbrentano.github.io/poemas/", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  dom.window.document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
  });
  dom.window.addEventListener("error", (event) => {
    console.error("PAGE ERROR:", event.error);
  });
  dom.window.console.log = (...args) => console.log("PAGE LOG:", ...args);
  dom.window.console.error = (...args) => console.error("PAGE ERROR LOG:", ...args);
  setTimeout(() => process.exit(0), 5000);
});
