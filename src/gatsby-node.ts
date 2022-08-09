import getPublishDate from "./getPublishDate";
import { DateTime } from "luxon";

export const NO_PUBLISH_DATE_KEY_PROVIDED = `Invalid "publishDateKey" provided in plugin options.`;

export interface LocalPluginOptions {
	publishDateKey: string | Function;
	dateFormat?: string;
	timezone?: string;
	delayInMinutes?: number;
}

export const onCreateNode = async (
	{
		node,
		loadNodeContent,
		actions,
		createNodeId,
		reporter,
		createContentDigest,
	}: any,
	pluginOptions: LocalPluginOptions
): Promise<void> => {
	const { createNode, createNodeField } = actions;
	const { publishDateKey, dateFormat, timezone, delayInMinutes } =
		pluginOptions;

	if (!publishDateKey) {
		reporter.panicOnBuild(NO_PUBLISH_DATE_KEY_PROVIDED);
		return;
	}

	const publishDate = getPublishDate({
		node,
		publishDateKey,
		dateFormat,
		timezone,
		delayInMinutes,
		reporter,
	});

	if (!publishDate) {
		return;
	}

	const currentDate = DateTime.now();
	const isPublished = publishDate.toMillis() <= currentDate.toMillis();

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
