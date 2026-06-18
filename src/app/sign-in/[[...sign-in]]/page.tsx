import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
