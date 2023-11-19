import { OpenAPIRoute, OpenAPIRouteSchema, Query, Str } from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";
import { example_prompt } from "util";

export class GenExample extends OpenAPIRoute {
	static schema = {
		tags: ["Image Generation"],
		summary: "Generate an example image",
		parameters: {
			steps: Query(Number, {
				description: "The number of steps to generate the image",
				default: 20,
				required: false,
			}),
		},
		responses: {
			"200": {
				description: "Returns an image",
				contentType: "image/png",
				// @ts-expect-error
				schema: new Str({ format: "binary" }),
			},
		},
	} satisfies OpenAPIRouteSchema;

	async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
		const search = new URL(request.url).searchParams;
		const step = parseInt(search.get("steps") || "20");

		const [image, _t, id] = await sdxl.generate(example_prompt(), step);

		return new Response(image, {
			headers: {
				"Content-Type": "image/png",
				"X-Image-ID": id,
			},
		});
	}
}
