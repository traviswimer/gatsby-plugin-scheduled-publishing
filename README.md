> `gatsby-plugin-scheduled-publishing` helps you auto-publish content without requiring a "data source".

- [Learn about the problems this plugin solves.](#problem-explanation)
- [Getting Started](#getting-started)
- [Advanced Examples](#examples)
- [Read the API reference](#api)

<h2 id="problem-explanation">What problems does this solve?</h2>

Sometimes you want to add new content to your Gatsby site, but only want it to be published after a certain date.

Normally, this would mean using a [data source](https://support.gatsbyjs.com/hc/en-us/articles/1500000907821-Hosting-and-Data-Source-Integrations) such as a CMS.

This plugin allows you to simply commit the scheduled date to your repo instead.

**Triggering the build**

This plugin only affects what is included in a build. How you generate a new build will depend on your setup.

<h2 id="getting-started">Getting Started</h2>

### Install

**Yarn:**

```shell
yarn add gatsby-plugin-scheduled-publishing
```

**NPM:**

```shell
npm install gatsby-plugin-scheduled-publishing
```

## General Usage

```javascript
// gatsby-config.js

const config = {
	plugins: [
		{
			resolve: `gatsby-plugin-scheduled-publishing`,
			options: {
				publishDate: (node) => node.frontmatter?.myPublishDate, // Required

				group: "BlogPosts", // Optional
				timezone: "America/New_York", // Optional
				delayInMinutes: 60 * 6, // Optional
				dateFormat: "yyyy-MM-dd", // Optional
			},
		},
	],
};
```

This example will look for any Gatsby Data Node (object returned by Gatsby GraphQL queries) that includes the property `frontmatter.myPublishDate`. It will then evaluate the value of this property as a date and compare it to the the current date to determine if it has been published.

Then you can query the data like this:

```javascript
// src/pages/MyPage.js

export default function MyPage({ data }) {
	const { title, myPublishDate } = data.blogPosts;
	return (
		<main>
			<h1>{title}</h1>
			<h2>Published on: {myPublishDate}</h2>
		</main>
	);
}

export const query = graphql`
	query published {
		blogPosts: allPublished {
			frontmatter {
				myPublishDate
				title
			}
		}
	}
`;
```

This plugin creates `published` and `unpublished` node types. This means you can run GraphQL queries on `allPublished` and `allUnpublished`.

If you include the `group` name option, you can filter results like this:

```javascript
export const query = graphql`
	query published {
		blogPosts: allPublished(filter: { publishGroup: { eq: "BlogPosts" } }) {
			publishGroup
			frontmatter {
				myPublishDate
				title
			}
		}
	}
`;
```

<h2 id="api">Plugin Options API</h2>

`publishDate`: _Function_

This function will run for every Gatsby GraphQL Node that is created in your app. It receives one parameter, which is the current `Node`.

If you want the `Node` to be included for scheduled publishing, return a string representing a date. If you return `undefined` or an invalid date string, the `Node` will not be included.

If that date is later than or equal to the current date, it will be considered **published**. If it is earlier than the current date, it will be considered **unpublished**.

In both cases, a boolean "`isPublished`" `field` will be added to the `Node` (`node.fields.isPublished`). The `Node` will also be included in either the `published()` & `allPublished()` GraphQL queries or the `unpublished()` & `allUnpublished()` GraphQL queries.

**Simple example**

```javascript
const config = {
	plugins: [
		{
			resolve: `gatsby-plugin-scheduled-publishing`,
			options: {
				publishDate: (node) => node.frontmatter?.myPublishDate,
			},
		},
	],
};
```

In this example, it will search all nodes that contain a `frontmatter` object, which has a `myPublishDate`.

**Complex data example**

```javascript
const config = {
	plugins: [
		{
			resolve: `gatsby-plugin-scheduled-publishing`,
			options: {
				publishDate: ({ frontmatter = {} }) => {
					const { year, month, day } = frontmatter;
					if ((year, month, day)) {
						return `${frontmatter.year}-${frontmatter.month}-${frontmatter.day}`;
					}
				};
			},
		},
	],
};
```

In this example, the year, month, and day are all separate properties on the `Node`, so the function returns a string that combines them all together. If any of them are not defined, it will return `undefined`, and the `Node` will not be included.

`dateFormat`: _string_ - _optional_ (Default: `"yyyy-MM-dd"`)

This is the date format that will be expected when a date is found with `publishDate`. By default, it is expected that you will pass a date formatted like this: `2022-05-30`

This plugin uses a library called [Luxon](https://moment.github.io/luxon/#/) to work with dates. You can find all supported date format options in [Luxon's date format documentation](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).

`timezone`: _string_ - _optional_ (Default: `"UTC"`)

This is the timezone you want to use for the publish date. To see all supported timezone strings refer to the [IANA Timezone List](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#list).

`delayInMinutes`: _number_ - _optional_ (Default: `0`)

Allows you to specify the time of day to publish. It is passed in using the number of minutes.

For example, to set it for 5:45am you would pass `60 * 5 + 45`. For 2:30pm, you would pass `60 * 14 + 30`.

<h2 id="examples">Examples</h2>

**Multiple instances example**

```javascript
const config = {
	plugins: [
		{
			resolve: `gatsby-plugin-scheduled-publishing`,
			options: {
				group: "BlogPosts",
				publishDate: (node) => {
					if(node.isBlogPost){
						return node.frontmatter?.myPublishDate
					}
				};
			},
		},
		{
			resolve: `gatsby-plugin-scheduled-publishing`,
			options: {
				group: "OtherContent",
				publishDate: (node) => {
					return node.startDate,
				};
			},
		},
	],
};

export const query = graphql`
	query published {
		blogPosts: allPublished(filter: { publishGroup: { eq: "BlogPosts" } }) {
			publishGroup
			frontmatter {
				myPublishDate
				title
			}
		}

		otherContent: allPublished(filter: { publishGroup: { eq: "OtherContent" } }) {
			publishGroup
			startDate
			content
		}
	}
`;
```

## How to run tests

```shell
yarn test
```

## How to develop locally

Use the following command to build and watch for changes:

```shell
yarn start
```

To test the plugin inside a Gatsby project, you can use `yarn link`.

First run this command inside the plugin repo:

```shell
yarn link
```

Then run this command inside your gatsby project:

```shell
yarn link gatsby-plugin-scheduled-publishing
```

## How to contribute

Open an issue for bug reports, feature requests, etc.

Pull requests are appreciated, but it should be discussed in an issue first.

## Project Links

- [NPM](https://www.npmjs.com/package/gatsby-plugin-scheduled-publishing)
- [GitHub](https://github.com/traviswimer/gatsby-plugin-scheduled-publishing)

## Author

#### Travis Wimer

- <a href="https://traviswimer.com/developer-portfolio" title="React Native, React, NodeJS, UI/UX Developer" target="_blank">Developer Portfolio</a>
- <a href="https://traviswimer.com/blog" title="React Native, React, NodeJS, UI/UX Blog" target="_blank">Blog</a>
- <a href="https://www.linkedin.com/in/traviswimer/" title="Developer Resume" target="_blank">LinkedIn</a>
- <a href="https://twitter.com/Travis_Wimer" title="Travis Wimer | Software Developer" target="_blank">Twitter</a>
- <a href="https://traviswimer.com/developer-portfolio/gatsby-plugin-scheduled-publishing" title="gatsby-plugin-scheduled-publishing | Travis Wimer" target="_blank">gatsby-plugin-scheduled-publishing Portfolio Page</a>

## License

MIT. Copyright © 2022 Travis Wimer
