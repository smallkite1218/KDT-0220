/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "http", hostname: "autoimg.danawa.com", pathname: "/**" },
      { protocol: "https", hostname: "autoimg.danawa.com", pathname: "/**" },
    ],
  },
}

export default nextConfig
