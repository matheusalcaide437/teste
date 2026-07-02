# Guia — Criar o Shortcut no iPhone (versão completa)

## Pré-requisitos
- iPhone com iOS 15 ou superior
- App **Atalhos** (Shortcuts) instalado — vem nativo no iPhone
- URL do Web App e token (obtidos no [setup.md](./setup.md))

---

## Estrutura dos passos

```
 1. Lista: Receita / Despesa  →  Escolher  →  Definir variável "tipo"
 2. Se tipo é "Receita"
      Lista: Salário / Comissão de Vendas / Freelance / Extra / Bônus / Outros
      Escolher de Lista
      Definir variável "categoria"  ←  Item Selecionado (mágico do passo acima)
    Caso Contrário
      Lista: Saúde / Alimentação / Casa / Transporte / Antônio / Lazer / Dízimos e Ofertas / Assinaturas / Educação
      Escolher de Lista
      Definir variável "categoria"  ←  Item Selecionado (mágico do passo acima)
    Terminar Se
 3. Pedir Texto  →  Definir variável "descricao"
 4. Pedir Número  →  Definir variável "valor"
 5. Lista: Pix / Crédito / Débito / Dinheiro  →  Escolher  →  Definir variável "forma_pagamento"
 6. Se tipo é "Despesa"
      Lista: Necessidade / Desejo
      Escolher de Lista
      Definir variável "classificacao"  ←  Item Selecionado (mágico do passo acima)
    Caso Contrário
      Definir variável "classificacao"  ←  "" (texto vazio)
    Terminar Se
 7. Obter conteúdo de URL  →  POST JSON  →  Definir variável "resposta"
 8. Se "resposta" contém "ok"
      Mostrar notificação ✅
    Caso Contrário
      Mostrar alerta ❌
    Terminar Se
```

---

## Passo a passo detalhado

### PASSO 1 — Tipo do lançamento

1. Abra o app **Atalhos** → toque em **"+"** → renomeie para **"💰 Lançar Gasto"**
2. Toque em **"Adicionar Ação"** → busque **"Lista"**
3. Adicione os itens: `Receita` e `Despesa`
4. Adicione nova ação → busque **"Escolher de Lista"**
5. Adicione nova ação → busque **"Definir Variável"**
   - Nome: `tipo`
   - Valor: toque no campo → selecione **"Item Selecionado"** (variável mágica do "Escolher de Lista" acima)

---

### PASSO 2 — Categoria (condicional por tipo)

1. Nova ação → busque **"Se"**
   - Entrada: variável `tipo`
   - Condição: **é**
   - Valor: `Receita`

**Dentro do bloco "Se verdadeiro":**

2. Nova ação → **"Lista"** com os itens:
   - `Salário`
   - `Comissão de Vendas`
   - `Freelance / Extra`
   - `Bônus`
   - `Outros`
3. Nova ação → **"Escolher de Lista"**
4. Nova ação → **"Definir Variável"**
   - Nome: `categoria`
   - Valor: **"Item Selecionado"** (variável mágica do "Escolher de Lista" imediatamente acima)

**Dentro do bloco "Caso Contrário":**

5. Nova ação → **"Lista"** com os itens:
   - `Saúde`
   - `Alimentação`
   - `Casa`
   - `Transporte`
   - `Antônio`
   - `Lazer`
   - `Dízimos e Ofertas`
   - `Assinaturas`
   - `Educação`
6. Nova ação → **"Escolher de Lista"**
7. Nova ação → **"Definir Variável"**
   - Nome: `categoria`
   - Valor: **"Item Selecionado"** (variável mágica do "Escolher de Lista" imediatamente acima)

8. Feche o bloco com **"Terminar Se"**

> ⚠️ **Importante**: em ambos os blocos, o valor do "Definir Variável" deve ser a **variável mágica** (ícone laranja de lista) do "Escolher de Lista" logo acima — não o nome escrito `categoria`.

---

### PASSO 3 — Descrição (opcional)

1. Nova ação → **"Pedir Texto"**
   - Prompt: `Descrição (opcional)`
2. Nova ação → **"Definir Variável"**
   - Nome: `descricao`
   - Valor: variável mágica do "Pedir Texto" acima

