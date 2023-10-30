## 第6章 画像処理

### 6.1 一部領域をモザイク化する

#### 目的

画像中で選択した部分領域にモザイクをかけます。

技術的には、`cv.resize()`関数を使ったリサイズ操作です。画像を拡大するには、そこにはなかったピクセルを推定して補完しなければなりませんが、もっとも簡単な方法だとモザイク状になるという特徴を利用するわけです。画像の一部だけをリサイズするには[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")のROIを使います。マウス操作で部分領域を選択するのには、[2.7節](./02-ui.md#27-マウス操作で部分領域を切り取る "INTERNAL")で作成した`RegionSelect`を使います。

本節ではコードを2つにわけて説明します。第1のコードでは、`cv.resize()`の用法と各種の補間方法を確認します。第2のコードでは主題の部分モザイクがけを実装します。

実行例を次の画面に示します。まずは用法説明のコード①のものです。

<img src="Images/Ch06/img-resize-1.png">

左が元画像で、あえて横幅36ピクセルに縮小しています。右がこれを10倍に拡大したときのものです。画質の乱れは縮小時にはわかりにくいので、拡大から確認しています。リサイズの補間管方法はプルダウンメニューから選択でき、この画面では12個が用意されています。メカニカルに用意しただけなので、`cv.resize()`では利用できないものもあります。その場合はコンソールにその旨表示され、選択は無視されます。ここで選択したのは`cv.INTER_LINEAR`という方法で、ぼけた画像になります。

部分モザイクのコード②の画面を次に示します。

<img src="Images/Ch06/img-resize-2.png">

左が元画像で、顔の部分を選択したところです。その隣に選択部分とそこにモザイクをかけた画像を表示しています。最も右が部分がモザイク化された様子を示しています。

#### コード①

用法説明のコード①`img-resize-1.html`は次の通りです。

```html
[File] img-resize1.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>一部領域をモザイク化する（補完方法）</h1>
 11
 12  <div>
 13    <img id="imageTag" width="36" src="samples/blackcat.jpg"/>
 14    <canvas id="canvasTag" class="placeholder"></canvas>
 15  </div>
 16  <div>
 17    <select id="selectTag"></select>
 18  </div>
 19
 20  <script>
 21    let imgElem = document.getElementById('imageTag');
 22    let selectElem = document.getElementById('selectTag');
 23
 24    function addOptions() {
 25      let inter = Object.keys(cv).filter(prop => prop.startsWith('INTER_'));
 26      inter.forEach(function(e){
 27        let elem = new Option(e, cv[e]);
 28        selectElem.appendChild(elem);
 29      });
 30    }
 31
 32    function imgProc(evt) {
 33      let inter = cv.INTER_LINEAR;
 34      if (evt)
 35        inter = Number(evt.target.value);
 36      let src = cv.imread(imgElem);
 37      let dst = new cv.Mat();
 38      try {
 39        cv.resize(src, dst, new cv.Size(), 10, 10, inter);
 40      }
 41      catch(err) {
 42        console.log(`${inter} not supported`);
 43      }
 44      cv.imshow('canvasTag', dst);
 45      src.delete();
 46      dst.delete();
 47    }
 48
 49    var Module = {
 50      onRuntimeInitialized: function() {
 51        addOptions();
 52        selectElem.addEventListener('change', imgProc);
 53        imgProc();
 54      }
 55    }
 56  </script>
 57
 58  </body>
 59  </html>
```

#### 補間方法

補間（間を補う）とは、存在しないピクセルを周囲のピクセル値から推定する作業です。

画像の拡大から考えます。拡大とは、それまで隙間なく並べられていたピクセルの間を空け、そこに適当な値をあてはめる作業です。たとえば、①③⑤の順に横に並んでいたピクセルを①〇③〇⑤〇のように隙間を空ければ、画像サイズは倍になります（〇の中の数字はピクセル値）。

隙間に埋める値の決め方はいろいろ考えられます。

最も単純なアイデアは、左隣の値をそのまま繰り返すというものです。これで、①①③③⑤⑤という並びになります。この方法を最近傍補間、OpenCVの定数名では`cv.INTER_NEAREST`といいます。簡単で計算も早いのですが、極端に大きくすると滑らかだった線やグラデーションが階段状、つまりモザイクになるという問題が生じます。本節では、この問題を逆手にとってモザイク化を実現しています。

もう少し凝った手なら、前後のピクセルの平均値を取ります。これだと①②➂④⑤⑤となり、もともとの滑らな変化が維持されます。右端がその前隣の⑤と同じなのは、右端の外にはピクセルは存在しないので、繰り返すしかないからです。これが実行例で用いた`cv.INTER_LINEAR`です。この方法はスムーズな絵がえられますが、本来はくっきりとした輪郭線がぼやけます。たとえば、②②⑩⑩のように背景の②と前景の⑩が明確に分かれていたのが、②②②⑥⑩⑩⑩⑩と、②と⑩の間に中間点ができます。これがぼけです。

この方法はスムーズな絵がえられますが、本来はくっきりとした輪郭線がぼやけます。たとえば、②②⑩⑩のように背景の②と前景の⑩が明確に分かれていたのが、②②②⑥⑩⑩⑩⑩と、②と⑩の間に中間点ができ、これがぼけになります。

#### 補間方法定数

`cv.resize()`関数で使える補間方法は現在10個が定義されています。いずれも`cv`オブジェクト直下のプロパティです。コード①では、（お手軽おという理由で）`<option>`をプログラム的に生成すために、これらプロパティを`Object.keys()`で機械的に取り出しています（24～30行目）。

```javascript
 22    let selectElem = document.getElementById('selectTag');
 23
 24    function addOptions() {
 25      let inter = Object.keys(cv).filter(prop => prop.startsWith('INTER_'));
 26      inter.forEach(function(e){
 27        let elem = new Option(e, cv[e]);
 28        selectElem.appendChild(elem);
 29      });
 30    }
```

25行目は[3.2節](./03-opencv.md#32-OpenCVjsの定数と関数 "INTERNAL")で使った手で、補間方法定数名がINTER_で始まることを利用しています。すべてが必ずしも`cv.resize()`で使えるとはかぎらないのは前述の通りで、他にも`WARP_`で始まる定数が2点利用可能だったりするので、詳細はOpenCVのリファレンスマニュアルを参照してください。検索フィールドから「InterpolationFlags」を入力すれば見つかります。

よく用いられる補間方法定数を次の表に示します。

定数名 | 値 | 意味
---|---|---
`cv.INTER_NEAREST` | 0 | 最近傍補間。近所のピクセル値をそのまま使う。モザイク状になる。
`cv.INTER_LINEAR` | 1 | バイリニア補間（デフォルト）。両端の2点の間を一次関数（リニア）で補間する（画像は2次元なので縦横両方）。処理は早い。
`cv.INTER_AREA` | 3 | ピクセル領域関係を利用したリサンプリング。縮小時に使うとモアレが防げる。
`cv.INTER_CUBIC` | 2 | バイキュービック補間。`INTER_LINEAR`のさらに横の2点を加えて、4点を使って三次関数で補間する。拡大時にお勧め。
`cv.INTER_LANCZOS4` | 4 | ランチョスと読む（ハンガリー人物理学者の名前）。たいていのケースでよりよい結果が得られるので、チョイスに悩むときはこれを使う。

#### cv.resize関数

画像の拡大縮小を行っているのが36～43行目です。

```javascsript
 36      let src = cv.imread(imgElem);
 37      let dst = new cv.Mat();
 38      try {
 39        cv.resize(src, dst, new cv.Size(), 10, 10, inter);
 40      }
 41      catch(err) {
 42        console.log(`${inter} not supported`);
 43      }
```

拡大縮小の`cv.resize()`関数を`try-catch`でくるんでいるのは、指定の補間方法（39行目末尾の`inter`）が利用できないものだったときの対処です。関数定義を次に示します。

<!-- FunctionDefinition cv.resize() 画像をリサイズする。 -->
```Javascript
cv.resize(                                  // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    cv.Size dsize,                          // リサイズ後のサイズ
    number fx = 0,                          // 横幅の倍率（浮動小数点数）
    number fy = 0,                          // 高さの倍率（浮動小数点数）
    number interpolation = cv.INTER_LINEAR  // 補完方法
);
```

第1引数`src`には入力画像の、第2引数`dst`には出力画像のcv.Matをそれぞれ指定します。第2引数はあらかじめ`new cv.Mat()`で定義しておきます。

第3引数`dsize`にはサイズを`cv.Size`から指定します。縦横のアスペクト比が元画像と異なるときは、縦あるいは横方向が引き延ばされます。ここでダミーの`new cv.Size()`を使っているのは、続く引数で倍率を指定しているからです。

第4引数`fx`と第5引数`fy`には横と縦の倍率を浮動小数点数から指定します。デフォルトの0なときは、第3引数の`dsize`が用いられます。指定されたときは第3引数は無視されます。

第6引数`interpolation`は、先述の補間方法です。

#### コード②

部分領域モザイク化のコード②`img-resize-2.html`は次の通りです。

```html
[File] img-resize2.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7    <script async src="libs/regionselect.js" type="text/javascript"></script>
  8  </head>
  9  <body>
 10
 11  <h1>一部領域をモザイク化する</h1>
 12
 13  <div>
 14    <img id="imageTag" width="360" src="samples/blackcat.jpg"/>
 15    <canvas id="canvasTagRoi" width="100" class="placeholder"></canvas>
 16    <canvas id="canvasTagMosaic" width="100" class="placeholder"></canvas>
 17    <canvas id="canvasTag" width="360" class="placeholder"></canvas>
 18  </div>
 19  <div>
 20    縮小率（2～30） <input type="range" id="rangeTag" min="2" value="10" max="30"/>
 21  </div>
 22
 23  <script>
 24    let imgElem = document.getElementById('imageTag');
 25    let rangeElem = document.getElementById('rangeTag');
 26    let region = [167, 56, 117, 102];
 27
 28    function imgProc(evt) {
 29      if (evt.type === 'regionselect')
 30        region = evt.detail;
 31
 32      let src = cv.imread(imgElem);
 33      let rect = new cv.Rect(...region);
 34      let roi = src.roi(rect);
 35      cv.imshow('canvasTagRoi', roi);
 36
 37      let scale = Number(rangeElem.value);
 38      let mat = new cv.Mat();
 39      cv.resize(roi, mat, new cv.Size(), 1/scale, 1/scale);
 40      cv.resize(mat, mat, new cv.Size(region[2], region[3]), 0, 0, cv.INTER_NEAREST);
 41      mat.copyTo(roi);
 42      cv.imshow('canvasTagMosaic', mat);
 43      cv.imshow('canvasTag', src);
 44
 45      [src, roi].forEach(m => m.delete());
 46    }
 47
 48    function resourceReady() {
 49      let rs = new RegionSelect('imageTag');
 50      imgElem.addEventListener('regionselect', imgProc);
 51      rangeElem.addEventListener('input', imgProc);
 52    }
 53
 54    function opencvReady() {
 55      rangeElem.dispatchEvent(new InputEvent('input'));
 56    }
 57
 58    window.addEventListener('load', resourceReady);
 59    var Module = {
 60      onRuntimeInitialized: opencvReady
 61    }
 62  </script>
 63
 64  </body>
 65  </html>
```

#### cv.resizeの第2引数

まず、読み込んだ画像にROIを設定します（32～34行目）。[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")で説明したように、画像処理をROIだけに適用すれば、それ以外の領域には影響を与えません。

```javascript
 32      let src = cv.imread(imgElem);
 33      let rect = new cv.Rect(...region);
 34      let roi = src.roi(rect);
```

続いて、このROIをいったん指定の縮小率で縮小し（39行目）、またもとの大きさに拡大します（40行目）。拡大時には`cv.INTER_NEAREST`を使うことで、あえてモザイク状にします。

```javascript
 38      let mat = new cv.Mat();
 39      cv.resize(roi, mat, new cv.Size(), 1/scale, 1/scale);
 40      cv.resize(mat, mat, new cv.Size(region[2], region[3]), 0, 0, cv.INTER_NEAREST);
```

`cv.resize()`を利用するまえに、第2引数で出力を受ける`cv.Mat()`を用意します（38行目）。よく見ると、コンストラクタの引数は空なので、これは空の`cv.Mat`です。しかし、`cv.resize()`を呼び出すと、関数が入力と同じデータ型となるように`cv.Mat`を新たに生成します。出力のサイズが異なるので、同じところに上書きできないからです。そのため、この第2引数の`mat`は、ROIとは別のオブジェクトとなっています。したがって、縮小拡大後のこのブジェクトの中身は、明示的にROIに戻さなければなりません。これをやっているのが41行目です。

```javascript
 41      mat.copyTo(roi);
```

[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")の同じ処理の箇所を確認します（`mat-roi.html`の56行目）。

```javascript
 56      cv.blur(roi, roi, new cv.Size(11, 11));
```

`cv.blur()`関数（次節）は画像をボケさせる関数なので、入出力でサイズもデータ型も同じなので、あらたに`cv.Mat`を生成しなくてよいので、同じROIが使いまわされます。

このように、関数を使ったときはだれがどのタイミングで`cv.Mat`を再利用するのか新規生成をするのがわかりにくくなっています。ROIに処理結果が反映していないときは、このような処理になっていないか確認してください。



### 6.2 画像をぼかす

#### 目的

画像をぼけさせます。ぼけ、といってきましたが、正確には平滑化（スムージング）処理という呼ばれます。皮膚のしみやそばかすなどのでこぼこを周囲の皮膚に溶け込ませることで取り除く、美肌効果があります。昔の映画だとソフトフォーカスと呼ばれていた効果に似ています。

技術的には、4種類の平滑化関数`cv.blur()`、`cv.GaussianBlur()`、`cv.medianBlur()`、`cv.bilateralFilter()`を取り上げます。名称は順に平均化フィルタ、ガウス平滑フィルタ、中間値フィルタ、バイラテラルフィルタといいます。どれにも「フィルタ」と付いているのは、これらがターゲットのピクセルを色眼鏡で見るかのように「フィルタをかけ」ることによって変更するからです。

関数にいくつもあるパラメータと効果の関連性を理解するため背景の理論も簡単に説明します。平滑化処理は、画像上のノイズなど細かく不要な要素を取り除くことで、続く別の処理を効果的に用いるのによく用いられます。

実行例を次の画面に示します。

<img src="Images/Ch06/img-blur-1.png">

左側が元画像、右側が平滑化処理後の画像です。ここでは平均化処理（`cv.blur()`）を用いています。効果がわかりやすくなるよう、あえてぼけの多くなるパラメータを用いています。

プルダウンメニューからは他の3つの方法を選択できます。次にそれらの結果を示します。

<!-- いずれも 360x202 -->
<img src="Images/Ch06/img-blur-2.png" width="300">
<img src="Images/Ch06/img-blur-3.png" width="300">
<img src="Images/Ch06/img-blur-4.png" width="300">

左から順にガウス平滑化フィルタ、中間値フィルタ、バイラテラルフィルタのものです。ガウス平滑化フィルタは平均化のものとあまり変わりありませんが、後者2点は色合いがアニメ絵のように領域内でまとまった感じになります。これら2点の間で比較すると、中間値では輪郭がぼけているのに対し、バイラテラルではしっかりしています。

#### コード

コード`img-blur.html`は次の通りです。

```html
[File] img-blur.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>画像をぼかす</h1>
 11
 12  <div>
 13    <img width="360" id="imageTag" src="samples/ducks-and-dog.jpg"/>
 14    <canvas id="canvasTag" class="placeholder"></canvas>
 15  </div>
 16  <div>
 17    <select id="selectTag">
 18      <option value="blur">平均化</option>
 19      <option value="gaussian">ガウス平滑化</option>
 20      <option value="median">中間値フィルタ</option>
 21      <option value="bilateral">バイラテラルフィルタ</option>
 22    </select>
 23  </div>
 24
 25
 26  <script>
 27    let imgElem = document.getElementById('imageTag');
 28    let selectElem = document.getElementById('selectTag');
 29
 30    function imgProc(evt) {
 31      let filter = 'blur';
 32      if (evt)
 33        filter = evt.target.value;
 34      console.log(`Filter: ${filter}`);
 35
 36      let src = cv.imread(imgElem);
 37      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
 38      let dst = new cv.Mat();
 39      let ksize = 7;
 40      let ksizeBox = new cv.Size(ksize, ksize);
 41
 42      switch(filter) {
 43      case 'blur':
 44        cv.blur(src, dst, ksizeBox);
 45        break;
 46      case 'gaussian':
 47        cv.GaussianBlur(src, dst, ksizeBox, 5.0);
 48        break;
 49      case 'median':
 50        cv.medianBlur(src, dst, ksize);
 51        break;
 52      case 'bilateral':
 53        cv.bilateralFilter(src, dst, ksize, 75, 75, cv.BORDER_DEFAULT);
 54      default:
 55        break;
 56      }
 57
 58      cv.imshow('canvasTag', dst);
 59      src.delete();
 60      dst.delete();
 61    }
 62
 63    function opencvReady() {
 64      selectTag.addEventListener('change', imgProc);
 65      imgProc();
 66    }
 67
 68    var Module = {
 69      onRuntimeInitialized: opencvReady
 70    }
 71  </script>
 72
 73  </body>
 74  </html>
```

#### フィルタ

フィルタをかける、というのは、数学的には画像を表現する行列とフィルタを表現する行列の間で乗算を行うことです。ただ、普通の定数倍や高校数学で学ぶ行列乗算とやや異なり、畳み込み演算という計算をします。

畳み込み演算の手順を次の図から説明します。

<!-- 原画は ODG にあり。759 x 208 -->
<img src="Images/Ch06/img-blur-convolution.png" width="500">

左が画像を表す行列で、今、中心にあるピクセルを変換しようとしています。この中心を注目ピクセル、周辺の8つのピクセルを含めたエリアを注目領域といいます。その右にあるのは左と同じサイズの行列で、要素はすべて1/9です。

まず、これら2つの行列の間で互いに同じ位置にあるピクセル同士で掛け算をし、その和を注目ピクセルと同じ位置に書き込みます。左上では99×1/9＝11です。この掛け算の結果が3番目の行列です。最後に、この行列要素の和を取り、別の行列の注目ピクセルに書き込みます。これが右端のものです。この処理を、対象の画像の左上から右下まですべてのピクセルについて行うのが、畳み込み演算です。

2番目の行列をフィルタ、あるいはカーネルと呼びます。図のカーネルの要素はすべて1/9です。この畳み込み演算はつまり、注目領域のすべてのピクセル値の和を取り、要素数で割っていることに他なりません。これは平均の計算です。

このフィルタのサイズを変更したり、要素の値を変化させることで、いろいろな変換が可能になります。

カラーやアルファチャネル付き画像では、各チャネルをそれぞれ独立したものとして操作します。ピクセルの入れ替えなので、入力と出力の画像のサイズもデータ型も同じです。

#### 平均化フィルタ

44行目の`cv.blur()`関数は、要素を要素数の逆数で埋めたフィルタを用いることで周辺ピクセルの平均値で注目ピクセルを置き換えます。

```javascript
 39      let ksize = 7;
 40      let ksizeBox = new cv.Size(ksize, ksize);
 ︙
 44        cv.blur(src, dst, ksizeBox);
```

一次元なら、株価や為替でみる移動平均と同じ効果です。フィルタのサイズを3×3から、39～40行目のように7×7と大きくすれば、画像がより平滑化されます。

`cv.blur()`関数の定義を次に示します。

<!-- FunctionDefinition cv.blur() 画像を平滑化する。 -->
```Javascript
cv.blur(                                    // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    cv.Size ksize,                          // フィルタのサイズ
    cv.Point anchor = cv.Point(-1, -1),     // アンカーポイント
    number borderType = cv.BORDER_DEFAULT   // 画像端でのピクセルの推定方法
);
```

第1引数`src`は入力の、第2引数`dst`は出力の、それぞれ`cv.Mat`です。第2引数の`cv.Mat`はあらかじめ定義しておかなければなりませんが、メモリ領域は関数が自動的に確保してくれます。

第3引数`ksize`はフィルタのサイズで、`cv.Size`から縦横のサイズを指定します。ここでは7×7を使っているので、`new cv.Size(7, 7)`です（40行目）。`ksize`のkはカーネルのkです。フィルタは別に正方形でなくてもよいのですが、変わったことをしようと思っているのでなければ、たいていは正方形です。また、たいていは奇数です。奇数だと、中心の注目ピクセルがしっかりと定まるからです。

第4引数`anchor`は注目ピクセルの位置です。デフォルトの(-1, -1)のときはフィルタの中央で、これも、凝ったことをしているのでなければデフォルトのまま使います。

第5引数`borderType`には画像端でのピクセルの推定方法を指定します。

#### 画像端推定方法

畳み込み演算を行うには、注目ピクセルの周りに他のピクセルが必要です。しかし、次の図に示すように、画像端になると外部にはピクセルがありません。

<!-- 原画は ODG にあり。192 x 190 -->
<img src="Images/Ch06/img-blur-border.png" width="120">

そこで、不明なところは外挿します。補間方法には次の表に示すものがあります。

<!-- BORDER_WARP は blur() と GaussianBlur() でサポートされていないので削除 -->
<!-- `cv.BORDER_WARP` | ピクセルが同じパターンで繰り返されるとしてコピー | 5678｜12345678｜1234 -->

ピクセル外挿定数 | 意味 | 例
---|---|---
`cv.BORDER_CONSTANT` | 外側のピクセル値を0などの一定の値とする | 0000｜12345678｜ 0000
`cv.BORDER_REPLICATE` | 境界にあるピクセルの値を外側に繰り返しコピーする | 1111｜12345678｜8888
`cv.BORDER_REFLECT` | 境界を境にピクセル値を鏡像のように値をコピーする | 4321｜12345678｜8765
`cv.BORDER_REFLECT_101` | 上と同じだが、境界の値が繰り返されない | 5432｜12345678｜7654
`cv.BORDER_DEFAULT` | `cv.BORDER_REFLECT_101`と同じ | 5432｜12345678｜7654

例の列では、パイプ2本の間にある8つの数字がピクセル値で、その左右外側が外挿値です。`cv.resize()`のデフォルトは`cv.BORDER_DEFAULT`で、これはcv.BORDER_REFLECT_101`と同じパータンです。

#### ガウス平滑化フィルタ

47行目の`cv.GaussianBlur()`関数は、注目ピクセルにはよりウェイトを置き、そこから離れたピクセルには平均値への寄与をするなくするようにした、重み付け平均を取ります。

```javascript
 47        cv.GaussianBlur(src, dst, ksizeBox, 5.0);
```

重み付けの値は、中心からの距離にしたがって減るようにガウス関数を使います。ガウス関数は次の図が示すように吊り鐘上になっています（偏差値でよく見る正規分布です）。ガウス関数の定数σの値が小さくなればなるほど吊り鐘はとがり、したがって注目ピクセルから外れたところの寄与が減ります。反対に、σの値が大きくなればなるほど吊り鐘はフラットになり、遠方のピクセルが結果に寄与する度合いが大きくなります。

<!-- 原画は xlsx にあり。 721 x 337 -->
<img src="Images/Ch06/img-blur-gaussian.png" width="400">

σは標準偏差で、σが1というのは偏差値10個ぶん（40または60）として知られています。参考までガウス関数の式を次に示します。 $a$ は定数、 $r$ は注目ピクセルからの距離、 $\mu$ は平均値、 $\sigma$ は標準偏差です。

$$ g(r) = a\ exp( - \frac{(r - \mu)^2}{2 \sigma^2 }) $$

`cv.GaussianBlur()`関数の書式を次に示します。

<!-- FunctionDefinition cv.GassianBlur() ガウス関数を使って画像を平滑化する。 -->
```Javascript
cv.GaussianBlur(                            // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    cv.Size ksize,                          // フィルタのサイズ
    number sigmaX,                          // x方向のσ
    number sigmaY = 0,                      // y方向のσ
    number borderType = cv.BORDER_DEFAULT   // 画像端でのピクセルの推定方法
);
```

第1引数`src`、第2引数`dst`、第3引数`ksize`、第6引数`borderType`は`cv.blur()`と同じです。

第4引数`sigmaX`はx方向の標準偏差で、大きければボケが大きく、小さければボケが小さくなります。第5引数はy方向のもので、デフォルトの0を指定すると、`sigmaX`と同じ値が取られます。どちらも0にすると、`ksize`から適当に決められます。

#### 中間値フィルタ

50行目の`cv.medianBlur()`関数は、注目領域内のピクセルの中間値で注目ピクセルを置き換えます。

```javascript
 50        cv.medianBlur(src, dst, ksize);
```

中間値あるいはメディアンは値を順番に並べ、ちょうど中間になる値を採用する統計的な測度です。しばしば、給与や資産など偏りがいびつなデータの統計で用いられます（イーロン・マスクが日本に越してきただけで日本人の平均総資産が2000円くらい増えることからわかるように、平均は実感を反映しているといえません）。

平均値、ガウス平滑化フィルタは正方行列で表現できますが、中間値フィルタは並べ替えを伴うので畳み込みでは計算できません。線形代数では解けないので、非線形フィルターと呼ばれます。

関数の書式を次に示します。

<!-- FunctionDefinition cv.medianBlur() 中間値フィルタを用いて画像を平滑化する。 -->
```Javascript
cv.medianBlur(                              // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    cv.Size ksize                           // フィルタのサイズ
);
```

引数はいずれもこれまでと同じです。フィルタ内部の値だけで計算が完結するので、ピクセル外挿が必要ありません。

ただ、フィルタサイズにはやや妙な制限が加わっています。まず3以上の奇数しか使えません。3×3あるいは5×5ならビット深度が`cv.CV_8U`、`cv.CV_16U`、`cv.CV_32F`の画像が使えますが、それ以上なら`cv.CV_8U`以外はエラーになります。

#### バイラテラルフィルタ

53行目の`cv.bilateralFilter()`関数はバイラテラルフィルタという、ガウス関数をもう一段複雑にした関数を用います。バイラテラル（bilateral）は相手が2つあるときに使う言葉で、訳語には両面や両側や互恵的といった語が与えられています。

```javascript
 53        cv.bilateralFilter(src, dst, ksize, 75, 75, cv.BORDER_DEFAULT);
```

ガウス関数は注目ピクセルから近いか遠いかのみに着目していました。バイラテラルはこれに加えて、ピクセル値が近いか遠いかにも着目します。距離を相手にしている前者を空間方向、ピクセル値を考慮する後者を色方向といいます。

関数の形はガウス関数の指数関数を2つ乗じた格好になっています。目的のところで述べたように輪郭が出やすくなるのは、この色方向の距離を考慮しているからです。輪郭は、前景と背景、あるいは2つの物体や色の間の仮想的な線です（アニメや漫画ではないので、実世界の人の輪郭には線は描かれていません）。したがって、輪郭をはさんだピクセル値はそれぞれの物体の中よりも大きく離れています。バイラテラルフィルタは、その差が大きければ値を温存する方向に動きます。

輪郭については次節でもっと取り扱います。

関数の書式を次に示します。

<!-- FunctionDefinition cv.bilateralFilter() バイラテラルフィルタを用いて画像を平滑化する。 -->
```Javascript
cv.bilateralFilter(                         // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    cv.Size ksize,                          // フィルタのサイズ
    number sigmaColor,                      // 空間方向のσ
    number sigmaSpace,                      // 空間方向のσ
    number borderType = cv.BORDER_DEFAULT   // 画像端でのピクセルの推定方法

);
```

第4引数が色方向用の`sigmaColor`、第5引数が空間方向用の`sigmaSpace`に置き換わっている以外は、引数は`cv.GaussianBlur()`と同じです。

ただし、入力画像は1チャネルか3チャネルでなければなりません。37行目であらかじめRGBAからRGBにしているのはこれが理由です。

```javascript
 36      let src = cv.imread(imgElem);
 37      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
```

OpenCVリファレンスはσの値に10未満の値を指定しても大して効果はなく、150より大きいと効果が絶大すぎてアニメ絵に近くなると述べています。なお、コードで用いている75という値は、OpenCVのチュートリアルからそのまま取ってきたものです。

参考までに、シグマを50、75（再掲）、150にしたときの結果を次に左から順に示します。

<!-- いずれも 360x202 -->
<img src="Images/Ch06/img-blur-5.png" width="300">
<img src="Images/Ch06/img-blur-4.png" width="300"> <!-- 再掲 -->
<img src="Images/Ch06/img-blur-6.png" width="300">




### 6.3 線画の生成
<!-- 残念ながら、OpenCV.js には cv.stylization()、cv.pencilSketch()、cv.edgePreservingFilter()、cv.detailEnhanve() といった Non-photorealistic 系は実装されていない。-->

#### エッジ検出の原理

写真からスケッチ（線画）を起こすような描くような効果を得るには、元画像から輪郭を抽出します。

先に、本節のコードで生成される画像を次に示します。左が元画像、右が検出後の画像です。

<!-- <img src="Images/Ch04/img-canny-1.png"> -->

輪郭は、背景と前景の境界線でピクセル輝度が大きく変化するという仮定をもとに抽出されます。前景の端なので、画像処理では輪郭のことを「エッジ」と呼びます。

エッジ検出の原理を、白い前景がグレーの背景に写っている次の模式的な画像から考えます。データ型には1チャンネル符号なし8ビット整数（`cv.CV_8UC1`）を使うので、ピクセル値の範囲は0～255です。

<!-- 969x303 -->
<!-- <img src="Images/Ch04/img-canny-theory.png" width="600"> -->

左図が元画像です。水平方向で切り取った5行目の黒枠に着目します。ピクセル値の並びは31、16、21、29、249、215、244、239、254、208で、グレー地と白い物体の境目で値が29から249へと急激に変化することがわかります。その前後ではブレはあるものの、だいたいおなじ値が連続しています。

中央図では、それぞれのピクセルについて、その左側のピクセルとの差分を計算しています。左端のピクセルには左側のピクセルがないので0とします。これにより、変化量がわかります。差がとくに大きい箇所だけ太字で強調してあります。

右図は、変化差の大きいピクセルの値を255（白）、それ以外を0（黒）に変えています。これがエッジです。

もっとも、これは理論的な話なので、期待しているほどにはエッジが浮かび上がるわけではありません。

OpenCVには、いろいろな場面に対応できる高度なエッジ検出メカニズムがいくつか用意されています。本節では、その中でも性能が高いといわれるCanny（キャニー）アルゴリズムを実装した`cv.Canny()`メソッドを用います。

#### エッジ検出

次にエッジ検出のコードを示します。

```html
[File] img-canny1.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>エッジ検出（輪郭抽出）</h1>
 11
 12  <div>
 13    <img id="imageTag" width="480" src="samples/cable-car.jpg"/>
 14    <canvas id="canvasTag" class="placeholder"></canvas>
 15  </div>
 16
 17  <script>
 18    let imgElem = document.getElementById('imageTag');
 19
 20    var Module = {
 21      onRuntimeInitialized: imgProc
 22    }
 23
 24    function imgProc() {
 25      let src = cv.imread(imgElem);
 26      let dst = new cv.Mat();
 27      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
 28      cv.Canny(src, dst, 50, 150);
 29      cv.imshow('canvasTag', dst);
 30      src.delete();
 31      dst.delete();
 32    }
 33  </script>
 34
 35  </body>
 36  </html>
```

コードパターンはこれまでのものと変わりません。実行結果は本節冒頭に示した通りです。

#### cv.Cannyメソッド

エッジ検出の`cv.Canny()`メソッド（28行目）の定義を次に示します。

<!-- FunctionDefinition cv.Canny() -->
```Javascript
cv.Canny(                      // 戻り値なし
 	Mat image,                 // CV_8UC1 入力画像
 	Mat edges,                 // CV_8UC1 出力画像
	number threshold1,         // 第1閾値（0～255）
	number threshold2,         // 第2閾値（0～255）
	number apertureSize = 3,   // カーネルサイズ（3、5、7）
	boolean	L2gradient = false // L2ノルムフラグ
);
```

第1引数には入力画像の`cv.Mat`を指定します。1チャンネル符号なし8ビット整数（`cv.CV_8UC1`）でなければならないので、`<img>`から読み込んだ画像（25行目）は`cv.cvtColor()`でモノクロに変更しなければなりません。

第2引数には出力画像を収容する`cv.Mat`を指定します。例によって、あらかじめ`new cv.Mat()`から定義したもの（26行目）でなければなりません。

第3引数と第4引数は、Cannyアルゴリズムに関係する最大と最小の閾値です。Cannyエッジ検出では、最初に輝度の差分（先の図の右図）が指定の最大閾値より大きければ間違いなくエッジであると判断します。これが`threshold2`です。また、最小閾値未満なら閾値ではないと棄却します。最少と最大の間のピクセルについては、連結性をもとに判断します。そのピクセルが最大閾値以上の間違いなくエッジの隣にあれば、それもエッジとしてカウントされます。そうでなければ棄却します。最小閾値をあまり低い値にするとノイズをエッジと誤検出しやすくなり、最大閾値を高い値にするとエッジを見逃しやすくなります。`threshold1`と`threshold2`は交換可能で、小さいほうが最小閾値に用いられます。

第5引数の`apertureSize`はカーネルサイズです。Cannyアルゴリズムでは、微分のSobelフィルタで最初のエッジ抽出を行いますが、これはそのサイズです。デフォルトでは3×3ですが、5または7も指定可能です。たいていはデフォルトでかまいません。

参考までにSobelフィルタだけを適用したときの結果を次に示します。

<!-- <img src="Images/Ch04/img-canny-sobel.png"> -->

Sobelフィルタは横方向と縦方向の線を検出するバリエーションがありますが、これは横方向のものです。Cannyの結果と比べると、エッジの判定ステップを踏まえていないため、線が太く荒っぽくなることがわかります。

この結果を得るには、`img-canny1.html`の28行目を次のものと置き換えます。詳細はOpenCVのリファレンスを参照してください。

```Javascript
 28      cv.Sobel(edge, edge, cv.CV_8UC1, 0, 1);
```

第6引数の`L2gradient`は、差分の強さ（縦横の差分をベクトルと考えたときのその大きさ）を計算するときにL2ノルム（普通の距離）を使うか、L1ノルム（マンハッタン距離）を使うかの指定です。デフォルトの`false`ならL1ノルムで、こちらのほうが計算が簡単です。`true`ならばL2ノルム（二乗和の平方根）を計算します。

Cannyアルゴリズムは、OpenCVのチュートリアル「Canny Edge Detection」に詳しく説明されています。興味のあるかたは、次のURLから参照してください。

```https://docs.opencv.org/3.4/da/d22/tutorial_py_canny.html```

#### 色付き輪郭

白い線だけのエッジ検出では素っ気ないので、元画像の上にエッジを描画します。つまり、このような画像を得ます。

<!-- <img src="Images/Ch04/img-canny-2.png"> -->

モノクロの紙面ではわかりませんが、線はピンク色（CSS名でPaleVioletRed）で描かれています。

次の要領で作成します。

1. `img-canny-1.html`と同じ要領で`cv.Canny()`でエッジ検出をします。このエッジ画像（コードでは`edge`）は、背景が黒、エッジが白です。
2. エッジ画像を反転します（`edgeReverse`）。これで、背景が白、エッジが黒の画像が得られます。これは、エッジ部分だけを温存するマスク画像として用います。
3. 単一色で染められた、元画像と同じサイズの画像を用意します（`dstColor`）。この色を適当に選択することで、エッジ部分をその色にすることができます（ここではPaleVioletRed）。
4. 元画像を、2の反転エッジ画像をマスクに用いて3の画像にコピーします。エッジ部分は黒なのでそこだけ背景色が残り、あとは元画像で埋められます。

コードを次に示します。

```html
[File] img-canny2.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>エッジ検出（元画像付き）</h1>
 11
 12  <div>
 13    <img id="imageTag" width="480" src="samples/cable-car.jpg"/>
 14    <canvas id="canvasTag" class="placeholder"></canvas>
 15  </div>
 16
 17  <script>
 18    let imgElem = document.getElementById('imageTag');
 19
 20    var Module = {
 21      onRuntimeInitialized: imgProc
 22    }
 23
 24    function imgProc() {
 25      let srcColor = cv.imread(imgElem);
 26      let edge = new cv.Mat();
 27      let edgeReverse = new cv.Mat();
 28      let dstColor = new cv.Mat(imgElem.height, imgElem.width,
 29        cv.CV_8UC4, new cv.Scalar(219, 112, 147, 128));
 30      cv.cvtColor(srcColor, edge, cv.COLOR_RGBA2GRAY);
 31      cv.Canny(edge, edge, 50, 150);
 32      cv.bitwise_not(edge, edgeReverse);
 33      srcColor.copyTo(dstColor, edgeReverse);
 34      cv.imshow('canvasTag', dstColor);
 35
 36      [srcColor, edge, edgeReverse, dstColor].forEach(function(mat){
 37        mat.delete();
 38      });
 39    }
 40  </script>
 41
 42  </body>
 43  </html>
```

ポイントは28行目です。`cv.Mat`を生成するときに縦横のサイズと元画像（`imgElem`）に合わせ、同じデータ型（`cv.8UC4`）とし、背景色を`cv.Scalar`で埋めています。RGBの値はPaleVioletRedのもので、アルファチャネルは半分透過（128）にしていますが、好みの値に変更してください。あとは、33行目でこの単一色画像に、エッジの反転画像（32行目）をマスクにして元画像をコピーする（33行目）だけです。


### 6.4 顔を検出する

### 6.5 QRコードを読む

<!-- OpenCV には QRCodeEncoder クラスがあるが、OpenCV.js には実装されていない。Python で試したが、使い方がわからなくて core dump する。生成には Python の pip qrcode を使うとよい -->

### 6.6 画像の傷を補修する

### 6.7 書類の傾きを補正する

ToneMapping, 
