module.exports = function(eleventyCc) {
  eleventyCc.addPassthroughCopy("*.css");
  eleventyCc.addPassthroughCopy("*.js");

  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
