import { AuthScreen } from "@/components/auth-screen";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <AuthScreen>
      <SignIn forceRedirectUrl="/app" />
    </AuthScreen>
  );
}
