# Divisor de Conta de Restaurante (PWA)

Aplicação simples e responsiva para **dividir conta de restaurante** de forma justa entre amigos/colegas de trabalho.

Você informa:

- Quem participou
- Quais itens foram consumidos
- Quem consumiu cada item
- Taxa de serviço (%)

E o app calcula automaticamente **quanto cada pessoa deve pagar**, com **taxa de serviço proporcional ao consumo**.

Além disso, o projeto está configurado como uma **PWA (Progressive Web App)**, podendo ser instalado como “appzinho” no celular.

---

## ✨ Funcionalidades

- 👥 **Cadastro de pessoas**
    - Adição e remoção de pessoas
    - Foco automático no campo de nome ao adicionar uma nova pessoa

- 🍽️ **Itens da conta**
    - Adição e remoção de itens
    - Nome do item e valor total
    - Campo de valor inicia **em branco** (sem “0”) para digitação
    - Seleção de quem consumiu cada item (chips clicáveis por pessoa)
    - Botões **“Todos”** e **“Nenhum”** por item

- 💸 **Cálculo da divisão**
    - Cada item é dividido igualmente entre os marcados como consumidores
    - Taxa de serviço (%) aplicada **proporcionalmente ao consumo de cada pessoa**
    - Tabela de resultado com:
        - Nome
        - Consumo
        - Taxa de serviço
        - Total
    - Resumo com:
        - Subtotal dos itens
        - Total da taxa de serviço
        - Total geral
    - Aviso sobre possíveis diferenças de centavos por causa de arredondamento

- 🧹 **Qualidade de uso**
    - Botão **“Limpar tudo”** (reseta pessoas, itens e resultado)
    - Botão **“Carregar exemplo”** com um caso real preenchido
    - Interface responsiva: funciona bem em **celular** e **desktop**
    - Foco automático:
        - Ao adicionar pessoa → foco no campo de nome
        - Ao adicionar item → foco no campo de nome do item

- 📱 **PWA (Progressive Web App)**
    - Manifesto configurado (`manifest.webmanifest`)
    - Service Worker simples com cache básico (`service-worker.js`)
    - Pode ser instalado na tela inicial do celular
    - Funciona offline com a versão em cache

---

## 🗂 Estrutura de arquivos

```bash
.
├── icons
│   ├── icon-192.png       # Ícone PWA 192x192
│   └── icon-512.png       # Ícone PWA 512x512
├── index.html             # App principal (HTML + CSS + JS)
├── manifest.webmanifest   # Manifesto PWA
└── service-worker.js      # Service Worker p/ cache e modo offline
````

---

## 🚀 Como rodar localmente

### 1. Requisitos

* Qualquer navegador moderno (Chrome, Edge, Firefox, etc.)
* Para funcionar como PWA (service worker), abrir via **HTTP**, não via `file://`.

### 2. Subindo um servidor local simples (com Python)

Dentro da pasta do projeto, rode:

```bash
# Se tiver Python 3 instalado
python -m http.server 8000
```

Depois acesse no navegador:

```text
http://localhost:8000
```

A partir daí:

* O **service worker** será registrado
* O app já poderá funcionar **offline** (dentro das limitações do cache configurado)

> 💡 Abrir diretamente o `index.html` clicando no arquivo (começando com `file://`) **não** permite registrar service worker nem PWA.

---

## 📲 Instalando como PWA no celular

Depois de hospedar ou rodar o servidor:

1. Acesse a URL do app no navegador do celular (ex.: `http://seu-ip:8000` ou a URL hospedada com HTTPS).
2. No Android (Chrome/Edge):

    * Pode aparecer um banner “Adicionar à tela inicial” **ou**
    * No menu ⋮ selecione **“Instalar app”** ou **“Adicionar à tela inicial”**.
3. Após instalar, o app:

    * Abre em tela cheia
    * Aparece junto com outros apps
    * Usa o ícone definido em `icons/icon-192.png` / `icon-512.png`.

> ⚠️ Para funcionamento completo como PWA **em produção**, é recomendado servir o app via **HTTPS**
> (GitHub Pages, Netlify, Vercel, etc. já oferecem isso gratuitamente).

---

## 🌐 Publicando em produção (opcional)

Você pode publicar esse projetinho em qualquer serviço de **hosting estático**, por exemplo:

* **GitHub Pages**
* **Netlify**
* **Vercel**
* Cloudflare Pages, etc.

Basta enviar estes arquivos:

* `index.html`
* `manifest.webmanifest`
* `service-worker.js`
* pasta `icons/` com os PNGs

Certifique-se de que:

* O `manifest.webmanifest` está acessível (ex.: `https://seusite.com/manifest.webmanifest`)
* O `service-worker.js` está na mesma pasta do `index.html`
* Os caminhos no `manifest.webmanifest` e no `index.html` para os ícones estão corretos.

---

## 🧠 Tecnologias usadas

* **HTML5** (marcação da página)
* **CSS puro** (layout responsivo, dark theme)
* **JavaScript Vanilla** (sem frameworks)

    * Manipulação de DOM
    * Lógica de divisão da conta
    * Cálculo de taxa proporcional
* **PWA**

    * `manifest.webmanifest`
    * `service-worker.js`

---

## 🛠 Ideias de melhorias futuras

* Salvar automaticamente o último estado no `localStorage`
* Atalhos para:

    * “Duplicar item” (ótimo para bebidas repetidas)
    * “Marcar/Desmarcar linha inteira rápido”
* Suporte a **descontos** ou **cupons**
* Modo **claro/escuro** alternável

---

## 📄 Licença

Use à vontade nos seus almoços, jantares, churrascos e rodízios 😄
Se for compartilhar ou modificar, só mantenha os créditos originais quando fizer sentido.