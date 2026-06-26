# Guia — Criar o Shortcut no iPhone

## Pré-requisitos
- iPhone com iOS 15 ou superior
- App **Atalhos** (Shortcuts) instalado — vem nativo no iPhone
- URL do Web App e token (obtidos no [setup.md](./setup.md))

---

## Criar o Shortcut passo a passo

### 1. Abrir o app Atalhos

Abra o app **Atalhos** no iPhone e toque em **"+"** (canto superior direito) para criar um novo atalho.

Toque no nome e renomeie para **"💰 Lançar Gasto"**.

---

### 2. Adicionar ação: Tipo do lançamento

1. Toque em **"Adicionar Ação"**
2. Busque por **"Escolher na lista"**
3. Configure:
   - **Itens da lista**: `Despesa` / `Receita`
   - **Solicitar**: `Tipo`
4. Toque em **"Adicionar ao Atalho de Tela de Início"** no resultado e renomeie a variável para **`tipo`**

---

### 3. Adicionar ação: Categoria

1. Toque em **"+"** para nova ação
2. Busque **"Escolher na lista"**
3. Configure:
   - **Itens**: `Alimentação`, `Transporte`, `Lazer`, `Saúde`, `Casa`, `Outros`
   - **Solicitar**: `Categoria`
4. Renomeie a variável de saída para **`categoria`**

---

### 4. Adicionar ação: Descrição (opcional)

1. Nova ação → busque **"Pedir texto"**
2. Configure:
   - **Solicitar**: `Descrição (opcional)`
   - **Entrada padrão**: deixe vazio
3. Renomeie a variável para **`descricao`**

---

### 5. Adicionar ação: Valor

1. Nova ação → busque **"Pedir número"**
2. Configure:
   - **Solicitar**: `Valor (R$)`
3. Renomeie a variável para **`valor`**

---

### 6. Adicionar ação: Forma de pagamento

1. Nova ação → busque **"Escolher na lista"**
2. Configure:
   - **Itens**: `Pix`, `Débito`, `Crédito`, `Dinheiro`
   - **Solicitar**: `Forma de pagamento`
3. Renomeie a variável para **`forma_pagamento`**

---

### 7. Adicionar ação: Enviar para a API

1. Nova ação → busque **"Obter conteúdo de URL"**
2. Configure:
   - **URL**: cole a URL do seu Web App
   - **Método**: `POST`
3. Toque em **"Mostrar mais"** e ative **"Cabeçalhos de solicitação"**:
   - Chave: `Content-Type` / Valor: `application/json`
4. Ative **"Corpo da solicitação"** → selecione **JSON**
5. Adicione os seguintes pares chave/valor (toque em **"+"** para cada um):

| Chave | Valor |
|-------|-------|
| `token` | `SUA_CHAVE_AQUI` (texto fixo) |
| `tipo` | variável `tipo` |
| `categoria` | variável `categoria` |
| `descricao` | variável `descricao` |
| `valor` | variável `valor` |
| `forma_pagamento` | variável `forma_pagamento` |

6. Renomeie a variável de saída para **`resposta`**

---

### 8. Adicionar ação: Notificação de sucesso/erro

1. Nova ação → busque **"Se"** (condicional)
2. Configure:
   - **Entrada**: variável `resposta`
   - **Condição**: `contém`
   - **Valor**: `"ok"`
3. Dentro do bloco **"Se verdadeiro"**:
   - Adicione ação **"Mostrar notificação"**
   - **Título**: `✅ Lançamento salvo!`
   - **Corpo**: `[tipo] · [categoria] · R$ [valor]` (insira as variáveis tocando nelas)
4. Dentro do bloco **"Caso contrário"**:
   - Adicione ação **"Mostrar alerta"**
   - **Mensagem**: `Erro: [resposta]`

---

## Adicionar à Tela Inicial

Para acesso com 1 toque:

1. Com o Shortcut aberto, toque nos **3 pontos** (···) no canto superior direito
2. Toque em **"Adicionar à Tela de Início"**
3. Escolha um ícone e nome (ex: **💰 Gastos**)
4. Toque em **"Adicionar"**

Um ícone aparecerá na sua tela inicial — toque nele para lançar um gasto em segundos.

---

## Atalhos rápidos (variações)

Você pode duplicar o Shortcut e pré-definir valores para lançamentos frequentes:

| Nome | Pré-definição |
|------|--------------|
| ☕ Café | Tipo = Despesa, Categoria = Alimentação |
| 🚗 Gasolina | Tipo = Despesa, Categoria = Transporte |
| 💼 Salário | Tipo = Receita, Categoria = Outros |

Para pré-definir: no passo da lista, ative **"Selecionar múltiplos"** como `false` e defina um valor padrão, ou simplesmente remova esse passo e passe o valor fixo direto no JSON do passo 7.

---

## Dicas de uso

- O Shortcut funciona com a tela bloqueada se você habilitar **"Mostrar na tela bloqueada"** nas configurações do atalho.
- Use o widget de Atalhos na tela inicial para acesso ainda mais rápido.
- O lançamento aparece na planilha em tempo real — sem precisar abrir nenhum app.
