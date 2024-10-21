# Safe Zone

**Safe Zone** é uma extensão para o navegador Firefox que ajuda os usuários a avaliar a privacidade das páginas que visitam. Ao analisar diversos aspectos de uma página web, a extensão fornece uma pontuação de privacidade que indica o quão bem a página respeita a privacidade do usuário. Além disso, a extensão detalha informações específicas sobre ameaças potenciais, armazenamento de dados e uso de cookies.

## 🔍 Funcionalidades

- **Detecção de Domínios de Terceira Parte:** Identifica e lista todos os domínios externos que a página está acessando.
- **Identificação de Ameaças de Sequestro de Navegador:** Detecta padrões suspeitos em scripts inline que podem indicar tentativas de sequestro ou hooks maliciosos.
- **Monitoramento do Uso de Armazenamento Local (Local Storage e Session Storage):** Verifica quais chaves estão sendo armazenadas localmente no dispositivo do usuário.
- **Contagem e Classificação de Cookies:** Conta os cookies injetados durante o carregamento da página, diferenciando entre cookies de primeira e terceira parte, bem como entre cookies de sessão e persistentes.
- **Detecção de Canvas Fingerprinting:** Identifica tentativas de rastreamento através da manipulação de elementos Canvas.
- **Pontuação de Privacidade:** Calcula uma pontuação baseada em diversos fatores para indicar o nível de privacidade da página visitada.

## 📋 Como Funciona

### 1. **Detecção de Domínios de Terceira Parte**
A extensão monitora todas as requisições de rede feitas pela página atual. Qualquer domínio que não corresponda ao domínio principal da página é considerado um domínio de terceira parte. Esses domínios são listados na seção correspondente no popup da extensão.

### 2. **Identificação de Ameaças de Sequestro de Navegador**
A extensão analisa os scripts inline presentes na página, procurando por padrões suspeitos como `eval(`, `document.write(`, `onbeforeunload`, `onunload`, `setTimeout(` e `setInterval(`. A presença desses padrões pode indicar tentativas de sequestro ou manipulação do comportamento do navegador.

### 3. **Monitoramento do Uso de Armazenamento Local**
A extensão verifica as chaves armazenadas em `localStorage` e `sessionStorage`. Ela contabiliza quantas chaves estão sendo usadas e quais são elas, fornecendo uma visão clara do quanto a página está armazenando localmente no dispositivo do usuário.

### 4. **Contagem e Classificação de Cookies**
A extensão coleta todos os cookies associados à página, diferenciando-os em:
- **Cookies de Primeira Parte:** Cookies definidos pelo domínio principal da página.
- **Cookies de Terceira Parte:** Cookies definidos por domínios externos acessados pela página.
- **Cookies de Sessão:** Cookies que expiram quando o navegador é fechado.
- **Cookies Persistentes:** Cookies que permanecem armazenados no dispositivo por um período definido.

### 5. **Detecção de Canvas Fingerprinting**
Canvas Fingerprinting é uma técnica de rastreamento que utiliza elementos Canvas para gerar um identificador único para o navegador do usuário. A extensão intercepta métodos como `toDataURL` e `getImageData` para detectar e relatar tentativas de fingerprinting.

### 6. **Pontuação de Privacidade**
A pontuação de privacidade é calculada com base nos seguintes critérios:

- **Domínios de Terceira Parte:** Cada domínio de terceira parte reduz 2.5 pontos.
- **Ameaças Detectadas:** Cada padrão suspeito reduz 1 ponto.
- **Cookies:**
  - Cada cookie total reduz 0.5 pontos.
  - Cada cookie de terceira parte reduz 1 ponto adicional.
- **Canvas Fingerprinting:** A detecção de Canvas Fingerprinting reduz 20 pontos.

A pontuação inicial é de 100 pontos, e as deduções são aplicadas conforme os critérios acima. A pontuação final é arredondada para o número inteiro mais próximo e limitada a um mínimo de 0 pontos.
