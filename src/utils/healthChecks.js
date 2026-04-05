import { supabase } from '../lib/supabase'

const HEALTH_CHECKS_TABLE = 'health_checks'

function isMissingTableError(error) {
  return (
    error?.code === 'PGRST116' ||
    error?.message?.includes('does not exist') ||
    error?.message?.toLowerCase?.().includes('relation') ||
    error?.message?.toLowerCase?.().includes('not found')
  )
}

export async function fetchHealthChecksFromSupabase({ limit = 30 } = {}) {
  try {
    const { data, error } = await supabase
      .from(HEALTH_CHECKS_TABLE)
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        checks: [],
        tableMissing: isMissingTableError(error),
        error,
      }
    }

    return { checks: data || [], tableMissing: false, error: null }
  } catch (error) {
    return {
      checks: [],
      tableMissing: isMissingTableError(error),
      error,
    }
  }
}

