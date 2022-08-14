// For some reason Gatsby insists that plugins keep gatsby-* files at the top level.
// So we just pull in the transpiled build files here.

module.exports.sourceNodes = require("./build/sourceNodes").default;
module.exports.createSchemaCustomization =
	require("./build/createSchemaCustomization").default;
