import RuntimeException from "@classes/exception";
import { InvalidParameterException, SanitizationException, InvalidOperationException } from "@classes/exceptions";
// @ts-ignore
import sanitizeHtml from "sanitize-html";
import config from "@root/conf.json";

/**
 * Manages templating functionalities
 */
export default class Templating {
	/**
	 * Sanitizes the given html string
	 * @param html the dirty html
	 * @returns the sanitized html
	 */
	public static sanitizeHtml(html: string) {
		return sanitizeHtml(html, {
			allowedTags: [
				"div",
				"span",
				"p",
				"strong",
				"em",
				"u",
				"s",
				"blockquote",
				"pre",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"ol",
				"li",
				"sub",
				"sup",
				"a",
				"iframe",
				"br",
				"hr"
			],
			selfClosing: [ "img", "br", "hr" ],
			allowedAttributes: {
				"a": [ "href", "rel", "target" ],
				"p": [ "class" ],
				"span": [ "class", "style" ],
				"pre": [ "class", "spellcheck" ],
				"iframe": [ "class", "allowFullscreen", "src", "frameborder" ]
			},
			allowedIframeHostnames: [ "www.youtube.com" ]
		});
	}

	/**
	 * Strips all html from the given text
	 * @param text the dirty text
	 * @returns the stripped text
	 */
	public static stripHtml(text: string) {
		return sanitizeHtml(text, {
			allowedTags: [],
			allowedAttributes: {}
		});
	}
};
