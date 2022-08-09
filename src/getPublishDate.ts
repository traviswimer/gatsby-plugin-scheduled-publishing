import _ from "lodash";
import { DateTime } from "luxon";
import type { Reporter, GatsbyNode } from "gatsby";

export interface getPublishDateProps {
	node: GatsbyNode & Record<any, any>;
	publishDateKey: string | Function;
	reporter: Reporter;
	dateFormat?: string;
	timezone?: string;
	delayInMinutes?: number;
}

export default function getPublishDate({
	node,
	publishDateKey,
	reporter,
	dateFormat = "yyyy-MM-dd",
	timezone = "UTC",
	delayInMinutes = 0,
}: getPublishDateProps): DateTime | void {
	let publishDateString;
	if (typeof publishDateKey === "string") {
		publishDateString = _.get(node, publishDateKey);
	} else if (typeof publishDateKey === "function") {
		publishDateString = publishDateKey(node);
	}

	if (!publishDateString) {
		// This node doesn't have the key, so we can ignore it
		return;
	}

	const midnight = 60 * 24;
	if (delayInMinutes >= midnight) {
		reporter.warn(
			`"delayInMinutes" plugin option is ${delayInMinutes} (${
				delayInMinutes / 60
			} hours), which is greater than or equal to 24 hours.\n\nThis is a bad idea and will probably cause problems. You should adjust your publish dates instead.`
		);
	}

	let publishDate;
	try {
		publishDate = DateTime.fromFormat(publishDateString, dateFormat, {
			zone: timezone,
		}).plus({ minutes: delayInMinutes });
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
