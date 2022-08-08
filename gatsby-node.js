function getPublishDate({ node, publishDateKey }) {
	if (!node.frontmatter) {
		return;
	}
	const publishDateString = node.frontmatter[publishDateKey];

	return !!publishDateString ? new Date(publishDateString) : undefined;
}

exports.onCreateNode = async (
	{
		node,
		loadNodeContent,
		actions,
		createNodeId,
		reporter,
		createContentDigest,
	},
	pluginOptions
) => {
	const { createNode, createNodeField, createParentChildLink } = actions;
	const { publishDateKey = "publishDate" } = pluginOptions;

	const publishDate = getPublishDate({ node, publishDateKey });

	if (!publishDate) {
		return {};
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

	const scheduledPublishingNode = {
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
