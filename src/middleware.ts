import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/",
  "/browse(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Redirect to profile setup if user is authenticated but hasn't completed onboarding
  const userId = (await auth()).userId;
  if (userId && req.nextUrl.pathname === "/sign-in") {
    // In a real app, we would check if the user has completed onboarding
    // For now, we'll just redirect if they're on the sign-in page after authentication
    const url = new URL("/profile-setup", req.url);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
