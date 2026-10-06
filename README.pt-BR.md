# Fio Motion

Um editor de animação 2D para Windows, criado por JustyPixels. Importe as peças do personagem, conecte braços, pernas e acessórios, e anime com pins, ossos e keyframes.

O Fio Motion funciona offline e tem todos os recursos desbloqueados. Não precisa de conta.

## Baixar

[Baixe o instalador ou a versão portátil](https://github.com/JustyPixels/fio-motion/releases). O arquivo `support.zip` inclui personagens de exemplo, guias e notas de compatibilidade.

A versão atual é **1.0.0-rc.1**, uma candidata para testes. Os executáveis ainda não têm assinatura digital, então o Windows pode exibir um aviso ao abrir. Os testes pendentes e as limitações estão nas [notas da versão](docs/RELEASE-NOTES.md).

## Como funciona

- **Rig:** importe PNG, JPEG, WebP ou PSD, monte o personagem e ajuste suas articulações. Você pode conectar as peças à mão ou usar o assistente humanoide.
- **Animate:** crie poses na timeline, ajuste as curvas de movimento e reutilize animações. Os novos keyframes já usam transições suaves.
- **Assemble:** organize cenas, adicione áudio e movimentos de câmera, e exporte MP4 ou sequências PNG com transparência.

O visualizador mantém a proporção do projeto, inclusive 16:9, 4:3, 1:1 e 9:16. A interface está disponível em português brasileiro, inglês, espanhol, francês, alemão, japonês e chinês simplificado.

Para começar, abra o exemplo da raposa na tela inicial ou siga o [guia rápido em português](docs/quick-start/pt-BR.md). Os projetos são salvos em `.puppet`; os arquivos das betas anteriores continuam compatíveis.

## Rodar pelo código

Com Node.js instalado:

```powershell
npm ci
npm start
```

O motor WebAssembly já está incluído. Para recompilá-lo ou gerar um instalador, veja as [instruções de build](docs/BUILD.md). A exportação de vídeo também precisa do FFmpeg descrito nesse guia.

## Encontrou um problema?

[Abra uma issue](https://github.com/JustyPixels/fio-motion/issues) com a versão do aplicativo, sua versão do Windows e os passos para reproduzir o problema. Uma imagem ou um projeto pequeno ajudam bastante, desde que não contenham material privado.

[Compatibilidade e limitações](docs/COMPATIBILITY.md) · [Arquitetura](docs/ARCHITECTURE.md) · [Avisos das dependências](THIRD-PARTY-NOTICES.txt)
