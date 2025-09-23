import dotenv from "dotenv";
import { githubResponse, loginGithub } from "./handlers/auth";
import { pullSettings, pushSettings } from "./handlers/settings";
import { getCurrentUser } from "./handlers/user";
import { logger } from "./logger";
import { authenticated } from "./middleware/authenticated";

function createServer(): Bun.Server {
	logger.info("Creating server...");
	dotenv.config();
	const server = Bun.serve({
		hostname: "localhost",
		port: 8081,
		routes: {
			// "/api/login": loginUsernamePassword,
			"/api/auth/github": loginGithub,
			"/api/auth/github/callback": githubResponse,
			"/api/user/v1.0/current": authenticated(getCurrentUser),
			"/api/settings/v1.0": {
				PUT: authenticated(pushSettings),
				GET: authenticated(pullSettings),
			},
		},
	});
	logger.info("Server created, listening on %s:%d", "localhost", 8080);

	return server;
}

const server = createServer();

async function shutdown() {
	logger.info("Shutting down...");
	server.stop();
	await new Promise((RES) => setTimeout(RES, 3000));
	process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
