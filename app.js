const form = document.getElementById("hardeningForm");
const mensagem = document.getElementById("message");

const MENSAGENS = {
  422: "Dados inválidos. Confira os campos obrigatórios.",
  502: "O sistema externo retornou um erro.",
  503: "O sistema externo está indisponível.",
  504: "O sistema externo demorou demais para responder.",
};

function mostrar(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
}

async function salvarChecklist(evento) {
  evento.preventDefault();
  const botao = evento.submitter;

  // Cada campo é enviado com o seu id como chave; a API converte "1"/"0" em 1/0.
  const dados = Object.fromEntries(
    [...form.elements].filter((campo) => campo.id).map((campo) => [campo.id, campo.value])
  );

  botao.disabled = true;
  mostrar("Salvando...", "");
  try {
    const resp = await fetch(`${API_URL}/api/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const corpo = await resp.json().catch(() => null);
    if (!resp.ok) {
      const campos = resp.status === 422 && typeof corpo?.detail === "object"
        ? ` Campos: ${Object.keys(corpo.detail).join(", ")}.` : "";
      mostrar((MENSAGENS[resp.status] || `Erro ${resp.status}.`) + campos, "error");
      return;
    }
    if (corpo.email_enviado) {
      mostrar("Checklist salvo e e-mail enviado.", "success");
    } else {
      mostrar("Checklist salvo, mas o e-mail não pôde ser enviado.", "error");
    }
  } catch {
    mostrar("Não foi possível conectar à API.", "error");
  } finally {
    botao.disabled = false;
  }
}

form.addEventListener("submit", salvarChecklist);
