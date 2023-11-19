import { OpenAPIRoute, OpenAPIRouteSchema, Query, Str } from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";

export class Gen extends OpenAPIRoute {
	static schema = {
		tags: ["Image Generation"],
		summary: "Generate an image",
		parameters: {
			prompt: Query(String, {
				description: "The comma-seperated prompt to generate an image from",
			}),
			steps: Query(Number, {
				description: "The number of steps to generate the image",
				default: 20,
				required: false,
			}),
			format: Query(String, {
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
		const search = new URL(request.url).searchParams;
		let prompt = search.get("prompt") || "";
		if (!prompt) {
			return Response.json(
				{
					success: false,
					error: "Prompt not provided",
				},
				{ status: 400 },
			);
		}
		const step = parseInt(search.get("steps") || "20");

		const [image, _t, id] = await sdxl.generate(prompt, step);

		const format = search.get("format") || "png";
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
				},
			});
		}
	}
}
