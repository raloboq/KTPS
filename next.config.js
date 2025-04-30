/** @type {import('next').NextConfig} */
const nextConfig = {
    //basePath: '/ktps',
    //assetPrefix: '/ktps/',
    reactStrictMode: true,
    images: {
      domains: ['i.imgur.com','virtual.konradlorenz.edu.co'],
      unoptimized: true  // Esto puede ayudar con problemas de imágenes en producción

    },
    
  }

module.exports = nextConfig


