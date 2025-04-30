/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/ktps',
    assetPrefix: '/ktps/',
    reactStrictMode: true,
    images: {
      domains: ['i.imgur.com','virtual.konradlorenz.edu.co'],
      unoptimized: true  // Esto puede ayudar con problemas de imágenes en producción

    },
    experimental: {
      // Si estás usando Next.js 13 o superior con App Router
      appDir: true
    }
  }

module.exports = nextConfig


