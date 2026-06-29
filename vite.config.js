import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'complianceai.centralindia.cloudapp.azure.com',
      'localhost',
      '20.244.40.144'
    ]
  }
})
