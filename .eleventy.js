const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const path = require("path");
const esbuild = require("esbuild");
const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const fs = require("fs");
const { URL } = require("url");

module.exports = function (eleventyConfig) {
	// Passthrough assets
	eleventyConfig.addPassthroughCopy("src/assets/favicon");
	eleventyConfig.addPassthroughCopy("src/robots.txt");
	eleventyConfig.addPassthroughCopy("src/assets/svg");
	eleventyConfig.addPassthroughCopy("src/assets/fonts");
	eleventyConfig.addPassthroughCopy("src/assets/css");

	// A filter to create absolute URLs
	eleventyConfig.addFilter("absoluteUrl", (path, base) => {
		try {
			return new URL(path, base).toString();
		} catch (e) {
			console.error("Failed to create absolute URL:", e);
			return path;
		}
	});

	// Custom 404 configuration for local dev server
	eleventyConfig.setBrowserSyncConfig({
		callbacks: {
			ready: function (err, bs) {
				bs.addMiddleware("*", (req, res) => {
					// Read the content of the generated 404.html file
					const content_404 = fs.readFileSync(eleventyConfig.dir.output + "/404.html");

					// Set the 404 status code and serve the content
					res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
					res.write(content_404);
					res.end();
				});
			},
		},
	});

	// Eleventy Image plugin
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif", "jpeg"],
		widths: [400, 700, 800, 1200, 1800],
		outputDir: "./public/assets/img",
		urlPath: "/assets/img/",
		filenameFormat: function (id, src, width, format, options) {
			const fileSlug = path.parse(src).name;
			return `${fileSlug}-${width}w.${format}`;
		},
		htmlOptions: {
			imgAttributes: {
				loading: "lazy",
				decoding: "async",
				sizes: "100vw",
			},
		},
	});

	// Image shortcode
	eleventyConfig.addShortcode("image", (src, alt, sizes = "auto", loading = "lazy", fetchpriority = "auto") => {
		const cleanAlt = alt.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
		return `<img src="${src}" alt="${cleanAlt}" sizes="${sizes}" loading="${loading}" fetchpriority="${fetchpriority}">`;
	});

	// Minify HTML output
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

	// Define the list of CSS files to be merged and minified
	const cssFiles = ["./src/assets/css/01-config.css", "./src/assets/css/02-reset.css", "./src/assets/css/03-components.css", "./src/assets/css/04-utilities.css"];

	// Create an asynchronous filter for inlining CSS
	eleventyConfig.addNunjucksAsyncFilter("inlineCSS", async (content, callback) => {
		try {
			// 1. Read the content of all CSS files
			let mergedCSS = "";
			for (const file of cssFiles) {
				// Use fs.promises.readFile for async file reading
				const cssContent = await fs.promises.readFile(file, "utf8");
				mergedCSS += cssContent;
			}

			// 2. Minify the merged CSS
			const minified = new CleanCSS().minify(mergedCSS).styles;

			// 3. Return the minified content to the template
			callback(null, minified);
		} catch (e) {
			console.error("Error in inlineCSS filter:", e);
			// Return an empty string in case of error
			callback(null, "");
		}
	});

	// Watch the JS folder for changes
	eleventyConfig.addWatchTarget("./src/assets/js/");

	eleventyConfig.on("eleventy.before", async () => {
		// Create the bundle for all pages (dropdown.js and forms.js)
		await esbuild.build({
			// Use the single entry point
			entryPoints: ["./src/assets/js/common.js"],
			// Use outfile now that there is only one entry point
			outfile: "./public/assets/js/common.min.js",
			bundle: true,
			minify: true,
			sourcemap: true,
		});

		// Create the bundle for the Whippet page (all four files)
		await esbuild.build({
			// Use the single entry point for this bundle as well
			entryPoints: ["./src/assets/js/whippet.js"],
			outfile: "./public/assets/js/whippet.min.js",
			bundle: true,
			minify: true,
			sourcemap: true,
		});
	});

	// Eleventy base config
	return {
		dir: {
			input: "src",
			output: "public",
		},
	};
};
