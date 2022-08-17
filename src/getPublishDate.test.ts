import type { GatsbyNode } from "gatsby";
import getPublishDate from "./getPublishDate";

test(`returns date when valid key function is provided`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => {
		return node.some.random.date;
	};
	const result: any = getPublishDate({
		node,
		publishDate,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

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
	const publishDate = (node) => node.an?.invalid?.key;

	const result = getPublishDate({
		node,
		publishDate,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

	expect(result).toBeUndefined();
});

test(`returns undefined when invalid key type is provided`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;

	// this isn't a function and should fail
	const publishDate = "not a function";

	const result = getPublishDate({
		node,
		publishDate,
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
	const publishDate = (node) => node.some?.random?.date;

	const result = getPublishDate({
		node,
		publishDate,
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
	const publishDate = (node) => node.some?.random?.date;

	const result = getPublishDate({
		node,
		publishDate,
		reporter: { panicOnBuild: jest.fn() },
	} as any);

	expect(result).toBeUndefined();
});

test(`reports error if date is invalid`, () => {
	const date = () => {};
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => node.some?.random?.date;

	const params = {
		node,
		publishDate,
		reporter: { panicOnBuild: jest.fn() },
	} as any;

	const result = getPublishDate(params);

	expect(jest.mocked(params.reporter.panicOnBuild).mock.calls[0][0]).toContain(
		"Invalid date found at specified publishDate."
	);
	expect(result).toBeUndefined();
});

test(`reports warning if delayInMinutes is over 24 hours`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => node.some?.random?.date;

	const params = {
		node,
		publishDate,
		delayInMinutes: 60 * 25,
		reporter: { warn: jest.fn() },
	} as any;

	const result = getPublishDate(params);

	expect(jest.mocked(params.reporter.warn).mock.calls[0][0]).toContain(
		`"delayInMinutes" plugin option is`
	);
	expect(result).not.toBeUndefined();
});

test(`correctly adjusts for timezones`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => node.some?.random?.date;

	const params = {
		node,
		publishDate,
		timezone: "America/New_York",
	} as any;

	const result: any = getPublishDate(params);

	expect(result.toString()).toEqual("2022-01-30T00:00:00.000-05:00");
});

test(`correctly adjusts for delayInMinutes`, () => {
	const date = "2022-01-30";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => node.some?.random?.date;

	const params = {
		node,
		publishDate,
		delayInMinutes: 60 * 5 + 45,
	} as any;

	const result: any = getPublishDate(params);

	expect(result.toString()).toEqual("2022-01-30T05:45:00.000Z");
});

test(`accepts different date formats`, () => {
	const date = "2022-22-01";
	const node = {
		some: {
			random: {
				date,
			},
		},
	} as GatsbyNode<any, any>;
	const publishDate = (node) => node.some?.random?.date;

	const params = {
		node,
		publishDate,
		dateFormat: "yyyy-dd-MM",
	} as any;

	const result: any = getPublishDate(params);

	expect(result.toString()).toEqual("2022-01-22T00:00:00.000Z");
});
