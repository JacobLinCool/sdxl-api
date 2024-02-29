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
import { example_prompt } from "util";

export class GenExample extends OpenAPIRoute {
	static schema = {
		tags: ["Image Generation"],
		summary: "Generate an example image",
		parameters: {
			model: Query(new Enumeration({ values: modelMappings["text-to-image"].models }), {
				description: "The model to use for generation.",
				default: DEFAULT_MODEL,
			}),
			steps: Query(new Int({ default: DEFAULT_STEPS }), {
				description: "The number of steps to generate the image",
				default: DEFAULT_STEPS,
				required: false,
			}),
			guidance: Query(new Num({ default: DEFAULT_GUIDANCE }), {
				description: "The guidance scale of the prompt",
				default: DEFAULT_GUIDANCE,
				required: false,
			}),
		},
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
		},
	} satisfies OpenAPIRouteSchema;

	async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
		const [image, time, id] = await sdxl.generate(data.query.model, {
			prompt: example_prompt(),
			num_steps: data.query.steps ? parseInt(data.query.steps) : undefined,
			guidance: data.query.guidance ? parseFloat(data.query.guidance) : undefined,
		});

		return new Response(image, {
			headers: {
				"Content-Type": "image/png",
				"X-Image-ID": id,
				"X-Image-Time": time.toString(),
			},
		});
	}
}
