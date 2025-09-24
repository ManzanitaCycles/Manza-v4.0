const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const path = require("path");
const esbuild = require("esbuild");
const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const fs = require("fs");

module.exports = function (eleventyConfig) {
    // Passthrough assets
    eleventyConfig.addPassthroughCopy("src/assets/favicon");
    eleventyConfig.addPassthroughCopy("src/_redirects");

    // Eleventy Image plugin
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        formats: ["avif", "jpeg"],
        widths: [400, 800, 1200, 1800],
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
            }
        }
    });

    // Image shortcode
    eleventyConfig.addShortcode("image", (src, alt, sizes = "auto", loading = "lazy", fetchpriority = "auto") => {
        // Escape single and double quotes in alt text to prevent HTML issues.
        const cleanAlt = alt.replace(/"/g, '&quot;').replace(/'/g, '&apos;');

        // Return the complete HTML img tag with the provided attributes.
        // The sizes and fetchpriority attributes are included by default with sensible fallbacks.
        return `<img src="${src}" alt="${cleanAlt}" sizes="${sizes}" loading="${loading}" fetchpriority="${fetchpriority}">`;
    });

    // Minify HTML output
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }

        return content;
    });

    // Minify CSS
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
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
            output: "public"
        }
    };
};