import _ from "lodash";
import { DateTime } from "luxon";
import type { Reporter, GatsbyNode } from "gatsby";

export interface getPublishDateProps {
	node: GatsbyNode & Record<any, any>;
	publishDateKey: string;
	reporter: Reporter;
	dateFormat?: string;
	timezone?: string;
}

export default function getPublishDate({
	node,
	publishDateKey,
	reporter,
	dateFormat = "yyyy-MM-dd",
	timezone = "UTC",
}: getPublishDateProps): DateTime | void {
	const publishDateString = _.get(node, publishDateKey);
	if (!publishDateString) {
		// This node doesn't have the key, so we can ignore it
		return;
	}

	let publishDate;
	try {
		publishDate = DateTime.fromFormat(publishDateString, dateFormat, {
			zone: timezone,
		});
	} catch (err) {
		reporter.panicOnBuild(
			`Invalid date found at specified publishDateKey. Found value "${publishDateString}" at "${publishDateKey}" on the following node:\n${JSON.stringify(
				node,
				undefined,
				"\t"
			)}`
		);
		return;
	}

	return publishDate;
}
