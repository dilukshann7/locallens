import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "@/lib/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "tourist",
        input: false,
      },
    },
  },
  trustedOrigins: ["http://localhost:3000"],
  advanced: {
    cookiePrefix: "locallens",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
})
