/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    basePath: "/WheaterApp",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "openweathermap.org",
            },
        ],
    },
};
export default nextConfig;
