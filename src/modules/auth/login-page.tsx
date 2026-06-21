"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { LoadingButton } from "@/components/ui/loading-button";
import { login } from "@/services/authService";

export function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const senha = String(formData.get("password") ?? "");

    try {
      setIsLoading(true);
      setError("");

      const response = await login(email, senha);

      localStorage.setItem("token", response.token);
      localStorage.setItem("usuario", JSON.stringify(response.usuario));

      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f7f9fb_0%,#f0f4f7_52%,#f7f9fb_100%)] font-sans text-(--color_neutral_dark) selection:bg-[#cde5ff] selection:text-[#005685]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/50 bg-(--color_bg_soft_alpha) backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-4">
          <Link
            href="/login"
            className="text-lg font-extrabold text-(--color_primary_variant) sm:text-xl"
          >
            Autonomo +
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-28">
        <section className="animate-login-card-in relative z-10 w-full max-w-md rounded-lg border border-[#a9b4b9]/20 bg-white p-8 shadow-2xl shadow-slate-900/4 transition duration-300 hover:shadow-slate-900/6 sm:p-10">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-extrabold text-(--color_neutral_dark) sm:text-4xl">
              Acesse sua conta
            </h1>
            <p className="text-sm leading-6 text-(--color_neutral) sm:text-base">
              Gerencie seu fluxo com clareza editorial.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder=" "
                required
                autoComplete="email"
                className="peer w-full border-0 border-b-2 border-(--color_neutral_light) bg-transparent px-0 pb-2 pt-4 text-(--color_neutral_dark) outline-none transition placeholder:text-transparent focus:border-(--color_primary_variant) focus:ring-0"
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-0 top-4 origin-left -translate-y-5 scale-[0.85] text-(--color_primary_variant) transition duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-(--color_neutral) peer-focus:-translate-y-5 peer-focus:scale-[0.85] peer-focus:text-(--color_primary_variant)"
              >
                E-mail profissional
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                required
                autoComplete="current-password"
                className="peer w-full border-0 border-b-2 border-(--color_neutral_light) bg-transparent px-0 pb-2 pr-12 pt-4 text-(--color_neutral_dark) outline-none transition placeholder:text-transparent focus:border-(--color_primary_variant) focus:ring-0"
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-0 top-4 origin-left -translate-y-5 scale-[0.85] text-(--color_primary_variant) transition duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-(--color_neutral) peer-focus:-translate-y-5 peer-focus:scale-[0.85] peer-focus:text-(--color_primary_variant)"
              >
                Senha
              </label>
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-0 top-3 grid h-9 w-9 place-items-center rounded-lg text-(--color_neutral) transition hover:bg-[#cde5ff]/45 hover:text-(--color_primary_variant)"
              >
                <span className="relative grid h-5 w-5 place-items-center">
                  <Icon name="visibility" className="h-5 w-5" />
                  {showPassword ? (
                    <span className="absolute h-6 w-0.5 rotate-45 rounded-full bg-current" />
                  ) : null}
                </span>
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="#"
                className="text-sm font-semibold text-(--color_primary_variant) transition hover:text-(--color_primary_dark) hover:underline hover:underline-offset-4"
              >
                Esqueci minha senha
              </Link>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-(--color_error)">
                {error}
              </p>
            ) : null}

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Entrando..."
            >
              Entrar no Sistema
            </LoadingButton>
          </form>

          <div className="mt-8 text-center text-sm text-(--color_neutral)">
            <span>Ainda n&atilde;o possui uma conta?</span>
            <Link
              href="/cadastro"
              className="ml-1 font-semibold text-(--color_primary_variant) transition hover:text-(--color_primary_dark)"
            >
              Solicitar acesso
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}

export default LoginPage;