---

### PASSO 4 — Valor

1. Nova ação → **"Pedir Número"**
   - Prompt: `Valor R$`
2. Nova ação → **"Definir Variável"**
   - Nome: `valor`
   - Valor: variável mágica do "Pedir Número" acima

---

### PASSO 5 — Forma de pagamento

1. Nova ação → **"Lista"** com os itens:
   - `Pix`
   - `Crédito`
   - `Débito`
   - `Dinheiro`
2. Nova ação → **"Escolher de Lista"**
3. Nova ação → **"Definir Variável"**
   - Nome: `forma_pagamento`
   - Valor: variável mágica do "Escolher de Lista" acima

---

### PASSO 6 — Classificação (apenas para Despesa)

1. Nova ação → **"Se"**
   - Entrada: variável `tipo`
   - Condição: **é**
   - Valor: `Despesa`

**Dentro do bloco "Se verdadeiro":**

2. Nova ação → **"Lista"** com os itens:
   - `Necessidade`
   - `Desejo`
3. Nova ação → **"Escolher de Lista"**
4. Nova ação → **"Definir Variável"**
   - Nome: `classificacao`
   - Valor: variável mágica do "Escolher de Lista" acima

**Dentro do bloco "Caso Contrário":**

5. Nova ação → **"Definir Variável"**
   - Nome: `classificacao`
   - Valor: **texto vazio** (deixe o campo em branco)

6. Feche com **"Terminar Se"**

---

### PASSO 7 — Enviar para a API

1. Nova ação → **"Obter Conteúdo de URL"**
2. Configure:
   - **URL**: `https://script.google.com/macros/s/AKfycbxMp1qxP6E08ziJ4lgWJ71FuzlFytuBXWgB9JCc6WSBPsJF-ekUwU4RvNC8aoQl6Asu/exec`
   - **Método**: `POST`
3. Expanda **"Cabeçalhos"** — deixe **vazio** (não adicione nenhum cabeçalho)
4. Em **"Pedir Corpo"** → selecione **JSON**
5. Adicione os pares chave/valor:

| Chave | Valor |
|-------|-------|
| `token` | `minha-chave-financas-2026` (texto fixo) |
| `tipo` | variável `tipo` |
| `categoria` | variável `categoria` |
| `descricao` | variável `descricao` |
| `valor` | variável `valor` |
| `forma_pagamento` | variável `forma_pagamento` |
| `classificacao` | variável `classificacao` |

6. Nova ação → **"Definir Variável"**
   - Nome: `resposta`
   - Valor: variável mágica de **"Conteúdos do URL"** (o resultado do passo acima)

---

### PASSO 8 — Notificação de resultado

1. Nova ação → **"Se"**
   - Entrada: variável `resposta`
   - Condição: **contém**
   - Valor: `ok`

**Dentro do "Se verdadeiro":**

2. Nova ação → **"Mostrar Notificação"**
   - Título: `✅ Lançamento salvo!`
   - Corpo: variável `tipo` + ` · ` + variável `categoria` + ` · R$ ` + variável `valor`

**Dentro do "Caso Contrário":**

3. Nova ação → **"Mostrar Alerta"**
   - Mensagem: `Erro: ` + variável `resposta`

4. Feche com **"Terminar Se"**

---

## Regra de ouro: como usar "Definir Variável" corretamente

Em todos os passos, o **valor** do "Definir Variável" deve ser a **variável mágica** da ação imediatamente acima — não um nome digitado.

Para selecionar a variável mágica:
1. Toque no campo de valor do "Definir Variável"
2. Toque no ícone de variáveis (parte inferior da tela)
3. Role até encontrar a ação desejada (ex: "Escolher de Lista", "Pedir Texto")
4. Toque nela — aparece como um chip colorido com o ícone da ação

Isso garante que o valor capturado em cada passo seja passado corretamente para o POST.

---

## Adicionar à Tela Inicial

1. Com o Shortcut aberto, toque nos **···** (canto superior direito)
2. Toque em **"Adicionar à Tela de Início"**
3. Escolha um ícone e nome (ex: **💰 Gastos**)
4. Toque em **"Adicionar"**
