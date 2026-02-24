import { prisma } from "@/lib/prisma";
import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Procedimientos para Users
  users: router({
    // Listar todos los usuarios
    list: publicProcedure.query(async () => {
      return await prisma.user.findMany({
        include: {
          posts: true,
        },
      });
    }),

    // Crear un nuevo usuario
    create: publicProcedure
      .input(
        z.object({
          email: z.email(),
          name: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return await prisma.user.create({
          data: input,
        });
      }),
  }),

  // Procedimientos para Posts
  posts: router({
    // Listar todos los posts
    list: publicProcedure.query(async () => {
      return await prisma.post.findMany({
        include: {
          author: true,
        },
      });
    }),

    // Crear un nuevo post
    create: publicProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string().optional(),
          published: z.boolean().default(false),
          authorId: z.number(),
        }),
      )
      .mutation(async ({ input }) => {
        return await prisma.post.create({
          data: input,
        });
      }),
  }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// create server
createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext() {
    console.log("context 3");
    return {};
  },
}).listen(2022);
