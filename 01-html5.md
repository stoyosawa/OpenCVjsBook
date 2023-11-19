## 第1章 HTML5の画像・ビデオ・カメラの入出力

C/C++やPythonのものとは異なり、OpenCV.jpには画像の読み込みや表示といった入出力機能がありません。HTML5がすでに提供しているからです。カメラも同様です。

本章では、HTML5における画像・ビデオ・カメラのハンドリング方法を説明します。具体的には`<img>`、`<video>`、`<canvas>`、`<track>`要素とそれらのDOMオブジェクト、それと描画コンテクスト（`CanvasRenderingContext2D`）です。属性・プロパティ、メソッド（関数）、イベントについては本書のスクリプティングの範囲で必要なもののみ取り上げます。また、ビデオ・カメラをフレーム単位で処理する方法も示します。

CSSは少しだけ用いますが、主として見栄えの調整のためなので、画像処理の本質には直接影響しません。使用するCSSファイル（`style.css`）は[付録D](./D-css.md "INTERNAL")に掲載しました。



### 1.1 画像処理の流れ

WebページでのOpenCVの画像処理の流れを次図から示します。

<!-- 544 x 277 ODG ファイルに原画あり -->
<img src="Images/Ch01/html-image-processing.png" height="150">

OpenCVが提供するのは中央の画像処理のメカニズムだけです。左右の画像やビデオの入出力にはHTML5の機能を用います。

