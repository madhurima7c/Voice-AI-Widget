/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Allow your Framer site to call the API
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                ],
            },
        ]
    },
}

module.exports = nextConfig
