---
order: 1
title: Archite
subtitle: AgentOS de orquestación multi-agente
description: Proyecto actual en fase de arquitectura y diseño de sistemas. Plataforma self-hosted y privacy-first que convierte prompts en grafos de tareas (DAG) sobre entornos aislados.
highlights:
  - Ejecución paralela de múltiples agentes en workspaces aislados mediante git worktrees y sandboxes locales o en servidor propio.
  - Motor de enrutamiento adaptativo que asigna cada subtarea al modelo más fiable y rentable según el historial local.
  - Memoria bitemporal segmentada por proyecto con sincronización cifrada y cuarentena automática de secretos y PII.
primaryTech:
  - Go
  - Svelte 5
  - Wails
secondaryTech:
  - PostgreSQL
  - gRPC
status: En desarrollo
---
