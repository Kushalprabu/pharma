import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  organization?: string;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  roleId: string,
  organization: string
) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw signUpError;
  if (!data.user) throw new Error('User creation failed');

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role_id: roleId,
      organization,
    });

  if (profileError) throw profileError;

  return data.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, user_roles(name), organization')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.user_roles?.name,
    organization: data.organization,
  };
}

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_roles(name)')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.user_roles?.name || null;
}
