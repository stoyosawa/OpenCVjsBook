/** <canvas> でマウス操作で矩形領域を選択し、(x, y, width, height) を regionselect カスタムイベント経由で返す。
 * 操作は、左マウスボタン押下でドラッグ。マウスを上げるとカスタムイベントが発生する。
 */
class RegionSelect {

	/** コンストラクタ
	 * @param {string} imageTag - <img> のIDタグ
	 */
  constructor(imageTag) {
    this.imgElem = document.getElementById(imageTag);
    this.divElem = this.imgElem.parentElement;

    let imgWidth = this.imgElem.offsetWidth;
    let imgHeight = this.imgElem.offsetHeight;

    this.divElem.style.position = 'relative';

    this.canvasElem = document.createElement('canvas');
    this.ctx = this.canvasElem.getContext('2d');
    this.divElem.appendChild(this.canvasElem);

    this.canvasElem.width = imgWidth;
    this.canvasElem.height = imgHeight;
    this.canvasElem.style.position = 'absolute';
    this.canvasElem.style.top = '0px';
    this.canvasElem.style.left = '0px';
    this.canvasElem.style.backgroundColor = 'transparent';
    this.canvasElem.style.zIndex = 2;

    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.mouseState = undefined;

    this.canvasElem.addEventListener('mousedown', () => this.mouseDown(event));
    this.canvasElem.addEventListener('mousemove', () => this.mouseMove(event));
    this.canvasElem.addEventListener('mouseup', () => this.mouseUp(event));
  }

  drawRectangle() {
    this.ctx.reset();
    this.ctx.setLineDash([5]);
    this.ctx.strokeStyle = 'white';
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  mouseDown(evt) {
    if (this.mouseState === undefined) {
      this.mouseState = 'down';
	    this.x = evt.offsetX;
	    this.y = evt.offsetY;
	    this.width = this.height = 0;
	  }
  }

  mouseMove(evt) {
  	if (this.mouseState === 'down') {
      this.width = evt.offsetX - this.x;
      this.height = evt.offsetY - this.y;
      this.drawRectangle();
  	}
  }

  mouseUp(evt) {
  	if (this.mouseState === 'down') {
      this.mouseState = undefined;
      let rect = [this.x, this.y, this.width, this.height];
      let regionSelect = new CustomEvent('regionselect', {detail: rect});
      this.imgElem.dispatchEvent(regionSelect);
  	}
  }

} // end of class
