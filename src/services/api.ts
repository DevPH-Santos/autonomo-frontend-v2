/**
 * URL base da API do backend.
 *
 * Durante o desenvolvimento, o backend está rodando localmente na porta 3000.
 * Todas as requisições do frontend vão partir desse endereço.
 */
const API_BASE_URL = "https://autonomo-backend.onrender.com";

/**
 * Função auxiliar para realizar requisições HTTP para a API.
 *
 * Ela centraliza configurações comuns, como:
 * - URL base do backend;
 * - envio de dados em JSON;
 * - tratamento padrão de erros.
 *
 * @param {string} endpoint - Caminho da rota da API. Exemplo: "/auth/login".
 * @param {RequestInit} options - Configurações da requisição, como method e body.
 * @returns {Promise<T>} Retorna os dados JSON enviados pelo backend.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    /**
     * Define que os dados enviados e recebidos estarão em formato JSON.
     * O spread de options.headers permite adicionar headers extras depois,
     * como Authorization para rotas protegidas.
     */
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  /**
   * Converte a resposta do backend para objeto JavaScript.
   * O backend está respondendo sempre em JSON nas rotas de autenticação.
   */
  const data = (await response.json()) as T & { erro?: string };

  /**
   * Se o status HTTP indicar erro, lançamos uma exceção.
   * Isso permite que as telas usem try/catch para exibir mensagens ao usuário.
   */
  if (!response.ok) {
    throw new Error(data.erro || "Erro na requisição.");
  }

  return data;
}
