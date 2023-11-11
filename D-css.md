### 付録D CSS

本書コードで用いたCSSの設定です（`style.css`）。いずれもちょっとした見栄えの向上のためのもので、OpenCVの機能性に関わるものではありません。

```css
[File] style.css
  1  /* Body */
  2  body {
  3     background-color: AliceBlue;
  4     color: Indigo;
  5  }
  6
  7  /* ページタイトル */
  8  h1 {
  9     font-size: 20px;
 10     color: DarkSlateBlue;
 11  }
 12
 13  /* キャンバスなど画像を表示するエリアの輪郭線 */
 14  .placeholder {
 15     outline: 2px gray dotted;               /* 周囲に点線で枠 */
 16  }
 17
 18  /* <div> を横並びにする */
 19  div.inline {
 20     display: inline-block;
 21  }
 22
 23  /* <input> で変更される値を <span> でくくって示すとき、その値を目立たせる。 */
 24  span.currentValue {
 25     color: DarkMagenta;
 26     background-color: MistyRose;
 27     padding: 3px 12px 3px 12px;
 28     border-radius: 5px;
 29  }
 30
 31  /* <input type="button"> ボタンを目立たせる */
 32  input[type="button"].click {
 33     color: LightBlue;
 34     border-width: 0px;
 35     border-radius: 5px;
 36     background-color: DarkCyan;
 37     padding: 10px;
 38     margin-left: 1em;
 39  }
 40
 41  /* 要素を隠す */
 42  .hide {
 43     display: none;
 44  }
```