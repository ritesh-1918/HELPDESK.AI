```typescript
import { getItemById, createItem } from '../utils'; // Importa las funciones a probar
import { createClient } from '@supabase/supabase-js';

// --- Mocking Setup ---
// Creamos un mock del cliente de Supabase para controlar su comportamiento en los tests
const mockError = { message: 'DB connection failed', details: '... a mock error ...', hint: '', code: '500' };

// Mock del API fluida de Supabase: from().select().eq()...
const mockQueryBuilder = {