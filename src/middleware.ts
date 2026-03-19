export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/gift-pages/:path*",
    "/gifts/:path*",
    "/settings/:path*",
  ],
};
