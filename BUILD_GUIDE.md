# Guia de Instalação e Build - AngoLife

O AngoLife pode ser instalado de duas formas principais: como **PWA** (instalação via browser) ou como **App Nativo** (via Capacitor).

## 1. Instalação via Browser (PWA)

Esta é a forma mais rápida. Basta aceder ao URL do seu site (após deploy) e:

- **Android/Chrome:** Clique nos 3 pontos e selecione **"Instalar Aplicativo"**.
- **iOS/Safari:** Clique no botão de **Partilhar** e selecione **"Adicionar ao Ecrã Principal"**.
- **Desktop:** Clique no ícone de instalar na barra de endereços do Chrome.

---

## 2. Build Nativo (Android / iOS)

Como o projecto já tem o Capacitor configurado, siga estes passos no seu terminal:

### Preparação

```bash
# 1. Gerar os ficheiros web otimizados
npm run build

# 2. Sincronizar os ficheiros com o Capacitor
npx cap sync
```

### Para Android

```bash
# 3. Adicionar plataforma se ainda não existir
npx cap add android

# 4. Abrir no Android Studio para gerar o APK/AAB
npx cap open android
```

### Para iOS (Mac Requerido)

```bash
# 3. Adicionar plataforma se ainda não existir
npx cap add ios

# 4. Abrir no Xcode para compilar
npx cap open ios
```

> [!TIP]
> Use o comando `npx cap copy` sempre que fizer alterações apenas no código web, e `npx cap sync` se adicionar plugins nativos.
