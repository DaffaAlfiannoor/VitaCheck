import client from './client'

export async function loginRequest(username, password) {
  const res = await client.post('/auth/login', { username, password })
  return res.data
}

export async function registerRequest(username, email, password) {
  const res = await client.post('/auth/register', { username, email, password })
  return res.data
}

export async function getMe() {
  const res = await client.get('/auth/me')
  return res.data
}

export async function resetPassword(username, email, new_password) {
  const res = await client.post('/auth/reset-password', { username, email, new_password })
  return res.data
}

export async function changePassword(current_password, new_password) {
  const res = await client.post('/auth/change-password', { current_password, new_password })
  return res.data
}

export async function updateHealthTarget(health_target) {
  const res = await client.post('/auth/target', { health_target })
  return res.data
}
