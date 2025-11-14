"use client";

import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <div
      style={{
        backgroundImage: "url('/fleet.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "160px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "relative",
      }}
    >
      {/* Left: logo */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        <Image src="/logo.png" alt="Unit Logo" width={100} height={100} priority />
      </div>

      {/* Center: title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "1.75rem",
            fontWeight: "bold",
            textShadow: "0 0 6px black",
          }}
        >
          NROTC PQS Board V1.1
        </h1>
      </div>

      {/* Right: Sign-in/out */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {status !== "authenticated" ? (
          <button
            onClick={() => signIn("google")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
            }}
          >
            Sign in with Google
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(255,255,255,0.3)",
              backdropFilter: "blur(6px)",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
            }}
          >
            <span style={{ color: "white", fontSize: "0.875rem" }}>
              Signed in as {session?.user?.name}
            </span>
            <button
              onClick={() => signOut()}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                padding: "0.25rem 0.75rem",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
