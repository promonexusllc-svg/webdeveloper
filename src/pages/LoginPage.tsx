import { SignIn } from "@/components/SignIn";

export function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="PromoNexus" className="mx-auto h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <SignIn />
      </div>
    </div>
  );
}
