# App Movie Management

Aplicacion web para gestionar peliculas con CRUD, SQLite y una cabecera de seguridad obligatoria.

## Instalacion

```bash
npm install
```

## Configuracion

Antes de ejecutar, crea un archivo `.env` basado en `.env.example`.

Ejemplo:

```env
PORT=8080
FIS_EPN_API_KEY=FIS-EPN-2026
PELICULAS_DATA_DIR=src/data
EPN_EVENT_MANAGER_URL=http://localhost:3000/events
```

## Ejecutar

```bash
npm start
```

## Desarrollo

```bash
npm run dev
```

## Pruebas

```bash
npm test
```

## Uso

1. Abre `http://localhost:8080`.
2. Ingresa la clave API en la interfaz.
3. Usa el formulario para crear, editar o eliminar peliculas.

