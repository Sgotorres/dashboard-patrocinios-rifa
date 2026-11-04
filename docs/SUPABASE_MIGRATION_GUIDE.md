# Guía de Arquitectura y Migración a Supabase

## Estado Actual de la Arquitectura

La aplicación está diseñada bajo el patrón **Local-First**. Los datos se persisten en el navegador del usuario a través de **IndexedDB** utilizando [Dexie.js](https://dexie.org/).

### Ventajas del Modelo Local-First Actual:
- **Cero latencia:** Consultas y mutaciones instantáneas.
- **Funcionamiento 100% offline:** Permite registrar abonos y boletos sin conexión a internet en el evento o sala de cine.
- **Privacidad y portabilidad:** Respaldo y restauración JSON listos para importar/exportar.

---

## Esquema Opcional de Supabase (`supabase_schema.sql`)

El archivo `supabase_schema.sql` en la raíz define la estructura de tablas (`raffle_settings` y `merchants`), tipos enumerados y llaves foráneas para PostgreSQL.

### Pasos para conectar Supabase:

1. **Crear el proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
   - En el **SQL Editor**, copia y ejecuta el contenido de `supabase_schema.sql`.

2. **Instalar la dependencia:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Configurar variables de entorno (`.env`):**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

4. **Implementar el Repositorio de Supabase:**
   Gracias a la **Clean Architecture** adoptada, solo necesitas crear una clase que implemente `IMerchantRepository`:
   ```typescript
   // src/data/repositories/SupabaseMerchantRepo.ts
   import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
   import { supabase } from '../../core/config/supabaseClient';

   export class SupabaseMerchantRepo implements IMerchantRepository {
     async getAll() { ... }
     async getById(id: string) { ... }
     async create(dto) { ... }
     async update(id, dto) { ... }
     async markAsPaid(id) { ... }
     async addPayment(id, amount, note) { ... }
     async addTickets(id, delta) { ... }
     async delete(id) { ... }
   }
   ```

5. **Intercambiar en el contenedor de Inyección de Dependencias (`src/core/di/container.ts`):**
   ```typescript
   // Cambiar LocalMerchantRepo por SupabaseMerchantRepo:
   export const merchantRepository: IMerchantRepository = new SupabaseMerchantRepo();
   ```
   **¡Ningún componente React ni Caso de Uso necesitará ser modificado!**
