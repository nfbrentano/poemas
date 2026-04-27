import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY')!
const LOOPS_MAILING_LIST_ID = Deno.env.get('LOOPS_MAILING_LIST_ID') // opcional

serve(async (req) => {
  // CORS Handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { email } = await req.json()
  if (!email) return new Response('Email required', { status: 400 })

  // 1. Criar contato no Loops
  const contactRes = await fetch('https://app.loops.so/api/v1/contacts/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOOPS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      source: 'website-poemas',
      mailingLists: LOOPS_MAILING_LIST_ID ? { [LOOPS_MAILING_LIST_ID]: true } : undefined
    })
  })

  if (!contactRes.ok) {
    const err = await contactRes.json()
    // Código 409 = contato já existe (tratar como sucesso)
    if (contactRes.status !== 409) {
      return new Response(JSON.stringify({ error: err }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
  }

  // 2. Disparar evento "newsletter_subscribe" para acionar automação de boas-vindas no Loops
  await fetch('https://app.loops.so/api/v1/events/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOOPS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      eventName: 'newsletter_subscribe'
    })
  })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
})
