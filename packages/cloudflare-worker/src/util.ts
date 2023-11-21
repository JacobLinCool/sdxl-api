function select<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function example_prompt(): string {
	const attributes = [
		["girl", "boy"], // Gender
		["young", "teenager", "adult", "elderly"], // Age
		["blonde hair", "black hair", "red hair", "brown hair", "blue hair", "green hair"], // Hair color
		[
			"wearing a casual outfit",
			"wearing a formal dress",
			"wearing sportswear",
			"wearing traditional attire",
		], // Clothing style
		["wearing a hat", "wearing glasses", "wearing a necklace", "wearing a scarf"], // Accessories
		["smiling", "looking serious", "laughing", "crying"], // Expression
		[
			"in a park",
			"at the beach",
			"in a city",
			"in a forest",
			"in a mountainous area",
			"in a futuristic city",
		], // Setting
		["during the day", "at sunset", "under starry night", "at dawn"], // Time of day
		["sunny weather", "rainy weather", "snowy condition", "foggy atmosphere"], // Weather
	];

	const segments = attributes.map(select);
	return "watercolor, painting, traditional, colorful, " + segments.join(", ");
}

export async function retry<T>(fn: () => Promise<T>, count = 0, max = 2): Promise<T> {
	await new Promise((resolve) => setTimeout(resolve, 1000 * (2 ** count - 1)));

	try {
		return await fn();
	} catch (err) {
		if (count >= max) {
			throw err;
		}
		return await retry(fn, count + 1, max);
	}
}
