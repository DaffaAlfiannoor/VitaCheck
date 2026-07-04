import client from './client'

export async function predict(data) {
  const res = await client.post('/predict', data)
  return res.data
}

export async function getHistory() {
  const res = await client.get('/predictions/history')
  return res.data
}
