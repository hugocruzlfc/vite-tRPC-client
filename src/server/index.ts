import { logRequest, logStartup, logTRPCCall } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

const t = initTRPC.create();

// Middleware de logging
const loggingMiddleware = t.middleware(async ({ path, type, next, input }) => {
  const start = Date.now();

  try {
    const result = await next();
    const duration = Date.now() - start;

    logTRPCCall(
      type,
      path,
      duration,
      result.ok,
      input,
      result.ok ? undefined : result.error?.message,
    );

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logTRPCCall(type, path, duration, false, input, errorMessage);
    throw error;
  }
});

const publicProcedure = t.procedure.use(loggingMiddleware);
const router = t.router;

const appRouter = router({
  users_list: publicProcedure.query(async () => {
    return await prisma.user.findMany({
      include: {
        posts: true,
      },
    });
  }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// create server
const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext({ req }) {
    // Log de peticiones HTTP
    const start = Date.now();
    logRequest(
      req.method || "UNKNOWN",
      req.url || "/",
      undefined,
      req.headers["user-agent"],
    );

    return {
      requestStart: start,
    };
  },
});

const PORT = 2022;

server.listen(PORT, () => {
  logStartup(PORT);
});
