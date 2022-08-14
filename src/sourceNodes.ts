import { SourceNodesArgs } from "gatsby";
import createPublishedAndUnpublishedNodes from "./createPublishedAndUnpublishedNodes";

export default async function sourceNodes(
	{
		actions,
		createNodeId,
		reporter,
		createContentDigest,
		getNodes,
	}: SourceNodesArgs,
	pluginOptions: any
) {
	// Create the Published and Unpublished nodes
	// This must be done here in "sourceNodes" instead of "onCreateNode".
	// "onCreateNode" runs too late, causing errors when restored from cache during "gatsby develop".
	const nodes = getNodes();
	const nodePromises = nodes.map((node) => {
		return createPublishedAndUnpublishedNodes(
			{
				node,
				actions,
				createNodeId,
				reporter,
				createContentDigest,
			},
			pluginOptions
		);
	});

	await Promise.all(nodePromises);
}
