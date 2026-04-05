import { supabase } from '../lib/supabase'

const HEALTH_CHECKS_TABLE = 'health_checks'

function isMissingTableError(error, status) {
  const code = error?.code
  const text = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ').toLowerCase()

  return (
    status === 404 ||
    code === '42P01' || // undefined_table
    code === 'PGRST205' || // not in schema cache
    code === 'PGRST204' ||
    text.includes('schema cache') ||
    text.includes('could not find') ||
    text.includes('does not exist') ||
    text.includes('undefined_table')
  )
}

export async function fetchHealthChecksFromSupabase({ limit = 30 } = {}) {
  try {
    const { data, error, status } = await supabase
      .from(HEALTH_CHECKS_TABLE)
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        checks: [],
        tableMissing: isMissingTableError(error, status),
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

