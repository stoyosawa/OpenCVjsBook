## 第7章 ビデオ処理

ビデオからのフレーム取り込みは、[1.9節](./01-html5.md#19-ビデオをフレーム単位で取得する "INTERNAL")で3通りの方法を説明しました。本章のコードでは、ChromeやEdgeで利用できる`HTMLVideoElement.requestVideoFrameCallback()`を用います。新旧バージョンをよ問わず、どのブラウザでもフレーム操作をしたいのなら、`setInterval()`を用いた方法がよいでしょう。



### 7.1 ビデオフレームと画像を合成する

#### 目的

ビデオフレームに流れ星の画像を合成します。

技術的には、`cv.add()`による合成です（[6.8節](./06-img.md#68-画像を合成する "INTERNAL")）。大きな背景フレームの一部領域に小さい流星画像を貼り付けるには、ROIを用います（[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")）。本節で重要な技術的なポイントは、`<video>`要素に結び付けた`cv.VideoCapture`オブジェクトを用意することで、以降、その`read()`関数でフレームを`cv.Mat`形式で読み込めるようにするところです。`HTMLImageElement`用の`cv.imread()`の`HTMLVideoElement`版といったところです。

加えて、ロードタイミングがそれぞれ異なるOpenCV、ビデオ、画像の3つのリソースすべてが揃ったところで処理を開始する方法を示します。また、適切なタイミングでOpenCVのリソースを解放する方法も示します。

実行例を次の画面に示します。

<img src="Images/Ch07/video-add-1.png">

左が`<video>`そのまま、右がフレームと流れ星画像の加算画像です。単純な加算では背景が透けて見えますが、ここでは暗い夜空が背景なので十分です。明るい背景を使っているなら、マスクを取るなど追加の作業が必要です。

流星は水平方向は等速で、5秒（コード25行目）かけて画像右端からから左端に移動します。左に達したら、また右からやり直します。垂直方向は等加速度で、やはり5秒かけて画像上端から中央に移動します。軌跡は残らないのでわかりにくいですが、放物線運動です。

画像処理はビデオが終端に達した（`ended`イベント）または停止した（`pause`イベント）と同時に終了します。このタイミングで`cv.Mat`などのリソースを解放するので、以降は星は流れません。ビデオ再生はHTML5の機能なので、そのままでも継続して視聴できます。流星を再度見るには、ページをリロードします。

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

OpenCV、ビデオ、画像というローディングタイミングが異なる3つのリソースがすべて揃わなければ、画像処理はスタートできません。そこで、それぞれにビットフラグを割り当て、処理直前にすべて準備完了したかを確認します。同じ方法は[6.1節](./06-img.md#61-一部領域をモザイク化する "INTERNAL")でも用いました。

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
 ︙
 65      perFrame();
 66    }
```

`init()`ではフレームを収容する`cv.Mat`（23、56行目）、1/10にリサイズした流れ星画像（23、58～61行目）を用意しています。あと、ビデオ（`HTMLVideoElement`）で`pause`または`ended`イベントが発生したら、すべてのリソース、登録したイベントやコールバック関数を削除する関数`stop()`関数を呼び出すよう登録します（44～50行目）。

セットアップが完了したら、フレーム処理の`perFrame()`を呼び出します（66行目）。関数の中では、フレームが読み込まれるたびに再帰的に呼びだすように`HTMLVideoElement.requestVideoFrameCallback()`で自身を登録します（41行目）。

#### ビデオからフレームを読む

ビデオからフレームを取得するには、`cv.VideoCapture`コンストラクタでビデオキャプチャオブジェクトを用意し（28行目）、そこから`read()`関数で読み込みます（29行目）。

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

`cv.VideoCapture`コンストラクタは、ビデオが準備できていなければ呼び出してはいけません。準備できていないタイミングでもインスタンス化はでき、エラーにもなりませんが、フレームは読めません。

OpenCV.js版のこのクラスの仕様はC++/Pythonとは異なります。たとえば、オリジナルにはカメラやビデオの属性を取得する`get()`や、値をセットする`set()`が備わっていますが、OpenCV.js版にはありません。

`cv.VideoCapture`オブジェクが用意できたら、その`read()`関数からフレームを読み込みます。関数定義を次に示します。

<!-- FunctionDefinition cv.VideoCapture.read() ビデオキャプチャからフレームを1枚読む。 -->
```Javascript
cv.VideoCapture.read(                       // 戻り値なし
    cv.Mat image                            // 出力画像（cv.CV_8UC4）
 );
```

引数に指定する受け手の`cv.Mat`はあらかじめ**4チャネル**8ビット符号なし整数の`cv.CV_8UC4`で準備しておかなければなりません。それ以外ではエラーが上がります。

`cv.Mat`のデータ型とサイズは現在表示されているビデオと同じでなければなりません。それ以外だと関数内部のチェックがエラーを上げます（`HTMLVideoElement.width`と`height`が正しくセットされていなければならないのは、この内部チェッカーがこれら値に依存しているからです）。

#### リソース解放法処理

ビデオが末尾に到達した（`ended`イベント）あるいはユーザ操作で停止された（`pause`イベント）タイミングで、OpenCVのリソースを解放します（46行目）。

```javascrpt
 44    function stop() {
 45      console.log('Video stopped');
 46      [src, star].forEach(m => m.delete());
 47      videoElem.removeEventListener('pause', stop);
 48      videoElem.removeEventListener('ended', stop);
 49      videoElem.cancelVideoFrameCallback(frameCbHandle);
 50    }
```

他にも、放置しておくと解放したOpenCVリソースにアクセスしかねないリスナー関数やコールバック関数も登録解除します。

フレーム単位でコールバックを呼び出す`HTMLVideoElement.requestVideoFrameCallback()`は、[1.9節](./01-html5.md#19-ビデオをフレーム単位で取得する "INTERNAL")で説明したように、自身を識別する整数値のIDを返します（24、41行目）。

```javascript
 24    let frameCbHandle;
 ︙ 
 41      frameCbHandle = videoElem.requestVideoFrameCallback(perFrame);
```

フレームコールバックを登録解除するには、この値を引数から指定した`HTMLVideoElement.cancelVideoFrameCallback()`を呼び出します（49行目）。

[第4章](./04-mat.md "INTERNAL")でも述べましたが、終わりが明示的ではないアプリケーションやユーザ操作によってはいくらでも延々と見続けられるビデオでは、どこでリソースを解放するかは悩ましいところです。`ended`または`pause`がよいか、それとも他のタイミングがよいかは、アプリケーション次第です。



### 7.2 カメラ映像を鏡像反転する

#### 目的

カメラ映像を鏡のように左右に反転します。停止は、`<video>`付属の操作パネル（`controls`）のボタンからです。

技術的には、反転操作の`cv.flip()`関数を説明しますが、それ自体はいたって簡単です。カメラ映像を使うには`HTMLVideoElement`にカメラのストリームを取り付けなければなりませんが、いったん`navigator.mediaDevices.getUserMedia()`でセットが済めば、あとの操作はビデオファイルと変わりません（[1.8節](./01-html5.md#18-カメラ映像を流す "INTERNAL")）。フレーム取得の方法も同じで、前節の`cv.VideoCapture`オブジェクト経由です。本節の目的はカメラを使ったサンプルを示すところだけにあるので、新奇な話はあえて組み込んでいません。

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
 73    videoElem.addEventListener('loadeddata', videoReady);
 74    var Module = {
 75      onRuntimeInitialized: opencvReady
 76    }
 77  </script>
 78
 79  </body>
 80  </html>
```

#### カメラのセットアップ

カメラの開始・停止方法は[1.8節](./01-html5.md#18-カメラ映像を流す "INTERNAL")で説明しましたが、再掲します。カメラからの映像ストリームを`<video>`にフィードするには、`navigator.mediaDevices.getUserMedia()`を用います。HTML5の機能なので、OpenCVは介在しません。

```javascript
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
```

`Promise`を返す非同期関数ですが、ビデオと同じ`loadedmatadata`や`loadeddata`イベントがが`HTMLVideoElement`に発生するので、それらを契機に処理を始められます。その登録をしているのが73行目です。

```javascript
 73    videoElem.addEventListener('loadeddata', videoReady);
```

OpenCVとビデオがどちらも準備できたところで目的の画像処理を始めるフラグを用いた方法は、前節と同じです。

カメラは、ビデオトラックを停止することで停止します。1本のビデオは複数のトラックで構成されていることもあるので、`MediaStream.getTracks()`は配列を返します（50行目）。[1.8節](./01-html5.md#18-カメラ映像を流す "INTERNAL")ではこれらをループして逐一停止していましたが、たいていは1本のトラックしかないので、0番目だけ停止すればこと足ります（51行目）。

```javascript
 49      videoElem.pause();
 50      let tracks = videoElem.srcObject.getTracks();
 51      tracks[0].stop();
 52      videoElem.srcObject = undefined;
```

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

#### 目的

リアルなビデオ映像をミニチュア風にします。

特撮映画のセットやジオラマでは、ミニチュアの人物や車や建物でそれっぽい映像を作成します。ミニチュア風というのはその反対で、リアルな映像をミニチュアぽくする写真撮影および加工の技術です。昭和な特撮番組を思い出させるレトロな雰囲気があるため、スマートフォンアプリになるくらい人気な技術です。

リアルをミニチュア風にする要因はいくつかあります。

リアルなビルや町の全体は遠くから撮影します。遠くから撮影するので、フォーカスが全体に合います。反対に、セット撮影は近接撮影です。そのため、フォーカスが合うのは中心部だけで、周辺部はぼやけます。逆にいえば、周辺をぼかせば、どことなくミニチュア風に錯覚します。プロのミニチュア風写真作家はチルトレンズと呼ばれる特殊なレンズを使いますが、本節では画像処理でぼけさせます。

模型やおもちゃの色合いは鮮やかで明るく、しかも近接撮影なために間の空気による色褪せが少ないことから、明るく、色鮮やかにすればそれらしくなります。また、領域の色合いの濃淡が少なくて均質なので、アニメ絵風な処理をすると一層それらしくなります。

動画では、小さいものがてちょこまか動くと、ミニチュア感が増します。ゴジラに向かっていく自衛隊の車列の感じです。

技術的には次の技法とOpenCV関数を用います。いずれも既出なので、あとは組み合わせるだけです。

撮影技術 | 画像処理 | 関数 | 本書の章節
---|---|---|---
中心部のみフォーカス | 画像の周辺だけを平滑化する | `cv.blur()` | [6.2節](./06-img.md#62-画像をぼかす "INTERNAL")
鮮やかで明るい色 | HSV変換し、彩度、明るさを上げる | `cv.cvtColor()`、`cv.convertTo()` | [5.6節](./05-colors.md#56-ポスター化する "INTERNAL")、[6.4節](./06-img.md#64-QRコードを読む "INTERNAL")
領域の色合いが均質 | 領域の色数を減らす | `cv.bilateralFilter()` | [6.2節](./06-img.md#6.2-画像をぼかす "INTERNAL")
動きが早い | 間欠的に処理する | -- | --

実行例を次の画面に示します。

<img src="Images/Ch07/video-miniture-1.png">

実行例の素材（左）には、高いところから道路を見下ろしたものを選びました。ジオラマ撮影では、たいてい、腰の高さくらいにある模型を斜めから下に見下ろすので、そのアングルだといかにもミニチュアに感じられるからです。あと、空はないほうがよいともされています。

右がミニチュア風動画で、色の鮮やかさ、明るさは下のトラックバーから操作できます。数値は倍率で、最大3倍まで0.1刻みで指定できます。ただ、彩度と明度の両方を操作するとサイケデリックな色合いになります。3番目の「スキップ」では、処理しないでスキップするフレームの枚数を指定します。1はすべてのフレームを処理し、2は1枚おき、3は2枚飛ばし、というように指定します。値が大きいほどちょこまかします。

本コードでは、フレーム処理単位でOpenCVのリソースを生成し、解放します。したがって、あらかじめ定めたタイミングで解放をする必要はありません。その代わり、メモリの取得と解放を頻繁に行うので、性能はあまりよくありません。

#### コード

コード`video-miniture.html`を次に示します。

```html
[File] video-miniture.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>実写をミニチュア風にする</h1>
 11
 12  <div>
 13    <video id="videoTag" width="380" controls muted autoplay loop
 14      src="samples/traffic.mp4"></video>
 15    <canvas id="canvasTag" class="placeholder"></canvas>
 16  </div>
 17  <div>
 18    鮮やかさ倍率（1～3）
 19    <input type="range" id="rangeTagS" min="1" max="3" step="0.1" value="1"/>
 20    <span id="spanTagS" class="currentValue">1</span><br/>
 21    　明るさ倍率（1～3）
 22    <input type="range" id="rangeTagV" min="1" max="3" step="0.1" value="1"/>
 23    <span id="spanTagV" class="currentValue">1</span><br/>
 24    　　スキップ（1～6）
 25    <input type="range" id="rangeTagG" min="1" max="6" value="1"/>
 26    <span id="spanTagG" class="currentValue">1</span>
 27  </div>
 28
 29  <script>
 30    let videoElem = document.getElementById('videoTag');
 31    let rangeElemS = document.getElementById('rangeTagS');
 32    let rangeElemV = document.getElementById('rangeTagV');
 33    let rangeElemG = document.getElementById('rangeTagG');
 34    let spanElemS = document.getElementById('spanTagS');
 35    let spanElemV = document.getElementById('spanTagV');
 36    let spanElemG = document.getElementById('spanTagG');
 37
 38    let readyFlag = 0;
 39    let size, rect;
 40
 41    function brighter(src, scales=[1, 1, 1]) {
 42      let temp1 = new cv.Mat();
 43      cv.cvtColor(src, temp1, cv.COLOR_RGB2HSV);
 44
 45      let mv = new cv.MatVector();
 46      cv.split(temp1, mv);
 47
 48      let temp2 = new cv.Mat();
 49      for(let i=0; i<mv.size(); i++) {
 50        if (scales[i] != 1) {
 51          mv.get(i).convertTo(temp2, -1, scales[i], 0);
 52          mv.set(i, temp2);
 53        }
 54      }
 55
 56      cv.merge(mv, temp2);
 57      cv.cvtColor(temp2, src, cv.COLOR_HSV2RGB);
 58
 59      [temp1, mv, temp2].forEach(m => m.delete());
 60    }
 61
 62    let counter = 0;
 63    function perFrame() {
 64      let cap = new cv.VideoCapture(videoElem);
 65
 66      let saturation = Number(rangeElemS.value);
 67      let value = Number(rangeElemV.value);
 68      let gap = Number(rangeElemG.value);
 69      spanElemS.innerHTML = saturation;
 70      spanElemV.innerHTML = value;
 71      spanElemG.innerHTML = gap;
 72
 73      if (counter % gap == 0)  {
 74        let src = new cv.Mat(size, cv.CV_8UC4);
 75        cap.read(src);
 76        cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
 77
 78        let dst = new cv.Mat();
 79        cv.bilateralFilter(src, dst, 5, 150, 150, cv.BORDER_DEFAULT);
 80        brighter(dst, [1, saturation, value]);
 81
 82        src = dst.clone();
 83        cv.blur(src, src, new cv.Size(7, 7));
 84        let roiSrc = src.roi(rect);
 85        let roiDst = dst.roi(rect);
 86        roiDst.copyTo(roiSrc);
 87
 88        cv.imshow('canvasTag', src);
 89        [src, dst, roiSrc, roiDst].forEach(m => m.delete());
 90      }
 91
 92      counter ++;
 93      videoElem.requestVideoFrameCallback(perFrame);
 94    }
 95
 96    function init() {
 97      if (readyFlag !== 3)
 98        return;
 99
100      size = new cv.Size(videoElem.width, videoElem.height);
101
102      let ratio = 0.7;
103      let w = Math.floor(videoElem.width * ratio);
104      let h = Math.floor(videoElem.height * ratio);
105      let x = Math.floor((videoElem.width - w) / 2);
106      let y = Math.floor((videoElem.height - h) / 2);
107      rect = new cv.Rect(x, y, w, h);
108
109      perFrame();
110    }
111
112    function videoReady() {
113      readyFlag |= 2;
114      videoElem.width = videoElem.offsetWidth;
115      videoElem.height = videoElem.offsetHeight;
116      init();
117    }
118
119    function opencvReady() {
120      readyFlag |= 1;
121      init();
122    }
123
124    videoElem.addEventListener('loadeddata', videoReady);
125    var Module = {
126      onRuntimeInitialized: opencvReady
127    }
128  </script>
129
130  </body>
131  </html>
```

OpenCVとビデオが準備できたところで初期化を行いますが（96～110行目の`init()`）、ここではのちに明示的な解放を必要とするリソースは生成しません。ここで定義している`cv.Size`（フレームサイズ）も`cv.Rect`（周辺ぼかし時のROIのサイズ）もJavaScriptオブジェクトで表現されているので、通常のガベージコレクタのコレクト対象です。

`cv.Rect`はフレーム中央に位置し、そのサイズはフレームの7割です（102～107行目）。この矩形領域の外側をぼかします。

#### 彩度と明度を上げる

彩度と明度を定数倍するのが、41～60行目の`brighter()`関数です。関数は受け取ったRGB画像をHSVに変換、処理が終わればもとのRGBに戻します。このなRGB→HSV→RGBのサンドイッチ構成は[5.6節](./05-colors.md#56-ポスター化する "INTERNAL")と同じです。

```javascript
 41    function brighter(src, scales=[1, 1, 1]) {
 ︙ 
 43      cv.cvtColor(src, temp1, cv.COLOR_RGB2HSV);
 ︙
 57      cv.cvtColor(temp2, src, cv.COLOR_HSV2RGB);
```

チャネル単位で処理をするのなら、`cv.split()`です（46行目）。出力を受ける`cv.MatVector`を用意するのを忘れないように（45行目）。

```javascript
 45      let mv = new cv.MatVector();
 46      cv.split(temp1, mv);
```

`brighter()`関数の第2引数の配列は、チャネルそれぞれの倍率を示しています（値は66～67行目でトラックバーから直接取得します）。ここが1でなければ`cv.Mat.convertTo()`を使ってその値で定数倍します（50行目の`if`）。

```javascript
 48      let temp2 = new cv.Mat();
 49      for(let i=0; i<mv.size(); i++) {
 50        if (scales[i] != 1) {
 51          mv.get(i).convertTo(temp2, -1, scales[i], 0);
 52          mv.set(i, temp2);
 53        }
 54      }
```

i番目の要素を`get()`し、変換したら、`set()`でもとに戻します（51～52行目）。

この関数でのポイントは、確保したOpenCVリソースを関数を出る直前に解放しているところです。このように関数単位で確保と解放が閉じていると、解放し忘れが少なくなります。

#### フレームをスキップする

スクリプトは、読み込んだフレームの数を`counter`でカウントしています。このカウンターがスキップ数で割り切れたときのみ、フレーム処理を実行します。

```javascript
 62    let counter = 0;
 63    function perFrame() { 
 ︙
 73      if (counter % gap == 0)  {
 ︙                                         // フレーム処理が入る
 90      }
 91 
 92      counter ++;
 93      videoElem.requestVideoFrameCallback(perFrame);
 94    }
```

[2.2節](./02-ui.md#22-ビデオをキャプチャする "INTERNAL")で説明した`HTMLVideoElement.getVideoPlaybackQuality()`から現在までに読み込んだフレーム数を用いてもよいのですが、どのみち正確なフレーム番号を指し示しているわけでもないので、ただのカウンターを使ったほうが早道でしょう。

<!-- See also: Number.MAX_SAFE_INTEGER -->
ビデオ終端から先頭に折り返しても、そのままカウントを続けます。フレーム数を追いかけるのではなく、数枚おきに処理をするのが目的なのでこれで十分です（JavaScriptの整数は16桁くらいまでは精度保証されているので、オーバーフローも気にしなくて大丈夫です）。

#### 注目領域の外側をぼけさせる

ROI（注目領域）は、画像の一部領域だけを処理するときに用います。しかし、注目領域ではないところのみ処理する、という反対の操作はできません。また、ROIは矩形領域なので、今回のように中心部を除いたロの字のような形状は表現できません（ROiを4つに分ける手もあるでしょうが、それはそれで面倒です）。

そこで、先に全体をぼけさせ、その中央にぼけさせていないもとの領域をコピーします（82～86行目）。

```javascript
 82        src = dst.clone();                       // コピーを用意
 83        cv.blur(src, src, new cv.Size(7, 7));    // コピー側全体をボケさせる
 84        let roiSrc = src.roi(rect);              // ボケた側のROI
 85        let roiDst = dst.roi(rect);              // ボケていない側の画像のROI
 86        roiDst.copyTo(roiSrc);                   // ボケてない矩形をボケたほうにコピー
```

ROIも`cv.Mat`なので、明示的に解放するのを忘れないように（89行目）。

```javascript
 89        [src, dst, roiSrc, roiDst].forEach(m => m.delete());
```



### 7.4 ショットをトランジションでつなぐ

#### 目的

2本のビデオをトランジションを交えて切り替えます。

2つのショットからひとつなぎの映像を作成するには、前のショットの末尾フレームと次のショットの先頭フレームをそのままつなぐのが基本です。しかし、前のショットの末尾数秒分と次のショットの先頭数秒分をオーバーラップさせることで、前後のショットを同一画面に同時に示す特殊なつなぎかたもあります。これがトランジションです。本節では、ディゾルブ、水平ワイプ、垂直ワイプ、円形ワイプの4種類のトランジションを実装します。

技術的には、先行するフレームからは徐々にその要素を取り除いていき、続くフレームは反対に徐々に要素を増やしていき、その結果を合成することでトランジションは構成されます（[6.8節](./06-img.md#68-画像を合成する "INTERNAL")）。要素の増減は、0～1の小数点数を値を持つフレームと同サイズの行列で表現できます。値が1.0の箇所では要素を保持し、0.0の箇所では完全に要素を削除し、その中間だと画像を薄くします。そして、この行列を時間に応じて変化させ、フレームに掛けます。つまり、トランジションとは時間によって変化する行列を重みとした重み付け加算ということができます。式にすれば次の通りです。

$$ S(t) = S_1(t) M_1(t) + S_2(t) M_2(t) $$

$S_1(t),\ S_2(t)$が時間 $t$ の元映像のフレーム、 $M_1(t),\ F_2(t)$ が要素増減の行列、 $S(t)$ が合成結果です。先行フレームの要素を減らしたらそのぶん後続フレームの要素を増やすので、通常、2つの行列は相補的です。なので、一方の行列を $M(t)$ としたら、他方の行列は $1 - $M(t)$ で計算できます。

$$ S(t) = S_1(t) M(t) + S_2(t) (1 - M(t)) $$

OpenCVでは行列の加算は`cv.add()`、乗算は`cv.multiply()`です。OpenCV.jsはスカラー値1から行列を引くのが得意ではないので、`cv.Mat.convertTo()`を流用します。「1から行列を引く」は、行列を-1倍して1を足すという操作に置き換えられます。

小数点数を用いるので、画像のデータ型には4チャネル32ビット浮動小数点数型（`cv.CV_32FC3`）を用います。この型を画像に使うときは0をまっくろ（最低輝度）、1をまっしろ（最大輝度）にするのが通例なので、型変換時にはピクセル値をすべて1/255倍します。

ディゾルブの実行例を次の画面に示します。

<img src="Images/Ch07/video-transition-1.png">

上段の左が先行ショット、右が後続ショットです。

下段の左と中央が、それぞれのショットにかける行列を画像として示したものです。スタート時点では、左はまっしろ（1.0）ですが次第に黒くなっていきます。反対に中央はまっくろ（0.0）ですが、次第に白くなっていきます。この濃度が、2つのショットをどれだけ混ぜ合わせるか度合いを示します。

下段右の画像が合成後のフレームです。後続フレームの地下鉄プラットフォームが微妙に映り込んでいるのがわかります。

サンプルには同サイズ（原寸は640×360）、同時間長（13秒）のものを選びました。`<video>`では`autoplay muted loop`の属性を指定しているので、ページがロードされれば即座にスタートしてまわり続けます。

トランジションのスタートは先行ショットの開始から4秒後で、5秒かけて後続ショットに移り変わります。先行ショットがループしてもとに戻れば、また最初から始まります。後続ショットとフレーム数に少し差がありますが、後続の終了タイミングとは連動していません。

下段の下にプルダウンメニューがあり、トランジションタイプを4つのなかから選べます。実行例はそれぞれ説明するときに示します。

#### コード

コード`video-transition.html`を次に示します。

```html
[File] video-transition.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>ショットをトランジションでつなぐ</h1>
 11
 12  <div>
 13    <video width="320" id="videoTagA" autoplay muted loop
 14      src="samples/ny.mp4"></video>
 15    <video width="320" id="videoTagB" autoplay muted loop
 16      src="samples/ny-subway.mp4"></video>
 17  </div>
 18  <div>
 19    <canvas id="canvasTagA" class="placeholder"></canvas>
 20    <canvas id="canvasTagB" class="placeholder"></canvas>
 21    <canvas id="canvasTag" class="placeholder"></canvas>
 22    <select id="selectTag">
 23      <option value="d" selected>ディゾルブ</option>
 24      <option value="h">水平ワイプ</option>
 25      <option value="v">垂直ワイプ</option>
 26      <option value="c">円形ワイプ</option>
 27    </select>
 28  </div>
 29
 30  <script>
 31    let videoElemA = document.getElementById('videoTagA');
 32    let videoElemB = document.getElementById('videoTagB');
 33    let selectElem = document.getElementById('selectTag');
 34    let readyFlag = 0;
 35
 36    function makeMask(size, startTime=4, period=5) {
 37      let type = selectElem.value;
 38      let time = videoElemA.currentTime - startTime;
 39      let color = new cv.Scalar(1, 1, 1);
 40      let pos = Math.max(0, time);
 41      pos = Math.min(pos, period);
 42
 43      let mask1 = cv.Mat.zeros(size, cv.CV_32FC3);
 44      if (type === 'd') {
 45        mask1.data32F.fill((period - pos) / period);
 46      }
 47      else if (type === 'h') {
 48        let w =  Math.floor(videoElemA.width * pos / period);
 49        cv.rectangle(mask1, new cv.Point(w, 0),
 50          new cv.Point(size.width-1, size.height-1), color, cv.FILLED);
 51      }
 52      else if (type === 'v') {
 53        let h = Math.floor(videoElemA.height * pos / period);
 54        cv.rectangle(mask1, new cv.Point(0, h),
 55          new cv.Point(size.width-1, size.height-1), color, cv.FILLED);
 56      }
 57      else if (type === 'c') {
 58        let rMax = Math.hypot(size.width, size.height);
 59        let r = Math.floor(rMax * (period - pos) / period);
 60        cv.circle(mask1, new cv.Point(Math.floor(size.width/2),
 61          Math.floor(size.height/2)), r, color, cv.FILLED);
 62      }
 63      cv.blur(mask1, mask1, new cv.Size(17, 17));
 64
 65      let mask2 = new cv.Mat();
 66      mask1.convertTo(mask2, -1, -1, 1);
 67
 68      return [mask1, mask2];
 69    }
 70
 71    function showFloat32Image(canvasID, src) {
 72      let dst = new cv.Mat();
 73      src.convertTo(dst, cv.CV_8UC3, 255);
 74      cv.imshow(canvasID, dst);
 75      dst.delete();
 76    }
 77
 78    function readFrameAsFloat32(videoElem, size) {
 79      let cap = new cv.VideoCapture(videoElem);
 80      let src = new cv.Mat(size, cv.CV_8UC4);
 81      cap.read(src);
 82      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
 83      src.convertTo(src, cv.CV_32FC3, 1/255);
 84      return src;
 85    }
 86
 87    function perFrame() {
 88      if (readyFlag != 7)
 89        return;
 90
 91      let size = new cv.Size(videoElemA.width, videoElemA.height);
 92      let srcA = readFrameAsFloat32(videoElemA, size);
 93      let srcB = readFrameAsFloat32(videoElemB, size);
 94
 95      let [maskA, maskB] = makeMask(size);
 96      showFloat32Image('canvasTagA', maskA);
 97      showFloat32Image('canvasTagB', maskB);
 98
 99      cv.multiply(srcA, maskA, srcA);
100      cv.multiply(srcB, maskB, srcB);
101      let dst = new cv.Mat();
102      cv.add(srcA, srcB, dst);
103      showFloat32Image('canvasTag', dst);
104
105      [srcA, srcB, maskA, maskB, dst].forEach(m => m.delete());
106      videoElemA.requestVideoFrameCallback(perFrame);
107    }
108
109     function videoBReady() {
110      readyFlag |= 4;
111      videoElemB.width = videoElemB.offsetWidth;
112      videoElemB.height = videoElemB.offsetHeight;
113      perFrame();
114    }
115
116    function videoAReady() {
117      readyFlag |= 2;
118      videoElemA.width = videoElemA.offsetWidth;
119      videoElemA.height = videoElemA.offsetHeight;
120      perFrame();
121    }
122
123    function opencvReady() {
124      readyFlag |= 1;
125      perFrame();
126    }
127
128    videoElemA.addEventListener('loadeddata', videoAReady);
129    videoElemB.addEventListener('loadeddata', videoBReady);
130    var Module = {
131      onRuntimeInitialized: opencvReady
132    }
133  </script>
134
135  </body>
136  </html>
```

構造はこれまでと変わりません。非同期に読み込まれるリソースが3つ（OpenCV、先行ビデオ、後続ビデオ）あるので、フラグ（34、110、117、124行目）が７（`0111`<sub>2</sub>）になったときにフレーム処理を始めます（88行目）。OpenCVリソースはフレーム単位に解放しているので（105行目）、終了処理はとくにはありません。実行中、Windowsのタスクマネージャが「非常に高い」電力消費をずっと報告するので、環境にやさしいコーディングではないようです。

#### 画像を32ビット浮動小数点数で扱う

ビデオフレームはRGBAからRGBに変換してから、32ビット浮動小数点数の`cv.CV_32FC3`に型変換します。このフレーム整形の一連の作業はどちらのビデオでも共通なので、ビデオキャプチャオブジェクトの準備も含めて次のように関数化しています（78～85行目）。

```javascript
 78    function readFrameAsFloat32(videoElem, size) {
 79      let cap = new cv.VideoCapture(videoElem);
 80      let src = new cv.Mat(size, cv.CV_8UC4);
 81      cap.read(src);
 82      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
 83      src.convertTo(src, cv.CV_32FC3, 1/255);
 84      return src;
 85    }
```

浮動小数点数に変換するときに1/255倍することで、ピクセル値の範囲を0.0～1.0にスケーリングするところがポイントです。

キャンバスに表示をするときは、反対に255倍してから8ビット符号なし整数`cv.CV_8UC3`に直します。これを関数化しています（71～76行目）。

```javascript
 71    function showFloat32Image(canvasID, src) {
 72      let dst = new cv.Mat();
 73      src.convertTo(dst, cv.CV_8UC3, 255);
 74      cv.imshow(canvasID, dst);
 75      dst.delete();
 76    }
```

#### ディゾルブ

トランジション用の変換行列は36～76行目の`makeMask()`関数で用意しています。関数は行列のサイズ（第1引数`size`）、トランジション開始時間（第2引数`startTime`）、トランジション期間（第3引数`period`）を引数から受け付け、先行ショット用行列`mask1`と後続ショット用`mask2`を配列に収容して返します。

```javascript
 36    function makeMask(size, startTime=4, period=5) {
 ︙
 68      return [mask1, mask2]; 
 69    } 
```

第2引数と第3引数は、13秒のビデオの時間長にあわせたタイミングをデフォルトにしています。この配分だと、最初の4秒が先行ショットのみ、4～9秒がトランジション中（合成画像）、9～13秒が後続ショットのみという構成になります。

先行ビデオの`mask1`の初期状態は全面黒です（43行目）。これを時間経過にしたがって徐々に部分を白くしていきます。

```javascript
 39      let color = new cv.Scalar(1, 1, 1);              // 白で埋める
 ︙
 43      let mask1 = cv.Mat.zeros(size, cv.CV_32FC3);     // 初期状態は黒
```

どれだけ白くするかを決定するパラメータが40～41行目の`pos`です。この変数は、ビデオ時間が`startTime`以前なら0、トランジション中なら0～5、それ以降なら5のままの値を取ります。

```javascript
 40      let pos = Math.max(0, time);
 41      pos = Math.min(pos, period);
```

ディゾルブでは、`mask1`のデータを値`(period - pos) / period`で埋めます（45行目）。この式なら、トランジション開始時点まで（`pos = 0`）では1.0です。時間が進むにつれ`pos`の値が大きくなるので、埋める値は1.0からゆっくりと小さくなります。終了時点、そしてそれ以降（`pos = period`）は0.0で埋めます。行列は32ビット浮動小数点数の`cv.Mat`なので、そのデータを指し示すプロパティは`Float32Array`配列の`cv.Mat.data32F`です（[4.1節](./04-mat.md#41-画像の構造を調べる "INTERNAL")）。配列なので、`fill()`関数からすべてを同じ値で埋められます。

```javascript
 45        mask1.data32F.fill((period - pos) / period);
```

#### 水平ワイプ

水平ワイプの実行例を次に示します。

<img src="Images/Ch07/video-transition-2.png">

画像を左右に割る垂直の線が時間経過ともに左から右へと走ります。この線の左側を黒、右側を白で埋めるには、初期状態では真っ黒な画像に、右端から垂線までを`cv.rectangle()`（[6.7節](./06-img.md#67-顔を検出する "INTERNAL")）を用いて白い長方形で埋めます。48行目の`videoElemA.width / period`が垂線の移動速度です。

```javascript
 48        let w =  Math.floor(videoElemA.width * pos / period);
 49        cv.rectangle(mask1, new cv.Point(w, 0),
 50          new cv.Point(size.width-1, size.height-1), color, cv.FILLED);
```

長方形を塗りつぶすので、第5引数の`thickness`に負の値を示す`cv.FILLED`が指定してあるのがポイントです。

#### 垂直ワイプ

垂直ワイプの実行例を次に示します。

<img src="Images/Ch07/video-transition-3.png">

画像を上下に分割する水平線が時間経過ともに上から下へと走ります。この線の下側を白で埋めるのも、水平ワイプ同様`cv.rectangle()`（[6.7節](./06-img.md#67-顔を検出する "INTERNAL")）です。53行目のの`videoElemA.height / period`が水平線の移動速度です。

```javascript
 53        let h = Math.floor(videoElemA.height * pos / period);
 54        cv.rectangle(mask1, new cv.Point(0, h),
 55          new cv.Point(size.width-1, size.height-1), color, cv.FILLED);
```

#### 円形ワイプ

円形ワイプの実行例を次に示します。

<img src="Images/Ch07/video-transition-4.png">

画像の中心を中心にした白い円の半径を次第に小さくしていきます。円の最大半径は画像長方形の対角線の半分です（58行目）。三角形の長辺と短辺から斜辺を求めるのには、JavaScript標準装備の`Math.hypot()`が使えます。

```javascript
 58        let rMax = Math.hypot(size.width, size.height);
 59        let r = Math.floor(rMax * (period - pos) / period);
 60        cv.circle(mask1, new cv.Point(Math.floor(size.width/2),
 61          Math.floor(size.height/2)), r, color, cv.FILLED);
```

白い円を描くには`cv.circle()`関数です。関数定義を次に示します。

<!-- FunctionDefinition cv.circle() 円を描く。 -->
```Javascript
cv.circle(                                  // 戻り値なし
    cv.Mat img,                             // 描画対象の画像
    cv.Point center,                        // 中心の座標
    number radius,                          // 半径
    cv.Scalar color,                        // 線色
    number thickness = 1,                   // 線の太さ
    number lineType = cv.LINE_8,            // 線の種類
    number shift = 0                        // 小数部分のビット数
);
```

円を規定するパラメータである中心座標と半径が第2引数`center`と第3引数`radius`に入っただけで、あとは他のグラフィックス描画関数と同じです。ここでも、第5引数`thickness`に塗りつぶしの`cv.FILLED`を指定しています。

関数名のcが小文字であるところが注意点です。大文字の`cv.Circle`は円のパラメータを記述するオブジェクトのコンストラクタですです（[4.4節](./04-mat.md#44-モノクロで円を描く "INTERNAL")）。

> オブジェクトの`cv.Circle`はOpenCV.jsの独自仕様なので、OpenCVリファレンスには記述されていません。



### 7.5 動いているものだけを抜き出す

#### 目的

ビデオから背景を抜き、動いている前景の物体だけを抜き出します。

固定カメラで撮影されたビデオであることが条件です。画面の物体が静止していても、カメラ自体が動いていれば、それは画像処理上は動いているとみなされるからです。ライティングに変化が少ないのも条件です。静止した物体を固定カメラで撮影しても、光の加減で色合いや反射がが変わったり、影ができたりすると、その部分が動いたとみなされるからです。ターゲットとしては、サーベイランスカメラから撮像した街や道路で、抽出するのはそこを移動する歩行者や車両です。

技術的には、複数のフレームの平均の計算です。時間的に変化するビデオフレームを何枚も加算してその枚数で除すと、平均的な画像が得られます。この平均画像には背景だけが表示されます。動かない背景のピクセル値は、何枚ものフレームの平均と一瞬一瞬のフレームとで変わりがないからです。反対に、移動物体は薄ぼんやりとしたイメージになります。移動している前景はフレームの特定の位置に一瞬しか存在しないため、平均するとピクセル値としては非常に小さくなるからです。そして、この平均画像＝背景画像をもとのフレームから差し引けば、物体だけが浮かび上がります。

平均といいましたが、何百枚もの画像をメモリに保持しておくのは現実的ではありません。そこで、[6.8節](./06-img.md#68-画像を合成する "INTERNAL")で取り上げた`cv.addWeighted()`関数を用います。これまでの重ね合わせの画像 $I$ には大きなウェイトを置き、現在のフレームの $F$ には小さな重みをかけていけば、平均と似たような効果が得られます。これなら、保持しておくのは $I$ だけで済みます。重み係数には、ここでは0.99と0.01を使います。式にすると、次のようになります。

$$ I = 0.99 I + 0.01 F $$

小数点数をかけるので、計算対象には`cv.CV_32FC3`を用います。整数では丸め誤差が大きく、思ったように効果が得られないからです。

画像の差分には`cv.subtract()`ではなく、その絶対値版の`cv.absDifff()`関数を使います。前者では暗いところから明るいところを引いたときにマイナス値になり、画像にしたときに0に飽和してしまうからです。その点、絶対値（abs）を取れば、背景と前景の明暗の差がどちらであっても、プラスのピクセル値が得られます。

実行例を次の画面に示します。

<img src="Images/Ch07/video-foreground-1.png">

上段左が元ビデオで、右が前景の物体です。道路、その左右の木々や標識、左上の空などが削除されています。

下段はこれを生成するために用意した画像です。左は`cv.addWeighted()`で順次フレームを加算していくことで得られた平均画像です。前景の車両が消えています。中央がその時点のフレーム（上段左のモノクロ版）から平均画像を引いた差分画像で、前景の車両だけが抽出されます。右は差分画像を`cv.treshold()`で2値化したマスク画像です。上段右は、この現在のフレームにマスク画像を適用しながら灰色の背景にコピーして得られています。

この画面は60秒のビデオが終わりに至ったときのものなので、差分画像に車両が出ていません。しかし、始めてから間もないと、まだ平均画像に前景の車両が残ります。開始1秒後（毎秒25フレームなので、25フレームくらいからの平均）暗いの画面を次に示します（下段のみ）。

<img src="Images/Ch07/video-foreground-2.png">

差分画像はまだ薄い灰色で、よく見ると、道路上になめくじが通ったあとのような影があります。平均化されてもまだ残っている車の残像です。丘の頂上には車両と認識できる形も残っています。そのため、差分を取っても背景の林や道路脇の設備が残っています。

#### コード

コード`video-foreground.html`を次に示します。

```html
[File] video-foreground.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>動いているものだけを抜き出す</h1>
 11
 12  <div>
 13    <video id="videoTag" width="480" height="270" autoplay muted src="samples/motorway.mp4"></video>
 14    <canvas id="canvasTag" class="placeholder"></canvas>
 15  </div>
 16  <div>
 17    <canvas id="canvasTag1" class="placeholder"></canvas>
 18    <canvas id="canvasTag2" class="placeholder"></canvas>
 19    <canvas id="canvasTag3" class="placeholder"></canvas>
 20  </div>
 21
 22  <script>
 23    let videoElem = document.getElementById('videoTag');
 24    let src, src32, src32gray, bg32gray, fg32gray, fg8mask, dst;
 25    let frameCallbackHandle;
 26    let readyFlag = 0;
 27
 28    function showImage(canvasID, src, half=false) {
 29      let mat = new cv.Mat();
 30      if (src.depth === cv.CV_32F)
 31        src.convertTo(mat, cv.CV_8UC3, 255);
 32      else
 33        mat = src.clone();
 34      if (half)
 35        cv.resize(mat, mat, new cv.Size(), 0.5, 0.5);
 36      cv.imshow(canvasID, mat);
 37      mat.delete();
 38    }
 39
 40    function perFrame() {
 41      if (readyFlag !== 3)
 42        return;
 43
 44      // 元フレームにはカラー版（src）とグレー版（srcGray）を用意する。どちらも cv.CV_32FC3
 45      let cap = new cv.VideoCapture(videoElem);
 46      cap.read(srcOrig);
 47      cv.cvtColor(srcOrig, src, cv.COLOR_RGBA2RGB);
 48      src.convertTo(src, cv.CV_32FC3, 1/255)
 49      cv.cvtColor(src, srcGray, cv.COLOR_RGB2GRAY);
 50
 51      // 背景画像と加算していくころで、前景抜きの画像を生成する
 52      cv.addWeighted(srcGray, 0.01, bgGray, 0.99, 0.0, bgGray);         // マニュアルには multichannel でもチャネル単位にやる と書いてあるが、32FC4 のままだとエラーになる。
 53      showImage('canvasTag1', bgGray, true);
 54
 55      // 差分を取ることで前景画像を生成する
 56      cv.absdiff(srcGray, bgGray, fgGray);
 57      showImage('canvasTag2', fgGray, true);
 58
 59      // 前景を 8UC1 に戻すことで、マスク画像にする
 60      fgGray.convertTo(mask, cv.CV_8UC1, 255);
 61      cv.threshold(mask, mask, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
 62      showImage('canvasTag3', mask, true);
 63
 64      // 現在のフレームの CV_8UC3版に前景マスクをかける
 65      dst.data32F.fill(0.8);
 66      src.copyTo(dst, mask);
 67      showImage('canvasTag', dst);
 68
 69      frameCallbackHandle = videoElem.requestVideoFrameCallback(perFrame);
 70    }
 71
 72
 73    function stop() {
 74      [srcOrig, src, srcGray, bgGray, fgGray, mask, dst].forEach(
 75        m => m.delete());
 76      videoElem.cancelVideoFrameCallback(frameCallbackHandle);
 77      videoElem.removeEventListener('pause', stop);
 78      videoElem.removeEventListener('ended', stop);
 79      readyFlag = 0;
 80    }
 81
 82    function init() {
 83      if (readyFlag != 3)
 84        return;
 85
 86      srcOrig = new cv.Mat(videoElem.height, videoElem.width, cv.CV_8UC4);
 87      src = new cv.Mat();
 88      srcGray = new cv.Mat();
 89      bgGray = new cv.Mat(videoElem.height, videoElem.width, cv.CV_32FC1,
 90        new cv.Scalar(0.5));
 91      fgGray = new cv.Mat();
 92      mask = new cv.Mat();
 93      dst = new cv.Mat(videoElem.height, videoElem.width, cv.CV_8UC3);
 94
 95      perFrame();
 96    }
 97
 98    function videoReady() {
 99      readyFlag |= 2;
100      videoElem.width = videoElem.offsetWidth;
101      videoElem.height = videoElem.offsetHeight;
102      init();
103    }
104
105    function opencvReady() {
106      readyFlag |= 1;
107      init();
108    }
109
110    videoElem.addEventListener('loadeddata', videoReady);
111    videoElem.addEventListener('pause', stop);
112    videoElem.addEventListener('ended', stop);
113    var Module = {
114      onRuntimeInitialized: opencvReady
115    }
116  </script>
117
118  </body>
119  </html>
```

フレーム処理で用いられる`cv.Mat`は初期化をつかさどる`init()`関数（82～96行目）でまとめて定義さしています。数が多いので、次の表にそれらのデータ型と用途をまとめて示します。

変数 | データ型 | 画面上の位置 | 用途
---|---|---|---
`srcOrig` | `cv.CV_8UC4` | 上段左 | `<video>`から読み込んだ4チャネル8ビット符号なし整数行列。
`src` | `cv.CV_32FC3` | -- | `srcOrig`を3チャネル32ビット浮動小数点数に変換した行列。
`srcGray` | `cv.CV_32FC1` | -- | `src`を1チャネル32ビット浮動小数点数に変換した行列で、その時点のモノクロフレーム。これを使って平均画像を生成する。
`bgGray` | `cv.CV_32FC1` | 下段左 | ここまでの平均画像（モノクロ背景画像）。初期値では中間のグレーの0.5で埋められている（89～90行目）。
`fgGray` | `cv.CV_32FC1` | 下段中央 | `srcGray`から`bgGray`を引いた差分画像。
`mask` | `cv.CV_8UC1` | 下段右 | `fgGray`を2値化した差分画像。
`dst` | `cv.CV_32FC3` | 上段右 | 3チャネル版の元フレーム`src`を、マスク画像`mask`を使ってこの灰色画像にコピーすることで得られる最終結果。

これらは、ビデオが末尾まで行った（`ended`イベント）、あるいはユーザが停止した（`pause`）ときに解放されます（74～75行目）。

32ビット浮動小数点数を用いているので、`cv.CV_8UC3`に直してからキャンバスに表示します（28空8行目の`showImage()`関数）。前節と同じ手ですが、下段の画像はオリジナルの半分のサイズにするためのフラグ（34～35行目）が入っています。

#### 平均（背景）画像の生成－cv.addWeighted

#### 差分（前景）画像の生成－cv.absDiff

#### 差分（前景）をもとにしたマスク画像の生成－cv.threshold

#### 最終画像の合成－cv.Mat.copyTo

#### 別解－cv2.BackgroundSubtractorMOG2

連続したフレームを順次、重みづけ平均を取っていくことで背景画像を生成するという手段は、画像処理の理解にはもってこいですが、実用となると手数が多くて面倒です。現在では、これよりも洗練された手法が開発されており、OpenCVにもいくつかのアルゴリズムが実装されています。OpenCV.jsでは、そのうちの`cv2.BackgroundSubtractorMOG2()`関数が利用できます。

用法は簡単です。最初に`cv2.createBackGroundSubjectMOG2`クラスのオブジェクトを用意し、読み込んだ映像フレームをその`apply()`メンバ関数で加えるだけです。型変換も必要ありません。


### 7.6 動きの方向を検出する

### 7.7 物体を追いかける

<TBD>
.
