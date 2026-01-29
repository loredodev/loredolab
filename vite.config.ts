import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Isso permite usar process.env.API_KEY no código React (Vite normalmente exige VITE_ prefixo)
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  }
})