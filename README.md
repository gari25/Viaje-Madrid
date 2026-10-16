# ViajeX · Europa 2026

Web de consulta para Kateryn y Mariangel (3–14 noviembre 2026), con planes A, B y C, itinerario por fecha, mapas, transportes y costos por cotizar.

## Actualización automática en tu Worker Cloudflare EXISTENTE

El sitio actual está en: https://viajex-europa-2026.kateryn2030.workers.dev

**No hace falta crear un proyecto Pages ni cambiar la URL.** El repositorio contiene `wrangler.jsonc` con `name: "viajex-europa-2026"`, igual al Worker ya creado, para servir `index.html` como un activo estático.

Configuración una sola vez:

1. Abre Cloudflare → **Workers & Pages → viajex-europa-2026 → Settings → Builds**.
2. Selecciona **Connect** y autoriza GitHub, específicamente `gari25/Viaje-Madrid`.
3. Elige la rama `main` y el directorio raíz (vacío o `/`).
4. **Build command:** dejar vacío (no compila); **Deploy command:** `npx wrangler deploy`.
5. Guardar conexión. Para iniciar la primera publicación, subir un nuevo commit a `main` (por ejemplo una modificación en `index.html`).
6. Verificar en **Deployments / Build history** que el despliegue sea exitoso y abrir el enlace `workers.dev` de arriba.

Luego, al actualizar `index.html` desde ChatGPT, Cloudflare publicará automáticamente los cambios en la MISMA dirección.

## Archivos

- `index.html`: web pública y responsiva en modo solo lectura.
- `wrangler.jsonc`: configuración del Worker y carpeta de activos.
- `.assetsignore`: excluye archivos de administración de la carpeta estática.

## Seguridad

Repositorio público, página accesible mediante enlace público. Evitar publicar domicilios privados, datos bancarios, localizadores de reservas, números de documento y datos familiares. Los horarios, costos y destinos están en revisión y **no constituyen reservas**. Mariangel no requiere acceso de escritura al repositorio.
