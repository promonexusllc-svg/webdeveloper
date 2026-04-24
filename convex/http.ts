import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { seedAdminEndpoint } from "./seedAdminHttp";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/seed-admin",
  method: "POST",
  handler: seedAdminEndpoint,
});

export default http;
