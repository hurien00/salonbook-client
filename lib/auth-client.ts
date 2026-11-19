import { createAuthClient } from "better-auth/react"

/**
 * Same-origin by default, so no baseURL is needed in the browser.
 * (The server-only BETTER_AUTH_URL cannot be read by client components.)
 */
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