①入力。画像は`<img src>`で読み込みます。ビデオあるいはカメラなら`<video src>`です。入力のステップにはビデオをフレーム単位に分解する処理も含まれます。フレーム処理の方法は[1.9節](#19-ビデオをフレーム単位で取得する "INTERNAL")で説明します。

②処理。入力画像は`<script>`内のOpenCVスクリプトで処理します。本章のコードは入力画像を未処理のまま次のステップに引き渡します。画像処理は[第3章](./03-opencv.md "INTERNAL")以降で説明します。

③処理が完了したら、結果の画像を`<canvas>`に貼り付けます。

本章では①と③を、HTML要素とそれに対応するDOMオブジェクトを確認しながら説明していきます。



### 1.2 画像をキャンバスに表示する

#### 目的

読み込んだ画像をそのままキャンバスに貼り付けます。

技術的には、`<img>`に読み込んだ画像をそのまま`<canvas>`に貼り付ける`CanvasRenderingContext2D.drawImage()`の用法を示します。画像にはそのサイズを示すプロパティがいくつかありますが、その違いについても説明します。

実行例を次の画面に示します。

<img src="Images/Ch01/html-image-1.png">

左が読み込んだ画像を表示する`<img>`で、右がそのコピーを貼り付けた`<canvas>`です。キャンバスにはその領域が目視できるように点線の枠を付けてありますが、これはCSSによる見栄えの調整なだけで、本質とは無関係です（枠線のスタイルは`outline: 2px gray dotted;`です）。

画像ファイル名はハードコードしてあるので、好みの画像に変更してください（12行目）。［ファイルを開く］ダイアログボックスからローカルファイルから選択するユーザインタフェースは[2.1節](./02-ui.md#21-ローカルファイルを選択する "INTERNAL")で説明します。

#### コード

コード`html-image.html`を次に示します。

<!-- 動作確認（✔️❌）： Local/Normal Firefox✔️ Chrome✔️ Edge✔️, Local/CORS Firefox Chrome Edge, HTTP Firefox Chrome Edge -->
```html
[File] html-image.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>画像をキャンバスに表示する</h1>
 10
 11  <div>
 12    <img id="imageTag" width="320" src="samples/sheep.jpg"/>
 13    <canvas id="canvasTag" class="placeholder"></canvas>
 14  </div>
 15
 16  <script>
 17    let imgElem = document.getElementById('imageTag');
 18    let canvasElem = document.getElementById('canvasTag');
 19    let ctx = canvasElem.getContext('2d');
 20
 21    function showImage() {
 22      ['width', 'height',
 23       'clientWidth', 'clientHeight',
 24       'offsetWidth', 'offsetHeight',
 25       'naturalWidth', 'naturalHeight'].forEach(function(d) {
 26        console.log(`img.${d}: ${imgElem[d]}, canvas.${d}: ${canvasElem[d]}`);
 27      });
 28      canvasElem.width = imgElem.width;
 29      canvasElem.height = imgElem.height;
 30      ctx.drawImage(imgElem, 0, 0, imgElem.width, imgElem.height);
 31    }
 32
 33    imgElem.addEventListener('load', showImage);
 34  </script>
 35
 36  </body>
 37  </html>
```

#### img要素

HTMLページに画像ファイルを取り込むには`<img>`要素を使います（12行目）。ファイルのURLは`src`属性から指定します。

```html
12    <img id="imageTag" width="320" src="samples/sheep.jpg"/>
︙
17    let imgElem = document.getElementById('imageTag');
```

`src`以外の属性はオプションです。ここでは、画像横幅を`width`属性から320ピクセルに設定しています。高さ指定の`height`は未指定ですが、もともとの画像のアスペクト比に準じて調整されます。この実行例では、もともとの画像のサイズが1280×885なので、高さは1/4の221ピクセルに縮小されます。

スクリプティングで必須なのは、`<img>`要素を特定する`id`属性です。対応するDOMオブジェクト（`HTMLImageElement`）は、この`id`属性を介して`document.getElementById()`関数から取得できます（17行目）。

#### HTMLImageElementのイベント

画像が読み込まれれば`load`イベントが発生します。読み込みが完了するまでは、画像に関連した処理はできません。たとえば、画像を収容するOpenCVの`cv.Mat`オブジェクトを画像と同じサイズで生成するとき、読み込み完了以前ではサイズが不明なため、エラーが発生します。そこで、`load`イベントの発生を契機に処理を開始するようにします。この段取りをしているのが、33行目の`addEventListener()`です。

```javascript
 17    let imgElem = document.getElementById('imageTag');
 ︙
 33    imgElem.addEventListener('load', showImage);
```

`load`イベントが`HTMLImageElement`（変数は17行目で定義した`imgElem`）で発生したら、`showImage()`関数を実行するよう登録しています。

#### canvas要素

`<img>`で取り込んだ画像のコピーを貼り付ける領域（キャンバス）は、`<canvas>`要素から用意します（13行目）。`<img>`要素同様、`id`属性にセットした識別子から対応するDOM（`HTMLCanvasElement`オブジェクト）も用意します（18行目）。

```html
13    <canvas id="canvasTag" class="placeholder"></canvas>
︙
18    let canvasElem = document.getElementById('canvasTag');
```

`width`や`height`の属性を指定していないので、ページ上ではデフォルトの300×150のスペースが確保されます。次の画面は画像がコピーされる前の初期状態です。キャンバスサイズがデフォルトのままなのが枠線からわかります。

<img src="Images/Ch01/html-image-2.png">

#### 描画コンテクスト
<!-- Wikipedia は「コンテキスト」のほうが多いと言っているが、あたしは自然には「コンテクスト」と打つので、そちらを採用。無理に「キ」にすると、揺れが多すぎる。-->

キャンバスに対する操作は、キャンバスの描画コンテクストを介して行います。「コンテクスト」（文脈）はやや意味不明瞭ですが、仮想的なキャンバスと考えてください。ここに画像を貼り付けたりグラフィックスを描画したりすると、`<canvas>`というビューファインダーからそれらが見えるようになるという塩梅です。

描画コンテクストは、`HTMLCanvasElement`の`getContext()`関数から取得します（19行目）。

```javascript
 19      let ctx = canvas.getContext('2d');
```

引数には5つほど選択肢がありますが、2次元での描画では2dで決め打ちです。戻り値は`CanvasRenderingContext2D`というオブジェクトです。

#### 画像のコピー

画像の読み込み完了とともに起動する`showImage()`（21～31行目）は、`HTMLImageElement`（`<img>`）の画像を描画コンテクストにコピーします。コピーするのは`CanvasRenderingContext2D`の`drawImage()`関数です（30行目）。

```javascript
 30      ctx.drawImage(imgElem, 0, 0, imgElem.width, imgElem.height);
```

第1引数には、コピー元の画像オブジェクトを指定します。ここでは`HTMLImageElement`オブジェクトです。

第2引数と第3引数には、その画像を貼り付けるキャンバス内での(x, y)座標を指定します。ここでは(0, 0)を指定しているので、キャンバスと画像の左上の位置は一致します。

第4引数と第5引数には、貼り付けるサイズを指定します。ここでは、ページ上での`<img>`と同じサイズを用いたいので、`imgElem.width`と`imgElem.height`を指定しています。

ここでは5変数のタイプを使いましたが、関数には3引数版と9引数番の者もあります。次に5引数版も含めて書式を示します。

```javascript
drawImage(image, dx, dy)
drawImage(image, dx, dy, dWidth, dHeight)
drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
```

`dx`、`dy`、`dWidth`、`dHeight`が`<canvas>`上の座標とサイズ（`d`はコピー先のdestinationの略）、`sx`、`sy`、`sWidth`、`sHeight`が`<img>`上の座標とサイズです（`s`はコピー元のsource）。9引数版からコピー元情報を`<img>`全体としたものが5引数版、そこからさらにコピー先情報のサイズをキャンバスサイズとしたものが3引数版です。9引数版は[1.3節](#13-部分領域をキャンバスに表示する "INTERNAL")で扱います。

#### いろいろなサイズ

画像やキャンバスにはサイズを示す複数のプロパティがあります。22～27行目は、参考までにこれをコンソールに印字しています。

```javascript
 22      ['width', 'height',
 23       'clientWidth', 'clientHeight',
 24       'offsetWidth', 'offsetHeight',
 25       'naturalWidth', , 'naturalHeight'].forEach(function(d) {
 26        console.log(`img.${d}: ${imgElem[d]}, canvas.${d}: ${canvasElem[d]}`);
 27      });
```

プロパティには、通常の`width`と`height`とともに、client、offset、naturalが先付けされたものがあります（scrollもあるが割愛）。これらの意味を次の表に示します。横幅と高さで意味は同じなので、表には`width`のもののみ記しています。

プロパティ | 意味
---|---
`width` | HTML要素の属性で指定された、ページ上に表示される画像のサイズ。
`clientWidth` | `width`にパディング（`padding`）を含んだサイズ。
`offsetWidth` | `clientWidth`にさらに枠線（`border`）を含んだサイズ。
`naturalWidth` | 読み込んだ画像のもともとのサイズ。

本節のコードでは`<img>`にパディングも枠線も含んでいないので、上の3点の違いがわかりません。そこで、次の2行を19行目の下に加え、パディングを周囲に20pxずつ加え、幅10pxの枠線で囲みます。

```javascript
 20    imgElem.style.padding = '20px';
 21    imgElem.style.border = '10px dashed purple';
```

出力結果を次に示します。

```
img.width: 320, canvas.width: 300
img.height: 221, canvas.height: 150
img.clientWidth: 360, canvas.clientWidth: 300
img.clientHeight: 261 canvas.clientHeight: 150
img.offsetWidth: 380, canvas.offsetWidth: 300
img.offsetHeight: 281, canvas.offsetHeight: 150
img.naturalWidth: 1280, canvas.naturalWidth: undefined
img.naturalHeight: 885, canvas.naturalHeight: undefined
```

client付きはパディングが上下左右に加わるので、40ピクセル増えます（320→360）。offset付きはさらに枠線の幅が加わるので、そこから20ピクセル増えます（→380）。HTML要素取り囲む余白にはマージン（`margin`）もありますが、これは要素の外側なので画像サイズには寄与しません。

natural付きは読み込んだもともとの画像のサイズです。出力結果から、`<img>`に表示されたものは1/4に縮小されていることがわかります。なお、`<canvas>`には`natural`付きは定義されていないので、`undefined`になります。

`<canvas>`にはサイズ属性を設定してなかったので、値はデフォルトの300×150です。このデフォルト状態のまま`<img>`を`<canvas>`にコピーすると、は320×221だった画像が左上を揃えたうえでキャンバスサイズで切り取られます。このため、下部の71ピクセルと右の20ピクセルが、次の画面のようにクリッピングされます。

<img src="Images/Ch01/html-image-3.png">

`<img>`と同じものを`<canvas>`に貼り付けるには、キャンバスのサイズを揃えます（25～26行目）。

```JavaScript
 25      canvasElem.width = imgElem.width;
 26      canvasElem.height = imgElem.height;
```

13行目の`<canvas>`属性に、次のように`width="320" height="221"`と記述してもかまいません。

```html
 13    <canvas id="canvasTag" width="320" height="221" class="placeholder">
   </canvas>
```

横縦両方指定するところに注意してください。`<img>`と異なり、未指定側は自動調節されないので、値はデフォルトのままです。`width="320"`単体での指定はつまり320×150となるので、下部分が次の画面のようにクリッピングされます。前の300×150の画面とは微妙にしか違いませんが、横幅が同じなので、右端の稜線や湖手前の樹が20ピクセルぶん多く含まれます。

<img src="Images/Ch01/html-image-4.png">

`<video>`では`height`プロパティが自動計算されません。したがって、高さには`clientHeight`あるいは`offsetHeight`を使うか、フレームのアスペクト比から計算しなければなりません（[1.4節](#14-ビデオを表示する "INTERNAL")参照）。



### 1.3 部分領域をキャンバスに表示する

#### 目的

`<img>`から部分領域を切り取り、`<canvas>`にリサイズして貼り付けます。

技術的には、描画コンテクストの`drawImage()`関数が話題という点では前節と同じ内容ですが、先ほど軽く触れた変数の扱いによっては、`<canvas>`に貼り付けられる部分領域が（見かけ上）拡大縮小されたり、部分的にクリッピングされることを示します。

実行例を次の画面に示します。

<!-- 枠なし版あり -->
<img src="Images/Ch01/html-partial-1.png">

読み込んだもともとの画像のサイズは1280x854です。左の`<img>`では`widht="320"`からサイズ指定をしているので、1/4に縮小されて表示されます。中央の`<canvas>`は、元画像で白枠でくくった部分を縮小前のサイズで示しています。右の`<canvas>`では縮小前の1/2（`<img>`の倍）で同じ枠内の部分画像を表示しています。

#### コード

コード`html-partial.html`を次に示します。

```html
[File] html-partial.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>部分領域をキャンバスに表示する</h1>
 10
 11  <div>
 12    <img id="imageTag" width="320" src="samples/cows.jpg"/>
 13    <canvas id="canvasTag1" class="placeholder"></canvas>
 14    <canvas id="canvasTag2" class="placeholder"></canvas>
 15  </div>
 16
 17  <script>
 18    let imgElem = document.getElementById('imageTag');
 19    let canvasElem1 = document.getElementById('canvasTag1');
 20    let ctx1 = canvasElem1.getContext('2d');
 21    let canvasElem2 = document.getElementById('canvasTag2');
 22    let ctx2 = canvasElem2.getContext('2d');
 23
 24    let [x_img, y_img, w_img, h_img] = [389, 418, 316, 255];
 25
 26    function showImage() {
 27      canvasElem1.width = w_img;
 28      canvasElem1.height = h_img;
 29      ctx1.drawImage(imgElem,
 30        x_img, y_img, w_img, h_img,
 31        0, 0, w_img, h_img
 32      );
 33
 34      canvasElem2.width = Math.floor(w_img * 0.5);
 35      canvasElem2.height = Math.floor(h_img * 0.5);
 36      ctx2.drawImage(imgElem,
 37        x_img, y_img, w_img, h_img,
 38        0, 0, canvasElem2.width, canvasElem2.height
 39      );
 40    }
 41
 42    imgElem.addEventListener('load', showImage);
 43  </script>
 44
 45  </body>
 46  </html>
```

コードの大半は前節のものと変わりません。違いはキャンバスを2枚用意しているところ（13～14、19～22行目）、`drawImage()`の引数が5個から9個になっているところです（29～32、36～39行目）。

#### 部分領域の切り出し

前節の`CanvasRenderingContext2D.drawImage()`関数では5引数版を用いましたが、ここでは9引数版を用いています。中央のキャンバス（`canvasElem1`と`ctx1`）から説明します。

```javascript
 24    let [x_img, y_img, w_img, h_img] = [389, 418, 316, 255];
 ︙ 
 29      ctx1.drawImage(imgElem,
 30        x_img, y_img, w_img, h_img,      // コピー元での左上の頂点の座標とそのサイズ
 31        0, 0, w_img, h_img               // コピー先での左上の頂点の座標とそのサイズ
 32      );
```

これは、24行目で指定した位置とサイズで`<img>`上の画像を切り出し、サイズはそのままでキャンバスに貼り付けるという指示です。このとき、30行目のコピー元の位置とサイズの座標系は、読み込まれた「もともと」のものです。24行目が`<img>`画像の見かけのサイズである320×213をはみ出た位置を指定しているのに、内部の部分が切り出されているところに注目のポイントです。

これはつまり、5引数版の`drawImage()`では、省かれたコピー元の情報がデフォルトで`0, 0, image.naturalWidth, image.naturalHeight`となるという意味です。そのため、5引数版を不用意に使うと、部分しかキャンバスに貼り付けれない事態が起こります。

31行目のコピー先のサイズと座標は、30行目で切り出した部分画像がぴったりと収まるように指定されています。しかし、これだけだとキャンバスサイズがデフォルトの300×150のままなので、貼り付け後はクリッピングされます。これを避けるには、キャンバスサイズを事前にそのサイズにセットする必要があります（27～28行目）。

```javascript
 27      canvasElem1.width = w_img;
 28      canvasElem1.height = h_img;
```

#### リサイズして貼り付け

右側のキャンバス（`canvasElem2`と`ctx2`）では、「もともと」の寸法の半分にした部分領域を貼り付けるため、キャンバスサイズもそれに合わせて設定します（34～35行目）。

```javascript
 34      canvasElem2.width = Math.floor(w_img * 0.5);
 35      canvasElem2.height = Math.floor(h_img * 0.5);
```

あとは9引数版の`drawImage()`で張り付けるだけです（36～39行目）。

```javascript
 36      ctx2.drawImage(imgElem,
 37        x_img, y_img, w_img, h_img,                   // コピー元
 38        0, 0, canvasElem2.width, canvasElem2.height   // コピー先
 39      );
```

37行目のコピー元の切り出し情報は中央のキャンバスと変わりません。変わったのは38行目で、もともと画像の半分のキャンバスサイズにリサイズして貼り付けと、という指示になっています。前節の5個引数の`drawImage()`でも同じ書き方をしていますが、あれは「このサイズとなるようもともとの画像をリサイズせよ」という指定だったのです。



### 1.4 ビデオを表示する

#### 目的

ビデオファイルを表示します。

技術的には、`<video>`要素とそのDOMオブジェクト`HTMLVideoElement`、プロパティ、イベントを説明します。また、フレームサイズの取得とビデオ読み込みタイミングでの注意点を示します。

実行例を次の画面に示します。  

<img src="Images/Ch01/html-video-1.png">

画面に示したように、`<video>`要素には再生・停止や再生位置を示すトラックバーなどのユーザインタフェースがあらかじめ用意されています。

#### コード

コード`html-video.html`を次に示します。

```html
[File] html-video.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>ビデオを表示する</h1>
 10
 11  <div>
 12    <video id="videoTag" width="320" controls src="samples/cat.mp4"
 13      type="video/mp4">
 14    </video>
 15  </div>
 16
 17  <script>
 18    let startTime = Date.now();
 19    let videoElem = document.getElementById('videoTag');
 20
 21    function showMetadata(evt) {
 22      console.log(`Video properties:
 23        Size offset:    ${videoElem.offsetWidth} x ${videoElem.offsetHeight}
 24        Size (element): ${videoElem.width} x ${videoElem.height}
 25        Size video:     ${videoElem.videoWidth} x ${videoElem.videoHeight}
 26        Duration:       ${videoElem.duration}s
 27        CurrentTime:    ${videoElem.currentTime}s
 28        Volume:         ${videoElem.volume} [0, 1]
 29        Play rate:      ${videoElem.playbackRate}
 30        Loop:           ${videoElem.loop}`
 31      );
 32    }
 33
 34    let events = [
 35      'ended', 'error', 'loadeddata', 'loadedmetadata', 'loadstart', 'pause',
 36       'play', 'seeked', 'seeking', 'suspend', 'volumechange'
 37    ];
 38    events.forEach(function(evt) {
 39      videoElem.addEventListener(evt, function() {
 40        let delta = (Date.now() - startTime).toLocaleString();
 41        console.log(`${delta}. event: ${evt}`);
 42      });
 43    });
 44
 45    videoElem.addEventListener('loadedmetadata', showMetadata);
 46  </script>
 47
 48  </body>
 49  </html>
```

ビデオを再生するだけなら、12～14行目の`<video>`だけで事足ります。コードが長くなったのは、スクリプトからプロパティやイベントのシーケンスを示したいからです。

#### video要素

`<video>`の属性で必須なものは`src`だけです。あと、この要素を識別する`id`はスクリプトをするうえで必要です。

```html
 12    <video id="videoTag" width="320" controls src="samples/cat.mp4"
 13      type="video/mp4">
 14    </video> 
```

`src`のメディアタイプを示す`type`属性は、子要素の`<source>`から複数のビデオファイルを指定するほうがようでしょう。ブラウザが、表示可能なものをこの情報から判断できるからです。次にサンプルを示します。

```html
<video id="videoTag">
  <source src="samples/cat.mov" type="video/mov">
  <source src="samples/cat.mp4" type="video/mp4">
</video>
```

`type`がなければ、最初に記述されたMOVファイルがダウンロードされます。しかし、このフォーマットはSafari以外ではたいていサポートされていません。したがって、これは廃棄され、次がダウンロードされます。`type`が指定してあれば、MOVが読めないブラウザは最初のファイルをスキップしてMP4をゲットします。ダウンロード1回分お得です。

`<video>`の属性のなかでもよく用いるものを次の表に示します。

属性 | デフォルト値 | 意味 
---|---|---
`autoplay` | `false` | この属性が記述されていると、ビデオが自動再生される。
`controls` | `false` | この属性が記述されていると、再生ボタンなどの操作パネルが表示される。初期状態で表示されなくても、たいていは左マウスクリックで引き出せる。
`loop` | `false` | この属性が記述されていると、末尾まで再生するとまた先頭に戻る。デフォルトでは1回だけ再生。
`muted` | `false` | この属性が記述されていると、オーディオがオフ（ミュート）される。
`poster` | なし | URLを指定すると、ビデオの先頭フレームがダウンロードされるまで、その画像が表示される（[2.3節](./02-ui.md#23-カメラにオンオフボタンを加えるポスター付き "INTERNAL")で取り上げます）。

起動時に自動再生をする`autoplay`とサウンドをミュートにする`muted`はたいていペアで指定します。ページアクセスと同時に大音量でビデオが始めると、職場や学校で恥ずかしい思いをするからです。

#### HTMLVideoElementのプロパティ

21～32行目に定義した`showMetadata()`関数は、ビデオのメタデータをコンソールに表示します。この関数は、`loadedmetadata`イベントを契機に起動するよう登録してあります（45行目）。

```javascript
 21    function showMetadata(evt) {
 22      console.log(`Video properties:
 23        Size offset:    ${videoElem.offsetWidth} x ${videoElem.offsetHeight}
 24        Size (element): ${videoElem.width} x ${videoElem.height}
 25        Size video:     ${videoElem.videoWidth} x ${videoElem.videoHeight}
 26        Duration:       ${videoElem.duration}s
 27        CurrentTime:    ${videoElem.currentTime}s
 28        Volume:         ${videoElem.volume} [0, 1]
 29        Play rate:      ${videoElem.playbackRate}
 30        Loop:           ${videoElem.loop}`
 31      );
 32    }
 ︙
 45    videoElem.addEventListener('loadedmetadata', showMetadata);
```

出力を、直前のイベントも含めて次に示します。コメントに後付けで示したのは、それぞれのプロパティ名です。

```
2. event: loadedmetadata                    // loadmetada以降に取得可
Video properties:
      Size offset:    320 x 180             // offsetWidth、offsetHeight
      Size (element): 420 x 0               // width、height
      Size video:     640 x 360             // videoWidth、videoHeight
      Duration:       9.217542s             // duration
      CurrentTime:    0s                    // currentTime
      Volume:         1 [0, 1]              // volume
      Play rate:      1                     // playbackRate
      Loop:           false                 // loop
```

`videoElem.height`が0なところに注目してください。`<video>`要素内で`width`属性が設定してあっても、`height`は指定していないないからです。`<img>`ではアスペクト比から未指定の辺の長さを自動で設定してくれましたが、`<video>`ではそうではないところが注意点です。

ビデオオリジナルのサイズは`videoWidth`と`videoHeight`プロパティに主要されています。キャンバスサイズを`width`あるいは`height`をもとに計算するときは、これらから得られるアスペクト比を用います。

ビデオの時間長を示す`duration`と現在時刻の`currentTime`の単位は秒で、浮動小数点数です。メタデータにはビデオの総フレーム数やフレームレート（秒間に再生するフレームの枚数）がたいていは備わっていますが、HTML5では取得できません。

> C++/Python版のOpenCVでは`VideoCapture.get()`からメタデータにアクセスできますが、OpenCV.jsはこの機能をサポートしていません。

`volume`は音量で、0.0～1.0の浮動小数点数です。0.0が無音、1.0が最大を示します。デフォルトは1.0です。このプロパティには対応するHTML属性がないので、`<video>`要素で音量を指定するときは、次のようにイベントリスナーを介してオブジェクトプロパティから設定します。

```html
<video id="videoTag" src="samples/cat.mp4" onloadedmetadata="this.volume=0.4;">
```

`playbackRate`は再生速度で1.0が通常スピードです。2.0なら倍速、負の値にすれば逆方向に進みます。これも対応するHTML属性はありません。

`loop`は同名のHTML属性と同じで、オートリ―ピートをかけるか否かを真偽値で指定します。デフォルトは`false`です。

#### HTMLVideoElementのイベント

`HTMLVideoElement`には数多くのイベントが用意されています。どのタイミングでこれらが発生するかを確認できるよう、34～43行目で代表的なものを12点登録しています。発生時点がわかりやすいよう、イベント名とともにスクリプト起動時（18行目）からの時間差（40行目）もコンソールに表示します。

```javascript
 18    let startTime = Date.now();
 ︙
 34    let events = [
 35      'ended', 'error', 'loadeddata', 'loadedmetadata', 'loadstart', 'pause',
 36       'play', 'seeked', 'seeking', 'suspend', 'volumechange'
 37    ];
 38    events.forEach(function(evt) {
 39      videoElem.addEventListener(evt, function() {
 40        let delta = (Date.now() - startTime).toLocaleString();
 41        console.log(`${delta}. event: ${evt}`);
 42      });
 43    });
```

これらイベントの発火タイミングと意味を次の表に示します。

イベント | 発火タイミング
---|---
`ended` | ビデオが最後まで行ったとき。ただし、ループ時には発火しない。
`error` | ネットワーク障害など、読み込みに失敗したとき。
`loadeddata` | 最初のフレームが読み込まれたとき。以降のフレームでは出てこない。
`loadedmetadata` | フレームサイズなどビデオのメタデータが読み込まれたとき。`loadeddata`よりも先。
`pause` | （操作パネルなどから）一時停止されたとき。
`play` | 再生開始時。
`seeked` | （操作パネルなどから）先送りや後戻りの操作が完了したとき。
`seeking` | （操作パネルなどから）先送りや後戻りの操作が開始したとき。`seeked`よりも先。
`suspend` | データ読み込みが中断されたとき。たいていは`pause`の前。
`timeupdate` | ビデオ時間（`currentTime`プロパティ）が更新されたとき。
`volumechange` | 音量が変更されたとき。

`loadeddata`と`loadedmetadata`は微妙にタイミングが異なります。`loadedmetadata`はビデオのサイズや時間長など、ビデオのメタデータが読み込まれたときに上がってきます。以降、サイズなどのプロパティ値にアクセスできます。しかし、まだフレームは読み込まれていないので、フレームをコピーするなどの画像操作はできません。最初のフレームが読み込まれたタイミングで発火するのが`loadeddata`です。

出力例を次に示します。左の数値がスクリプト開始時（8行目）からのミリ秒を示します。右のコメントは筆者の操作です。

```
2. event: loadedmetadata      // ページアクセス
5. event: loadeddata
2,210. event: play            // 操作パネルから▷（再生）をクリック
2,513. event: suspend         // 操作パネルから⏸︎（一時停止）をクリック
4,291. event: pause
5,991. event: seeking         // 操作パネルから●（再生位置）をドラッグして再生位置を変更
6,023. event: seeked
︙                            // seeking/seeked が繰り返される
6,292. event: seeking
6,294. event: seeked
8,363. event: play            // 操作パネルから▷（再生）をクリック
9,804. event: pause           // 操作パネルから⏸︎（一時停止）をクリック
```

`loadedmetadata`と`loadeddata`はほぼ同時ですが、それでも3ミリ秒の間隔が空いているところに注意してください。

一時停止の`suspend`と`pause`がつながって出てくるのは、データ転送の中断ののちに再生が停止するからです。再生位置変更の`seeking`と`seeked`は、操作しているあいだは連続して出てくるところもポイントです。



### 1.5 ビデオをランダムにシャッフルする

#### 目的

ビデオシャッフリングを実装します。

そういう用語は存在しませんが、アナログレコードをこすって効果を出すスクラッチのビデオ版です。ここでは、一定間隔でビデオの再生ポイントをランダムに移動することで、ビデオ中を行ったり来たりさせます。ほっておくとずっと再生していますが、操作パネルから再生停止すれば終了します。停止後は、普通に視聴できます。

技術的には、現在時刻を示すビデオプロパティの`currentTime`を`setInterval()`で定期的に操作しているだけです。

実行例を次の画面に示します。

<img src="Images/Ch01/html-shuffle-1.png">

もっとも、画面キャプチャでは動くところはわかりません。どこにジャンプしたかはコンソールから確認してください。

#### コード

コード（`html-shuffle.html`）を次に示します。

```html
[File] html-shuffle.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>ビデオをランダムにシャッフルする</h1>
 10
 11  <div>
 12    <video id="videoTag" width="320" src="samples/cat.mp4"></video>
 13  </div>
 14
 15  <script>
 16    let interval = undefined;
 17    let videoElem = document.getElementById('videoTag');
 18
 19    function ready() {
 20      videoElem.controls = true;
 21      videoElem.loop = true;
 22      videoElem.muted = true;
 23      videoElem.play();
 24      interval = setInterval(function() {
 25        let nextPos = videoElem.duration * Math.random();
 26        videoElem.currentTime = nextPos;
 27        console.log(`Skipped to ${nextPos}`);
 28      }, 2500);
 29    }
 30
 31    function stopInterval() {
 32      clearInterval(interval);
 33      console.log('Shuffle stopped');
 34    }
 35
 36    videoElem.addEventListener('loadeddata', ready);
 37    videoElem.addEventListener('pause', stopInterval);
 38  </script>
 39
 40  </body>
 41  </html>
```

#### HTMLVideoElementのプロパティ設定

ここでは、`<video>`の属性はプロパティから設定しています（20～23行目）。

```javascript
 19    function ready() {
 20      videoElem.controls = true;
 21      videoElem.loop = true;
 22      videoElem.muted = true;
 23      videoElem.play();
 ︙
 36    videoElem.addEventListener('loadeddata', ready);
```

`autoplay`プロパティに`true`をセットすることで自動再生がオンになるかは、ブラウザに依ります。スクリプト側から確実に再生開始をさせるなら、`HTMLVideoElement.play()`関数を用います（23行目）。

`HTMLVideoElement`にはこの他にも、一時停止などビデオ操作の関数がいろいろ用意されています。詳細は、次にURLを示すMDNの`HTMLMediaElement`のAPIドキュメントを参照してください（`HTMLVideoElement`のほとんどのプロパティや関数は、この親クラスから継承しています）。

```https://developer.mozilla.org/ja/docs/Web/API/HTMLMediaElement```

#### ランダム再生と停止

シャッフリングは、`setInterval()`関数で2.5秒（2500ミリ秒）おきに発生するように設定しています（24行目）。

```javascript
 16    let interval = undefined;
 ︙ 
 24      interval = setInterval(function() {
 25        let nextPos = videoElem.duration * Math.random();
 26        videoElem.currentTime = nextPos;
 27        console.log(`Skipped to ${nextPos}`);
 28      }, 2500);
``` 

飛び先は先頭から末尾（`duration`プロパティ）までの間のランダムな位置です。この値を`currentTime`プロパティに代入すればそのままジャンプします。

ほっておくとシャッフリングは永遠に繰り返されます。そこで、操作パネルから一時停止をすれば、シャッフリングを停止するようにします。これには、`HTMLVideoElement`に上がってくる`pause`イベントを契機に（37行目）、タイマを`clearInterval()`関数でクリアします（32行目）。

```javascript
 31    function stopInterval() {
 32      clearInterval(interval);
 33      console.log('Shuffle stopped');
 34    }
 ︙
 37    videoElem.addEventListener('pause', stopInterval);
```

`pause`イベントはブラウザのタブを移ることでも発生します。



### 1.6 ビデオサムネールを作成する

#### 目的

一定間隔で抜き出したフレームを格子状に並べたビデオサムネールを作成します。

サムネールは、縮小した見本画像を並べた画像です。親指の爪（thumbのnail）サイズだから、サムネールです。ネガフィルム（銀塩）写真の時代にはべた焼き、あるいはコンタクトシートと呼ばれました。

技術的には[1.3節](#13-部分領域をキャンバスに表示する "INTERNAL")の部分画像の取得の応用ですが、一定間隔でフレームを取り出すのに`timeupdate`イベントを用います。イベントが発生するたびに時刻をチェックし、キャプチャするタイミングならそうして、そうでなければ処理をスキップします。

ビデオは最初から最後まで流すので、長いビデオだと時間がかかります。フレームが徐々にキャンバスを埋めていくのがアニメーション風で楽しいので、あえてそのような実装にしています。指定の時間ポイントにジャンプすることで時間短縮を図るなら、`timeupdate`は使わず、[1.5節](#15-ビデオをランダムにシャッフルする "INTERNAL")の`currentTime`プロパティを用います。

実行例を次の画面に示します。 

<img src="Images/Ch01/html-thumbnail-1.png">

サムネールの利点は高い一覧性です。欠点は、小さくし過ぎると画像を認識できなくなることです。では大きくすればよいかというと、それに伴って台紙も大きくなるので、数が多いとディスプレイに収まらなくなり、逆に一覧性が低下します。

#### コード

コード（`html-thumbnail.html`）を次に示します。

```html
[File] html-thumbnail.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>ビデオサムネールを作成する</h1>
 10
 11  <div>
 12    <video id="videoTag" width="320" src="samples/cat.mp4"></video>
 13    <canvas id="canvasTag" class="placeholder"></canvas>
 14  </div>
 15
 16  <script>
 17    let sheetSize = {width: 4, height: 3};
 18    let imgWidth = 128;
 19    let imgHeight = undefined;
 20    let count = 0;
 21    let timeSeries = undefined;
 22
 23    let videoElem = document.getElementById('videoTag');
 24    let canvasElem = document.getElementById('canvasTag');
 25    let ctx = canvasElem.getContext('2d');
 26
 27    function prepare() {
 28      let aspect = videoElem.videoHeight / videoElem.videoWidth;
 29      imgHeight = Math.floor(imgWidth * aspect);
 30      canvasElem.width = imgWidth * sheetSize.width;
 31      canvasElem.height = imgHeight * sheetSize.height;
 32
 33      let number = sheetSize.width * sheetSize.height;
 34      let interval = videoElem.duration / number;
 35      timeSeries = [...Array(number).keys()].map(i => i * interval);
 36
 37      videoElem.muted = true;
 38      videoElem.play();
 39    }
 40
 41    function pasteFrame() {
 42      let pos_x = (count % sheetSize.width) * imgWidth;
 43      let pos_y = Math.floor(count / sheetSize.width) * imgHeight;
 44      ctx.drawImage(videoElem, pos_x, pos_y, imgWidth, imgHeight);
 45    }
 46
 47    function timeUpdated() {
 48      if (videoElem.currentTime > timeSeries[count]) {
 49        console.log(`${count} at ${videoElem.currentTime}`);
 50        pasteFrame();
 51        count ++;
 52      }
 53    }
 54
 55    videoElem.addEventListener('loadedmetadata', prepare);
 56    videoElem.addEventListener('timeupdate', timeUpdated);
 57  </script>
 58
 59  </body>
 60  </html>
```

#### サムネール台紙の設計

27～39行目の`prepare()`関数は初期設定のためのものです。ここで、サムネールを貼り付ける台紙（キャンバス）のサイズや縮小画像の貼り付け位置を設計します。また、どのタイミングでフレームをゲットするのかも決めます。

関数は、ビデオのメタデータが読み込まれたとき（`loadedmetadata`イベント）に呼び出します(55行目）。

```javascript
 27    function prepare() {
 ︙
 55    videoElem.addEventListener('loadedmetadata', prepare);
```

関数では、まずサムネールの枚数とサイズを決めます（17～18行目）。キャンバスに格子状に配置するので、枚数は縦横の格子の数で記述します。ここでは4×3の合計12枚です。

```javascript
 17    let sheetSize = {width: 4, height: 3};
```

レイアウト図に起こすと、次のようになります。

<!-- 888x387 ODG ファイルに原画あり -->
<img src="Images/Ch01/html-thumbnail-layout.png" width="500">

格子の左上の0～11の数値がサムネールの番号です。中央の括弧が格子の横縦の位置を示します。これらはサムネール番号から計算されます（図右の計算式）。横はサムネール番号を横の格子数（4）で割った時の余りから得られます。縦は、同じく番号を横の格子数で割って小数点以下を切り捨てた値です。

格子の横幅は18行目で指定していますが、高さは未指定です。これは、ビデオサイズから得られるアスペクト比から計算します（28～29行目）。実行例で用いているビデオフレームのサイズは640×360なので、サムネールは128×72になります。

<!-- canvas.width に float を代入すると、自動的に int に変換される。でも、この場合は sheetSize を掛けると丸め誤差は出るので、先に int にしたほうがよい。-->
```javascript
 18    let imgWidth = 128;
 ︙
 28      let aspect = videoElem.videoHeight / videoElem.videoWidth;
 29      imgHeight = Math.floor(imgWidth * aspect);
```

キャンバスそのものサイズもこれで決定できます（30～31行目）。

```javascript
 30      canvasElem.width = imgWidth * sheetSize.width;
 31      canvasElem.height = imgHeight * sheetSize.height;
```

#### フレーム間隔の決定

フレームを取り出す間隔は、ビデオの時間長（`duration`プロパティ）を格子数で割って決定します（33～34行目）。サンプルビデオの時間長は9.2秒なので、12で割って0.77秒間おきです。

```javascript
 33      let number = sheetSize.width * sheetSize.height;
 34      let interval = videoElem.duration / number;
```

次いで、0からスタートしてこの間隔を開けた等差数列の配列を作成します（35行目）。

```javascript
 35      timeSeries = [...Array(number).keys()].map(i => i * interval);
```

1行にまとめているので、ぱっと見にはわかりにくいかもしれません。まず、`Array()`コンストラクタで12個の要素の配列を作成します（`Array(number)`）。今度はそのインデックス番号からなる配列を生成します（`.keys()`）。これで[0, 1, ..., 11]が得られます。あとは、`map()`を使ってそれぞれに0.77を掛けます（`map(i => i * interval)`）。

`prepare()`関数は最後にオーディオをミュートにし（37行目）、再生を開始させています（38行目）。

```javascript
 37      videoElem.muted = true;
 38      videoElem.play();
```

#### 一定間隔でフレームを抜き出す

一定間隔でのフレームの取り出しには`timeupdate`イベントが便利です。これを登録しているのが56行目です。

```javascript
 56    videoElem.addEventListener('timeupdate', timeUpdated);
```

このイベントは`HTMLVideoElement.currentTime`が更新されると発生します。一般的なビデオのフレームレートは30 fpsなので33ミリ秒おきに発火するように思えますが、実際にはもっと少ないです。MDNは15～250ミリ秒くらいに1回と述べています。

ここでは0.77秒に1回サムネール取り込みますが、その間に発火するのは3回程度です。このくらいならそれほど無駄ではありません。

`timeupdate`イベント発火で呼び出される`timeUpdated()`関数は47～53行目で定義しています。

```javascript
 20    let count = 0;
 ︙
 47    function timeUpdated() {
 48      if (videoElem.currentTime > timeSeries[count]) {
 49        console.log(`${count} at ${videoElem.currentTime}`);
 50        pasteFrame();
 51        count ++;
 52      }
 53    }
```

現在時刻が`timeSeries`の`count`番目の要素よりも大きければ、取り込みです（48行目）。取り込んだら、格子番号を記録している`count`（20行目で0にセット）を1つ繰り上げます（51行目）。

#### 貼り付け

50行目で呼び出している`pasteFrame()`関数（41～45行目）がキャンバスにフレームを貼り付けます。

```javascript
 41    function pasteFrame() {
 42      let pos_x = (count % sheetSize.width) * imgWidth;
 43      let pos_y = Math.floor(count / sheetSize.width) * imgHeight;
 44      ctx.drawImage(videoElem, pos_x, pos_y, imgWidth, imgHeight);
 45    }
```

格子番号の`count`から格子位置、そこからキャンバス上の位置を決定する方法は、先ほど図から示しました。`drawImage()`を使った縮小コピーの方法は[1.3節](#13-部分領域をキャンバスに表示する "INTERNAL")で説明した通りです。



### 1.7 ビデオに字幕を加える

#### 目的

ビデオに字幕を表示します。

技術的には、字幕のタイミングと表示文字列を収容したWebVTTというファイルを用意し、`<video>`要素の間に挟むだけです。HTML5の機能の1つなので、自力でキャンバスに文字を描くなどの必要はありません。本節ではこのWebVTTのフォーマットを説明するとともに、対応するDOMオブジェクトの`HTMLTrackElement`から字幕情報を抽出する方法、そして字幕（キュー）に変更のあったときに発せられる`cuechange`イベントの使い方を示します。

実行例を次の画面に示します。 

<img src="Images/Ch01/html-caption-1.png">

字幕は（とくに設定がなければ）自動で配置されます。上の画面では操作パネルが表示されているのでその上に置かれますが、パネルがなければ画面下端に配置されます。

> 字幕ファイルをローカル（`file:///...`）から読み込むと、クロスサイトリソース共有（CORS）制約に抵触し、エラーが上がります。CORSについては[3.2節](./03-opencv.md#32-CrossOrgignの問題を回避する "INTERNAL")で説明します。

#### コード

コード`html-caption.html`を次に示します。

```html
[File] html-caption.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  <body>
  7
  8  <h1>ビデオに字幕を加える</h1>
  9
 10  <div>
 11    <video id="videoTag" width="320" controls>
 12      <source src="samples/cat.mp4" type="video/mp4"/>
 13      <track id="trackTag" kind="captions" srclang="ja" default
 14        src="samples/cat.vtt"/>
 15    </video>
 16  </div>
 17
 18  <script>
 19    let videoElem = document.getElementById('videoTag');
 20    let trackElem = document.getElementById('trackTag');
 21
 22    function showCue(evt) {
 23      let trackObject = evt.target.track;
 24      let cueList = trackObject.activeCues;
 25      if (cueList.length > 0)
 26        console.log(`${videoElem.currentTime} ${cueList[0].text}`);
 27      else
 28        console.log(`${videoElem.currentTime} Cue changed but no cue`);
 29    }
 30
 31    trackElem.addEventListener('cuechange', showCue);
 32  </script>
 33
 34  </body>
 35  </html>
```

字幕を加えるだけなら、字幕ファイルと12～16行目のHTML要素だけで片が付きます。スクリプト部分（18～32行目）は、字幕テキストにスクリプトからアクセスする方法を示すために加えたものです。

#### track要素

ビデオに字幕を加えるには、`<video></video>`の間に`<track`>要素を挟みます（13～15行目）。HTMLの仕様はビデオ（あるいはオーディオ）の特定の時間範囲内に付随するデータ全般をテキストトラックと総称しますが、ここでは字幕と呼びます。

```html
 12    <video id="videoTag" width="320" controls>
 13      <source src="samples/cat.mp4" type="video/mp4"/>
 14      <track id="trackTag" kind="captions" srclang="ja" default
 15        src="samples/cat.vtt"/>
 16    </video>
```

英日独仏など各国語の字幕に対応できるよう、`<track>`は複数挟むことができます。`default`属性は、その中でもどれをデフォルトに用いるかを指定するものです。上記のコードでは1つしかないので不必要な気もしますが、`default`指定がなければ、操作パネルから能動的に選択しなければ字幕は表示されません。

`kind`は字幕の種類を示します。たとえば、テキストデータが字幕（subtitiles）なのか、クローズドキャプション（captions）なのかを示します。captionsを指定すれば、たいていは問題ありません。

`srclang`はテキストデータの言語を示します。これを「言語タグ」といいます。`kind`にsubtitlesキーワードを指定したときには、必須の属性です。使用できる言語タグはインターネット標準のRFC 5646で定義されており、次のIANA（インターネットの標準化機構）のURLから全リストをチェックできます。

```https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry```

付け足しですが、ここでは[1.4節](#14-ビデオを表示する "INTERNAL")で軽く触れた`<source>`からソースビデオを指定してます。実用上意味があるわけではなく、参考までです。

#### WebVTTファイル

字幕データはWebVTT（Web Video Text Track）と呼ばれるフォーマットで別ファイルに記述します。仕様は、W3Cのワーキンググループが開発中の「WebVTT: The Web Video Text Tracks Format」で規定されています。URLを次に示します。

```https://www.w3.org/TR/webvtt1/```

ファイルはメモ帳などで作成できるテキスト形式で、文字エンコーディングにはUTF-8を用います。

ここで使用したファイル（`samples/cat.vtt`）を次に示します（行番号はファイルには含みません）。

```
[File] samples/cat.vtt
  1  WEBVTT - 白黒ぶち猫
  2
  3
  4  00:00.000 --> 00:03.500
  5  あ、まんまくれるのかにゃ。
  6
  7  00:04.000 --> 00:08.999
  8  なんだ、くれないんだ。
  9  じゃ、いいや。
```

ファイル先頭には、文字列でWEBVTTと示します。同じ行に、スペースを挟んで好みの文字を書き込んでもよいので、たいていは中身を短く説明する文を入れます。

先頭行から2つ以上空行を入れます。WebVTTの改行はLF（`0A`）だけ、CR（`0D`）だけ、CRLF（`0D0A`）のいずれでもよいことになっていますが、Windowsとの相互運用性を考えると、CRLFがよいでしょう。

字幕を出すタイミングとその文章のかたまりを、仕様ではキュー（cue）と呼びます。キューの間には空行を1つ以上入れます。上記ではキューは2つあります。

キューの先頭は表示タイミングで、時:分:秒.ミリ秒で記述します（仕様ではcue timingと呼びます）。上記の例のように、時は0なら省いてもかまいません。表示タイミングは開始と終了からなり、その間にはスペースと`-->`（ハイフン2つと大なり記号）とスペースを挟みます。

表示タイミングに続けて、表示する文を書きます（cue payload）。複数行でもかまいません。

表示タイミングは必ずしも連続している必要はありません。上記の例では、最初のキューは3.5秒のタイミングで消え、次は4.0秒で登場します。3.5～4.0の間は字幕なし区間です。

#### HTMLTrackElementオブジェクト

字幕情報は、`<track>`オブジェクトの`HTMLTrackElement`（20行目）からアクセスできます。

```javascript
20    let trackElem = document.getElementById('trackTag');
```

ただ、字幕テキストなど実際的な情報を取得するには、オブジェクトをかなり遡ります。これらオブジェクトの連携を次の図に模式的に示します。

<!-- 847x275 ODG ファイルに原画あり -->
<img src="Images/Ch01/html-caption-objects.png" width="500">

字幕情報は、`HTMLTrackElement`の`track`プロパティに収容されています。ここでは、イベントリスナーの`showCue()`関数で字幕情報処理をしており、その引数にはイベントオブジェクトが引き渡されるので（22行目の`evt`）、`evt.target.track`と書いています（23行目）。

```javascript
 22    function showCue(evt) {
 23      let trackObject = evt.target.track;
```

`HTMLTrackElement.track`は`TextTrack`というオブジェクトです。この中には`activeCues`という、現在使用中のキューを収容したプロパティが用意されています。複数形であることからわかるように、これは配列のような列挙型オブジェクトです（`TextTrackCueList`）。24行目では、これをいったん変数`cueList`に格納しています。

```javascript
 24      let cueList = trackObject.activeCues;
```

その時点で字幕が表示されていれば、そこに複数のキューが収容されています。その数は`length`から知ることができます（25行目）。字幕が表示されていなければ、この値は0です。

```javascript
 25      if (cueList.length > 0)
 26        console.log(`${videoElem.currentTime} ${cueList[0].text}`);
 27      else
 28        console.log(`${videoElem.currentTime} Cue changed but no cue`);
```

どのタイミングでも、ここの用例のWebVTTファイルにはキューは1つしかないので、`TextTrackList`の0番目の要素にアクセスします。これは`TextTrackCue`というオブジェクトで、その中には（いろいろありますが）`text`という字幕文字列を収容したプロパティがあります。26行目で表示しているのはこれです。

#### cuechangeイベント

`HTMLTrackElement`オブジェクトには`cuechange`というイベントが用意されています。その名の通り、字幕に変更があったときに上がってくるものです。変更なので、字幕が表示されたときだけでなく、消えたときにも発生します。ここでは、31行目で処理関数の`showCue()`（22～29行目）を登録しています。

```javascript
31    trackElem.addEventListener('cuechange', showCue);
```

26、28行目のコンソール出力を次に示します。左に示す時間は`HTMLVideoElement.currentTime`プロパティのものなので、必ずしもWebVTTファイルで指定した時間と一致するわけではありません。

```
0.004612 あ、まんまくれるのかにゃ。
3.514987 Cue changed but no cue
4.004043 なんだ、くれないんだ。
じゃ、いいや。
9.014032 Cue changed but no cue
```



### 1.8 カメラ映像を流す

#### 目的

カメラからの映像を`<video>`に流します。

技術的にはブラウザに組み込まれた外部デバイスの取得、それにより得られたビデオストリームのハンドリング、そしてデバイスの解放の方法を示します。デバイスの取得は非同期的な処理なので、`Promise`が用いられます。

実行例を次の画面に示します。

<img src="Images/Ch01/html-camera-1.png">

カメラは自動的にスタートします。停止するには操作パネルの停止ボタンを押します。停止（`pause`イベント）と同時にカメラを解放するようにスクリプトが書かれているので、再度ボタンを押しても再生は再開しません。カメラを再スタートしたいときは、ページをリロードします。

やや不親切な設計ですが、占有し続けて、他のアプリケーションがカメラを利用できなくなるのを防ぐためです。なお、ブラウザのタブを閉じることでもカメラを解放できます。タブ移動だけでは解放されないので注意が必要です。ボタンからオンオフをコントロールする方法は[2.3節](./02-ui.md#23-カメラにオンオフボタンを加えるポスター付き "INTERNAL")で扱います。

#### コード

コード`html-camera.html`を次に示します。

```html
[File] html-camera.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>カメラの映像を流す</h1>
 10
 11  <div>
 12    <video id="videoTag" controls muted></video>
 13  </div>
 14
 15  <script>
 16    let videoElem = document.getElementById('videoTag');
 17
 18    let cameraSettings = {
 19      audio: false,
 20      video: {
 21        width: 320,
 22        height: 240,
 23        facingMode: 'environment'
 24      }
 25    };
 26
 27    function cameraStart() {
 28      navigator.mediaDevices.getUserMedia(cameraSettings)
 29      .then(function(mediaStream) {
 30        videoElem.srcObject = mediaStream;
 31        videoElem.play();
 32      });
 33    }
 34
 35    function cameraStop() {
 36      videoElem.pause();
 37      let tracks = videoElem.srcObject.getVideoTracks();
 38      tracks.forEach(function(track) {
 39        track.stop();
 40      });
 41      videoElem.srcObject = undefined;
 42    }
 43
 44    function cameraReady() {
 45      console.log(`Camera sizes:
 46        width/height:       ${videoElem.width}x${videoElem.height}
 47        offsetWidth/Height: ${videoElem.offsetWidth}x${videoElem.offsetHeight}
 48        videoWidth/Height:  ${videoElem.videoWidth}x${videoElem.videoHeight}`);
 49    }
 50
 51    cameraStart();
 52    videoElem.addEventListener('loadeddata', cameraReady);
 53    videoElem.addEventListener('pause', cameraStop);
 54  </script>
 55
 56  </body>
 57  </html>
```

#### MediaStreamオブジェクト

カメラ映像は、カメラデバイスを取得し、そこから得られるビデオストリームを`<video>`に割り当てることで表示されます。

カメラなどのハードウェア機器からのメディアストリームには、`MediaStream`オブジェクトからアクセスします。このオブジェクトの取得と再生開始を行っているのが、27～33行目で定義した`cameraStart()`関数です。この関数はスクリプト末尾の51行目で実行しています。

```javascript
 16    let videoElem = document.getElementById('videoTag');
 ︙
 27    function cameraStart() {
 28      navigator.mediaDevices.getUserMedia(cameraSettings)
 29      .then(function(mediaStream) {
 30        videoElem.srcObject = mediaStream;
 31        videoElem.play();
 32      });
 33    }
 ︙
 52    cameraStart(); 
```

`MediaStream`オブジェクトは、ブラウザそのものを表現する`navigator`のプロパティである`mediaDevices`の、`getUserMedia()`関数から取得します（28行目）。この関数は非同期的で、`Promise`を返します。この`Promise`が解決されると（29行目の`then`）、`MediaStream`オブジェクトが得られます（29行目の無名関数`function()`の引数の`mediaStream`）。`Promise`の用法に不慣れなら、次の「プロミスの使用」と題されたMDNのJavaScriptガイドを参照してください。

```https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises```

あとは、得られたストリームを`<video>`の`srcObject`プロパティに結び付けるだけです（30行目）。以降、普通のビデオファイル同様に操作ができます。ここでは、`HTMLVideoElement.play()`関数で再生を開始しています（31行目）。

> 古いブラウザには`srcObject`をサポートしていないものもあります。その場合は、`src`プロパティに`URL.createObjectURL(mediaStream)`の戻り値を代入せよ、とMDNにはありますが、今度は、新しいバージョンで動作しなくなります。

#### カメラ設定

`navigator.mediaDevices.getUserMedia()`関数の引数には、カメラ設定を指示するオブジェクト（辞書）を引き渡します（仕様では`MediaTrackConstraints`と呼ばれています）。本コードでは、18～25行目でこれを定義しています。

```javascript
 18    let cameraSettings = {
 19      audio: false,
 20      video: {
 21        width: 320,
 22        height: 240,
 23        facingMode: 'environment'
 24      }
 25    };
```

オブジェクトには`audio`と`video`のキーがあり、真偽値からそれらを使用するかを指示します。ここではオーディオはオフ（19行目）です。

ビデオはオンですが、`true`の代わりに詳細設定オブジェクトを指定できます（20～24行目）。この内側オブジェクトのキーはいろいろありますが、よく使うのはカメラサイズを指定する`width`と`height`です。単位はピクセルです。

`facingMode`（23行目）はカメラが複数あるデバイスで、どれを使うかを指示するものです。たとえば、携帯電話でフロントとリアのどちらのカメラを使うかを指定します。ここで用いているenvironmentはリア側（ディスプレイの反対側）です。フロント側（セルフィ側）にするならuserです。PC内蔵カメラのように1つしかなければ、どちらを指定してもそれが選択されます。

#### カメラが使えない

カメラは、別のアプリケーションが使用中ならば利用できません。その場合、`getUserMedia()`は`Promise`の解決に失敗し、次のようにエラーメッセージを表示します。

```
Uncaught (in promise) DOMException: Could not start video source
```

使用中のカメラをオフにし、再度試してください。

カメラを使用しているブラウザは使用中であることをアイコンで明示するので、そこから使用状況はわかります。次にChromeの使用中画面を示します。

<!-- 枠なし版あり -->
<img src="Images/Ch01/camera-inuse-chrome.png">

こちらはFirefoxのものです。

<!-- 枠なし版あり -->
<img src="Images/Ch01/camera-inuse-firefox.png">

内蔵カメラなら、レンズ脇のLEDが点灯しているかからも確認できます。

#### カメラの使用許可

ブラウザ（`navigator`）は、（あらかじめ許可しているのでなければ）次の画面のようにカメラの使用許諾を求めます。

<img src="Images/Ch01/camera-request-chrome.png">

許可はOSレベルではアプリケーション単位、アプリケーション（ブラウザ）では宛先（ドメイン＋ポート）単位でコントロールされています。スクリプトがエラー終了するときはそれぞれを確認してください。

Windowsでは［設定］>［プライバシー］>［カメラ］でコントロールします。

Chromeでは右上の［︙］から［設定］>［プライバシーとセキュリティ］>［サイトの設定］>［カメラ］です。Firefoxならこれも右上の［≡］から［設定］>［プライバシーとセキュリティ］の「許可設定」の下の「カメラ」の［設定...］です。ブラウザやそのバージョンによって異なるので、見当たらなかったら検索してください。

#### ビデオ（カメラ）の属性

カメラ映像が用意できると、普通のビデオ同様、`HTMLVideoElement`の`loadeddata`イベントが上がってきます（52行目で登録）。ここでは、このイベントを契機にビデオサイズを表示させています（44～49行目）。

```javascript
 44    function cameraReady() {
 45      console.log(`Camera sizes:
 46        width/height:       ${videoElem.width}x${videoElem.height}
 47        offsetWidth/Height: ${videoElem.offsetWidth}x${videoElem.offsetHeight}
 48        videoWidth/Height:  ${videoElem.videoWidth}x${videoElem.videoHeight}`);
 49    }
 ︙
 52    videoElem.addEventListener('loadeddata', cameraReady); 
```

出力例を示します。

```
Camera sizes:
        width, height:       0x0
        offsetWidth, Height: 320x240
        videoWidth, Height:  320x240
```

`HTMLVideoElement`プロパティの`width`と`height`がどちらも0であるところに注意してください。`videoWidth`と`videoHeight`はカメラ設定で指定した通りになっているので、フレームをキャンバスにコピーするなど寸法が必要なときはこちらを使います。

#### カメラの解放

利用が終わったらカメラは解放します。ここでは、操作パネルの停止ボタン（`pause`イベント）を契機に解放するようにしています（53行目で登録）。解放操作は`cameraStop()`関数に記述してあります（35～42行目）。

```javascript
 35    function cameraStop() {
 36      videoElem.pause();
 37      let tracks = videoElem.srcObject.getVideoTracks();
 38      tracks.forEach(function(track) {
 39        track.stop();
 40      });
 41      videoElem.srcObject = undefined;
 42    }
 ︙
 53    videoElem.addEventListener('pause', cameraStop);
```

解放操作はいくつかのステップからなっています。

まず、`HTMLVideoElement.pause()`関数で映像再生を停止します（36行目）。操作ボタンですでに止まっていますが、停止命令が2度あっても困りはしません。

続いて、映像を構成するトラックを`MediaStream`オブジェクトから停止します（37～40行目）。まず、`MediaStream`の`getVideoTracks()`からトラックオブジェクトの`MediaStreamTrack`配列を取得します（37行目）。映像メディアは複数のトラックを持つこともあるため、戻り値が配列なところが注意点です。次いで、個々の`MediaStreamTrack`を、その関数である`stop()`からトラックを停止します（39行目）。

トラックは通常1つだけなので、37～40行目は`videoElem.srcObject.getVideoTracks()[0].stop()`と1行で書いてもたいていは問題ありません。

最後に`videoElem.srcObject`に`undefined`を代入することで無効化します。

停止処理が適切でないと、他のアプリケーションからカメラが使えないので確実に行ってください。


### 1.9 ビデオをフレーム単位で取得する

#### 目的

ビデオをフレーム単位に分解して操作します。

フレーム操作は、静止画像を対象とする画像処理技術に必須です。技術的にはフレーム操作のHTML5 APIの説明ですが、標準仕様がまだ固まっていないため、ブラウザごとに異なるメカニズムを用いられています。本節では次の3つの方法を示します。

①`HTMLVideoElement.requestVideoFrameCallback()`...フレームが用意できると、指定のコールバック関数を呼び出す関数です。Firefox以外のブラウザならたいていは利用できるようです。筆者はChromeとEdgeで動作確認をしました（どちらも本書執筆時点では最新版）。

②`HTMLVideoElement.seekToNextFrame()`...ビデオ本来の再生を無視して、スクリプトが能動的にフレーム送りを指示する関数です。`play()`と`pause()`を連続的に繰り返すようなイメージです。Firefoxで採用されていますが、MDNは非推奨扱いにしています。

③`setInterval()` ... 一般的なビデオが毎秒30フレーム（1コマの提示時間にして33ミリ秒）であることを踏まえ、33.3ミリ秒単位でフレームを取得します。必ずしもフレーム送りとインターバルタイマーのタイミングが一致するとはかぎりませんが、標準仕様だけで実装できるというメリットがあります。

実行例を次の画面に示します。どの方法でも、画面の様子は同じです。 

<img src="Images/Ch01/html-frame-1.png">

左側が`<video>`の流すビデオ、右側がフレームを貼り付けた`<canvas>`です。キャンバス左上の数値は`HTMLVideoElement.currentTime`の示すビデオ時間です。

#### コード①

`HTMLVideoElement.requestVideoFrameCallback()`関数を用いたコード①`html-frame-chrome.html`を次に示します。

```html
[File] html-frame-chrome.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  <body>
  7
  8  <h1>ビデオをフレーム単位で取得する（Chrome、Edge…）</h1>
  9
 10  <div>
 11    <video id="videoTag" width="320" controls src="samples/cat.mp4"></video>
 12    <canvas id="canvasTag" class="placeholder"></canvas>
 13  </div>
 14
 15  <script>
 16    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
 17      console.log('Good. requestVideoFrameCallback is supported.');
 18    }
 19    else {
 20      throw new Error('requestVideoFrameCallback not supported.');
 21    }
 22
 23    let videoElem = document.getElementById('videoTag');
 24    let canvasElem = document.getElementById('canvasTag');
 25    let ctx = canvasElem.getContext('2d');
 26
 27    function perFrame(now, metadata) {
 28      canvasElem.width = videoElem.offsetWidth;
 29      canvasElem.height = videoElem.offsetHeight;
 30      ctx.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
 31      ctx.font = '16px sans-serif';
 32      ctx.fillText(videoElem.currentTime, 10, 30);
 33      videoElem.requestVideoFrameCallback(perFrame);
 34    }
 35
 36    videoElem.requestVideoFrameCallback(perFrame);
 37  </script>
 38
 39  </body>
 40  </html>
```

キャンバスへの文字列の描画は描画コンテクストの`fillText()`関数から行っています（31～32行目）。

#### 関数は利用可能か？

`HTMLVideoElement.prototype`プロパティに関数が含まれていれば利用可能です。そうでなければ、このコードではフレーム単位の処理ができないので、`Error`を上げてスクリプトを強制終了します（16～21行目）。

```javascript
 16    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
 17      console.log('Good. requestVideoFrameCallback is supported.');
 18    }
 19    else {
 20      throw new Error('requestVideoFrameCallback not supported.');
 21    }
```

この関数を持たないFirefoxで実行したときの画面を次に示します。20行目のエラーメッセージがコンソールに出力されています。

<img src="Images/Ch01/html-frame-2.png">

動作を停止したのはスクリプトだけです。HTMLそのものは生きているので、キャンバスは空のままでも、再生ボタン▶をクリックすればビデオはスタートします。

#### requestVideoFrameCallback関数

この関数を介して`HTMLVideoElement`に登録したイベントコールバック関数は、フレームが表示されるたびに呼び出されます（36行目）。ここでは、フレーム表示が発生したら`perFrame()`関数（27～34行目）を呼び出すよう登録しています。

```javascript
 36    videoElem.requestVideoFrameCallback(perFrame);
```

コールバック関数は1回しか呼び出されません。そこで、`perFrame()`の中で、次フレームのためのコールバック関数を再度登録します（33行目）。

```javascript
 33      videoElem.requestVideoFrameCallback(perFrame);
```

コールバック関数には2つの引数が与えられます。ここでは`now`と`metadata`です。

```javascript
27    function perFrame(now, metadata) {
```

`now`はスクリプトがスタートしてからのミリ秒単位の現在時刻です。`metadata`はこのビデオのメタデータを収容した辞書形式のオブジェクトで、フレームのサイズやここまで提示した総フレーム枚数などが収容されています。メタデータの仕様は次のURLから閲覧できます。ドラフト段階なので、今後変更があるかもしれません。

```https://wicg.github.io/video-rvfc/```

#### cancelVideoFrameCallback関数

`HTMLVideoElement.requestVideoFrameCallback()`関数は自身を参照する識別子を返します。`setTimeout()`が返すタイマー識別子と同じで、正の整数値です（`unsigned long`）。この識別子から、`HTMLVideoElement.cancelVideoFrameCallback()`関数でそのコールバック登録を解除できます。

コード①では利用していません。

OpenCV.jsスクリプティングでは、終了時に各種のリソースを明示的に解放しなければなりません（[第4章](./04-mat.md "INTERNAL")で説明します）。このとき、同時にフレームコールバックも削除します。OpenCVリソースを解放したあとで誤って呼び出すと、存在しないリソースにアクセスしてしまうからです。

#### コード②

`HTMLVideoElement.seekNextFrame()`関数を用いたコード②`html-frame-firefox.html`を次に示します。

```html
[File] html-frame-firefox.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>ビデオをフレーム単位で取得する（Firefox）</h1>
 10
 11  <div>
 12    <video id="videoTag" width="320" controls src="samples/cat.mp4"></video>
 13    <canvas id="canvasTag" class="placeholder"></canvas>
 14  </div>
 15
 16  <script>
 17    if ('seekToNextFrame' in HTMLVideoElement.prototype) {
 18      console.log('Good. seekToNextFrame is supported.');
 19    }
 20    else {
 21      throw new Error('seekToNextFrame not supported.');
 22    }
 23
 24    let videoElem = document.getElementById('videoTag');
 25    let canvasElem = document.getElementById('canvasTag');
 26    let ctx = canvasElem.getContext("2d");
 27
 28    function perFrame() {
 29      canvasElem.width = videoElem.offsetWidth;
 30      canvasElem.height = videoElem.offsetHeight;
 31
 32      setInterval(function() {
 33        videoElem.seekToNextFrame()
 34        .then(function() {
 35          ctx.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
 36          ctx.font = '16px sans-serif';
 37          ctx.fillText(videoElem.currentTime, 10, 30);
 38        });
 39      }, 33.33);  // 33 ms = (1000 ms / 30 fps);
 40    }
 41
 42    videoElem.addEventListener('loadeddata', perFrame);
 43  </script>
 44
 45  </body>
 46  </html>
```

17～22行目で関数が`HTMLVideoElement`に備わっているかを確認するところは、コード①と同じです。

#### seekToNextFrame関数
<!-- Firefox のフレーム処理機構の seekToNextFrame は使い方はよくわからないが、これがよい。 https://itecnote.com/tecnote/javascript-extract-video-frames-reliably/ -->

この関数は`Promise`を返す非同期処理です。呼び出されるとフレームを1つ進め、その操作が完了れすれば、フレームを処理できます。処理が終われば、呼び出して次のフレームへと進みます。この操作をしているのが33～38行目です。

```javascript
 33        videoElem.seekToNextFrame()
 34        .then(function() {
 35          ctx.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
 36          ctx.font = '16px sans-serif';
 37          ctx.fillText(videoElem.currentTime, 10, 30);
 38        });
```

ここでは`Promise`の解決を待っていますが、フレーム送りがされると`seeked`イベントを発生するので、そちらでのイベントハンドラーで処理をすることもできます。

関数を繰り返し呼び出せば、逐次的なフレーム送りができます。しかし、そのタイミングはもとの再生速度とは無関係です。そのままでは、たいていは高速再生になります。33～38行目が`setInterval()`にくくられているのは、時間調整のためです。

```javascript
 32      setInterval(function() {
 ︙  
 39      }, 33.33);  // 33 ms = (1000 ms / 30 fps);
```

33.33ミリ秒なのは、一般的なビデオのフレームレートが30 fps（frame per second）だからです。ビデオ本来のフレームレートがこれよりも早ければ、コードが提示する映像はスローモーションになります。残念ながら、HTML5にはメディアのメタデータに含まれているフレームレート情報を取得する機能は（現時点では）ありません。

コード②の方法には、もとのビデオの再生タイミングを無効にするという副作用があります。操作パネルで一時停止ボタンを押しても、関数が勝手に次のフレームに動かしてしまいます。

#### コード③

`setInterval()`を用いたコード③`html-frame-timer.html`を次に示します。

```html
[File] html-frame-timer.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6  </head>
  7  <body>
  8
  9  <h1>ビデオをフレーム単位で取得する（タイマー使用）</h1>
 10
 11  <div>
 12    <video id="videoTag" width="320" controls src="samples/cat.mp4"></video>
 13    <canvas id="canvasTag" class="placeholder"></canvas>
 14  </div>
 15
 16  <script>
 17    let videoElem = document.getElementById('videoTag');
 18    let canvasElem = document.getElementById('canvasTag');
 19    let ctx = canvasElem.getContext("2d");
 20    let intervalId = undefined;
 21
 22    function videoStarted() {
 23      intervalId = setInterval(perFrame, 33.33);
 24    }
 25    function videoStopped() {
 26      console.log('stopped');
 27      clearInterval(intervalId);
 28    }
 29
 30    function perFrame() {
 31      canvasElem.width = videoElem.offsetWidth;
 32      canvasElem.height = videoElem.offsetHeight;
 33      ctx.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
 34      ctx.font = '16px sans-serif';
 35      ctx.fillText(videoElem.currentTime, 10, 30);
 36      console.log('running');
 37    }
 38
 39    videoElem.addEventListener('play', videoStarted);
 40    ['suspend', 'pause', 'ended'].forEach(function(evt) {
 41      videoElem.addEventListener(evt, videoStopped);
 42    });
 43  </script>
 44
 45  </body>
 46  </html>
```

#### イベントの処理

タイマー使用のこの方法には、ビデオの停止や再開といったイベントへの対処が必要です。つけっぱなしのタイマーだと、ビデオ停止中であってもキャンバスへのコピー操作（30～37行目）が発生し、同じフレームなのに繰り返し無駄にリソースを費やしてしまいます。

フレーム送りをしたいのは再生中だけなので、`play`イベントを契機にタイマーをスタートします。このイベント登録部分が39行目です。

```javascript
 39    videoElem.addEventListener('play', videoStarted);
```

反対に、`suspended`、`pause`、`ended`といった停止関係のイベントが発生したら、`clearInterval()`でタイマーを解除します（40～42行目）。同じ恰好の`addEventListener()`を3回書いてもよいのですが、ここではループを形成してます。

```javascript
 40    ['suspend', 'pause', 'ended'].forEach(function(evt) {
 41      videoElem.addEventListener(evt, videoStopped);
 42    });
```

他にも、対応が必要なイベントはいくつかあります。たとえば、`seeked`および`seeking`イベントは処理していないので、操作パネルで先送りなどしているときは、キャンバスの画像は変化しません。イベントの登録自体は難しい話ではありませんが、そのときはどう対処すべきなのかを考えるのは厄介です。そういう意味では、コード③の方法はストレートで容易でどこでも使える反面、設計が難しいというデメリットがあります。

#### どれを使う？

本書では、ビデオ処理には`HTMLVideoElement.equestVideoFrameCallback()`を用います。サポートしているブラウザが多いこと、スタンダードトラックのほぼ最終段階にあり、将来的には標準仕様に組み込まれそうだからです。Firefoxユーザは、本書のコードを`seekToNextFrame()`を用いた、あるいはインターバルタイマを用いた方法に移植してください。

ここでは示しませんでしたが、[1.6節](#16-ビデオサムネールを作成する "INTERNAL")で用いた`timeupdate`イベントを利用する手もあります。ただし、発火が0.25秒おき程度と時間精度が低いのが問題です。とくに、[7.5節](./07-video.md#75-動いているものだけを抜き出す "INTERNAL")や[7.6節](./07-video.md#76-動きの方向を検出する "INTERNAL")のように前後のフレームから動きを検出する処理では、おそらく思ったような結果は得られません。その代わり、実装はシンプルで、どのブラウザでも使えるので、時間精度の必要がなければ、採用を考慮する価値はあります。

重要な点ですが、本節で示したいずれの方法でも、フレームを1枚1枚正確に処理をすることはできません。HTML/JavaScriptは、もともと時間に正確な操作をするようには設計されていないからです。

W3Cは現在、ビデオコーデックに直接アクセスする`WebCodecs`の仕様を作成中です。最新の2023年10月12日版はまだドラフト段階ですが、すでに利用可能なブラウザもあるようです。使ってみたい方は次のURLを参照してください。

```https://w3c.github.io/webcodecs/#videoencoder-interface```
