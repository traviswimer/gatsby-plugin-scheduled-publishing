import { DateTime } from "luxon";
import type { Reporter, GatsbyNode } from "gatsby";

export interface getPublishDateProps {
	node: GatsbyNode & Record<any, any>;
	publishDate: string | Function;
	reporter: Reporter;
	dateFormat?: string;
	timezone?: string;
	delayInMinutes?: number;
}

export default function getPublishDate({
	node,
	publishDate,
	reporter,
	dateFormat,
	timezone = "UTC",
	delayInMinutes = 0,
}: getPublishDateProps): DateTime | void {
	let retrievedDateString;
	if (typeof publishDate === "function") {
		retrievedDateString = publishDate(node);
	}

	if (!retrievedDateString) {
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

	let retrievedDate: DateTime;
	if (dateFormat) {
		retrievedDate = DateTime.fromFormat(retrievedDateString, dateFormat, {
			zone: timezone,
		}).plus({ minutes: delayInMinutes });
	} else {
		retrievedDate = DateTime.fromISO(retrievedDateString, {
			zone: timezone,
		}).plus({ minutes: delayInMinutes });
	}
	if (!retrievedDate.isValid) {
		reporter.panicOnBuild(
			`Invalid date found at specified publishDate. Found value "${retrievedDateString}" at "${retrievedDate}" on the following node:\n${JSON.stringify(
				node,
				undefined,
				"\t"
			)}`
		);
		return;
	}

	return retrievedDate;
}
