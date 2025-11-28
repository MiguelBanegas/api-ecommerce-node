# API E-commerce

API REST para e-commerce de motocicletas construida con Node.js, Express y Firebase Firestore.

## Características

- **Productos**: CRUD completo de productos con imágenes
- **Usuarios**: Gestión de usuarios
- **Firebase Firestore**: Base de datos en tiempo real
- **CORS**: Configurado para peticiones cross-origin

## Tecnologías

- Node.js
- Express
- Firebase Admin SDK
- Firestore
- dotenv
- CORS

## Instalación Local

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPO>
cd API-Ecommerce
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

   - Copiar `.env.example` a `.env`
   - Colocar tu archivo `serviceAccountKey.json` en la raíz del proyecto

4. Iniciar el servidor:

```bash
npm start
# o en modo desarrollo
npm run dev
```

## Endpoints

### Productos

- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear un producto
- `POST /api/products/seed` - Carga masiva de productos

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `POST /api/users` - Crear un usuario
- `POST /api/users/seed` - Carga masiva de usuarios

## Despliegue

Ver [deployment_guide.md](deployment_guide.md) para instrucciones de despliegue en VPS.

## Seguridad

⚠️ **IMPORTANTE**: Nunca subas el archivo `serviceAccountKey.json` a Git. Este archivo contiene credenciales sensibles y está incluido en `.gitignore`.
