// Plugin Imports
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const faviconsPlugin = require("eleventy-plugin-gen-favicons");
const metagen = require('eleventy-plugin-metagen');
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const svgSprite = require("eleventy-plugin-svg-sprite");

// Shortcode Imports
const Image = require("@11ty/eleventy-img");
const path = require("path");
const gifShortcode = require('./src/_includes/shortcodes/gif');

// Filters
const { DateTime } = require("luxon");
const markdownFilter = require('./src/_includes/filters/markdown-filter.js');

// Markdown
const markdownIt = require('markdown-it');
const markdownItAttrs = require('markdown-it-attrs');
const markdownItOptions = {
  html: true,
  breaks: true,
  linkify: true
}
const markdownLib = markdownIt(markdownItOptions).use(markdownItAttrs)


// async function pictureShortcode(src, alt, css=" ", sizes = "100vw", loading = "lazy", decoding = "async") {

//   let url = path.join("./src/assets/images/", src);

//   let stats = await Image(url, {
//     widths: [600, 1024],
//     formats: ["svg", "avif", "webp", "jpeg"],
//     urlPath: "/img/opt/",
//     outputDir: "./_dist/img/opt/",
//   });

//   let imageAttributes = {
//     alt,
//     class: css,
//     sizes,
//     loading,
//     decoding,
//   };

//   return Image.generateHTML(stats, imageAttributes, {
//     whitespaceMode: "inline",
//   });
// }

function pictureShortcode(src, alt, css, sizes = "100vw", loading = "lazy", decoding = "async") {

  let url = `./src/assets/images/${src}`;

  let options = {
    widths: [660, 1280],
    formats: ["svg", "avif", "webp", "jpeg"],
    urlPath: "/img/opt/",
    outputDir: "./_dist/img/opt/",
  };

  Image(url, options);

  let imageAttributes = {
    alt,
    class: css,
    sizes,
    loading,
    decoding,
  };
  
  let metadata = Image.statsSync(url, options);

  return Image.generateHTML(metadata, imageAttributes, {
    whitespaceMode: "inline",
  });
}

module.exports = function(eleventyConfig) {
 
  // https://giuliachiola.dev/posts/add-html-classes-to-11ty-markdown-content/
  eleventyConfig.setLibrary('md', markdownLib);
  
  // passthrough node_modules
  eleventyConfig.addPassthroughCopy({'./node_modules/alpinejs/dist/cdn.js' : './js/alpine.js'});
  eleventyConfig.addPassthroughCopy({'./node_modules/sharer.js/sharer.min.js' : './js/sharer.min.js'});
  eleventyConfig.addPassthroughCopy({'./node_modules/clipboard/dist/clipboard.min.js' : './js/clipboard.min.js'});
  // passthrough assets & custom scripts
  eleventyConfig.addPassthroughCopy({'src/assets/js' : '/js/'});
  eleventyConfig.addPassthroughCopy({'src/assets/static' : '/static/'});
  eleventyConfig.addPassthroughCopy({'src/assets/videos' : '/videos/'});
  
  // watch for changes
  eleventyConfig.addWatchTarget('./tailwind.config.js');
  eleventyConfig.addWatchTarget('./src/assets/css/*.css');
  eleventyConfig.addWatchTarget('./src/assets/sprites/');
  
  // Add Shortcodes
  eleventyConfig.addNunjucksShortcode("picture", pictureShortcode);
  eleventyConfig.addShortcode("gif", gifShortcode);

	// Filters
  eleventyConfig.addFilter('markdownFilter', markdownFilter);
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });
  

  // add plugins
  eleventyConfig.addPlugin(faviconsPlugin, {
    'outputDir': './_dist',
    'manifestData': {'name': 'EdgePoint Learning'},
    'generateManifest': true
  });

  eleventyConfig.addPlugin(emojiReadTime);

  eleventyConfig.addPlugin(metagen);

  eleventyConfig.addPlugin(svgSprite, {
    path: "./src/assets/sprites",
  });

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://www.edgepointlearning.com",
    },
  });

  return {
    dir: {
      input: 'src',
      output: '_dist'
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: 'njk',
  };

};