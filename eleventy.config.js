module.exports = function(eleventyCc) {
  eleventyCc.addPassthroughCopy("src/css");
  eleventyCc.addPassthroughCopy("src/scripts");
  eleventyCc.addPassthroughCopy("./parts/contents");
  eleventyCc.addPassthroughCopy("./parts/secrets");
  eleventyCc.addPassthroughCopy("./parts/components");

  return {
    dir: {
      input: "src",
      includes: "./_includes",
      output: "_site"
    }
  };
};


