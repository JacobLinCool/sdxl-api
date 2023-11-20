import type { Ai } from "@cloudflare/ai";
import debug from "debug";

const log = debug("sdxl");
log.enabled = true;

export class SDXL {
	constructor(
		protected ai?: Ai,
		protected r2?: R2Bucket,
	) {}

	public async generate(
		prompt: string,
		steps: number,
	): Promise<[image: Uint8Array, time_ms: number, id?: string]> {
		if (!this.ai) {
			throw new Error("Cloudflare AI not bound");
		}

		log({ prompt, steps });
		let start = Date.now();
		const image: Uint8Array = await this.ai.run(
			"@cf/stabilityai/stable-diffusion-xl-base-1.0",
			{
				prompt,
				num_steps: steps,
			},
		);
		const time_ms = Date.now() - start;
		log(`Image generated in ${time_ms}ms`);

		let id: string | undefined;
		if (this.r2) {
			const key = this.key();
			const metadata = {
				prompt,
				steps: steps.toString(),
				time: time_ms.toString(),
			};
			await this.r2.put(key, image, { customMetadata: metadata });
			id = key.replace(/\.png$/, "");
		}

		return [image, time_ms, id];
	}

	public async info(key: string): Promise<{
		prompt: string;
		steps: number;
		time: number;
	} | null> {
		if (!this.r2) {
			throw new Error("R2 not bound");
		}

		if (!key.endsWith(".png")) {
			key = key + ".png";
		}

		const obj = await this.r2.head(key);
		if (!obj) {
			return null;
		}
		const metadata = obj.customMetadata;

		return {
			prompt: metadata.prompt,
			steps: parseInt(metadata.steps),
			time: parseInt(metadata.time),
		};
	}

	public async retrieve(key: string, stream?: false): Promise<ArrayBuffer | null>;
	public async retrieve(key: string, stream: true): Promise<ReadableStream | null>;
	public async retrieve(
		key: string,
		stream = false,
	): Promise<ArrayBuffer | ReadableStream | null> {
		if (!this.r2) {
			throw new Error("R2 not bound");
		}

		if (!key.endsWith(".png")) {
			key = key + ".png";
		}

		const obj = await this.r2.get(key);
		if (!obj) {
			return null;
		}

		if (stream) {
			return obj.body;
		} else {
			return obj.arrayBuffer();
		}
	}

	public setup({ ai, r2 }: { ai?: Ai; r2?: R2Bucket | null }) {
		this.ai = ai;

		if (r2 === null) {
			this.r2 = undefined;
		} else if (r2) {
			this.r2 = r2;
		}
	}

	protected key(): string {
		const d = new Date();
		const year = d.getFullYear();
		const month = (d.getMonth() + 1).toString().padStart(2, "0");
		const day = d.getDate().toString().padStart(2, "0");
		const date = `${year}-${month}-${day}`;
		const hours = d.getHours().toString().padStart(2, "0");
		const minutes = d.getMinutes().toString().padStart(2, "0");
		const seconds = d.getSeconds().toString().padStart(2, "0");
		const time = `${hours}-${minutes}-${seconds}`;
		const random = Math.random().toString(36).substring(2);
		const key = `${date}/${time}-${random}.png`;
		return key;
	}
}

export const sdxl = new SDXL();
