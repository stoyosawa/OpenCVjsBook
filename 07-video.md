## 第7章 ビデオ処理

ビデオからフレームを取り込む方法は[1.9節](./01-html5.md#19-ビデオをフレーム単位で取得する "INTERNAL")で3通り説明しました。本章のコードでは、ChromeやEdgeで利用できる`HTMLVideoElement.requestVideoFrameCallback()`を用います。どのブラウザでも確実にフレーム操作をしたいのなら、`setInterval()`を用いた方法に書き換えてください。



### 7.1 ビデオフレームと画像を合成する

#### 目的

ビデオフレームと画像を合成します。合成は、Adobe Photoshopなど画像編集アプリケーションではレイヤーをなんらかの方法で重ね合わせることです。

技術的には、画像の合成は2枚の`cv.Mat`に対する加減乗除などの演算処理です。これら演算処理は、チャネル単位にそれぞれ対応するピクセル値に対して行われます。画像1のピクセル $P_1(r_1, g_1, b_1, a_1)$ と、画像2の同じ位置のピクセル $P_2(r_2, g_2, b_2, a_2)$ を加算すると、演算後のピクセルは $P_12(r_1 + r_2, g_1 + g_2, , b_1 + b_2, a_1 +a_2)$ となります。他の四則演算も同様です。本節の目的は、こうした演算がどのような視覚的効果をもたらすのかを確認するのが目的です。

コードは2つ提示します。

コード①では、`cv.add()`関数を用いてビデオフレームに流れ星を加算合成します。ロードタイミングがそれぞれ異なるOpenCV、ビデオ、画像の3つのリソースすべてが揃わなければ処理は実行できないので、[6.1節](./06-img.md#61-一部領域をモザイク化する "INTERNAL")と同じようにフラグを用意します。また、ビデオが終了したタイミングでOpenCVのリソースを解放します。

コード②では、その他の演算を静止画2枚を対象に示します。

流れ星合成のコード①の実行例を、次の画面に示します。

<img src="Images/Ch07/video-add-1.png">

左が`<video>`そのまま、右がフレームと流れ星画像の合成画像です。加算合成をすると、2つの画像を透明シートに印刷し、重ねて透かして見た感じの絵が得られます。この実行例では、ほぼまっくろな夜空に明るい水色を合成しているので、流れ星が背景を覆い隠したように見えますが、よく見ると星雲が透けています（紙面ではわかりにくいので実行して確かめてください）。

加減乗除の合成のコード②の実行例を、次の画面に示します。

<img src="Images/Ch07/img-compose-1.png">

上段の2つが元画像です。左は背景の輝度が234くらいとかなり明るい反面、前景のダックスフンドが14くらいと暗くなっています。右の赤茶けた風紋は輝度144くらいで、やや中間寄りです。

2段目以降が合成結果です。画像左上に、用いた演算とその関数を示してあります（[2.4節](./02-ui.md#24-日本語文字を画像に重畳する "INTERNAL")の`Overlay`クラス使用）。

加算すると、左の元画像の背景の輝度が234前後と明るいので、ほとんどの個所で飽和します（以下、ここで示す輝度値はヒストグラムのピーク値）。そのため、合成後の背景はほぼ白です。黒ダックスフンドの毛並みの輝度はおおむね15で、背景画像の赤い砂漠は157前後なので、合成後の毛並みはかなり明るい色合いになります。

この用例では2枚の画像は夜空よりは明るいので、加算をすると両者が透けてみえることがよくわかります。また、ピクセル値を加算すると値は基本的に大きくなります。ビット深度が表現できる最大値を超えると最大値に飽和されるので（`cv.CV_8U`なら255）、合成後はかなり明るくなります。

減算は逆に暗くなります。引いた結果が最小値より小さくなったら、こちらも最小値に飽和されます（`cv.CV_8U`では0）。


#### コード

コード`video-add.html`を次に示します。

```html
[File] video-add.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>ビデオに画像を貼り付ける</h1>
 11
 12  <div>
 13    <img id="imageTag" src="samples/comet.png" class="hide"/>
 14    <video width="360" id="videoTag" controls autoplay muted
 15      src="samples/night-sky.mp4"></video>
 16    <canvas id="canvasTag" class="placeholder"></canvas>
 17  </div>
 18
 19  <script>
 20    let imgElem = document.getElementById('imageTag');
 21    let videoElem = document.getElementById('videoTag');
 22    let readyFlag = 0;
 23    let src, star;
 24    let frameCbHandle;
 25    let period = 5;
 26
 27    function perFrame() {
 28      let cap = new cv.VideoCapture(videoElem);
 29      cap.read(src);
 30      cv.imshow('canvasTag', src);
 31
 32      let time = videoElem.currentTime % period;
 33      let speed = (src.cols - star.cols) / period;
 34      let accel = (src.rows / 2)  / (period ** 2);
 35      let x = (src.cols - star.cols) - speed * time;
 36      let y = accel * (time ** 2);
 37      let rect = new cv.Rect(x, y, star.cols, star.rows);
 38      let roi = src.roi(rect);
 39      cv.add(roi, star, roi);
 40      cv.imshow('canvasTag', src);
 41      frameCbHandle = videoElem.requestVideoFrameCallback(perFrame);
 42    }
 43
 44    function stop() {
 45      console.log('Video stopped');
 46      [src, star].forEach(m => m.delete());
 47      videoElem.removeEventListener('pause', stop);
 48      videoElem.removeEventListener('ended', stop);
 49      videoElem.cancelVideoFrameCallback(frameCbHandle);
 50    }
 51
 52    function init() {
 53      if (readyFlag !== 7)
 54        return;
 55
 56      src = new cv.Mat(videoElem.height, videoElem.width, cv.CV_8UC4);
 57
 58      let img = cv.imread(imgElem);
 59      star = new cv.Mat();
 60      cv.resize(img, star, new cv.Size(), 1/10, 1/10);
 61      img.delete();
 62
 63      videoElem.addEventListener('pause', stop);
 64      videoElem.addEventListener('ended', stop);
 65      perFrame();
 66    }
 67
 68    function videoReady() {
 69      console.log('video ready');
 70      readyFlag |= 4;
 71      videoElem.width = videoElem.offsetWidth;
 72      videoElem.height = videoElem.offsetHeight;
 73      init();
 74    }
 75
 76    function imageReady() {
 77      console.log('image ready');
 78      readyFlag |= 2;
 79      init();
 80    }
 81
 82    function opencvReady() {
 83      console.log('OpenCV ready');
 84      readyFlag |= 1;
 85      init();
 86    }
 87
 88    if (imgElem.complete)
 89      readyFlag |= 2;
 90    imgElem.addEventListener('load', imageReady);
 91    videoElem.addEventListener('loadeddata', videoReady);
 92    var Module = {
 93      onRuntimeInitialized: opencvReady
 94    }
 95  </script>
 96
 97  </body>
 98  </html>
```

画像合成だけのわりに長いのは、3点のリソースのタイミングを取ったり解放したりする手間がかかっているからです。合成画像を表示するだけなら、38～40行目だけです。

#### 準備ができたかを確認

OpenCV、ビデオ、画像というローディングタイミングが異なる3つのリソースがすべて揃わなければ、画像処理はスタートできません。そこで、それぞれにビットフラグを割り当て、処理直前にすべて準備完了したかを確認します。

フラグの初期値は0、あるいは2進数で`000`<sub>2</sub>です（22行目）。

```javascript
 22    let readyFlag = 0;                   // 初期値 000
```

OpenCVの準備ができれば1ビット目にフラグを立てます（`001`<sub>2</sub>とORを取る）。

```javascript
 82    function opencvReady() {
 83      console.log('OpenCV ready');
 84      readyFlag |= 1;                    // OpenCVが用意できたら1ビット目を立てる
 ︙
 92    var Module = {
 93      onRuntimeInitialized: opencvReady
 94    }
```

画像の読み込みが完了したら2ビット目にフラグを立てます（`010`<sub>2</sub>とORを取る）。キャッシュから読み込まれたときは`load`イベントが発生しないので、`HTMLImageElement.complete`プロパティが`true`になっていれば読み込み完了と同じ扱いにします。

```javascript
 76    function imageReady() {
 77      console.log('image ready');
 78      readyFlag |= 2;                    // 画像が用意できたら2ビット目を立てる
 ︙
 88    if (imgElem.complete)
 89      readyFlag |= 2;                    // キャッシュにあるときも2ビット目を立てる
 90    imgElem.addEventListener('load', imageReady);
```

ビデオも同様です。再生可能になったら`loadeddata`イベントが発生するので、それを契機に3ビット目を立てます（`100`<sub>2</sub>とORを取る）。

```javascript
 68    function videoReady() {
 69      console.log('video ready');
 70      readyFlag |= 4;                    // ビデオが用意できたら3ビット目を立てる
 71      videoElem.width = videoElem.offsetWidth;
 72      videoElem.height = videoElem.offsetHeight;
 ︙
 91    videoElem.addEventListener('loadeddata', videoReady); 
```

ビデオが用意できたら、`HTMLVideoElement`の`width`および`height`プロパティを現在の表示サイズでセットします（71～72行目）。というのも、`<video>`要素で属性指定しないかぎり、`width`や`height`はセットされないからです（[1.4節](./01-html5.md#14-ビデオを表示する "INTERNAL")参照）。`offsetWidth/Height`でも`clientWidth/Height`でも、パディングなどの周辺がなければどちらを使ってもかまいません（[1.2節](./01-html5.md#12-画像をキャンバスに表示する "INTERNAL")参照）。

この作業は必須です。ビデオからフレームを読み込むときの`read()`関数は、コピー前に`width`および`height`からサイズ確認をします。空白のままではエラーが上がります。

いずれのリソースでも、フラグ立てなど必要なセットアップが完了したら、すべてが完了したときのセットアップを記述した`init()`関数（52～66行目）を呼び出します。この関数はしかし、フルビットが得られていなければなにもしないので、実際にセットアップが行われるのは最後に準備が完了したリソース（たいていは`opencv.js`）に呼び出されたときです。

```javascript
 52    function init() {
 53      if (readyFlag !== 7)               // フラグが3本とも立っていなければ戻る
 54        return;
```

`init()`ではフレームを収容する`cv.Mat`（56行目）、流れ星画像（58～61行目）を用意しています。流れ星画像は1/10にリサイズしています。あと、ビデオ（`HTMLVideoElement`）で`pause`または`ended`イベントが発生したら、すべてのリソース、登録したイベントやコールバック関数を削除します（44～50行目の`stop()`関数）。

#### ビデオからフレームを読む

ビデオからフレームを取得するには、`cv.VideoCapture`コンストラクタでビデオキャプチャオブジェクトを用意し（28行目）、そこから`read()`関数で読み込みます（29行目）。描画コンテクストの関数を使わずに`cv.Mat`が得られる`cv.imread()`のビデオ版です。

```javascript
 28      let cap = new cv.VideoCapture(videoElem);
 29      cap.read(src);
```

`cv.VideoCapture`コンストラクタの書式を次に示します。

<!-- FunctionDefinition cv.VideoCapture ビデオキャプチャコンストラクタ。 -->
```Javascript
cv.VideoCapture cv.VideoCapture(            // cv.VideoCaptureオブジェクトが返る
    HTMLVideoElement element                // <video>オブジェクト
 );
```

引数には読み取り対象の`HTMLVideoElement`オブジェクトを指定します。

`cv.VideoCapture`コンストラクタは、ビデオが準備できていなければ呼び出せません。OpenCVは準備できているが、ビデオが準備できていないタイミングでインスタンス化すると、エラーにはなりませんが、あとでフレームが読めません。

OpenCV.js版のこのクラスの仕様はC++/Pythonとは異なります。たとえば、オリジナルにはカメラやビデオの属性を取得する`get()`や、値をセットしたり`set()`が備わっていますが、OpenCV.js版にはありません。

`cv.VideoCapture`オブジェクが用意できれば、その`read()`関数からフレームを読み込めます。関数定義を次に示します。

<!-- FunctionDefinition cv.VideoCapture.read() ビデオキャプチャからフレームを1枚読む。 -->
```Javascript
cv.VideoCapture.read(                       // 戻り値なし
    cv.Mat image                            // 出力画像
 );
```

引数に指定する受け手の`cv.Mat`はあらかじめ**4チャネル**8ビット符号なし整数の`cv.CV_8UC4`で準備しておかなければなりません。それ以外ではエラーが上がります。

`cv.Mat`のデータ型とサイズは現在表示されているビデオと同じでなければなりません。それ以外だと関数内部のチェックがエラーを上げます（`HTMLVideoElement.width`と`height`が正しくセットされていなければならないのは、この内部チェッカーがここれら値に依存しているからです）。

#### 画像を合成する－cv.add

フレームを読み込んだら、それと流れ星画像を合成します。流れ星画像は小さいので（オリジナルサイズの640×512を60行目で1/10にしているので64×51）、フレーム画像`src`にはそのサイズのROIを設定し、そことだけ合成します（ROIについては[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")参照）。

```javascript
 37      let rect = new cv.Rect(x, y, star.cols, star.rows);
 38      let roi = src.roi(rect);
 39      cv.add(roi, star, roi);
 40      cv.imshow('canvasTag', src);
```

ここで合成は、同じデータ型でサイズの2つの`cv.Mat`を、互いに同じ位置（行、列、チャネル）にある値を加算することを意味します。単純加算なので、透明なシートに印画された2枚の写真を重ねて透かしたような結果が得られます。

`cv.add()`関数の定義を次に示します。

<!-- FunctionDefinition cv.VideoCapture.read() ビデオキャプチャからフレームを1枚読む。 -->
```Javascript
cv.add(                                     // 戻り値なし
    cv.Mat src1,                            // 入力画像1
    cv.Mat src2,                            // 入力画像2
    cv.Mat dst,                             // 出力画像
    cv.Mat mask = noArray(),                // マスク画像
    number dtype = -1                       // 出力データ型
 );
```

第1引数`src1`と第2引数`src2`の`cv.Mat`は同じデータ型、同じサイズでなければなりません（他の用法もありますが割愛します）。

第3引数`dst`は加算の結果を収容する`cv.Mat`で、こちらも`src1`、`src2`と同サイズ、同データ型です。使用中のビット深度が表現できる値より加算結果が大きくなるときは、最大値に置き換えられます。`cv.CV_8U`だと256以上は255に抑えられます。

加算結果画像のビット深度あえて変更するときは第5引数`dtype`にビット深度を指定しますが、そのままにするときはデフォルトの-1を指定します。第4引数`mask`には演算対象となる領域を指定するマスク画像を指定します。

単純加算です。本節のビデオは背景が暗いので、明るい流れ星画像が際立って見えます。明るければ、流れ星の背後になにかが透けて見えます。透かせたくないのなら、`cv.Mat.copyTo()`関数で上書きをする、あるいは流れ星をより際立たせるために`cv.addWeighted()`を用いたほうがよいでしょう（後者については[TBA](TBA "INTENRAL")で取り上げます）。

25、32～36行目は流れ星の位置（37行目の`cv.Rect`のパラメータ）を計算しています。画像横幅を5秒（25行目）で横切るように水平方向の速度を決定しています（33行目）。放物線を描くように、垂直方向には加速度が付けてあります（34行目）。こちらは画像高さの半分に5秒で到達するように決定しています。

#### リソース解放法処理

ビデオが末尾に到達した（`ended`イベント）あるいはユーザ操作で停止された（`pause`イベント）タイミングで、OpenCVのリソースを解放します。

```javascrpt
 44    function stop() {
 45      console.log('Video stopped');
 46      [src, star].forEach(m => m.delete());
 47      videoElem.removeEventListener('pause', stop);
 48      videoElem.removeEventListener('ended', stop);
 49      videoElem.cancelVideoFrameCallback(frameCbHandle);
 50    }
```

重要なのは46行目の`cv.Mat`の解放です。OpenCVリソースで解放が必要とされるものは他にも`cv.MatVector`などの`Vector`類、顔検出のカスケード検出器オブジェクトなどがあります。そうしたオブジェクトには`delete()`メンバ関数が備わっています。

OpenCVリソースを解放したら、以降、フレーム処理の`perFrame()`関数（27～41行目）を含む、`cv.Mat`を参照する関数は呼び出せません（この`stop()`自体も2度は呼べない）。そこで、イベントリスナーやコールバックもあわせて登録解除します。

[第4章](./04-mat.md "INTERNAL")でも述べましたが、終わりが明示的ではないアプリケーションやユーザ操作によってはいくらでも延々と見続けられるビデオでは、どこでリソースを解放するかは悩ましいところです。`ended`または`pause`がよいか、それとも他のタイミングがよいかは、アプリケーション次第です。


#### 画像合成関数

画像間では、加減乗除どの演算もできます。画像は数値の並んだ行列なので、相対する2つの要素間ではどんな演算だってできないことはないからです。もっとも、それは数学的な話で、結果がどのように見えるかは別問題です。



演算 | 関数 | 補足
---|---|---
加算 | `cv.add()` | ピクセル値が加算で大きくなるので明るく、白っぽくなる。
減算 | `cv.subtract()` | ピクセル値が減算で小さくなるので暗くなる。減算結果が負のときは0に抑えられる（`cv.CV_8Uのとき`）。
乗算 | `cv.multiply()` | 乗算するので値はえらく大きくなり、たいてい、結果は白く飛んでしまう。実用的には、`cv.CV_8U`なら乗算後に1/255にする（定数倍の第4引数がある）。上の画面も1/255倍した結果。
除算 | `cv.divide()` | 除算するので値はえらく小さくなり、たいてい、結果は黒くなってしまう。実用的には、`cv.CV_8U`なら除算後に255倍する（定数倍の第4引数がある）。上の画面も255倍した結果。
重み付け加算 | `cv.addWeighted()` | 重み付け係数には、2つを足して1になるような1以下の値を選ぶのがよい。

関数の用法はどれも似たようなものなので、定義は省きます。次のURLに示すOpenCVリファレンスの「Operations on arrays」にまとめて掲載されていますので、詳細はそちらを参照してください。

```https://docs.opencv.org/4.8.0/d2/de8/group__core__array.html```

一風変わった効果が得られる行列演算もなかにはあるので、手の空いたときに楽しんでください。


### 7.2 カメラ映像を鏡像反転する

#### 目的

カメラ映像を鏡のように左右に反転します。停止は、`<video>`付属の操作パネル（`controls`）のボタンからです。

カメラ映像を使うには`HTMLVideoElement`にカメラのストリームを取り付けなければなりませんが、いったん`navigator.mediaDevices.getUserMedia()`でセットが済めば、あとの操作はビデオファイルと変わりません。このあたりは[1.8節](./01-html5.md#18-カメラ映像を流す "INTERNAL")で説明した通りです。フレーム取得の方法も同じで、前節の`cv.VideoCapture`オブジェクト経由です。

技術的には、反転操作の`cv.flip()`関数を説明しますが、いたって簡単なものです。本節の目的はカメラを使ったサンプルを示すところだけにあるので、新奇な話はあえて組み込んでいません。

実行例を次の画面に示します。

<img src="Images/Ch07/video-flip-1.png">

左は`<video>`要素で、カメラ映像をそのまま表示しています。右は`<canvas>`で、カメラからコピーしたフレームを反転操作してから貼り付けてあります。

#### コード

コード`video-flip.html`を次に示します。

```html
[File] video-flip.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>カメラ映像を鏡像反転する</h1>
 11
 12  <div>
 13    <video id="videoTag" controls></video>
 14    <canvas id="canvasTag" class="placeholder"></canvas>
 15  </div>
 16
 17  <script>
 18    let videoElem = document.getElementById('videoTag');
 19    let readyFlag = 0;
 20    let frameCallbackId;
 21
 22    let constraints = {
 23      audio: false,
 24      video: { width: 360, height: 270 }
 25    };
 26
 27    navigator.mediaDevices.getUserMedia(constraints)
 28    .then(mediaStream => {
 29      videoElem.srcObject = mediaStream;
 30      videoElem.play();
 31    });
 32
 33    function perFrame() {
 34      if (readyFlag !== 3)
 35        return;
 36
 37      let cap = new cv.VideoCapture(videoElem);
 38      let src = new cv.Mat(videoElem.height, videoElem.width, cv.CV_8UC4);
 39      cap.read(src);
 40      cv.flip(src, src, 1);
 41      cv.imshow('canvasTag', src);
 42
 43      src.delete();
 44      frameCallbackId = videoElem.requestVideoFrameCallback(perFrame);
 45    }
 46
 47    function videoStop() {
 48      console.log('video stopped');
 49      videoElem.pause();
 50      let tracks = videoElem.srcObject.getTracks();
 51      tracks[0].stop();
 52      videoElem.srcObject = undefined;
 53      videoElem.removeEventListener('pause', videoStop);
 54      videoElem.cancelVideoFrameCallback(frameCallbackId);
 55      readyFlag = 0;
 56    }
 57
 58    function videoReady() {
 59      console.log('video ready'); 
 60      readyFlag |= 2;
 61      videoElem.width = videoElem.videoWidth;
 62      videoElem.height = videoElem.videoHeight;
 63      videoElem.addEventListener('pause', videoStop);
 64      perFrame();
 65    }
 66
 67    function opencvReady() {
 68      console.log('openv ready');
 69      readyFlag |= 1;
 70      perFrame();
 71    }
 72
 73    videoElem.addEventListener('loadeddata', videoReady)
 74    var Module = {
 75      onRuntimeInitialized: opencvReady
 76    }
 77  </script>
 78
 79  </body>
 80  </html>
```

カメラ映像を反転するだけのわりに長いのは、カメラ処理とリソース管理があるからです。それさえなければ、コードは端的には39～41行目だけで片付きます。

カメラのセットアップとストリームの`HTMLVideoElement`への接続は21～31行目です。[1.8節](./01-html5.md#18-カメラ映像を流す "INTERNAL")のものと変わりません。

ここでも、リソースの準備状態はフラグ（19行目の`readyFlag`）で管理しています。リソースはOpenCVとカメラ映像しかないので、どちらも準備できていればフラグは3になります（34行目）。

リソースの解放は（47～56行目）はカメラ、イベントリスナー、コールバック関数だけです。と、いうのも、OpenCVリソースはフレーム単位で作成し、その都度解放しているからです（38、43行目）。最初に作成して使いまわすのと異なり、解放タイミングに悩まなくて済むところが美点です。その代わり、フレームを進めるたびに毎回同じメモリ確保が発生するので、効率はよくありません。

#### 反転操作－cv.flip

画像の反転操作には`cv.flip()`関数を使います（40行目）。

```javascript
 39      cap.read(src);
 40      cv.flip(src, src, 1);
```

関数定義を次に示します。

<!-- FunctionDefinition cv.flip() 画像を上下左右に反転する。 -->
```Javascript
cv.flip(                                    // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    number flipCode                         // 反転方法
 );
```

第1引数`src`は入力画像、第2引数`dst`は結果を受ける出力画像です。`dst`のデータ型とサイズは`src`と同じものになります。

第3引数`flipCode`には反転方法を数値から指定します。0のときはX軸を軸に反転します（上下が入れ替わる）。1のときはY軸を軸にするので、左右が入れ替わります。-1を指定すると上下左右どちらも反転します。



### 7.3 実写をミニチュア風にする

### 7.4 2つのカットをトランジションでつなぐ

### 7.5 動いているものだけを抜き出す

### 7.6 動きの方向を検出する

### 7.7 物体を追いかける

<TBD>
