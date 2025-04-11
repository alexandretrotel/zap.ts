import { LoginForm } from "@/zap/components/public/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-muted/50 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          Zap.ts ⚡️
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
