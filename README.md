## 📊 Finance BC - Asistente Financiero Inteligente con IA

Una aplicación web Single Page Application (SPA) Full-Stack diseñada para la gestión avanzada de finanzas personales. Permite a los usuarios registrar sus ingresos y gastos, visualizar métricas interactivas y recibir asesoría financiera personalizada a través de un asistente virtual impulsado por Inteligencia Artificial que analiza sus datos en tiempo real.

---

### ✨ Características Principales

* **Autenticación Segura:** Sistema de registro e inicio de sesión integrado mediante Supabase Auth, garantizando la privacidad de los datos por usuario con tokens JWT.
* **Dashboard Interactivo y Reactivo:** Panel principal que totaliza ingresos, gastos y saldo restante, recalculándose instantáneamente mediante memorización en el frontend.
* **Visualización de Datos:** Implementación de gráficos avanzados (Distribución circular y Barras apiladas históricas) adaptables a filtros de tiempo.
* **Gestión de Ingresos Dinámicos:** Configuración de salarios netos independientes para los 12 meses del año almacenados en estructuras JSONB.
* **Asistente de IA (Gemini):** Chatbot financiero con memoria de conversación que lee el contexto temporal filtrado por el usuario para ofrecer recomendaciones matemáticas exactas.
* **Diseño Mobile-First:** Interfaz 100% responsiva con menús tipo "Drawer" (deslizantes) para dispositivos móviles y soporte nativo para Modo Oscuro/Claro.
* **Filtros Persistentes:** La selección de fechas y el historial del asistente de IA se mantienen guardados en el almacenamiento local del navegador para una navegación fluida.

---

### 🏗️ Arquitectura y Tecnologías

El proyecto fue desarrollado utilizando una arquitectura de cliente-servidor, separando claramente las responsabilidades visuales de la lógica de negocio y la persistencia de datos.

#### 🎨 Frontend (Cliente)
* **Framework:** React (construido con Vite para un rendimiento ultrarrápido).
* **Estilos:** Tailwind CSS v4 para diseño responsivo basado en utilidades.
* **Gráficos:** Recharts para la renderización de métricas financieras.
* **Iconografía:** Lucide-React.
* **Enrutamiento:** React Router DOM con protección de rutas privadas (Protected Routes).

#### ⚙️ Backend (Servidor)
* **Entorno:** Node.js.
* **Framework:** Express.js para la creación de la API RESTful.
* **Integración de IA:** SDK de Google Gen AI (`gemini-3.5-flash`) con capacidades de inyección de contexto JSON e historial de chat.
* **Seguridad:** Middleware personalizado para la verificación y validación de tokens de sesión (JWT).

#### 🗄️ Base de Datos
* **Motor:** PostgreSQL (alojada en la nube mediante Supabase).
* **Estructura Relacional:**
  * Tabla `perfiles`: Gestiona la relación 1 a 1 con el usuario de autenticación, almacenando su salario base y variaciones mensuales mediante tipos de datos `JSONB`.
  * Tabla `gastos`: Registra los movimientos financieros vinculados mediante llaves foráneas (`user_id`), categorizando montos y fechas precisas.

---

### 🛡️ Sobre el Desarrollador

Este proyecto fue estructurado y codificado aplicando principios de diseño seguro y análisis preciso de la información. 

Soy un ex alumno de la Universidad de El Salvador (UES) graduado como Ingeniero de Sistemas Informáticos[cite: 1]. Cuento con especializaciones técnicas en Análisis de Datos y en Ciberseguridad[cite: 1]. Estas disciplinas me han permitido desarrollar esta plataforma con un enfoque riguroso hacia la exactitud matemática y la protección de la información del usuario[cite: 1].
