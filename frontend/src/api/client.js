import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Jangan redirect jika 401 berasal dari endpoint login/register itu sendiri
    // (artinya user salah memasukkan kredensial, bukan sesi yang expired)
    const isAuthEndpoint =
      err.config?.url?.includes('/auth/login') ||
      err.config?.url?.includes('/auth/register')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default client
