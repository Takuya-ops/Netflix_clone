import { PrismaClient } from "@prisma/client";
import { decl } from "postcss";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient
  }
}