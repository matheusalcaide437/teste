# Guia de Setup — Google Sheets + Apps Script

## Pré-requisitos
- Conta Google
- Acesso ao Google Sheets e Google Apps Script

---

## Passo 1 — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha em branco.
2. Dê um nome, por exemplo: **Controle Financeiro Pessoal**.
3. Guarde a URL da planilha (você precisará dela no Passo 2).

---

## Passo 2 — Criar o Apps Script

1. Na planilha, clique em **Extensões → Apps Script**.
2. Apague o conteúdo do arquivo `Código.gs` que aparece.
3. Cole o conteúdo completo do arquivo [`apps-script/Code.gs`](../apps-script/Code.gs) deste repositório.
4. Clique em **Salvar** (ícone de disquete ou `Ctrl+S`).

---

## Passo 3 — Definir o token de segurança

No início do `Code.gs`, localize a linha:

```js
token: "TROQUE_POR_UM_TOKEN_SECRETO",
```

Substitua `TROQUE_POR_UM_TOKEN_SECRETO` por uma string aleatória, por exemplo:

```
minha-chave-financas-2026
```

> Anote esse valor — você usará o mesmo no Shortcut do iPhone.

---

## Passo 4 — Configurar a planilha (uma única vez)

1. No editor do Apps Script, selecione a função **`configurarSistema`** no menu suspenso de funções.
2. Clique em **Executar**.
3. Na primeira execução, o Google pedirá permissão — clique em **Revisar permissões** → **Permitir**.
4. Uma notificação no canto da planilha confirmará: *"✅ Sistema configurado!"*

Isso criará as abas **Lançamentos**, **Resumo**, **Config** e **Orçamento**, o painel visual e o menu **💰 Orçamento**.

> ⚠️ `configurarSistema` limpa a aba **Lançamentos**. Execute apenas no primeiro setup (ou quando quiser zerar os dados).

---

## Passo 5 — Fazer o deploy como Web App

1. No editor do Apps Script, clique em **Implantar → Nova implantação**.
2. Em **Tipo**, selecione **App da Web**.
3. Configure:
   - **Descrição**: `Controle Financeiro v1`
   - **Executar como**: `Eu mesmo (seu e-mail)`
   - **Quem tem acesso**: `Qualquer pessoa`
4. Clique em **Implantar**.
5. Copie a **URL do App da Web** gerada — ela terá este formato:

```
https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXX/exec
```

> Guarde essa URL. Ela será usada no Shortcut do iPhone.

---

## Passo 6 — Testar o endpoint

Você pode testar via terminal com `curl`:

```bash
curl -L -X POST "COLE_AQUI_A_URL_DO_WEB_APP" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "SUA_CHAVE_AQUI",
    "tipo": "Despesa",
    "categoria": "Alimentação",
    "descricao": "Teste de integração",
    "valor": 25.50,
    "forma_pagamento": "Pix"
  }'
```

Resposta esperada:

```json
{"status":"ok","linha":2}
```

Verifique na aba **Lançamentos** da planilha — uma nova linha deve ter aparecido.

---

## Re-deploy após alterações

Toda vez que modificar o `Code.gs`, você precisa fazer um novo deploy:

1. **Implantar → Gerenciar implantações**
2. Clique no lápis (editar) na sua implantação existente
3. Em **Versão**, selecione **Nova versão**
4. Clique em **Implantar**

> A URL permanece a mesma — não precisa atualizar o Shortcut.

---

## Solução de problemas

| Problema | Solução |
|----------|---------|
| `Token inválido` | Verifique se o token no Shortcut é idêntico ao do `Code.gs` |
| `categoria inválida` | Confirme que a categoria enviada está exatamente igual às listadas em `CONFIG.categorias` |
| Planilha não atualiza | Verifique se fez re-deploy após editar o script |
| Erro de permissão | Re-execute `configurarSistema` e aceite as permissões novamente |
