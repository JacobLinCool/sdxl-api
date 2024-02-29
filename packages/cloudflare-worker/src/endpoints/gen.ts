import { modelMappings } from "@cloudflare/ai";
import {
	Enumeration,
	Int,
	Num,
	OpenAPIRoute,
	OpenAPIRouteSchema,
	Query,
	Str,
} from "@cloudflare/itty-router-openapi";
import { DEFAULT_GUIDANCE, DEFAULT_MODEL, DEFAULT_STEPS } from "constants";
import { Env } from "env";
import { sdxl } from "sdxl";

export class Gen extends OpenAPIRoute {
	static schema = {
		tags: ["Image Generation"],
		summary: "Generate an image",
		parameters: {
			model: Query(new Enumeration({ values: modelMappings["text-to-image"].models }), {
				description: "The model to use for generation.",
				default: DEFAULT_MODEL,
			}),
			prompt: Query(String, {
				description: "The prompt to generate an image from",
			}),
			steps: Query(new Int({ default: DEFAULT_STEPS }), {
				description: "The number of steps to generate the image",
				default: DEFAULT_STEPS,
				required: false,
			}),
			// strength: Query(new Int({ default: 1 }), {
			// 	description: "The strength of the image",
			// 	default: 1,
			// 	required: false,
			// }),
			guidance: Query(new Num({ default: DEFAULT_GUIDANCE }), {
				description: "The guidance scale of the prompt",
				default: DEFAULT_GUIDANCE,
				required: false,
			}),
			format: Query(new Enumeration({ values: ["png", "json"] }), {
				description: "The format of the returns, either `png` or `json`",
				default: "png",
				required: false,
			}),
		},
		// requestBody: {
		// 	image: new Str({ format: "binary", required: false }),
		// 	mask: new Str({ format: "binary", required: false }),
		// },
		responses: {
			"200": {
				description: "Returns an image",
				contentType: "image/png",
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
		const prompt = data.query.prompt;
		if (!prompt) {
			return Response.json(
				{
					success: false,
					error: "Prompt not provided",
				},
				{ status: 400 },
			);
		}

		const [image, time, id] = await sdxl.generate(data.query.model, {
			prompt,
			num_steps: data.query.steps ? parseInt(data.query.steps) : undefined,
			guidance: data.query.guidance ? parseFloat(data.query.guidance) : undefined,
		});

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
