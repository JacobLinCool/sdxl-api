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

		// generate an image
		const [image] = await sdxl.generate(
			"A colorful deep space nebula on a black background.",
			12,
		);

		// return the image
		return new Response(image, { headers: { "content-type": "image/png" } });
	},
} as ExportedHandler<Env>;
