// Utilitário para incluir o email do admin em todas as requisições

export function getAdminHeaders(): HeadersInit {
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("admin_email") : null

  return {
    "Content-Type": "application/json",
    ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
  }
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAdminHeaders(),
    ...(options.headers || {}),
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
