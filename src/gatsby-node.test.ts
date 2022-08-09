import type { GatsbyNode } from "gatsby";
import { DateTime } from "luxon";
import { onCreateNode, NO_PUBLISH_DATE_KEY_PROVIDED } from "./gatsby-node";

test(`doesn't create node when no date is found`, async () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey = "an.invalid.key";
	const params = {
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
	await onCreateNode(params, {
		publishDateKey,
	});
	expect(params.actions.createNodeField).not.toHaveBeenCalled();
	expect(params.actions.createNode).not.toHaveBeenCalled();
});

test(`reports error when no "publishDateKey" is provided`, async () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey: any = undefined;
	const params = {
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
	await onCreateNode(params, {
		publishDateKey,
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
	const publishDateKey = "some.random.date";
	const params = {
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
	await onCreateNode(params, {
		publishDateKey,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `isPublished`,
		value: true,
	});
	expect(params.actions.createNode).toHaveBeenCalledTimes(1);
	const first_call = jest.mocked(params.actions.createNode).mock.calls[0][0];
	expect(first_call.id).toContain(`${node.id} >>>`);
	expect(first_call.internal).toBeDefined();
	expect(first_call.mdx___NODE).toEqual(node.id);
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
	const publishDateKey = "some.random.date";
	const params = {
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
	await onCreateNode(params, {
		publishDateKey,
	});
	expect(params.actions.createNodeField).toHaveBeenCalledWith({
		node,
		name: `isPublished`,
		value: false,
	});
	expect(params.actions.createNode).toHaveBeenCalledTimes(1);
	const first_call = jest.mocked(params.actions.createNode).mock.calls[0][0];
	expect(first_call.id).toContain(`${node.id} >>>`);
	expect(first_call.internal).toBeDefined();
	expect(first_call.mdx___NODE).toEqual(node.id);
});
