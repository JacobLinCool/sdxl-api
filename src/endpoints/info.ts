import { OpenAPIRoute, OpenAPIRouteSchema, Path } from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";

export class Info extends OpenAPIRoute {
	static schema = {
		tags: ["Image Retrieval"],
		summary: "Retrieve the configuration for an generated image",
		parameters: {
			id: Path(String, {
				description: "ID of the image to retrieve",
			}),
		},
		responses: {
			"200": {
				description: "Returns an image",
				schema: {
					prompt: String,
					steps: Number,
					Time: Number,
				},
			},
		},
	} satisfies OpenAPIRouteSchema;

	async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
		const { id } = data.params;
		const info = await sdxl.info(id);
		if (!info) {
			return Response.json(
				{
					success: false,
					error: "Image not found",
				},
				{ status: 404 },
			);
		}

		return Response.json(info);
	}
}
