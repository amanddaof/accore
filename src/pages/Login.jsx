import { useState } from "react";
import { supabase } from "../services/supabase";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha incorretos");
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">ACCORE</h1>

        <form onSubmit={handleLogin} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="seuemail@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {erro && <p className="login-error">{erro}</p>}

          <button type="submit">Entrar</button>

        </form>
      </div>
    </div>
  );
}
