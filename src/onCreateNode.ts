import getPublishDate from "./getPublishDate";
import { DateTime } from "luxon";

export const NO_PUBLISH_DATE_KEY_PROVIDED = `Invalid "publishDateKey" provided in plugin options.`;
export const DEFAULT_GROUP_NAME = "UNGROUPED";

export interface LocalPluginOptions {
	publishDateKey: string | Function;
	group?: string;
	dateFormat?: string;
	timezone?: string;
	delayInMinutes?: number;
}

const onCreateNode = async (
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
	const { group, publishDateKey, dateFormat, timezone, delayInMinutes } =
		pluginOptions;

	const publishGroup = group || DEFAULT_GROUP_NAME;

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

	// Adds an "isPublished" field to the original node
	createNodeField({
		node,
		name: `isPublished`,
		value: isPublished,
	});
	createNodeField({
		node,
		name: `publishGroup`,
		value: publishGroup,
	});

	// Creates queryable nodes of both Published and Unpublished files
	const content = await loadNodeContent(node);

	const scheduledPublishingNode: any = {
		id: createNodeId(`${node.id} >>> ScheduledPublishing`),
		publishGroup,
		internal: {
			content,
			type: isPublished ? `Published` : `Unpublished`,
		},
		node___NODE: node.id,
	};

	scheduledPublishingNode.internal.contentDigest = createContentDigest(
		scheduledPublishingNode
	);

	createNode(scheduledPublishingNode);
};

export default onCreateNode;
