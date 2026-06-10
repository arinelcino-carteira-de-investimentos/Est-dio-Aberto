import React, { useState } from "react";
import { KeyRound, ShieldAlert, Sparkles, User, Mail, LogIn, ClipboardCheck } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, username: string, password?: string) => Promise<void>;
  onSignup: (email: string, username: string, password?: string) => Promise<void>;
}

export default function LoginScreen({ onLogin, onSignup }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("O endereço de e-mail é obrigatório.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      if (isRegistering) {
        if (!name) {
          setErrorMsg("Nome de usuário é obrigatório para cadastro.");
          setLoading(false);
          return;
        }
        await onSignup(email.trim(), name.trim(), password);
      } else {
        const username = name.trim() || email.split("@")[0];
        await onLogin(email.trim(), username, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-screen w-screen bg-[#0c0d10] flex items-center justify-center p-4 md:p-8 select-none font-sans overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.22] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#15171e]/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 md:p-8 space-y-6 text-left">
        {/* Logo and Greeting */}
        <div className="text-center space-y-1.5 pb-2 border-b border-zinc-800/60">
          <div className="flex justify-center items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-4 h-8 bg-[#0c0d10] rounded-r-none rounded-l-full"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
              Open Studio
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-[#d4af37] uppercase font-bold block">
            MOTOR AUTÔNOMO DE CONTEÚDO
          </span>
        </div>

        {/* Form Title */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-zinc-150 tracking-tight flex items-center gap-1.5">
            <span>{isRegistering ? "Iniciar Novo Registro" : "Acessar Plataforma"}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </h2>
          <p className="text-[11px] text-zinc-400 font-medium">
            {isRegistering 
              ? "Crie sua conta para simular geração de posts e controle de robôs." 
              : "Faça login com seu e-mail administrativo do Open Studio."}
          </p>
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono py-1.5 px-2.5 rounded-lg bg-[#1c1e26] border border-zinc-800/40 w-fit select-none shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Autenticação Sincronizada Supabase API</span>
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="bg-red-950/45 border border-red-900/65 rounded-xl p-3 flex items-start gap-2 text-[11px] text-red-250 font-semibold animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Nome Completo / Usuário</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Arinelcino de Souza"
                className="w-full text-xs text-zinc-200 bg-[#232631]/60 border border-zinc-800/80 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition duration-200"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>E-mail Corporativo</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: arinelcino@gmail.com"
              className="w-full text-xs text-zinc-200 bg-[#232631]/60 border border-zinc-800/80 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>Chave / Senha de Acesso</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full text-xs text-zinc-200 bg-[#232631]/60 border border-zinc-800/80 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#c29f2e] disabled:bg-zinc-700 text-zinc-950 font-bold text-xs p-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-xl uppercase font-mono tracking-wider"
          >
            {isRegistering ? <ClipboardCheck className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? "Processando..." : isRegistering ? "Cadastrar Conta" : "Autenticar no Painel"}</span>
          </button>
        </form>

        {/* Toggle between Register/Login */}
        <div className="text-center pt-3 border-t border-zinc-800/45 text-xs text-zinc-400">
          <span>{isRegistering ? "Já possui login ativo?" : "Não possui uma chave?"}</span>{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg("");
            }}
            className="text-[#d4af37] hover:underline font-semibold"
          >
            {isRegistering ? "Entrar Aqui" : "Criar Registro Único"}
          </button>
        </div>
      </div>
    </div>
  );
}
