import { apiFetch } from "./api";

/**
 * Interface que representa os dados públicos do usuário retornados pela API.
 */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  // Adicione outros campos conforme necessário
}

/**
 * Interface para a resposta de login.
 */
export interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: Usuario;
}

/**
 * Interface para a resposta de cadastro.
 */
export interface CadastroResponse {
  mensagem: string;
  usuario: Usuario;
}

/**
 * Realiza o login do usuário.
 *
 * Essa função envia email e senha para o backend.
 * Se as credenciais estiverem corretas, a API retorna um token JWT
 * e os dados públicos do usuário.
 *
 * Rota chamada no backend:
 * POST /auth/login
 *
 * @param {string} email - Email informado no formulário de login.
 * @param {string} senha - Senha informada no formulário de login.
 * @returns {Promise<LoginResponse>} Retorna mensagem, token e dados do usuário.
 */
export function login(email: string, senha: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    /**
     * O backend espera receber exatamente:
     * {
     *   email: "...",
     *   senha: "..."
     * }
     */
    body: JSON.stringify({
      email,
      senha,
    }),
  });
}

/**
 * Cadastra um novo usuário no sistema.
 *
 * Essa função envia nome, email e senha para o backend.
 * Se os dados forem válidos, a API cria o usuário no banco
 * e retorna os dados públicos do usuário cadastrado.
 *
 * Rota chamada no backend:
 * POST /auth/cadastro
 *
 * @param {string} nome - Nome completo informado no formulário.
 * @param {string} email - Email informado no formulário.
 * @param {string} senha - Senha informada no formulário.
 * @returns {Promise<CadastroResponse>} Retorna mensagem e dados do usuário criado.
 */
export function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string
): Promise<CadastroResponse> {
  return apiFetch<CadastroResponse>("/auth/cadastro", {
    method: "POST",
    /**
     * O backend espera receber exatamente:
     * {
     *   nome: "...",
     *   email: "...",
     *   senha: "..."
     * }
     */
    body: JSON.stringify({
      nome,
      email,
      senha,
    }),
  });
}

/**
 * Remove os dados de autenticação salvos no navegador.
 *
 * Essa função é usada no logout para encerrar a sessão local do usuário.
 * Depois dela, o usuário deixa de ter acesso às rotas privadas.
 */
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}
