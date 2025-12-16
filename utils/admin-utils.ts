// Funções utilitárias para o painel administrativo

export async function loadAdmins() {
  try {
    const response = await fetch("/api/admin/list")
    if (response.ok) {
      const data = await response.json()
      return data
    }
    return []
  } catch (error) {
    console.error("[v0] Erro ao carregar admins:", error)
    return []
  }
}

export async function loadTasks() {
  try {
    const response = await fetch("/api/admin/tasks")
    if (response.ok) {
      const data = await response.json()
      return data
    }
    return []
  } catch (error) {
    console.error("[v0] Erro ao carregar tasks:", error)
    return []
  }
}
