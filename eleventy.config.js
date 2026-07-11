const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const path = require("path");
const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const fs = require("fs");

module.exports = function (eleventyConfig) {
	// Passthrough assets
	eleventyConfig.addPassthroughCopy("src/favicon.ico");
	eleventyConfig.addPassthroughCopy("src/robots.txt");

	// Add a date filter for the Sitemap
	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		return dateObj.toISOString().split("T")[0];
	});

	// Setup images
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif"],
		widths: [320, 480, 620, 1088, 1920],
		sharpOptions: {
			avif: {
				quality: 40,
				effort: 6,
			},
		},
		filenameFormat: function (id, src, width, format, options) {
			const extension = path.extname(src);
			const name = path.basename(src, extension);
			return `${name}-${width}w.${format}`;
		},
		htmlOptions: {
			imgAttributes: {
				loading: "lazy",
				decoding: "async",
				sizes: "auto",
			},
		},
	});

	// Find filter for testimonials
	eleventyConfig.addFilter("findByKey", (array, key, value) => {
		if (!Array.isArray(array)) {
			return null;
		}
		return array.find((item) => item[key] === value);
	});

	// Minify JS
	eleventyConfig.on("eleventy.before", async () => {
		const source = fs.readFileSync("src/js/kit-builder.js", "utf8");
		const result = await minify(source);
		fs.mkdirSync("public/js", { recursive: true });
		fs.writeFileSync("public/js/kit-builder.js", result.code);
	});

	// Minify HTML
	eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
		if (outputPath && outputPath.endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
			});
			return minified;
		}
		return content;
	});

	// Minify CSS
	eleventyConfig.addFilter("cssmin", function (code) {
		return new CleanCSS({}).minify(code).styles;
	});

	// Set directories
	return {
		dir: {
			input: "src",
			output: "public",
		},
	};
};
