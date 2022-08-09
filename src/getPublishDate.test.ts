import type { Reporter, GatsbyNode } from "gatsby";
import getPublishDate from "./getPublishDate";

test(`returns date when valid key string is provided`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey = "some.random.date";
	const result = getPublishDate({
		node,
		publishDateKey,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

	// @ts-ignore
	expect(result.toString()).toEqual("2022-01-30T00:00:00.000Z");
});

test(`returns undefined when invalid key string is provided`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey = "an.invalid.key";

	const result = getPublishDate({
		node,
		publishDateKey,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

	expect(result).toBeUndefined();
});

test(`returns undefined when key exists but Date is null`, () => {
	const date = null;
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey = "some.random.date";

	const result = getPublishDate({
		node,
		publishDateKey,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

	expect(result).toBeUndefined();
});

test(`returns undefined when empty string is provided`, () => {
	const date = "";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey = "some.random.date";

	const result = getPublishDate({
		node,
		publishDateKey,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

	expect(result).toBeUndefined();
});

test(`reports error if date is invalid`, () => {
	const date = 9238423788;
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDateKey = "some.random.date";

	const params = {
		node,
		publishDateKey,
		reporter: { panicOnBuild: jest.fn() },
	} as any;

	const result = getPublishDate(params);

	expect(jest.mocked(params.reporter.panicOnBuild).mock.calls[0][0]).toContain(
		"Invalid date found at specified publishDateKey."
	);
	expect(result).toBeUndefined();
});
