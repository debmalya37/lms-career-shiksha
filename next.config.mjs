import nextPWA from "next-pwa";
import runtimeCaching from 'next-pwa/cache.js';
/** @type {import('next').NextConfig} */
const baseConfig = {
  // Uncomment or customize your settings
  // reactStrictMode: true,
  // output: 'export',
  // distDir: 'dist',
  // trailingSlash: true,
  // assetPrefix: '/',
};

const withPWA = nextPWA({
  
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  exclude: [
    '**/payment/success*',
    '**/payment/failed*',
  ],

});

const nextConfig = withPWA(baseConfig);

export default nextConfig;
