import { AuthLayout } from "@/components/auth/shared/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function Home() {
  return (
    <div>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </div>
  );
}
