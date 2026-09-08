import { AuthScreen } from "@/components/auth-screen";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthScreen>
      <SignUp forceRedirectUrl="/app" />
    </AuthScreen>
  );
}
