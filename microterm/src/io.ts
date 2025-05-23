
/** Just a not so pretty way to make it easier to use setTimeout() with async/await */
function pause(s = 1) {
	return new Promise(resolve => setTimeout(resolve, 1000 * Number(s)));
}

/**
 * Types the given text on the screen
 * @param {string|Array<string>} text Text to type
 * @param {Object} options Typer config
 * @param {number} options.wait Time (ms) to wait between characters.
 * @param {number} options.lineWait If text is an array of strings, it will wait this amount (ms) between lines
 * @param {number} options.finalWait Time (ms) to wait when finished.
 * @param {string} options.typerClass Class to add to the typing container, in order to style is with CSS
 * @param {boolean} options.useContainer If true, types text into the container element (3rd parameter). If false, creates a new div
 * @param {boolean} options.stopBlinking Stop blinking when typing is done
 * @param {boolean} options.processChars Whether to preprocess spaces, tabs and newlines to &nbsp; (3x&nbsp;) and <br>
 * @param {boolean} options.clearContainer Clear container before typing
 * @param {Element} container DOM element where text will be typed
 */
export async function type(
	text,
	options = {},
	container = document.querySelector(".terminal")
) {
	if (!text) return Promise.resolve();

	let {
		wait = 30,
		initialWait = 1000,
		finalWait = 500,
		lineWait = 100,
		typerClass = "",
		useContainer = false,
		stopBlinking = true,
		processChars = true,
		clearContainer = false
	} = options;

	// If text is an array, e.g. type(['foo', 'bar'])
	if (processChars && Array.isArray(text)) {
		for (const t of text)
			await type(
				t,
				{
					...options,
					initialWait: lineWait,
					finalWait: lineWait
				},
				container
			);
		return;
	}

	let interval;
	return new Promise(async (resolve) => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
		// Create a div where all the characters can be appended to (or use the given container)
		let typer = useContainer
			? container
			: document.createElement("div");
		typer.classList.add("typer", "active");

		if (typerClass) {
			typer.classList.add(typerClass);
		}
		// Handy if reusing the same container
		if (clearContainer) {
			container.innerHTML = "&nbsp;";
		}

		if (!useContainer) {
			container.appendChild(typer);
		}

		if (initialWait) {
			await pause(initialWait / 1000);
		}

		let queue = text;
		if (processChars) {
			queue = text.split("");
		}

		let prev;

		// Use an interval to repeatedly pop a character from the queue and type it on screen
		interval = setInterval(async () => {
			if (queue.length) {
				let char = queue.shift();

				// This is an optimisation for typing a large number of characters on the screen.
				// It seems the performance degrades when trying to add 500+ DOM elements rapidly on the screen.
				// So the content of the previous element is moved to the typer container and removed, which
				// reduces the amount of DOM elements.
				// This may cause issues when the element is removed while the character is still animating (red screen)
				if (processChars && prev) {
					prev.remove();
					if (
						prev.firstChild &&
						prev.firstChild.nodeType ===
							Node.TEXT_NODE
					) {
						typer.innerText +=
							prev.innerText;
					} else {
						typer.appendChild(prev);
					}
				}
				let element = processChars
					? getChar(char)
					: char;
				if (element) {
					typer.appendChild(element);

					if (element.nodeName === "BR") {
						scroll(container);
					}
				}
				prev = element;
			} else {
				// When the queue is empty, clean up the interval
				clearInterval(interval);
				await pause(finalWait / 1000);
				if (stopBlinking) {
					typer.classList.remove("active");
				}
				resolve();
			}
		}, wait);
	});
}


/**
 * Convert a character that needs to be typed into something that can be shown on the screen.
 * Newlines becomes <br>
 * Tabs become three spaces.
 * Spaces become &nbsp;
 * */
function getChar(char) {
	let result;
	if (typeof char === "string") {
		if (char === "\n") {
			result = document.createElement("br");
		} else if (char === "\t") {
			let tab = document.createElement("span");
			tab.innerHTML = "&nbsp;&nbsp;&nbsp;";
			result = tab;
		} else if (char === " ") {
			let space = document.createElement("span");
			space.innerHTML = "&nbsp;";
			space.classList.add("char");
			result = space;
		} else {
			let span = document.createElement("span");
			span.classList.add("char");
			span.textContent = char;
			result = span;
		}
	}
	return result;
}