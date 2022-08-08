import type { CreateNodeArgs, PluginOptions } from "gatsby";

function getPublishDate({ node, publishDateKey }: any) {
	if (!node.frontmatter) {
		return;
	}
	const publishDateString = node.frontmatter[publishDateKey];

	return !!publishDateString ? new Date(publishDateString) : undefined;
}

export const onCreateNode = async (
	{
		node,
		loadNodeContent,
		actions,
		createNodeId,
		reporter,
		createContentDigest,
	}: CreateNodeArgs,
	pluginOptions: PluginOptions
): Promise<void> => {
	const { createNode, createNodeField } = actions;
	const { publishDateKey = "publishDate" } = pluginOptions;

	const publishDate = getPublishDate({ node, publishDateKey });

	if (!publishDate) {
		return;
	}

	const currentDate = new Date();
	const isPublished = publishDate <= currentDate;

	// Adds an "isPublished" field to the original MDX node
	createNodeField({
		node,
		name: `isPublished`,
		value: isPublished,
	});

	// Creates queryable nodes of both Published and Unpublished mdx files
	const content = await loadNodeContent(node);

	const scheduledPublishingNode: any = {
		id: createNodeId(`${node.id} >>> MdxScheduledPublishing`),
		internal: {
			content,
			type: isPublished ? `MdxPublished` : `MdxUnpublished`,
		},
		mdx___NODE: node.id,
	};

	scheduledPublishingNode.internal.contentDigest = createContentDigest(
		scheduledPublishingNode
	);

	createNode(scheduledPublishingNode);
};
