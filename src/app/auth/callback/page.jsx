import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Signing you in...</p>}>
      <CallbackClient />
    </Suspense>
  );
}
