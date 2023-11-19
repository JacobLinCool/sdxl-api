import { OpenAPIRoute, OpenAPIRouteSchema, Path, Str } from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";

export class Retrieve extends OpenAPIRoute {
	static schema = {
		tags: ["Image Retrieval"],
		summary: "Retrieve an generated image",
		parameters: {
			id: Path(String, {
				description: "ID of the image to retrieve",
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
		const { id } = data.params;
		const image = await sdxl.retrieve(id);
		if (!image) {
			return Response.json(
				{
					success: false,
					error: "Image not found",
				},
				{ status: 404 },
			);
		}

		return new Response(image, {
			headers: {
				"Content-Type": "image/png",
			},
		});
	}
}
