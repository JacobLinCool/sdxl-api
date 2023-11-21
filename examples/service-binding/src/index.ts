import { colors } from "colors";
import { positions } from "positions";
import { sdxl } from "sdxl-api";

interface Env {
	// the service binding to the upstream SDXL-API worker
	sdxl: Fetcher;
}

export default {
	async fetch(request, env) {
		// ignore favicon requests
		if (new URL(request.url).pathname !== "/") {
			return new Response("Not found", { status: 404 });
		}

		// setup the SDXL instance, bind to the service
		sdxl.setup({ fetcher: env.sdxl });

		for (let i = 0; i < 3; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000 * 3 ** i - 1));

			try {
				// generate an image
				const [image, time, id] = await sdxl.generate(
					`A colorful ${select(colors)} deep space nebula centered at ${select(
						positions,
					)} on a black background.`,
					12,
				);

				// return the image
				return new Response(image, {
					headers: {
						"content-type": "image/png",
						"x-image-id": id,
						"x-image-time": time.toString(),
					},
				});
			} catch (e) {
				console.error(e);
			}
		}
	},
} as ExportedHandler<Env>;

export function select<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}
