import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const folderId = url.searchParams.get('folderId') || 'root'
    const pageSize = url.searchParams.get('pageSize') || '50'

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current user
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

    // Get user's Google Drive connection
    const { data: connection, error: connectionError } = await supabase
      .from('cloud_storage_connections')
      .select('access_token, refresh_token, token_expires_at')
      .eq('advocate_id', user.id)
      .eq('provider', 'google_drive')
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      throw new Error('No active Google Drive connection found')
    }

    // Check if token needs refresh
    let accessToken = connection.access_token
    if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
      // Token expired, refresh it
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_DRIVE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET') || '',
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token'
        })
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        accessToken = refreshData.access_token

        // Update token in database
        await supabase
          .from('cloud_storage_connections')
          .update({
            access_token: accessToken,
            token_expires_at: refreshData.expires_in 
              ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
              : null
          })
          .eq('advocate_id', user.id)
          .eq('provider', 'google_drive')
      }
    }

    // List files from Google Drive
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?` + new URLSearchParams({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,parents)',
        pageSize,
        orderBy: 'folder,name'
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!driveResponse.ok) {
      throw new Error('Failed to list files from Google Drive')
    }

    const driveData = await driveResponse.json()

    // Transform Google Drive response to our format
    const files = driveData.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      size: file.size ? parseInt(file.size) : undefined,
      modifiedDate: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
      path: file.name, // Simplified path for now
      mimeType: file.mimeType,
      webViewUrl: file.webViewLink
    }))

    return new Response(
      JSON.stringify({
        success: true,
        files,
        totalCount: files.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Google Drive files error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to list Google Drive files'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})