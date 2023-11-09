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

2つのショットからひとつなぎの映像を作成するとき、前のショットの末尾フレームと次のショットの先頭フレームを単純につなぐのが基本です。しかし、前のショットの末尾数秒分と次のショットの先頭数秒分をオーバーラップさせることで、前後のショットを同一画面に同時に示す特殊なつなぎかたもあります。これがトランジションです。本節では、左右ワイプ、ディゾルブ、円形ワイプの3種類のトランジションを実装します。

技術的には、先行するフレームからは徐々にその要素を取り除いていき、続くフレームは反対に徐々に要素を増やしていき、その結果を合成することでトランジションは構成されます（[6.8節](./06-img.md#68-画像を合成する "INTERNAL")）。この要素の増減は0～1の小数点数を値を持つ、フレームと同じサイズの行列で表現できます。値が1の箇所では要素を保持し、0の箇所では完全に要素を削除し、その中間だと画像を薄くします。一種の線形フィルタ（3×3の対角行列）ですが、ピクセル位置に応じて値が変わるところがちょっと違います（[6.3節](./06-img.md#63-線画を生成する "INTERNAL")参照）。マスク画像としてみることもできますが、完全保持と完全無視の間が許容されているところが異なります（[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")参照）。

この行列をフレームに掛ければ、フレームの画像の要素が増減します。つまり、トランジションは次の式で表せます。

$$ S = S_1 * F_1 + S_2 * F_2 $$

$S_1,\ S_2$が元映像のフレーム、 $F_1,\ F_2$ が要素増減の行列、 $S$ が合成結果です。加算は`cv.add()`、乗算は`cv.multiply()`で計算できます。通常、トランジションの2つの行列は相補的なので、一方の行列から他方の行列は $1 - $F$ で計算できます。もっとも、OpenCV.jsの行列は定数を掛けたり引いたりするのは得意ではないので、`cv.Mat.convertTo()`を流用します。1から行列を引くのは、行列を-1倍して1を足すという操作に置き換えられます。

実行例を次の画面に示します。

<img src="Images/Ch07/video-transition-1.png">


#### コード



### 7.5 動いているものだけを抜き出す

### 7.6 動きの方向を検出する

### 7.7 物体を追いかける

<TBD>
.
