import { useEffect } from "react";
import Intercom from "@intercom/messenger-js-sdk";

interface IntercomClientProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    createdAt?: number; // Unix timestamp (in seconds)
  };
}

export default function IntercomClient({ user }: IntercomClientProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize Intercom with user data if available
    Intercom({
      app_id: "gjsq5w9w", // your Intercom app ID
      ...(user && {
        user_id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
      }),
    });
  }, [user]);

  return null; // nothing visible, it just injects the messenger
}
