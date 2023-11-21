import { Ai } from "@cloudflare/ai";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { Env } from "env";
import { sdxl } from "sdxl";
import { GenExample } from "./endpoints/example";
import { Gen } from "./endpoints/gen";
import { Info } from "./endpoints/info";
import { Retrieve } from "./endpoints/retrieve";

export const router = OpenAPIRouter({
	docs_url: "/",
	schema: {
		info: {
			title: "SDXL API",
			description: "The API for Stable Diffusion XL @ Cloudflare AI Workers",
			version: "1.0.0",
		},
		externalDocs: {
			url: "https://github.com/JacobLinCool/sdxl-api",
		},
	},
});

router.get("/api/gen/", Gen);
router.get("/api/example/", GenExample);
router.get("/api/info/:id", Info);
router.get("/api/retrieve/:id", Retrieve);

// 404 for everything else
router.all("*", () =>
	Response.json(
		{
			success: false,
			error: "Route not found",
		},
		{ status: 404 },
	),
);

export default {
	fetch(request, env, context) {
		const ai = new Ai(env.AI, { debug: false });
		const r2 = env.R2 || null;
		sdxl.setup({ ai, r2 });

		return router.handle(request, env, context);
	},
} as ExportedHandler<Env>;
