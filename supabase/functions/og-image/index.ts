import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const slug = url.searchParams.get('slug')

    if (!slug) {
      return new Response('Slug is required', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: poem, error } = await supabase
      .from('poems')
      .select('title, excerpt, content')
      .eq('slug', slug)
      .single()

    if (error || !poem) {
      return new Response('Poem not found', { status: 404 })
    }

    const title = poem.title
    const text = (poem.excerpt || poem.content).replace(/<[^>]*>/g, '').slice(0, 150) + '...'

    // Simplest way: Return an SVG that browser can render as image
    // For a real production, use Satori or a Puppeteer-based service
    const svg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#0a0a0a"/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#grad)"/>
        
        <!-- Decoration -->
        <circle cx="1100" cy="100" r="150" fill="#ffffff" fill-opacity="0.03" />
        <line x1="50" y1="580" x2="200" y2="580" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" />

        <!-- Title -->
        <text x="100" y="250" font-family="serif" font-size="72" fill="#ffffff" font-weight="bold">${title}</text>
        
        <!-- Excerpt -->
        <text x="100" y="350" font-family="sans-serif" font-size="32" fill="#a0a0a0" font-style="italic">
          ${text.match(/.{1,60}(\s|$)/g)?.map((line, i) => `<tspan x="100" dy="${i === 0 ? 0 : 45}">${line.trim()}</tspan>`).join('') || ''}
        </text>

        <!-- Brand -->
        <text x="100" y="550" font-family="sans-serif" font-size="24" fill="#ffffff" font-weight="bold" letter-spacing="2">NATANAEL BRENTANO</text>
        <text x="100" y="580" font-family="sans-serif" font-size="18" fill="#666666">poemasdenatanael.com.br</text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
