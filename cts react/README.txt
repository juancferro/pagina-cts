OKAS — Observatorio y Kit Anti‑Sesgo (React, CDN)

Cómo correrlo en local (3 opciones):

A) Abrir directo
   1. Descomprime el ZIP.
   2. Doble clic en index.html (usa CDNs para React y Tailwind).

B) Servidor simple con Python
   1. Descomprime el ZIP y entra a la carpeta en la terminal.
   2. Ejecuta:  python -m http.server 8000
   3. Abre:     http://localhost:8000

C) Servidor con Node (serve)
   1. Descomprime el ZIP y entra a la carpeta en la terminal.
   2. Instala:  npm -g i serve
   3. Ejecuta:  serve .
   4. Abre la URL que te muestre (p. ej. http://localhost:3000)

Notas
- Este ejemplo usa TailwindCSS y React via CDN para evitar build steps.
- El formulario de AIA-Lite, Datasheets, etc. es demostrativo (sin backend).
- El código está comentado línea por línea para facilitar modificaciones.