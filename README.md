# LoL Draft Analyzer

Herramienta para analizar drafts de League of Legends con predicciones de winrate, counters, synergies y un simulador interactivo.

## Requisitos previos

- Python 3.10+
- Node.js 20+ y npm

## Backend

```bash
# Activar entorno virtual
source .venv/bin/activate

# Instalar dependencias
pip install -r backend/requirements.txt

# (Opcional) Ejecutar ETL para generar los datos procesados
cd backend && python etl.py && cd ..

# Arrancar el servidor API (puerto 8000)
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

La documentación interactiva de la API estará disponible en `http://localhost:8000/docs`.

## Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Arrancar servidor de desarrollo (puerto 5173)
npm run dev
```

El frontend hace proxy de `/api` al backend en `localhost:8000`, así que ambos deben estar corriendo simultáneamente.

## Scripts del frontend

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción (tipos + bundling) |
| `npm run lint` | Linter con Oxlint |
| `npm run preview` | Vista previa del build de producción |
