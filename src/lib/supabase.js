import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://huhihqdijcjhlmsqebem.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aGlocWRpamNqaGxtc3FlYmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDAzMDIsImV4cCI6MjA3NTU3NjMwMn0.I8ZsBcqKkQoSdKBz7_6XYyLbVdUGL_Vuk6rMbWVLBzs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)