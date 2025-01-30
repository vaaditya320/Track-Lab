'use client'; // Ensure this is a client component

import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import './globals.css';

// Wrap the whole app with the SessionProvider
export default function Layout({ children }) {
  return (
    <SessionProvider>
      <html lang="en">
        <body>
          <Fragment>
            {/* Header */}
            <header className="bg-gray-800 text-white p-4">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">
                  <Link href="/">TrackLab</Link>
                </h1>
                <UserHeader />
              </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto p-4">{children}</main>

            {/* Footer (Optional) */}
            <footer className="bg-gray-800 text-white p-4 mt-4">
              <div className="container mx-auto text-center">
                <p>&copy; 2025 TrackLab. All rights reserved.</p>
              </div>
            </footer>
          </Fragment>
        </body>
      </html>
    </SessionProvider>
  );
}

// A new functional component to handle session management in the header
function UserHeader() {
  const { data: session, status } = useSession();

  return (
    <div>
      {status === "authenticated" ? (
        <div className="flex items-center">
          <span className="mr-4">Welcome, {session?.user?.name}</span>
          <Link href="/api/auth/signout">
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Sign Out
            </button>
          </Link>
        </div>
      ) : (
        <Link href="/api/auth/signin">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </button>
        </Link>
      )}
    </div>
  );
}
