const nextConfig = {
  async redirects() {
    return [
      {
        source: '/deals/casablanca-shangai',
        destination: '/deals/casablanca-shanghai',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
