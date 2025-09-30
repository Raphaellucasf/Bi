import { supabase } from './supabaseClient';

export async function getIndicadores(escritorioId) {
  if (!escritorioId) return [];
  const { data, error } = await supabase
    .from('indicadores')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('nome', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function addIndicador(nome, escritorioId) {
  if (!nome || !escritorioId) return null;
  const { data, error } = await supabase
    .from('indicadores')
    .insert([{ nome, escritorio_id: escritorioId }])
    .select()
    .single();
  if (error) return null;
  return data;
}
