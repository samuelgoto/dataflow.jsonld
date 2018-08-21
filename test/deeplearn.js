const Assert = require("assert");

describe("Deeplearn", function() {
  it("Hello", function() {
  });

  function assertThat(x) {
   return {
    equalsTo(y) {
     Assert.equal(x.trim(), y.trim());
    }
   }
  }
 });

