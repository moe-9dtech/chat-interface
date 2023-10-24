/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos']
    },
    env: {
        liveSocket: "https://localhost:3000",
        localSocket: "http://localhost:3001",
        liveApi: "https://localhost:5000/api/",
        localApi: "http://localhost:5000/api/",
    }
}

module.exports = nextConfig
