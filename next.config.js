/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY,
    QWEN_API_KEY: process.env.QWEN_API_KEY,
    TIANAPI_KEY: process.env.TIANAPI_KEY,
    BANGYAN_API_KEY: process.env.BANGYAN_API_KEY,
    BOCHA_API_KEY: process.env.BOCHA_API_KEY,
  },
}

module.exports = nextConfig