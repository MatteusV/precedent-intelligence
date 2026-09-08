import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/app") || pathname === "/app/escritorio") {
    return;
  }

  const authState = await auth();

  if (authState.userId && !authState.orgId) {
    return NextResponse.redirect(new URL("/app/escritorio", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
