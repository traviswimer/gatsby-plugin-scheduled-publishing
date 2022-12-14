import type { GatsbyNode } from "gatsby";
import { DateTime } from "luxon";
import createPublishedAndUnpublishedNodes, {
	NO_PUBLISH_DATE_KEY_PROVIDED,
	DEFAULT_GROUP_NAME,
} from "./createPublishedAndUnpublishedNodes";

test(`doesn't create node when no date is found`, async () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => node.an?.invalid?.key;
	const params: any = {
		node,
		loadNodeContent: jest.fn(),
		actions: {
			createNode: jest.fn(),
			createNodeField: jest.fn(),
		},
		createNodeId: jest.fn(),
		reporter: {},
		createContentDigest: jest.fn(),
	};
	await createPublishedAndUnpublishedNodes(params, {
		publishDate,
	});
	expect(params.actions.createNodeField).not.toHaveBeenCalled();
	expect(params.actions.createNode).not.toHaveBeenCalled();
});

test(`reports error when no "publishDate" is provided`, async () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate: any = undefined;
	const params: any = {
		node,
		loadNodeContent: jest.fn(),
		actions: {
			createNode: jest.fn(),
			createNodeField: jest.fn(),
		},
		createNodeId: jest.fn(),
		reporter: { panicOnBuild: jest.fn() },
		createContentDigest: jest.fn(),
	};
	await createPublishedAndUnpublishedNodes(params, {
		publishDate,
	});
	expect(jest.mocked(params.reporter.panicOnBuild).mock.calls[0][0]).toEqual(
		NO_PUBLISH_DATE_KEY_PROVIDED
	);
	expect(params.actions.createNodeField).not.toHaveBeenCalled();
	expect(params.actions.createNode).not.toHaveBeenCalled();
});

test(`creates node field and node when key and value are valid`, async () => {
	const date = "2022-01-30";
	const node = {
		id: "NodeID",
		some: {
			random: {
				date,
			},
		},
	} as any;
	const publishDate = (node) => node.some?.random?.date;
	const params: any = {
		node,
		loadNodeContent: jest.fn(),
		actions: {
			createNode: jest.fn(),
			createNodeField: jest.fn(),
		},
		createNodeId: jest.fn(),
		reporter: {},
		createContentDigest: jest.fn(),
	};
	params.createNodeId.mockImplementation((id) => id);
	await createPublishedAndUnpublishedNodes(params, {
		publishDate,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `isPublished`,
		value: true,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `publishGroup`,
		value: DEFAULT_GROUP_NAME,
	});
	expect(params.actions.createNode).toHaveBeenCalledTimes(1);
	const first_call = jest.mocked(params.actions.createNode).mock.calls[0][0];
	expect(first_call.id).toContain(`${node.id} >>>`);
	expect(first_call.internal).toBeDefined();
	expect(first_call.node___NODE).toEqual(node.id);
	expect(first_call.publishGroup).toEqual(DEFAULT_GROUP_NAME);
});

test(`creates unpublished node field and node when date is later than the current date`, async () => {
	const date = DateTime.now().plus({ days: 10 }).toFormat("yyyy-MM-dd");
	const node = {
		id: "NodeID",
		some: {
			random: {
				date,
			},
		},
	} as any;
	const publishDate = (node) => node.some?.random?.date;
	const params: any = {
		node,
		loadNodeContent: jest.fn(),
		actions: {
			createNode: jest.fn(),
			createNodeField: jest.fn(),
		},
		createNodeId: jest.fn(),
		reporter: {},
		createContentDigest: jest.fn(),
	};
	params.createNodeId.mockImplementation((id) => id);
	await createPublishedAndUnpublishedNodes(params, {
		publishDate,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `isPublished`,
		value: false,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `publishGroup`,
		value: DEFAULT_GROUP_NAME,
	});
	expect(params.actions.createNode).toHaveBeenCalledTimes(1);
	const first_call = jest.mocked(params.actions.createNode).mock.calls[0][0];
	expect(first_call.id).toContain(`${node.id} >>>`);
	expect(first_call.internal).toBeDefined();
	expect(first_call.node___NODE).toEqual(node.id);
	expect(first_call.publishGroup).toEqual(DEFAULT_GROUP_NAME);
});

test(`sets publishGroup`, async () => {
	const date = "2022-01-30";
	const node = {
		id: "NodeID",
		some: {
			random: {
				date,
			},
		},
	} as any;
	const publishDate = (node) => node.some?.random?.date;
	const params: any = {
		node,
		loadNodeContent: jest.fn(),
		actions: {
			createNode: jest.fn(),
			createNodeField: jest.fn(),
		},
		createNodeId: jest.fn(),
		reporter: {},
		createContentDigest: jest.fn(),
	};
	params.createNodeId.mockImplementation((id) => id);

	const groupName = "test_group";
	await createPublishedAndUnpublishedNodes(params, {
		publishDate,
		group: groupName,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `publishGroup`,
		value: groupName,
	});
	expect(params.actions.createNode).toHaveBeenCalledTimes(1);
	const first_call = jest.mocked(params.actions.createNode).mock.calls[0][0];
	expect(first_call.publishGroup).toEqual(groupName);
});
