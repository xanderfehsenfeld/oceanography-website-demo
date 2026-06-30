/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/liveocean-web/:file",
        destination: "https://s3.kopah.uw.edu/liveocean-web/:file",
        basePath: false,
      },
    ]
  },
}

export default nextConfig
