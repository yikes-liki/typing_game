import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { TypingGame } from "./components/TypingGame";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen">
      <Authenticated>
        <div className="absolute top-4 right-4 z-20">
          <SignOutButton />
        </div>
        <TypingGame />
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-sm h-16 flex justify-between items-center border-b border-white/20 shadow-sm px-4">
            <h2 className="text-xl font-semibold text-white">TypeRush</h2>
          </header>
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <Content />
            </div>
          </main>
        </div>
      </Unauthenticated>
      
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          TypeRacer Pro
        </h1>
        <p className="text-xl text-gray-300">Sign in to test your typing speed</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <SignInForm />
      </div>
    </div>
  );
}
