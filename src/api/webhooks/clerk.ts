import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/clerk-sdk-node'
import { getSupabaseClient } from '@/lib/supabaseClient'

// This would typically be an Express/Fastify/Next.js API route
// Adjust based on your backend framework

export async function handleClerkWebhook(
  body: string,
  headers: Record<string, string>
) {
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set')
  }

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': headers['svix-id'] || '',
      'svix-timestamp': headers['svix-timestamp'] || '',
      'svix-signature': headers['svix-signature'] || ''
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    throw new Error('Invalid webhook signature')
  }

  // Initialize Supabase client with service role for admin operations
  const supabase = getSupabaseClient()

  // Log the webhook event
  const { error: logError } = await supabase
    .from('clerk_webhook_events')
    .insert({
      event_type: evt.type,
      payload: evt.data,
      user_id: evt.data.id || null,
      received_at: new Date().toISOString()
    })

  if (logError) {
    console.error('Error logging webhook event:', logError)
  }

  // Handle different event types
  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data)
      break
    case 'user.updated':
      await handleUserUpdated(evt.data)
      break
    case 'user.deleted':
      await handleUserDeleted(evt.data)
      break
    case 'session.created':
      console.log('User session created:', evt.data.user_id)
      break
    case 'session.ended':
      console.log('User session ended:', evt.data.user_id)
      break
    default:
      console.log(`Unhandled event type: ${evt.type}`)
  }

  return { received: true }
}

async function handleUserCreated(userData: any) {
  const supabase = getSupabaseClient()
  
  // Create user profile in Supabase
  const { error } = await supabase
    .from('users')
    .insert({
      user_id: userData.id,
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  console.log('User profile created:', userData.id)
}

async function handleUserUpdated(userData: any) {
  const supabase = getSupabaseClient()
  
  // Update user profile in Supabase
  const { error } = await supabase
    .from('users')
    .update({
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userData.id)

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  console.log('User profile updated:', userData.id)
}

async function handleUserDeleted(userData: any) {
  // User deletion is handled by CASCADE in database
  console.log('User deleted (handled by DB cascade):', userData.id)
}