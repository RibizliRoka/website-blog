module.exports = function(eleventyCc) {
  eleventyCc.addPassthroughCopy("src/css");
  eleventyCc.addPassthroughCopy("src/scripts");
  eleventyCc.addPassthroughCopy("./parts/markdown");
  eleventyCc.addPassthroughCopy("./parts/components");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
