import { ExecutionContext } from '@cloudflare/workers-types';

export interface Env {
	BLASTENGINE_USER_ID: string;
	BLASTENGINE_API_KEY: string;
}

const worker = {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Hello World!');
	},
};

export default worker;
