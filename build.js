const { build } = require('esbuild');
const fs = require('fs');

// Read the content of epub.min.js
const epubJsContent = fs.readFileSync('public/epub.min.js', 'utf8');

build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  loader: {
    '.html': 'text',
  },
  // Define a global constant with the file content
  define: {
    'EPUB_JS_CONTENT': JSON.stringify(epubJsContent),
  },
}).catch(() => process.exit(1));
