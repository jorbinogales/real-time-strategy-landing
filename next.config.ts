import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PGlite (WASM) y pg se cargan como paquetes de Node, no se empaquetan.
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
};

export default nextConfig;
