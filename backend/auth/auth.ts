import { createClerkClient } from "@clerk/backend";
import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import { db } from "../db/db";

const clerkSecretKey = secret("ClerkSecretKey");
const clerkClient = createClerkClient({ secretKey: clerkSecretKey() });

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  imageUrl: string;
  email: string | null;
}

// Configure the authorized parties.
// TODO: Configure this for your own domain when deploying to production.
const AUTHORIZED_PARTIES = [
  "https://*.lp.dev",
  "http://localhost:5173",
];

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    // Resolve the authenticated user from the authorization header or session cookie.
    const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      const verifiedToken = await clerkClient.verifyToken(token, {
        authorizedParties: AUTHORIZED_PARTIES,
      });

      const user = await clerkClient.users.getUser(verifiedToken.sub);
      const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ');

      // Sync user to our database
      await db.exec`
        INSERT INTO users (id, email, name, image_url)
        VALUES (${user.id}, ${primaryEmail}, ${name}, ${user.imageUrl})
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          image_url = EXCLUDED.image_url,
          updated_at = NOW();
      `;

      return {
        userID: user.id,
        imageUrl: user.imageUrl,
        email: primaryEmail ?? null,
      };
    } catch (err: any) {
      throw APIError.unauthenticated("invalid token", { cause: err.message });
    }
  }
);

// Configure the API gateway to use the auth handler.
export const gw = new Gateway({ authHandler: auth });
