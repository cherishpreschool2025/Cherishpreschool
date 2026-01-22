import { supabase } from '../lib/supabase'

const ACTIVITIES_TABLE = 'activities'

/**
 * Fetches all activities from Supabase database
 * @returns {Promise<Array>} Array of activities
 */
export async function fetchActivitiesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from(ACTIVITIES_TABLE)
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      // If table doesn't exist (404), silently return empty array
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.log('Activities table not found - will be created when you add your first activity')
        return []
      }
      console.error('Error fetching activities from Supabase:', error)
      return []
    }

    return data || []
  } catch (error) {
    // Silently handle table not found errors
    if (error.message?.includes('404') || error.message?.includes('does not exist')) {
      return []
    }
    console.error('Error fetching activities:', error)
    return []
  }
}

/**
 * Saves a single activity to Supabase database
 * @param {Object} activity - Activity object to save
 * @returns {Promise<Object>} Saved activity
 */
export async function saveActivityToSupabase(activity) {
  try {
    // Check if activity exists (by id)
    const { data: existing } = await supabase
      .from(ACTIVITIES_TABLE)
      .select('id')
      .eq('id', activity.id)
      .single()

    if (existing) {
      // Update existing activity
      const { data, error } = await supabase
        .from(ACTIVITIES_TABLE)
        .update({
          title: activity.title,
          description: activity.description,
          category: activity.category,
          image: activity.image,
          color: activity.color,
          images: activity.images || []
        })
        .eq('id', activity.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Insert new activity
      const { data, error } = await supabase
        .from(ACTIVITIES_TABLE)
        .insert({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          image: activity.image,
          color: activity.color,
          images: activity.images || []
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error saving activity to Supabase:', error)
    throw error
  }
}

/**
 * Saves multiple activities to Supabase database
 * @param {Array} activities - Array of activities to save
 * @returns {Promise<Array>} Array of saved activities
 */
export async function saveActivitiesToSupabase(activities) {
  try {
    // Get all existing activity IDs
    const { data: existing, error: fetchError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select('id')

    // If table doesn't exist, show helpful message
    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.message?.includes('does not exist')) {
        console.error('❌ Activities table not found! Please create it in Supabase first.')
        console.error('📖 See SUPABASE_SETUP.md for instructions')
        throw new Error('Activities table does not exist. Please create it in Supabase SQL Editor (see SUPABASE_SETUP.md)')
      }
      throw fetchError
    }

    const existingIds = (existing || []).map(a => a.id)
    const newIds = activities.map(a => a.id)

    // Delete activities that are no longer in the list
    const idsToDelete = existingIds.filter(id => !newIds.includes(id))
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from(ACTIVITIES_TABLE)
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        console.warn('Error deleting removed activities:', deleteError)
      }
    }

    // Upsert all activities (insert or update)
    if (activities.length > 0) {
      const { data, error } = await supabase
        .from(ACTIVITIES_TABLE)
        .upsert(activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          image: activity.image,
          color: activity.color,
          images: activity.images || []
        })), {
          onConflict: 'id'
        })
        .select()

      if (error) throw error
      return data || activities
    }

    return []
  } catch (error) {
    console.error('Error saving activities to Supabase:', error)
    throw error
  }
}

/**
 * Deletes an activity from Supabase database
 * @param {number} activityId - ID of activity to delete
 * @returns {Promise<void>}
 */
export async function deleteActivityFromSupabase(activityId) {
  try {
    const { error } = await supabase
      .from(ACTIVITIES_TABLE)
      .delete()
      .eq('id', activityId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting activity from Supabase:', error)
    throw error
  }
}

