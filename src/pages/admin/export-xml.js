import { buildWxr } from '../../utils/wxr-builder.js';

/** Nome e conteúdo do arquivo de backup, com todas as obras informadas (qualquer estado). */
export function buildExportFile(poems, now = new Date()) {
  return { filename: `poemas-${now.toISOString().slice(0, 10)}.xml`, xml: buildWxr({ poems, now }) };
}

/** Baixa um texto como arquivo, sem enviar nada a servidor. */
export function downloadTextFile(filename, text, mimeType = 'application/xml') {
  const url = URL.createObjectURL(new Blob([text], { type: `${mimeType};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Gera o XML (WXR 1.2) de todas as obras e inicia o download. Devolve a quantidade exportada. */
export function exportPoemsXml(poems) {
  const { filename, xml } = buildExportFile(poems);
  downloadTextFile(filename, xml);
  return poems.length;
}
