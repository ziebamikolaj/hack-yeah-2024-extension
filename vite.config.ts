import { writeFileSync } from "fs";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "move-popup-html",
      writeBundle(options, bundle) {
        const popupHtmlChunk = Object.values(bundle).find(
          (chunk) => chunk.fileName === "src/popup/index.html",
        );
        if (popupHtmlChunk && "source" in popupHtmlChunk) {
          writeFileSync(
            resolve(options.dir || "", "popup.html"),
            popupHtmlChunk.source,
          );
        }
        delete bundle["src/popup/index.html"];
      },
    },
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        background: resolve(__dirname, "src/background/background.ts"),
        content: resolve(__dirname, "src/content/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css") return "styles.css";
          return assetInfo.name || "[name].[ext]";
        },
      },
    },
    outDir: "dist",
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
