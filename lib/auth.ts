import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string)
const db = client.db('salonbookdb');

export const auth = betterAuth({

 user: {
       additionalFields: {
          role: {
              type: "string",
              required: false,
              defaultValue: "customer",
              // NOTE: input:true lets the sign-up form choose the role.
              // For production, validate/force this server-side (see databaseHooks).
              input: true,
            },
          phone: {
              type: "string",
              required: false,
              input: true,
            }
        }
    },
     emailAndPassword: { 
    enabled: true, 
  },
  /**
   * Guarantee what actually lands in MongoDB:
   * - sign-up with the "admin" option  -> role: "admin"
   * - sign-up with the "customer" option -> role: "customer"
   * - any missing/unknown value          -> role: "customer"
   * No other string can ever be stored.
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "admin" ? "admin" : "customer",
          },
        }),
      },
    },
  },
  socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
 database: mongodbAdapter(db, {
    client,
  }),
});