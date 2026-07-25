"use client";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
//import { User } from "../generated/prisma/client";
import { auth } from "@/auth";
import { signOut } from "../actions/auth-actions";

type User = typeof auth.$Infer.Session.user;

export default function DashboardClientPage({ user }: { user: User | null }) {
  const router = useRouter();

  if (user === null) {
    redirect("/login");
  }
  const { email, createdAt, id, name, image, emailVerified } = user;

  // Redirect to auth if not authenticated

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="bg-primary/5 container min-h-screen">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 pt-20 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-primary/90 overflow-hidden rounded-lg p-6 shadow">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-200">
                  Welcome to Your Dashboard!
                </h2>
                <p className="text-gray-200">
                  Manage your account and explore better-auth features
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <Image
                    alt="Profile"
                    width={50}
                    height={50}
                    className="h-10 w-10 rounded-full"
                    src={user?.image || "/user.jpg"}
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-200">{user.name}</p>
                    <p className="text-gray-200">{email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-primary-foreground hover:bg-primary-foreground/40 inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Authentication Info */}
            <div className="bg-primary-foreground/40 mb-6 rounded-lg border border-blue-200 p-4">
              <h3 className="mb-2 text-lg font-medium text-blue-900">
                Authentication Status
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium text-blue-700">
                    Status:{" "}
                    {emailVerified ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Authenticated
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Unauthenticated
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Provider:</span>
                  <span className="ml-2 text-blue-600">Better-Auth</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">User ID:</span>
                  <span className="ml-2 text-blue-600">{id}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-blue-700">
                    Email Verified:
                  </span>
                  <span className="ml-2 text-blue-600">
                    {emailVerified ? <p>Yes</p> : <p>No</p>}
                  </span>
                </div>
              </div>
            </div>

            {/* Demo Features */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-primary-foreground/40 rounded-lg p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Social Login
                </h3>
                <p className="text-sm text-gray-600">
                  Seamlessly authenticate with Google, GitHub, and other social
                  providers.
                </p>
              </div>

              <div className="bg-primary-foreground/40 rounded-lg p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  User Management
                </h3>
                <p className="text-sm text-gray-600">
                  Manage user accounts, profiles, and authentication settings.
                </p>
              </div>

              <div className="bg-primary-foreground/40 rounded-lg p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Secure Access
                </h3>
                <p className="text-sm text-gray-600">
                  Protected routes and secure authentication flow with
                  better-auth.
                </p>
              </div>
            </div>

            {/* Demo Actions */}
            <div className="bg-primary-foreground/40 mt-8 rounded-lg p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Try These Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => alert("Mock action: Profile updated!")}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => alert("Mock action: Settings saved!")}
                  className="hover:bg-primary-foreground/40 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => alert("Mock action: Data exported!")}
                  className="hover:bg-primary-foreground/40 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Export Data
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="hover:bg-primary-foreground/40 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  ← Back to Home
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Manage Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
