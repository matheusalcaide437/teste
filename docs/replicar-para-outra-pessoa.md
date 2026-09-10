# Guia — Replicar o sistema para outra pessoa (ex.: sua mãe)

Este guia mostra como criar uma **cópia independente** do sistema para outra pessoa.
Nada é compartilhado entre a sua instância e a dela: planilha, script, URL do Web App,
token e Shortcut são todos próprios. Assim cada um vê só os seus dados.

Tempo estimado: **40 a 60 minutos**, sendo ~20 min no computador e ~20 min no iPhone dela.

---

## Antes de começar — 3 decisões

### 1. Em qual conta Google a planilha vai ficar?

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **Conta Google dela** (recomendado) | Dados ficam com ela; ela abre a planilha no próprio celular; não mistura com as suas coisas | Você precisa fazer o setup logado na conta dela (ou ao lado dela) |
| Sua conta, planilha compartilhada com ela | Você mantém tudo num lugar só | Dados dela ficam no seu Drive; ela depende de você para qualquer ajuste |

> Recomendação: use a conta dela. Se ela não tiver conta Google, crie uma em
> [accounts.google.com](https://accounts.google.com) antes de seguir.
> Todos os passos no computador devem ser feitos **logado nessa conta**.

### 2. Ela usa iPhone?

O app **Atalhos** só existe no iPhone/iPad. Se ela usa Android, a planilha e o script
funcionam igual, mas o "botão na tela inicial" precisa de outro app — veja
[Alternativa para Android](#alternativa-para-android) no final.

### 3. Quais são as categorias e o orçamento dela?

Sente 15 minutos com ela e anote:

- **Categorias de despesa** (6 a 10 itens). Sugestão inicial:
  `Saúde`, `Farmácia`, `Alimentação`, `Casa`, `Transporte`, `Lazer`, `Igreja`, `Família`, `Outros`
- **Categorias de receita** (3 a 5 itens). Sugestão: `Aposentadoria`, `Aluguel`, `Ajuda da família`, `Outros`
- **Limite mensal** de cada categoria de despesa (pode ser aproximado, dá para ajustar depois)
- **Receita mensal** esperada

Esses nomes serão usados em **dois lugares** e precisam ser idênticos nos dois: no `Code.gs`
e nas listas do Shortcut. Acentos e maiúsculas contam.

---

## PARTE A — No computador (conta Google dela)

### Passo 1 — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) logado na conta dela.
2. Crie uma planilha em branco e dê um nome, ex.: **Controle Financeiro — Mãe**.

### Passo 2 — Colar o script

1. Na planilha: **Extensões → Apps Script**.
2. Apague o conteúdo do arquivo `Código.gs`.
3. Cole o conteúdo completo de [`apps-script/Code.gs`](../apps-script/Code.gs).
4. Ainda **não salve** — primeiro personalize (Passo 3).

### Passo 3 — Personalizar para ela

Tudo fica no topo do arquivo, em dois blocos.

**3a. Bloco `CONFIG` — token e listas do Shortcut**

```js
var CONFIG = {
  token: "COLOQUE-UM-TOKEN-NOVO-E-DIFERENTE-DO-SEU",
  ...
  categorias: [            // despesas — os MESMOS nomes irão para o Shortcut dela
    "Saúde",
    "Farmácia",
    "Alimentação",
    "Casa",
    "Transporte",
    "Lazer",
    "Igreja",
    "Família",
    "Outros"
  ],
  categoriasReceita: [
    "Aposentadoria",
    "Aluguel",
    "Ajuda da família",
    "Outros"
  ],
  formasPagamento: ["Pix", "Débito", "Crédito", "Dinheiro"],
  classificacoes: ["Necessidade", "Desejo"]
};
```

> **Token:** NÃO reutilize o seu. Use uma frase longa e sem espaços, ex.:
> `mae-financas-2026-Xk93pQ`. Anote — vai para o Shortcut dela no Passo 7.

**3b. Bloco `CONFIG_ORCAMENTO` — receita e limites mensais**

Este bloco hoje contém **os seus valores e subcategorias pessoais** (salário, comissão,
"Antônio", "Presentes / Esposa", assinaturas, etc.). Substitua tudo pelos dados dela:

```js
var CONFIG_ORCAMENTO = {
  receita: {
    aposentadoria: { label: "Aposentadoria", valor: 3000 },
    aluguel:       { label: "Aluguel",       valor: 1200 },
  },
  categorias: [
    { nome: "Saúde",       orcamento: 600,  subcategorias: [ { nome: "Plano de saúde", valor: 450 }, { nome: "Consultas", valor: 150 } ] },
    { nome: "Farmácia",    orcamento: 300,  subcategorias: [ { nome: "Remédios", valor: 300 } ] },
    { nome: "Alimentação", orcamento: 900,  subcategorias: [ { nome: "Mercado", valor: 700 }, { nome: "Feira", valor: 200 } ] },
    { nome: "Casa",        orcamento: 700,  subcategorias: [ { nome: "Luz", valor: 200 }, { nome: "Água", valor: 100 }, { nome: "Gás", valor: 100 }, { nome: "Internet / TV", valor: 300 } ] },
    { nome: "Transporte",  orcamento: 200,  subcategorias: [ { nome: "Uber / Ônibus", valor: 200 } ] },
    { nome: "Lazer",       orcamento: 300,  subcategorias: [ { nome: "Passeios", valor: 300 } ] },
    { nome: "Igreja",      orcamento: 300,  subcategorias: [ { nome: "Dízimo e ofertas", valor: 300 } ] },
    { nome: "Família",     orcamento: 300,  subcategorias: [ { nome: "Presentes / Netos", valor: 300 } ] },
    { nome: "Outros",      orcamento: 200,  subcategorias: [ { nome: "Imprevistos", valor: 200 } ] },
  ]
};
```

**Regras que não podem ser quebradas:**

- Toda categoria em `CONFIG.categorias` deve existir em `CONFIG_ORCAMENTO.categorias` com o
  **mesmo nome exato** (e vice-versa). O painel e o resumo cruzam os dois pela string.
- A soma das `subcategorias` deve bater com o `orcamento` da categoria (é só informativo, mas
  evita confusão no painel).
- Mantenha `"Receita"`/`"Despesa"`, `"Necessidade"`/`"Desejo"` como estão — o script valida
  esses valores.

Agora **salve** (`Ctrl+S`).

### Passo 4 — Configurar a planilha (executar UMA vez)

1. No menu suspenso de funções do editor, selecione **`configurarSistema`**
   (não use `setupSheet` sozinha — `configurarSistema` chama tudo: abas, orçamento, painel e menu).
2. Clique em **Executar**.
3. O Google vai pedir permissão: **Revisar permissões → escolha a conta dela →**
   se aparecer "O Google não verificou este app", clique em **Avançado → Acessar (não seguro)** → **Permitir**.
   Isso é normal para scripts pessoais.
4. Volte para a planilha: devem existir as abas **Lançamentos**, **Resumo**, **Config** e
   **Orçamento**, e o menu **💰 Orçamento** na barra superior.

> ⚠️ `configurarSistema` **apaga o conteúdo da aba Lançamentos**. Só execute de novo se
> quiser zerar os dados. Para mudar categorias depois, veja [Manutenção](#manutenção-depois-que-ela-já-está-usando).

### Passo 5 — Publicar o Web App

1. No editor: **Implantar → Nova implantação**.
2. Engrenagem ao lado de "Selecionar tipo" → **App da Web**.
3. Preencha:
   - **Descrição**: `Controle Financeiro Mãe v1`
   - **Executar como**: **Eu mesmo** (a conta dela)
   - **Quem tem acesso**: **Qualquer pessoa** (obrigatório — o Shortcut chama sem login;
     a proteção é o token)
4. **Implantar** → autorize de novo se pedir.
5. Copie a **URL do app da Web** (`https://script.google.com/macros/s/.../exec`).
   Ela é **diferente da sua**. Anote junto com o token.

### Passo 6 — Testar antes de mexer no iPhone

**Jeito fácil (sem terminal):** cole a URL `/exec` do Passo 5 em `CONFIG.webAppUrl` (topo do código) e salve.
Depois, no editor do Apps Script, selecione a função **`testarWebApp`**
e clique em **Executar** (ou, na planilha, menu **💰 Orçamento → 🧪 Testar Web App**).
Ela confere token, abas e categorias, faz um POST real na URL publicada e mostra o
resultado no **Registro de execução** (ou num alerta, se rodar pelo menu). Se der certo,
aparece `✅ SUCESSO! Linha N gravada` mais a URL e o token prontos para copiar no Shortcut.
Apague a linha "TESTE" depois.

**Confirmação rápida no navegador:** cole a URL `.../exec` na barra de endereços. Deve
aparecer um texto como `{"status":"ok","totalLancamentos":0}`. Se aparecer página de login
do Google ou erro em HTML, o problema é a implantação (veja a tabela abaixo).

**Jeito alternativo (terminal):**

```bash
curl -L -X POST "URL_DO_WEB_APP_DELA" \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_DELA","tipo":"Despesa","categoria":"Farmácia","descricao":"Teste","valor":10,"forma_pagamento":"Pix","classificacao":"Necessidade"}'
```

No **Windows (PowerShell)** o `curl` é outro programa e o comando acima falha. Use:

```powershell
Invoke-RestMethod -Method Post -Uri "URL_DO_WEB_APP_DELA" -ContentType "application/json" -Body '{"token":"TOKEN_DELA","tipo":"Despesa","categoria":"Farmácia","descricao":"Teste","valor":10,"forma_pagamento":"Pix","classificacao":"Necessidade"}'
```

Esperado: `{"status":"ok","linha":2}` e uma linha nova em **Lançamentos**.

**Se o teste falhar:**

| O que aparece | Causa | Solução |
|---------------|-------|---------|
| Página de login do Google / HTML enorme | "Quem tem acesso" ficou em **Somente eu** | Implantar → Gerenciar implantações → lápis → Quem tem acesso: **Qualquer pessoa** → Nova versão → Implantar |
| `Script function not found: doPost` | Implantou antes de colar/salvar o código | Salve o código e publique uma **Nova versão** |
| `Token inválido` | Token do comando ≠ token da versão publicada | Confira o `CONFIG.token` e publique uma **Nova versão** (editar o código não atualiza o Web App sozinho) |
| `'categoria' inválida` | Categoria do teste não está em `CONFIG.categorias` da versão publicada | Use uma categoria exata da lista ou publique Nova versão |
| `'classificacao' deve ser...` | Faltou `classificacao` no corpo da Despesa | Inclua `"classificacao":"Necessidade"` |
| Resposta vazia / `301` / `302` | `curl` sem `-L` (o Google redireciona) | Adicione `-L` |
| Erro de sintaxe no PowerShell | `curl` do Windows não aceita `-d` com aspas simples | Use o `Invoke-RestMethod` acima ou o `testarWebApp` |
| `Authorization is required` ao rodar `testarWebApp` | Primeira vez usando `UrlFetchApp` | Clique em Revisar permissões → Avançado → Acessar → Permitir, e execute de novo |

---

## PARTE B — No iPhone dela

### Passo 7 — Criar o Shortcut

Há dois caminhos. O **A** é bem mais rápido.

**Caminho A — Duplicar o seu e enviar para ela (recomendado)**

1. No **seu** iPhone, app Atalhos → segure o atalho "💰 Lançar Gasto" → **Duplicar**.
2. Renomeie a cópia (ex.: "💰 Gastos Mãe") e edite **quatro coisas**:
   - A **Lista** de categorias de **Despesa** (dentro do "Caso Contrário" do primeiro "Se") → troque pelos nomes dela, exatamente como no `CONFIG.categorias`.
   - A **Lista** de categorias de **Receita** (dentro do "Se tipo é Receita") → nomes do `CONFIG.categoriasReceita`.
   - Na ação **Obter Conteúdo de URL**: a **URL** → a do Passo 5.
   - No corpo JSON dessa ação: o valor de **`token`** → o do Passo 3.
3. Toque em **···** → **Compartilhar** → envie por **AirDrop** ou **Copiar Link do iCloud** (mande pelo WhatsApp).
4. No iPhone dela, abra o link → **Adicionar Atalho**.
5. Depois de adicionado, apague a cópia do seu iPhone para não confundir os dois.

**Caminho B — Criar do zero no iPhone dela**

Siga o [shortcut-guide.md](./shortcut-guide.md) passo a passo, **substituindo**:
- as listas de categorias (Passo 2 do guia) pelas dela;
- a URL e o token (Passo 7 do guia) pelos dela.

### Passo 8 — Adicionar à tela inicial e testar com ela

1. Atalho aberto → **···** → **Adicionar à Tela de Início** → nome curto e ícone grande (ex.: **💰 Gastos**).
2. Faça **um lançamento real com ela olhando**, e mostre a linha aparecendo na planilha
   (app Google Planilhas no celular dela, ou pelo navegador).
3. Mostre onde ela vê o resultado: aba **Resumo** (saldo do mês) e aba **Orçamento**
   (quanto já gastou de cada limite, com cores).

---

## Checklist final

- [ ] Planilha criada na conta **dela**
- [ ] `CONFIG.token` novo, diferente do seu
- [ ] `CONFIG.categorias` e `CONFIG.categoriasReceita` com as categorias dela
- [ ] `CONFIG_ORCAMENTO` sem nenhum dado seu (conferir "Antônio", "Esposa", salário, assinaturas)
- [ ] Cada categoria existe nos **dois** blocos com nome idêntico
- [ ] `configurarSistema` executada e 4 abas criadas
- [ ] Web App publicado como **Qualquer pessoa** e URL anotada
- [ ] Teste via `curl` retornou `"status":"ok"`
- [ ] Shortcut dela com URL + token + listas dela (não os seus)
- [ ] Ícone na tela inicial e um lançamento real feito com ela

---

## Dicas para facilitar o uso dela

- **Menos perguntas = mais uso.** Se ela não vai usar "Necessidade/Desejo", duplique o
  atalho e, no "Se tipo é Despesa", troque a pergunta por **Definir variável `classificacao` = `Necessidade`**.
  Assim são só 4 toques: tipo, categoria, valor, pagamento.
- **Atalhos fixos para gastos frequentes**: duplique o atalho dela e pré-defina tipo e
  categoria (ex.: "💊 Farmácia") — sobra só digitar o valor.
- **Texto maior na planilha**: no app Planilhas, ela pode dar zoom com dois dedos; a aba
  **Orçamento** já foi pensada para leitura rápida com cores 🟢🟡🔴.
- **Você acompanhar junto?** Na planilha dela: **Compartilhar → seu e-mail → Leitor**.
  Você vê tudo sem risco de alterar nada.

---

## Manutenção depois que ela já está usando

**Mudar ou adicionar categoria / limite:**

1. Edite `CONFIG.categorias` (ou `categoriasReceita`) **e** `CONFIG_ORCAMENTO.categorias`.
2. Salve e faça **Implantar → Gerenciar implantações → lápis → Nova versão → Implantar**
   (a URL não muda, o Shortcut continua funcionando).
3. Atualize a **Lista** correspondente no Shortcut dela.
4. Para refletir no painel/Resumo **sem apagar os lançamentos**:
   - Faça uma cópia da aba **Lançamentos** (clique direito na aba → Duplicar) como backup;
   - Execute `configurarSistema`;
   - Copie os dados de volta da cópia para **Lançamentos** (a partir da linha 2, colunas A–H);
   - Apague a cópia.

**Novo mês:** nada a fazer — Resumo e Orçamento usam sempre o mês atual.

**Ela trocou de iPhone:** os atalhos sincronizam pelo iCloud. Se não aparecer, repita o Passo 7.

---

## Alternativa para Android

O Web App aceita qualquer `POST` com JSON, então no Android funciona com apps que fazem
requisição HTTP por botão. Opções gratuitas:

- **HTTP Shortcuts** (Play Store): cria um ícone na tela inicial que envia o JSON; suporta
  variáveis com menu de escolha (tipo, categoria, pagamento) e campo numérico (valor).
  Configure: método `POST`, URL do Passo 5, corpo JSON igual ao do `curl` do Passo 6,
  marcando "seguir redirecionamentos".
- **MacroDroid** ou **Tasker**: mesma ideia, com ação "HTTP Request".

Opção sem app extra: um **Google Forms** ligado à planilha, com os mesmos campos — perde a
velocidade do atalho, mas funciona em qualquer celular. Nesse caso o formulário grava numa
aba própria; seria preciso adaptar as fórmulas do Resumo para ler dessa aba.
