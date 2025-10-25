import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code || !state) {
      throw new Error('Missing authorization code or state parameter')
    }

    // Decode state to get user info
    const stateData = JSON.parse(atob(state))
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_DRIVE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET') || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${url.origin}/settings/cloud-storage/callback`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user information from Google')
    }

    const userInfo = await userResponse.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('cloud_storage_connections')
      .select('id')
      .eq('advocate_id', user.id)
      .eq('provider', 'google_drive')
      .eq('provider_account_id', userInfo.id)
      .single()

    let connection
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    if (existingConnection) {
      // Update existing connection
      const { data, error } = await supabase
        .from('cloud_storage_connections')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          provider_account_email: userInfo.email,
          provider_account_name: userInfo.name,
          is_active: true,
          sync_status: 'active',
          sync_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id)
        .select()
        .single()

      if (error) throw error
      connection = data
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from('cloud_storage_connections')
        .insert({
          advocate_id: user.id,
          provider: 'google_drive',
          provider_account_id: userInfo.id,
          provider_account_email: userInfo.email,
          provider_account_name: userInfo.name,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          root_folder_path: '/AdvocateHub',
          is_active: true,
          is_primary: false,
          sync_status: 'active'
        })
        .select()
        .single()

      if (error) throw error
      connection = data
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        connection,
        message: 'Google Drive connected successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Google Drive OAuth error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to connect Google Drive'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})