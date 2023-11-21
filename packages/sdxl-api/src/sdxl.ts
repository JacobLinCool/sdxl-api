import debug from "debug";

const log = debug("sdxl-api");
log.enabled = true;

const base = "https://sdxl.upstream.service/";

export class SDXL {
	constructor(protected fetcher?: Fetcher) {}

	public async generate(
		prompt: string,
		steps: number,
	): Promise<[image: Uint8Array, time_ms: number, id?: string]> {
		if (!this.fetcher) {
			throw new Error("Service Binding not set up");
		}

		log({ prompt, steps });

		const url = new URL("/api/gen", base);
		url.searchParams.set("prompt", prompt);
		url.searchParams.set("steps", steps.toString());

		let start = Date.now();
		const res = await this.fetcher.fetch(url);
		const time_ms = Date.now() - start;
		log(`Image generated in ${time_ms}ms`);

		const id = res.headers.get("x-image-id");
		log(`Image ID: ${id}`);
		const image = await res.arrayBuffer().then((b) => new Uint8Array(b));

		return [image, time_ms, id];
	}

	public async info(key: string): Promise<{
		prompt: string;
		steps: number;
		time: number;
	} | null> {
		const url = new URL(`/api/info/${encodeURIComponent(key)}`, base);

		const res = await this.fetcher.fetch(url);
		if (!res.ok) {
			return null;
		}

		return res.json();
	}

	public async retrieve(key: string, stream?: false): Promise<ArrayBuffer | null>;
	public async retrieve(key: string, stream: true): Promise<ReadableStream | null>;
	public async retrieve(
		key: string,
		stream = false,
	): Promise<ArrayBuffer | ReadableStream | null> {
		const url = new URL(`/api/retrieve/${encodeURIComponent(key)}`, base);

		const res = await this.fetcher.fetch(url);
		if (!res.ok) {
			return null;
		}

		if (stream) {
			return res.body;
		} else {
			return res.arrayBuffer();
		}
	}

	public setup({ fetcher }: { fetcher: Fetcher }) {
		this.fetcher = fetcher;
	}
}

export const sdxl = new SDXL();
