/** HTMLImageElement.src に代入できる SOUND ONLY の画像データURL を返します。
 * @param {number} w - 画像の幅（px）
 * @param {number} h - 画像の高さ（px）
 * @param {number} fontSize - フォントのサイズ（px）
 * @returns {string} DataURL（Base64）
 */
function soundOnly(w=320, h=240, fontSize=48) {
  let canvasElem = document.createElement('canvas');
  canvasElem.width = w;
  canvasElem.height = h;
  let ctx = canvasElem.getContext('2d');

  let text = 'SOUND ONLY';
  let color = 'rgb(252, 0, 0)';

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h);

  ctx.font = `bold ${fontSize}px "Helvetica"`;
  ctx.letterSpacing = `-${fontSize/16}px`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3.0;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 11;
  ctx.strokeText('SOUND ONLY', w/2, h/2);

  return canvasElem.toDataURL();
}
