/**
 * Supabase Client
 * 
 * IMPORTANT: In production, you'll need to:
 * 1. Install @supabase/supabase-js: npm install @supabase/supabase-js
 * 2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file
 * 3. Update the imports below
 */

// Uncomment when @supabase/supabase-js is installed:
// import { createClient } from '@supabase/supabase-js';

// For now, using a type definition and mock implementation
// Replace this with actual Supabase client when package is installed

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: any) => any;
      insert: (data: any) => Promise<{ data: any; error: any }>;
      update: (data: any) => any;
      delete: () => any;
    };
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => any;
    delete: () => any;
  };
}

// Create Supabase client
// TODO: Uncomment and use actual createClient when @supabase/supabase-js is installed
/*
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL and/or Anon Key not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}
*/

// Temporary mock implementation for development
// Replace this entire block with the actual Supabase client above
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  // Mock implementation - replace with actual Supabase client
  console.warn('Using mock Supabase client. Install @supabase/supabase-js and uncomment the actual implementation.');
  
  supabase = {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: () => ({ data: null, error: null }),
        insert: async (data: any) => {
          console.log('Mock insert:', table, data);
          // In production, this would make actual API call
          return { data: [{ ...data, id: crypto.randomUUID() }], error: null };
        },
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      insert: async (data: any) => {
        console.log('Mock insert:', table, data);
        // In production, this would make actual API call
        return { data: [{ ...data, id: crypto.randomUUID() }], error: null };
      },
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  } as SupabaseClient;
} else {
  console.warn('Supabase URL and/or Anon Key not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export { supabase };

/**
 * Helper function to create a new student profile
 * Note: In production, user_id should come from auth.users after creating an auth user
 * For development, we generate a UUID, but this should be replaced with proper auth flow
 */
export async function createStudentProfile(data: {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  currentGrade: string;
  parentEmail?: string;
  avatarUrl?: string;
}) {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check your environment variables.');
  }

  // Generate a UUID for user_id (in production, this should come from auth.users)
  // TODO: Integrate with Supabase Auth to create user first, then use that user_id
  const userId = crypto.randomUUID();

  const profileData = {
    user_id: userId,
    role: 'student' as const,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    student_id: data.studentId,
    current_grade: data.currentGrade,
    parent_email: data.parentEmail || null,
    avatar_url: data.avatarUrl || null,
  };

  const { data: result, error } = await supabase.from('profiles').insert(profileData);

  if (error) {
    throw new Error(`Failed to create student profile: ${error.message}`);
  }

  return result;
}
