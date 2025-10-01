# MyMovie - Frontend

Passo a passo pra executar localmente

Passo 1 - Instalar o pnpm

Usando npm:
npm install -g pnpm@latest-10

Ou um desse métodos:
https://pnpm.io/installation

Passo 2 - Instalar as dependências

Na raiz do projeto:
pnpm install

Passo 3 - Configurar o ambiente pra executar no celular

Passo 3.1 - Instalar SDK17 do Java

No powershell (talvex precise ser como administrador):
choco install -y microsoft-openjdk17

Passo 3.2 - Instalar o Android Studio
Link: https://developer.android.com/studio?hl=pt-br
Só clicar next, next pra tudo, e instalar tudo o que ele recomendar por padrão

Passo 3.3 - Adicionar váriavel de ambiente ANDROID_HOME
Criar variável de ambiente ANDROID_HOME apontando pra C:/Users/<username>/AppData/Local/Android/Sdk

Passo 3.4 - Adicionar o platform-tools ao Path do sistema
Adicionar C:/Users/<username>/AppData/Local/Android/Sdk ao Path

Para verificar se deu certo, rodar esse comando no powershell
adb

Passo 4 - Ativar a depuração via USB no celular

Cada celular é diferente, mas normalmente é em configurações -> sobre o telefone -> clicar 5 vezes em cima da versão do sistema -> opções de desenvolvedor -> ativar depuração USB

Pra testar, conectar o celular ao PC via usb e rodar no terminal:
adb devices

É pra aparecer algo do tipo:
List of devices attached
JV4DRS5DXG6TOJHE        device

Passo 5 - Gerar a build de desenvolvimento

Executar na pasta raiz do projeto:
pnpm android

Talvez precise instalar o expo-dev-client antes do comando anterior
npx expo install expo-dev-client

O pnpm android demora uns 15 minutos, é normal

Passo 6 - Rodar a build de desenvolvimento

Executar no terminal:
pnpm start

Conectar o celular no PC

Depois que começar a rodar, apertar a no terminal pra abrir o app no celular
Se der um erro "activity not started": desinstalar o expo-dev-client, remover o node_modules e rodar pnpm install de novo

