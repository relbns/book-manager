// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/book-manager/',
  base: process.env.NODE_ENV === 'production' ? '/book-manager/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

// GitHub Pages Deployment Instructions
/*
To deploy this app to GitHub Pages, follow these steps:

1. Create a GitHub repository for your project
   - Go to github.com and create a new repository named "book-manager"

2. Initialize Git in your project and push to GitHub
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/book-manager.git
   git push -u origin main
   ```

3. Add GitHub Pages deployment workflow
   - Create a directory: .github/workflows
   - Create a file: .github/workflows/deploy.yml with the following content:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'

         - name: Install Dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@4.1.5
           with:
             branch: gh-pages
             folder: dist
   ```

4. Configure GitHub repository settings
   - Go to repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

5. Push your changes to trigger deployment
   ```
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Pages deployment workflow"
   git push
   ```

6. Once deployed, your app will be available at:
   https://YOUR_USERNAME.github.io/book-manager/

7. Personal Access Token Instructions:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Click "Generate new token"
   - Give it a name like "Book Manager App"
   - Select the following scopes: "gist"
   - Click "Generate token"
   - Copy the token and save it securely
   - Use this token to authenticate in the app
*/