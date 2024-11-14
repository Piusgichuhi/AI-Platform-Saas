import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ['/api/webhooks/clerk']  // Public route for webhooks
});

export const config = {
  matcher: [
    // Always run Clerk middleware for API routes (except public ones)
    '/(api|trpc)(.*)',

    // Optionally, you can include other routes you want Clerk to handle for authentication, etc.
    // For example, uncomment the following line to apply Clerk middleware to all routes
    // '/(.*)',

    // Skip Next.js internals and static assets like images, CSS, JS files, etc.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
