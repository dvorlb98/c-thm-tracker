# C + TryHackMe 30-Day Tracker

App web local para registrar progreso de estudio con C Programming: A Modern Approach, 2nd Edition de K. N. King y TryHackMe Cyber Security Learning Roadmap.

## Requisitos

- Node.js instalado.
- npm instalado.
- Navegador moderno.

## Como correrlo localmente

```bash
npm install
npm run dev
```

Despues abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Como se guarda el progreso

La app no usa backend ni base de datos externa. Todo se guarda en `localStorage` del navegador bajo la key:

```text
c-thm-progress-v1
```

Cada tarea guarda:

- `completed`: true/false
- `completedAt`: fecha/hora ISO cuando se marco como completada
- `dayNumber`
- `taskId`

Tambien se guardan:

- `startDate`
- `lastSavedAt`
- `lastCompletedTaskAt`
- notas por dia
- campos de Daily shutdown por dia

Si el contenido de `localStorage` esta corrupto o no tiene la forma esperada, la app arranca con progreso limpio y mueve el valor anterior a una key de backup corrupta.

## Exportar e importar backup

Usa los controles de la seccion `Backup controls`:

- `Export JSON`: descarga un archivo con progreso, notas, fecha de inicio y timestamps.
- `Import JSON`: carga un backup JSON y valida su estructura antes de reemplazar el progreso actual.
- `Reset all`: borra progreso, notas y fecha de inicio despues de pedir confirmacion.

Recomendacion: exporta un JSON al final de cada semana o antes de limpiar datos del navegador.

## Vista Today

Si no hay fecha de inicio, usa `Start plan today`. La app guarda la fecha local como Dia 1 y calcula:

```text
currentDay = diferencia de dias + 1
```

Si `currentDay` esta entre 1 y 30, ese dia se resalta en el plan. Si ya pasaron mas de 30 dias, la app entra en modo review.

## Limitaciones

- El progreso solo existe en el navegador donde uses la app, salvo que exportes/importes JSON.
- Si limpias datos del sitio desde el navegador sin backup, `localStorage` se pierde.
- No hay sincronizacion entre dispositivos porque no hay backend.
