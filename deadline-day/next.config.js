const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "placeholder.svg",
      "img.uefa.com",
      "cdn.sofifa.net",
      "cdn.futbin.com",
      "tmssl.akamaized.net",
      "img.a.transfermarkt.technology",
    ],
  },
  // Make sure there are no experimental flags that might interfere with routing
}

module.exports = nextConfig

