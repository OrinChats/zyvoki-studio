# Zyvoki Studio v6 — suporte a projetos multimídia

O importador aceita recursos PNG, JPEG, WebP, SVG, GIF, MP4, WebM, GLB, GLTF, BIN, HDR, KTX2 e fontes WOFF/WOFF2 em `film/`.

## Contrato do motor

O ZIP deve conter `film/index.html`, scripts locais e áudio opcional `narration.mp3`. O HTML precisa disponibilizar `window.READY=true`, `window.END=<segundos>` e `window.seek(t)`, além de desenhar o frame em um canvas (`id="c"` recomendado). O Studio copia o canvas para a prévia e a gravação WebM. Um renderizador WebGL (por exemplo Three.js) pode usar esse canvas, mas precisa ser incluído pelo projeto; o Studio não transforma automaticamente arquivos GLB em cenas.

## Recursos

O importador cria URLs blob para recursos no ZIP e disponibiliza `window.zyvokiAsset('models/soldado.glb')` e `window.ZYVOKI_ASSETS`. Assim, um motor Three.js com GLTFLoader pode carregar o GLB. Referências diretas entre aspas no HTML são reescritas; URLs dentro de JS devem passar por `zyvokiAsset`. GLTF com arquivos externos precisa ter suas dependências resolvidas pelo motor; prefira GLB autossuficiente.

## Recomendações

- Criar modelos, texturas e cenários fora do Studio, exportando GLB.
- Usar uma biblioteca 3D incluída no próprio projeto e renderização WebGL em canvas.
- Mapas com latitude norte para cima, verificando projeção e coordenadas.
- Fotos e pinturas históricas com créditos e datas; reconstituições identificadas.
- Para grandes projetos, testar limites de memória e GPU no Android.

## Limitações

Não inclui editor 3D, GLTFLoader, Three.js ou conversor MP4. O navegador grava WebM. A sincronização de animações WebGL depende de implementação correta de `seek(t)` no projeto. Projetos grandes podem falhar no celular.
