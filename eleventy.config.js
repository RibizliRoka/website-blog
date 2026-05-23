module.exports = function(eleventyCc) {
  eleventyCc.addPassthroughCopy("src/css");
  eleventyCc.addPassthroughCopy("src/scripts");
  eleventyCc.addPassthroughCopy("markdown");
  eleventyCc.addPassthroughCopy("components");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
