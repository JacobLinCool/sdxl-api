import { Int, OpenAPIRoute, OpenAPIRouteSchema, Query, Str } from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";
import { example_prompt } from "util";

export class GenExample extends OpenAPIRoute {
	static schema = {
		tags: ["Image Generation"],
		summary: "Generate an example image",
		parameters: {
			steps: Query(new Int({ default: 20 }), {
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
				headers: {
					"X-Image-ID": {
						description: "The ID of the image",
					},
					"X-Image-Time": {
						description: "The time taken to generate the image, in milliseconds",
					},
				},
			},
		},
	} satisfies OpenAPIRouteSchema;

	async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
		const steps = data.query.steps;

		const [image, time, id] = await sdxl.generate(example_prompt(), steps);

		return new Response(image, {
			headers: {
				"Content-Type": "image/png",
				"X-Image-ID": id,
				"X-Image-Time": time.toString(),
			},
		});
	}
}
