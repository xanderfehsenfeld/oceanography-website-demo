/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/liveocean-web/:file",
        destination: "https://s3.kopah.uw.edu/liveocean-web/:file",
        basePath: false,
      },

      {
        source: "/api/forecast/drifters/:file",
        destination:
          "https://oceanography-gis-913205417955.us-west1.run.app/api/forecast/drifters/:file",
        basePath: false,
      },
    ]
  },
}

export default nextConfig
