import {
	Enumeration,
	Int,
	OpenAPIRoute,
	OpenAPIRouteSchema,
	Query,
	Str,
} from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";

export class Gen extends OpenAPIRoute {
	static schema = {
		tags: ["Image Generation"],
		summary: "Generate an image",
		parameters: {
			prompt: Query(String, {
				description: "The prompt to generate an image from",
			}),
			steps: Query(new Int({ default: 20 }), {
				description: "The number of steps to generate the image",
				default: 20,
				required: false,
			}),
			format: Query(new Enumeration({ values: ["png", "json"] }), {
				description: "The format of the returns, either `png` or `json`",
				default: "png",
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
			"400": {
				description: "Error",
				schema: {
					success: Boolean,
					error: String,
				},
			},
		},
	} satisfies OpenAPIRouteSchema;

	async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
		let prompt = data.query.prompt || "";
		if (!prompt) {
			return Response.json(
				{
					success: false,
					error: "Prompt not provided",
				},
				{ status: 400 },
			);
		}
		const steps = data.query.steps;

		const [image, time, id] = await sdxl.generate(prompt, steps);

		const format = data.query.format;
		if (format === "json") {
			const url = new URL(`./retrieve/${id}`, request.url);
			return Response.json({
				id,
				url,
			});
		} else {
			return new Response(image, {
				headers: {
					"Content-Type": "image/png",
					"X-Image-ID": id,
					"X-Image-Time": time.toString(),
				},
			});
		}
	}
}
