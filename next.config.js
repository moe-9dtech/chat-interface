/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos']
    },
    env: {
        liveSocket: "https://localhost:3000",
        localSocket: "http://localhost:3001"
    }
}

module.exports = nextConfig
