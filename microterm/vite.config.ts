import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [    tailwindcss(),svelte(), viteSingleFile()],
  build: 
      {
          outDir: "dist",
          assetsInlineLimit: 1e9,
          rollupOptions: {
            input: "index.html",
            output: { inlineDynamicImports: true }
          }
        }
        
})


/*
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const nft = mode === "nft";       // vite build --mode nft
  return {
    base: nft ? "./" : "/",         // rutas relativas solo en modo nft
    plugins: nft ? [viteSingleFile()] : [],
    build: nft
      ? {
          outDir: "dist/nft",
          assetsInlineLimit: 1e9,
          rollupOptions: {
            input: "index.html",
            output: { inlineDynamicImports: true }
          }
        }
      : { outDir: "dist" }
      */