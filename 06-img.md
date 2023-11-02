## 第6章 画像処理

### 6.1 一部領域をモザイク化する

#### 目的

画像中で選択した部分領域にモザイクをかけます。

技術的には、`cv.resize()`関数を使ったリサイズ操作です。画像を拡大しようと引っ張り伸ばすと、間に隙間ができます。この隙間を埋めるのにもっともシンプルな方法を使うと、結果がモザイク状になるという特徴を利用するわけです。画像の一部だけをリサイズするには[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")のROIを使います。マウス操作で部分領域を選択するのには、[2.7節](./02-ui.md#27-マウス操作で部分領域を切り取る "INTERNAL")で作成した`RegionSelect`を使います。

本節ではコードを2つに分けて説明します。第1のコードでは、`cv.resize()`の用法と各種の補間方法を確認します。第2のコードでは主題の部分モザイクがけを実装します。

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

もう少し凝った手なら、前後のピクセルの平均値を取ります。これだと①②➂④⑤⑤となり、もともとの滑らな変化が維持されます。右端がその前隣の⑤と同じなのは、右端の外にはピクセルは存在しないので、繰り返すしかないからです。これが実行例で用いた`cv.INTER_LINEAR`です。この方法はスムーズな絵が得られますが、本来はくっきりとした輪郭線がぼやけます。たとえば、②②⑩⑩のように背景の②と前景の⑩が明確に分かれていたのが、②②②⑥⑩⑩⑩⑩と、②と⑩の間に中間点ができます。これがぼけです。

この方法はスムーズな絵がえられますが、本来はくっきりとした輪郭線がぼやけます。たとえば、②②⑩⑩のように背景の②と前景の⑩が明確に分かれていたのが、②②②⑥⑩⑩⑩⑩と、②と⑩の間に中間点ができ、これがぼけになります。

#### 補間方法定数

`cv.resize()`関数で使える補間方法は現在10個が定義されています。いずれも`cv`オブジェクト直下のプロパティです。コード①では、（お手軽という理由で）`<option>`をプログラム的に生成するために、これらプロパティを`Object.keys()`で機械的に取り出しています（24～30行目）。

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

ガウス平滑化フィルタ | 中間値フィルタ | バイラテラルフィルタ
---|---|---
<img src="Images/Ch06/img-blur-2.png" width="300"> | <img src="Images/Ch06/img-blur-3.png" width="300"> | <img src="Images/Ch06/img-blur-4.png" width="300">

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

<!-- いずれも 360x202。img-blur-4.png は再掲 -->

σ=50 | σ=75 | σ=150 | 
---|---|---
<img src="Images/Ch06/img-blur-5.png" width="300"> | <img src="Images/Ch06/img-blur-4.png" width="300"> | <img src="Images/Ch06/img-blur-6.png" width="300">



### 6.3 線画の生成
<!-- 残念ながら、OpenCV.js には cv.stylization()、cv.pencilSketch()、cv.edgePreservingFilter()、cv.detailEnhanve() といった Non-photorealistic 系は実装されていない。-->

#### 目的

画像から黒地に白い線の線画を生成します。また、前節のバイラテラルフィルタで元画像をアニメ絵っぽくしたうえで、その上に線を重畳することで、輪郭線付きのアニメ絵風にします。

技術的には、線画は画像の「エッジ」を検出することで得られます。この処理は、ピクセル列に対して微分を施すフィルタを用いて畳み込み演算を施すことで行われます。どのようなフィルタかはおいおい説明します。

本節ではコードを2つに分けて説明します。第1のコードでは、OpenCV関数はいくつかある画像微分フィルタ関数のうち`cv.Sobel()`、`cv.Laplacian()`、`cv.Canny()`を適用し、それぞれの出来栄えを比較します。第2のコードでは輪郭付きアニメ絵風を生成します。

実行例を次の画面に示します。まずは微分フィルタ関数比較のコード①のものです。

<img src="Images/Ch06/img-edge-1.png">

左から元画像、Sobel、Laplacian、Cannyです。カタカナ読みすると順にソベル、ラプラシアン、キャニーで、いずれも開発者の人名から来ています。ソベルはかなり粗いですが、ラプラシアンとキャニーはなかなかです。

輪郭付きアニメ絵風のコード②の画面を次に示します。

<img src="Images/Ch06/img-edge-2.png">

左が元画像、中央がキャニーの結果の白黒を反転させることで輪郭線を黒にしたものです。右が輪郭付きアニメ絵風で、元画像を`cv.bilateralFilter()`で処理し、それを中央の画像をマスクとして背景灰色の画像に貼り付けています（マスクについては[5.8節](./05-colors.md#58-背景を入れ替える（輝度調整付き） "INTERNAL")参照）。

#### エッジ検出の原理

画像のエッジ（輪郭線）は、背景と前景の境界線でピクセル値が大きく変化するという仮定をもとに抽出されます。

エッジ検出の原理を、白い前景がグレーの背景に写っている次の模式的な画像から考えます。データ型は1チャンネル8ビット符号なし整数（`cv.CV_8UC1`）としているので、ピクセル値の範囲は0～255です。

<!-- xlsx に原画あり。969x303 -->
<img src="Images/Ch06/img-edge-theory.png" width="600">

左図が元画像です。水平方向で切り取った5行目の黒枠に着目します。ピクセル値の並びは31、16、21、29、249、215、244、239、254、208で、グレー地と白い物体の境目で値が29から249へと急激に変化することがわかります。その前後ではブレはあるものの、だいたいおなじ値が連続しています。

中央図では、それぞれのピクセルについて、その左側のピクセルとの差分を計算しています。デジタルなのでただの引き算ですが、連続したアナログ値と考えると、これは微分操作です。左端のピクセルには左側のピクセルがないので外挿して0とします。これにより、変化量がわかります。差がとくに大きい箇所だけ太字で強調してあります。

右図は、変化差の大きいピクセルの値を255（白）、それ以外を0（黒）に変えています。これがエッジです。

OpenCVには、いろいろな場面に対応できる高度なエッジ検出メカニズムがいくつか用意されています。`cv.Sobel()`は上述の通り微分を1回かける操作を施します。`cv.Laplacian()`は微分を2回、つまり2階微分をかけます。ソベルを距離÷時間の速度と考えれば、ラプラシアンは距離を時間で2回割った加速度に相当します。

#### コード①

3つのエッジ検出関数を使ったエッジ検出のコード①`img-edge1.html`は次の通りです。

```html
[File] img-edge1.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>線画の生成（輪郭のみ）</h1>
 11
 12  <div>
 13    <img id="imageTag" width="240" src="samples/cinquecento.jpg"/>
 14    <canvas id="canvasTag1" class="placeholder"></canvas>
 15    <canvas id="canvasTag2" class="placeholder"></canvas>
 16    <canvas id="canvasTag3" class="placeholder"></canvas>
 17  </div>
 18
 19  <script>
 20    let imgElem = document.getElementById('imageTag');
 21
 22    function imgProc() {
 23      let src = cv.imread(imgElem);
 24      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
 25
 26      let edge = new cv.Mat();
 27      cv.Sobel(src, edge, cv.CV_8U, 1, 1, 5);
 28      cv.imshow('canvasTag1', edge);
 29
 30      cv.Laplacian(src, edge, cv.CV_8U, 3);
 31      cv.imshow('canvasTag2', edge);
 32
 33      cv.Canny(src, edge, 50, 150);
 34      cv.imshow('canvasTag3', edge);
 35
 36      [src, edge].forEach(m => m.delete());
 37    }
 38
 39    var Module = {
 40      onRuntimeInitialized: imgProc
 41    }
 42  </script>
 43
 44  </body>
 45  </html>
```

#### cv.Sobel関数

27行目では、`cv.Sobel`関数を使ってエッジを検出しています。1次微分関数です。

```javascript
 24      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
 25
 26      let edge = new cv.Mat();
 27      cv.Sobel(src, edge, cv.CV_8U, 1, 1, 5);
 28      cv.imshow('canvasTag1', edge);
```

24行目で入力画像をモノクロに変換しています。本節のエッジ検出関数はいずれも8ビット符号なし整数（`cv.CV_8U`）ならなんでも受け付けます。操作をどのチャネルにも等しく適用するだけだからです。アルファチャネルもです。

しかし、RGBAのまま処理をすると結果が見えなくなります。RGB画像に加わったすべて255のアルファチャネルでは、（定数なので）1次でも2次でも微分を取ると0です。そして、すべて0のアルファチャネルは完全透明という意味なので、キャンバスに表示してもなにも見えません。ここでは事前にモノクロに変換していますが、せめて`cv.COLOR_RGBA2RGB`で3チャネルにへ変換しておきます。

関数の定義を次に示します。

<!-- FunctionDefinition cv.Sobel() 1次微分をかけることで画像のエッジを抽出する。-->
```Javascript
cv.Sobel(                                   // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    number ddepth,                          // 出力画像のビット深度
    number dx,                              // x方向にかける微分の回数
    number dy,                              // y方向にかける微分の回数
    number ksize = 3,                       // フィルタサイズ
    number scale = 1,                       // 倍数
    number delta = 0,                       // 加算数
    number borderType = cv.BORDER_DEFAULT   // 画像端でのピクセルの推定方法
);
```

第1引数`src`には入力画像の、第2引数`dst`には出力画像をそれぞれ指定します。画像のチャネル数にはとくに制限はありません。複数チャネルなら、それぞれ個別に処理されます。

第3引数`ddepth`には出力画像のビット深度を定数から指定します。8ビット符号なし整数なら`cv.CV_8U`です。

第4引数`dx`と第5引数`dy`は、それぞれX方向（水平）とy方向（垂直）に何回微分をかけるか指定します。`dx`に1を指定すると、水平方向に1回微分をかけるので、縦線が抽出されます。`dy`に1なら横線が抽出されます。ここではともに1を指定しているので、縦横の線を検出します。

第5引数`ksize`にはフィルタサイズを指定します。`cv.Sobel()`も中身は畳み込みフィルタなので、フィルタサイズは[6.2節](#62-画像をぼかす "INTERNAL")の線形フィルタで説明したものと同じですが、1、3、5、7だけしか使えません。オプションなので、27行目のように未指定ならば3が選択されるので、3×3行列が用いられます。

行列の中身は、3×3なら次のように構成されています（ $M_x$ がx方向の、 $M_y$ がy方向のもの）。

$$M_x = \begin{pmatrix}
  −1 & 0 & 1 \\
  -2 & 0 & 2 \\
  -1 & 0 & 1
\end{pmatrix}, M_y = \begin{pmatrix}
  −1 & −2 & −1 \\
  0 & 0 & 0 \\
  1 & 2 & 1
\end{pmatrix}$$

第6引数`scale`と第7引数`delta`は得られた結果のピクセルの輝度を補正するため、定数倍と定数加算を行います。デフォルトはそれぞれ1と0なので、補正なしという意味です。

第7引数`borderType`にが画像外郭のピクセル値を外挿する方法を定数から指定します。外挿方法は[6.2節](#62-画像をぼかす "INTERNAL")で説明しました。

ソベルフィルタの原理は前述の通りですが、より詳しいことは、次にURLを示すOpenCVチュートリアルで説明されています。

```https://docs.opencv.org/4.8.0/d2/d2c/tutorial_sobel_derivatives.html```

#### cv.Laplacain関数

30行目では、`cv.Laplacian`関数を使ってエッジを検出しています。2次微分関数です。

```javascript
 30      cv.Laplacian(src, edge, cv.CV_8U, 3);
```

関数の定義を次に示します。

<!-- FunctionDefinition cv.Laplacian() 2次微分をかけることで画像のエッジを抽出する。-->
```Javascript
cv.Laplacian(                               // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    number ddepth,                          // 出力画像のビット深度
    number ksize = 1,                       // フィルタサイズ
    number scale = 1,                       // 倍数
    number delta = 0,                       // 加算数
    number borderType = cv.BORDER_DEFAULT   // 画像端でのピクセルの推定方法
);
```

引数は前出の`cv.Sobel()`から`dx`、`dy`を抜いただけです。第4引数の`ksize`がデフォルトの1のときは、次の3×3行列が用いられます。

$$M_x = \begin{pmatrix}
  0 & 1 & 0 \\
  1 & -4 & 1 \\
  0 & 1 & 0
\end{pmatrix}$$

#### cv.Canny関数

34行目では、`cv.Canny`関数を使ってエッジを検出しています。

```javascript
 24      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
 ︙
 30      cv.Laplacian(src, edge, cv.CV_8U, 3);
```

関数の定義を次に示します。

<!-- FunctionDefinition cv.Canny() キャニー法を用いたエッジ検出。-->
```Javascript
cv.Canny(                                   // 戻り値なし
   	cv.Mat image,                           // 入力画像（cv.CV_8U）
   	cv.Mat edges,                           // 出力画像（cv.CV_8UC1）
   	number threshold1,                      // 第1閾値（0～255）
    number threshold2,                      // 第2閾値（0～255）
    number apertureSize = 3,                // カーネルサイズ（3、5、7）
    boolean	L2gradient = false              // L2ノルムフラグ
);
```

キャニーエッジ検出の基本はソベルと同じ1次微分フィルタですが、精度向上のための仕掛けがいくつか組み込まれています。関数引数に関係してくるので、やや細かいですが説明を加えます。

1. ガウス平滑化フィルタ（[6.2節](#62-画像をぼかす "INTERNAL")をかけることでノイズを除去します。内部で自動的に行っているので、引数には関係しません。
2. ソベルフィルタをxとy方向にかけます。第5引数の`apartureSize`がこのときのフィルタサイズです。`cv.Sobel()`のフィルタサイズには1～7の奇数のみしか指定できないので、ここでもこの制約が適用されます。
3. 結果からエッジの大きさと方向を計算します。
4. 線と線が重なると太くなってしまいます。そこで、重なりのあるところは1本の細線にします。
5. 3で計算した強度と大小2つの閾値を比較し、それがエッジあるかを判断します。このときに用いるのが第3引数`threshold1`と第4引数`threshoold2`です。一方が他方より大きければよいので、順番は入れ替えてもかまいません。判断基準を次に示します。エッジ強度をG、閾値大は $\theta_l$、閾値小は $\theta_s$ と書いています。

エッジ強度と閾値の関係 | 判定
---|---
$G \ge \theta_l$ | エッジと判定
$G \le \theta_s$ | エッジではないと棄却
$\theta_s \leq G \leq \theta_l$ | 他のエッジピクセルと隣り合わせになっていればエッジと判定。でなければ棄却。

閾値小をあまり低い値にするとノイズをエッジと誤検出しやすくなり、閾値大を高い値にするとエッジを見逃しやすくなります。

第6引数`L2gradient`はステップ3のエッジの大きさの計算方法を指定するもので、L1ノルムとL2ノルムから選びます。L1なら`false`を指定します。こちらがデフォルトです。`true`ならL2です。

ノルムというのは距離のことで、次に示す図では左下の点から右上の点に移動するとき距離です。

<!-- ODG に原画あり。564x212 -->
<img src="Images/Ch06/img-edge-norms.png" width="300">

左はL2ノルムで、対角線を突っ切って始点から終点に行ったときの直線距離です。横と縦の二乗和の平方根から計算できます。右がL1ノルムで、あみだくじのように格子線を通って終点に向かいます。道路が正確な碁盤の目状なら、どの経路でも距離は変わりません。わたしたちは碁盤の目の街というと京都をイメージしますが、ニューヨークのマンハッタンが代表的ということで、これをマンハッタン距離といいます。L1は引き算と絶対値演算だけで計算できるので、L2に比べて高速です。

Cannyアルゴリズムは、OpenCVチュートリアルの「Canny Edge Detection」に詳しく説明されています。興味のあるかたは、次のURLから参照してください。

```https://docs.opencv.org/4.8.0/da/d5c/tutorial_canny_detector.html```

#### コード②

輪郭付きアニメ絵風のコード②`img-edge2.html`は次の通りです。

```html
[File] img-edge2.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>線画の生成（元画像付き）</h1>
 11
 12  <div>
 13    <img id="imageTag" width="240" src="samples/cinquecento.jpg"/>
 14    <canvas id="canvasTag1" class="placeholder"></canvas>
 15    <canvas id="canvasTag2" class="placeholder"></canvas>
 16  </div>
 17
 18  <script>
 19    let imgElem = document.getElementById('imageTag');
 20
 21    function imgProc() {
 22      let src = cv.imread(imgElem);
 23      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
 24
 25      let edge = new cv.Mat();
 26      cv.cvtColor(src, edge, cv.COLOR_RGB2GRAY);
 27      cv.Canny(edge, edge, 50, 150);
 28      cv.bitwise_not(edge, edge);
 29      cv.imshow('canvasTag1', edge);
 30
 31      let color = new cv.Scalar(50, 50, 50);
 32      let bg = new cv.Mat(imgElem.height, imgElem.width, cv.CV_8UC3, color);
 33
 34      let fg = new cv.Mat();
 35      cv.bilateralFilter(src, fg, 7, 75, 75, cv.BORDER_DEFAULT);
 36
 37      fg.copyTo(bg, edge);
 38      cv.imshow('canvasTag2', bg);
 39
 40      [src, edge, bg, fg].forEach(m => m.delete());
 41    }
 42
 43    var Module = {
 44      onRuntimeInitialized: imgProc
 45    }
 46  </script>
 47
 48  </body>
 49  </html>
```

#### 要領

輪郭付きアニメ絵風画像は`cv.Canny()`と`cv.bilateralFilter()`の組み合わせで生成します。

①`img-edge1.html`同様、`cv.Canny()`でエッジ検出をします（27行目）。このエッジ画像は、背景が黒、エッジが白です。

```javascript
 25      let edge = new cv.Mat();
 26      cv.cvtColor(src, edge, cv.COLOR_RGB2GRAY);
 27      cv.Canny(edge, edge, 50, 150);
```

②エッジ画像はマスクに使います。エッジ部分以外を前景として元画像をコピーしたいので、背景を白、エッジを黒に反転します（28行目)。

```javascript
 28      cv.bitwise_not(edge, edge);
```

③単一色で染めた、元画像と同じサイズの画像を用意します（29行目）。この色が線色になります。ここでは(50, 50, 50）のやや濃い目のグレーを用いています。

```javascript
 31      let color = new cv.Scalar(50, 50, 50);
 32      let bg = new cv.Mat(imgElem.height, imgElem.width, cv.CV_8UC3, color);
```

④元画像に`cv.bilateralFilter()`をかけることで、アニメ絵風にします（35行目）。

```javascript
 34      let fg = new cv.Mat();
 35      cv.bilateralFilter(src, fg, 7, 75, 75, cv.BORDER_DEFAULT);
``` 

④元画像を、②の反転エッジ画像をマスクに用いて③の画像にコピーします。エッジ部分は黒なのでそこだけ背景色が残り、あとは元画像で埋められます。

```javascript
 37      fg.copyTo(bg, edge);
``` 

### 6.4 QRコードを読む
<!-- OpenCV には QRCodeEncoder クラスがあるが、OpenCV.js には実装されていない。Python で試したが、使い方がわからなくて core dump する。生成には Python の pip qrcode を使うとよい -->
<!-- BE/LE の bytes を読む Node.js の Buffer.readFloat32BE/LE は普通の js には実装されていない。-->

#### 目的

画像に埋め込まれたQRコードを読み取ります。また、回転した状態でもコードが読み取れることも確認します。

技術的には、`cv.QRCodeDetector()`クラスを紹介します。クラスには複数のコードを一気に読み取る、図形の検出と解読をまとめて行うなどのコンビニエンス機能が用意されていますが、ここでは対象は1つにかぎり、処理も検出とデコードを個別に行います。また、検出位置を確認できるように画像上に矩形を描きますが、これにはOpenCVのグラフィックス機能の`cv.polylines()`関数を使います。

実行例を次の画面に示します。

<img src="Images/Ch06/img-qrcode-1.png">

左の画像ではウォールペーパーの上で18秒に1回の速さで回転しています。左下のボタンをクリックすると画像がキャプチャされ、QRコードが読み込まれます。結果はボタン脇に表示されます。ここではURLです。右はキャプチャ時点を示すキャンバスで、検出したコードの周囲に枠線を引いています。

コンソールにもいろいろ出力されますが、その部分を説明するときに順に示します。

#### コード

コード`img-qrcode.html`は次の通りです。

```html

[File] img-qrcode.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>QRコードを読む</p>
 11
 12  <div>
 13    <img id="imgTagBg" src="samples/wallpaper.jpg" class="hide"/>
 14    <img id="imgTagQr" src="samples/qr.png" class="hide"/>
 15    <canvas id="canvasTag1"></canvas>
 16    <canvas id="canvasTag2"></canvas>
 17  </div>
 18  <div>
 19    <input type="button" id="buttonTag" value="Click" class="click"/>
 20    <span id="spanTag" width="100">解読結果</span>
 21  </div>
 22
 23
 24  <script>
 25    let imgElemBg = document.getElementById('imgTagBg');
 26    let imgElemQr = document.getElementById('imgTagQr');
 27    let canvasElem1 = document.getElementById('canvasTag1');
 28    let ctx = canvasElem1.getContext('2d');
 29    let buttonElem = document.getElementById('buttonTag');
 30    let spanElem = document.getElementById('spanTag');
 31    let deg = 0;
 32
 33    function rotate(deg=0) {
 34      let side = 400;
 35      canvasElem1.width = canvasElem1.height = side;
 36      ctx.drawImage(imgElemBg, 0, 0, canvasElem1.width, canvasElem1.height);
 37      ctx.translate(side/2, side/2);
 38      ctx.rotate(deg * Math.PI / 180);
 39      ctx.drawImage(imgElemQr,
 40        0, 0, imgElemQr.width, imgElemQr.height,
 41        -imgElemQr.width/2, -imgElemQr.height/2, imgElemQr.width, imgElemQr.height);
 42    }
 43
 44    function decodePoints(points) {
 45      let floatArr = [];
 46      for(let c=0; c<points.cols; c++)
 47        floatArr.push([...points.floatPtr(0, c)]);
 48      return floatArr;
 49    }
 50
 51    function drawPoly(img, points) {
 52      cv.cvtColor(img, img, cv.COLOR_RGBA2RGB);
 53      let mv = new cv.MatVector();
 54      let mat = new cv.Mat();
 55      points.convertTo(mat, cv.CV_32SC2);
 56      mv.push_back(mat);
 57      cv.polylines(img, mv, true, new cv.Scalar(255, 255, 0), 5);
 58      cv.imshow('canvasTag2', img);
 59      [mv, mat].forEach(m => m.delete());
 60    }
 61
 62    function imgProc() {
 63      console.log(`Click at ${deg}°`);
 64      let imgData = ctx.getImageData(0, 0, canvasElem1.width, canvasElem1.height);
 65      let src = cv.matFromImageData(imgData);
 66
 67      let detector = new cv.QRCodeDetector();
 68      let gray = new cv.Mat();
 69      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
 70      let points = new cv.Mat();
 71      let ret = detector.detect(gray, points);
 72      console.log(`Detected: ${ret}.
 73        rows=${points.rows}, cols=${points.cols}, type=${points.type()}`);
 74
 75      let text = detector.decode(src, points);
 76      spanElem.innerHTML = text;
 77
 78      let floatArr = decodePoints(points);
 79      console.log('Point data: ', floatArr);
 80      drawPoly(src, points);
 81
 82      [src, points, detector].forEach(m => m.delete());
 83    }
 84
 85    function setup() {
 86      setInterval(function() {
 87        rotate(deg);
 88        deg = (deg + 1 % 360);
 89      }, 50);
 90    }
 91
 92    window.addEventListener('load', setup);
 93    var Module = {
 94      onRuntimeInitialized: function() {
 95        buttonElem.addEventListener('click', imgProc);
 96      }
 97    }
 98  </script>
 99
100  </body>
101  </html>
```

<!-- See https://misc.laboradian.com/html5/rotate-image-canvas-sample/001/ -->
ウォールペーパーとサンプルQRコードは`<img>`で読み込みますが（13～14行目）、CSSの`display: none;`から非表示にしています。これらは`<canvas>`に重ねて貼り付けることで可視にします（15行目）。ウォールペーパーを背景にQRコードを回転させているのが`rotate()`関数（33～42行目）です。ウォールペーパーとQRコードの画像中心を合わせ、後者を回転するのは描画コンテクストの機能だけで達成しているので、とくに説明は必要ないでしょう。

ボタンクリックで呼び出される`imgProc()`関数でQRコードの処理をします。回転QRコードのキャンバスをそのままコピーするには`CanvasRenderingContext2D.getImageData()`、得られた`ImageData`から`cv.Mat`を生成するには`cv.matFromImageData()`を用います（64～65行目）。要領は[4.2節](./04-mat.md#42-キャンバスをコピーする "INTERNAL")で説明しました。

```javascript
 63      let imgData = ctx.getImageData(0, 0, canvasElem1.width, canvasElem1.height);
 65      let src = cv.matFromImageData(imgData);
```

#### cv.QRCodeDetectorクラス

QRコードの検出と解読には、まず`cv.QRCodeDetector`クラスをインスタンス化します（67行目）。

```javascript
 67      let detector = new cv.QRCodeDetector();
```

コンストラクタには引数はありません。戻り値はクラスオブジェクトです。コンストラクタの定義を次に示します。

<!-- FunctionDefinition cv.QRCodeDetector() QRコードの検出と解読を行うクラスのコンストラクタ。 -->
```Javascript
cv.QRCodeDetector = cv.QRCodeDetector();    // インスタンスを返す
```

#### cv.QRCodeDetector.detect関数

画像中のQRコードの位置（4隅の座標）を`cv.QRCodeDetector`のメンバ関数`detect()`から取得します（71行目）。

```javascript
 68      let gray = new cv.Mat();
 69      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
 70      let points = new cv.Mat();
 71      let ret = detector.detect(gray, points);
 72      console.log(`Detected: ${ret}.
 73        rows=${points.rows}, cols=${points.cols}, type=${points.type()}`);
```

入力画像画像はモノクロ（1チャネル）でなければならないので、ここで色変換します（68～69行目）。カラーでも検出はできますが、色空間はOpenCVネイティブのBGRでなければなりません。結果の座標は`cv.Mat`に収容されて返ってくるので、空のものをあらかじめ用意します（70行目）。

関数定義を次に示します。
<!-- FunctionDefinition cv.QRCodeDetector.detect() QRコードの4隅を検出する。 -->
```Javascript
boolean cv.QRCodeDetector.detect(           // 真偽値
    cv.Mat img,                             // 入力画像
    cv.Mat ponts,                           // 出力（座標値）
);
```

関数はコードが検出されたら`true`を、、でなかったら`false`を返します。

第2引数`points`は1行4列の2チャネル`cv.Mat`を返します。データ型は`cv.CV_32FC2`（整数値で13）です。このことを確認しているのが72～73行目です。コンソールの値を次に示します。

```
Detected: true.
      rows=1, cols=4, type=13
```

ここから4点の座標を取り出す方法はあとで説明します。

#### cv.QRCodeDetector.decode関数

QRコードを含んだ画像とコードの4隅の座標値から中身のデータを取り出すには、`cv.QRCodeDetector`のメンバ関数`decode()`を用います（75行目）。

```javascript
 75      let text = detector.decode(src, points);
 76      spanElem.innerHTML = text; 
```

関数定義を次に示します。

<!-- FunctionDefinition cv.QRCodeDetector.decode() QRコードを解読する。 -->
```Javascript
string cv.QRCodeDetector.decde(             // 文字列を返す
    cv.Mat img,                             // 入力画像
    cv.Mat points,                          // 出力（座標値）
    cv.Mat straight_code = noArray()        // バイナリコード
);
```

戻り値はUTF-8文字列です。戻り値は第1引数`img`にはQRコードを含んだ画像を、第2引数`points`には`detect()`で取得した`cv.Mat`を指定します。第3引数はバイナリコードを返しますが、オプションなので使いません。

ここでは戻り値の文字列をそのまま`<span>`（20行目）に書き込んでいます。

#### 点の情報

`cv.QRCodeDetector.detect()`の返す`cv.Mat`は4×1の2チャネル32ビット浮動小数点数で、次の図のようにチャネル0にx座標4つが、チャネル1にy座標4つが、それぞれ別個に縦に並んでいます。

<!-- ODG に原画あり。424 x 295 -->
<img src="Images/Ch06/img-qrcode-points.png" width="300">

このままでは読みにくいので、[[x0, y0], [x1, y1], [x2, y2], [x3, y3]]の格好の配列の配列に直します。これをやっているのが44～49行目の`decodePoints()`関数です。

```javascript
 44    function decodePoints(points) {
 45      let floatArr = [];
 46      for(let c=0; c<points.cols; c++)
 47        floatArr.push([...points.floatPtr(0, c)]);
 48      return floatArr;
 49    }
```

`cv.Mat`には`data`プロパティがあり、数値のバイナリデータを収容しています。ここではIEEE 754の単精度小数点数です（[4.5節](./04-mat.md#45-浮動小数点数で円を描く "INTERNAL")参照）。`cv.Mat.data`から行列位置を指定して値を得るには、[4.3節](./04-mat.md#43-ピクセルの色名を判定する "INTERNAL")で使った`cv.Mat.ucharPtr()`の32ビット浮動小数点数版の`cv.Mat.floatPtr()`です（47行目）。この関数は、チャネル数ぶんの値を収容した同じ型の`TypedArray`を返します。ここでは、それをいったん2要素の配列に直してから外側の配列に収容しています。

これで、4点ぶんの浮動小数点数が得られました。78行目でこれを確認のためにコンソールに出力しています。例を次に示します（読みやすいように手で整形しています）。

```javascript
Point data: [
  [162, 87],
  [313.3069152832031, 162.72605895996094],
  [236.28421020507812, 313.1889953613281],
  [85.53795623779297, 236.69090270996094]
]
```
#### 多角形を描く
<!-- See https://stackoverflow.com/questions/68289572/how-to-use-cv-polylines-in-opencv-js -->

最後に、座標値から画像`src`（64行目）に矩形を描きます（51～60行目）。これには、頂点のリストを与えることで、それら頂点を線でつないで描画する`cv.polylines()`関数を使います。

```javascript
 51    function drawPoly(img, points) {
 52      cv.cvtColor(img, img, cv.COLOR_RGBA2RGB);
 53      let mv = new cv.MatVector();
 54      let mat = new cv.Mat();
 55      points.convertTo(mat, cv.CV_32SC2);
 56      mv.push_back(mat);
 57      cv.polylines(img, mv, true, new cv.Scalar(255, 255, 0), 5);
 58      cv.imshow('canvasTag2', img);
 59      [mv, mat].forEach(m => m.delete());
 60    }
```

関数定義を次に示します。

<!-- FunctionDefinition cv.polylines() 頂点を線で連結したグラフィックスを描く。 -->
```Javascript
cv.polylines(                               // 戻り値なし
    cv.Mat img,                             // 描画対象の画像
    cv.MatVector points,                    // 頂点のリスト
    cv.Scalar color,                        // 線色
    number thickness = 1,                   // 線の太さ
    number lineType = cv.LINE_8,            // 線の種類
    number shift = 0                        // 小数部分のビット数
);
```

第2引数`points`は[5.4節](./05-colors.md#54-RGB画像を色成分に分解する "INTERNAL")で説明した、複数の`cv.Mat`を収容するコンテナの`cv.MatVector`です（53行目）。複数といいつつ、ここでは要素は1つだけです。要素のデータ型は2チャネル32ビット符号あり整数（`cv.CV_32SC2`）でなければならないので、`cv.QRCodeDetector.detect()`の戻り値をそのままでは使えません。そこで、`cv.Mat.convertTo()`関数から型変換をします（55行目）。

第3引数`color`は色で、`cv.Scalar`から指定します。OpenCVのグラフィック関数はアルファチャネルに対応していないので、キャンバスから読んだRGBAはRGBに変換しておきます（52行目）。

以降の引数はオプションです。

第4引数`thickness`は線の太さをピクセル単位で示します。ここでは5を指定しています。太い線は多角形の外側に描かれます。

第5引数`lineType`の線種はあとから説明します。

第6引数`shift`は座標値に小数点数を用いるときに使うものです。画像処理ではピクセルとピクセルの間にサブピクセルと呼ばれる仮想的なピクセルを考えることで計算精度を高めることがありますが、そのときに使います。デフォルトは0です（小数点数扱いしない）。

#### 線種

OpenCVの多角形や直線の描画関数では、次の表に示す3つの線種から1つを指定できます。デフォルトは8連結です。

`lineType`定数 | 線種名 | 斜線（原寸） | 斜線（拡大）
---|---|---|---
`cv.LINE_4` | 4連結（Bresenhamアルゴリズム） | ![line-4](Images/Ch06/line-types/line-4.png) | ![line-4-enlarge](Images/Ch06/line-types/line-4-enlarge.png)
`cv.LINE_8` | 8連結（デフォルト） | ![line-4](Images/Ch06/line-types/line-8.png) | ![line-4-enlarge](Images/Ch06/line-types/line-8-enlarge.png)
`cv.LINE_AA` | アンチエイリアス | ![line-4](Images/Ch06/line-types/line-aa.png) | ![line-4-enlarge](Images/Ch06/line-types/line-aa-enlarge.png)

`cv.LINE_4`は4連結と呼ばれる線種で、格子状の整数平面に1点ずつ点をプロットしながら線を描画するときに、上下左右の4方向に移動しながら描画する方法です。チェスの駒がその軌跡で線を引いていくとしたら、ルークのようにしか動けない描きかたです。高速ですがギザギザな線になります。

`cv.LINE_8`は8連結で、上下左右斜めの8方向に動くものです（チェスのクィーン）。斜めに移動することができるぶん、4連結よりも若干細く描画されます。

`cv.LINE_AA`は線を背景の色になじむようににじませす。ギザギザな4連結や8連結と異なり、線がスムースに見えます。この手法をアンチエイリアスといい、AAはそこからきています。



### 6.5 電線を消す

#### 目的

画像から電線や金網などの細線を消去します。

技術的には、モルフォロジー演算と呼ばれるテクニックを用います。OpenCVの関数は`cv.morphologyEx()`です。モルフォロジー演算は細線以外にも影響を与えるため、細線のなくなった画像からマスク画像を生成し、これらと元画像を合成します。この後処理は、[5.8節](./05-colors.md#58-背景を入れ替える（輝度調整付き） "INTERNAL")の`cv.threshold()`と`cv.Mat.copyTo()`の組み合わせ技と同じです。

実行例を次の画面に示します。

<img src="Images/Ch06/img-morph-1.png">

左上が元画像です。右上はモルフォロジー演算のなかでもクロージングと呼ばれるタイプの処理を適用したものです。水平に走る電線が消えましたが、メインの電柱と変圧器が水彩画が水でにじんだような感じになっています。

このにじみを解消しているのが下段の画像です。左下は、モルフォロジー処理後の画像から`cv.threhold()`で生成したマスク画像です。右下はモルフォロジー画像に、このマスクをかけた元画像をコピーしたものです。にじみが（すべての点ではないにしても）戻っています。

画面上部のプルダウンメニューでは、モルフォロジー演算時のカーネルの構造を指定できます（後述）。

#### コード

コード`img-morph.html`を次に示します。

```html
[File] img-morph.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>電線を消す</h1>
 11
 12  <div>
 13    <select id="selectTag">
 14      <option value="111111111" selected>すべて1</option>
 15      <option value="010010010">縦線</option>
 16      <option value="000111000">横線</option>
 17    </select>
 18  </div>
 19  <div>
 20    <img width="360" id="imageTag" src="samples/power-pole.jpg"/>
 21    <canvas id="canvasTag1" class="placeholder"></canvas>
 22    <canvas id="canvasTag2" class="placeholder"></canvas>
 23    <canvas id="canvasTag3" class="placeholder"></canvas>
 24  </div>
 25
 26
 27  <script>
 28    let imgElem = document.getElementById('imageTag');
 29    let selectElem = document.getElementById('selectTag');
 30
 31    function imgProc() {
 32      let src = cv.imread(imgElem);
 33
 34      let kernelArray = selectElem.value.split('').map(i => Number(i));
 35      let kernel = cv.matFromArray(3, 3, cv.CV_8UC1, kernelArray);
 36
 37      let morph = new cv.Mat();
 38      let anchor = new cv.Point(-1, -1);
 39      cv.morphologyEx(src, morph, cv.MORPH_CLOSE, kernel, anchor, 1);
 40      cv.imshow('canvasTag1', morph);
 41
 42      let mask = new cv.Mat();
 43      cv.cvtColor(morph, mask, cv.COLOR_RGBA2GRAY);
 44      cv.threshold(mask, mask, 128, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);
 45      console.log('ready');
 46      cv.imshow('canvasTag2', mask);
 47
 48      src.copyTo(morph, mask);
 49      cv.imshow('canvasTag3', morph);
 50
 51      [src, kernel, morph, mask].forEach(m => m.delete());
 52    }
 53
 54    function opencvReady() {
 55      selectElem.addEventListener('change', imgProc);
 56      imgProc();
 57    }
 58
 59    var Module = {
 60      onRuntimeInitialized: opencvReady
 61    }
 62  </script>
 63
 64  </body>
 65  </html>
```

`<select>`オプションの値は、モルフォロジー演算で用いるカーネルを0と1の9つの数字で表現しています（14~16行目）。これらは1文字ずつに分解して数値の配列に直すことで、`cv.matFromArray()`を使って3×3で`cv.CV_8UC1`の`cv.Mat`に変換します（35行目）。

```javascript
 34      let kernelArray = selectElem.value.split('').map(i => Number(i));
 35      let kernel = cv.matFromArray(3, 3, cv.CV_8UC1, kernelArray);
```

#### モルフォロジー演算

モルフォロジー演算の原理を説明します。

モルフォロジー演算には膨張（dilate）、収縮（erode）、オープニング（opening）、クロージング（closing）の4つのタイプがあります。いずれも畳み込み演算と同じで、3×3などのカーネル（フィルタ）をすべてのピクセルについて適用します。

白黒画像から説明します。白が前景、黒が背景と考えてください。

膨張は次の図に示すように、カーネルサイズ内に1つでも白があったら、その域内をすべて白にする操作です。

<!-- ODG に原画あり。1060×308 -->
<img src="Images/Ch06/img-morph-dilate.png" width="600">

左手が処理前の状態です。灰色の丸が注目ピクセル、そのカーネルは点線の枠線です。このとき、前景のテトリスブロックもどきの1点がカーネルに含まれているので、カーネル範囲をすべて白にします（中央）。この操作を画像全体に対して施すと、図右手のように前景の輪郭が膨れ上がります。また、輪郭のでこぼこが減ります。

図にはありませんが、背景の黒がカーネル以上に広がっているところでは、カーネルに1点も白が含まれていないため、膨張操作をしてもままっくろが保たれます。

収縮は次の図に示すように、カーネル内に1つでも黒があったら、その域内をすべて黒にする操作です。

<!-- ODG に原画あり。1068×308 -->
<img src="Images/Ch06/img-morph-erode.png" width="600">

操作要領は、白黒が反転しているだけで膨張と変わりませんが、白い前景が黒で塗りつぶされます。これにより、電線や野球場のバックネットなどの細線が背景に溶け込んで見えなくなります。前景がカーネルサイズに比べて十分に大きければ、前景は残りますが輪郭部分がやや浸食されます。

前景（明るいほう）は膨張では膨らみ、収縮では縮こまります。これだと、前景のサイズが変わってしまいます。そこで、膨張したら収縮する、あるいは収縮したら膨張するのように、反対の操作を組み合わせることでサイズを戻します。膨張＞収縮をクロージング、収縮＞膨張をオープニングといいます。本節のように細線を消したいときは先に収縮するので、オープニングを使います。

1回のオープニングあるいはクロージングでは思った効果が得られないこともあります。その場合は、同じことを何回も繰り返します。

#### 構造要素の形状

先ほどの説明で、「1つでも」白か黒があれば域内を塗り潰すと述べました。この条件はカーネルを構成する行列から変更できます。カーネルの要素を0と1だけとし、収縮なら1の箇所に白が1つでもあればそこを黒で塗りつぶします。0のところに白があっても無視します。このカーネルは構造要素と呼ばれています。

「1つでも」のケースでは、構造要素はすべて1の行列です。本節のコードでは、14行目のオプションの111111111がこれです。

$$\begin{pmatrix}
  1 & 1 & 1 \\
  1 & 1 & 1 \\
  1 & 1 & 1
\end{pmatrix}$$

中央行だけ、横一列に1の並んだカーネルというのも考えられます。

$$ K_{横線} \begin{pmatrix}
  0 & 0 & 0 \\
  1 & 1 & 1 \\
  0 & 0 & 0
\end{pmatrix}$$

これを前述の縮小処理の模式図に当てはめると、白ピクセルはカーネルの左下に1つありますが、そこはカーネルでは1ではありません。そこで、ここでは塗りつぶしはしません。

同様に、中央列だけ縦一列に並んだカーネルも可能です。

$$ K_{縦線} \begin{pmatrix}
  0 & 1 & 0 \\
  0 & 1 & 0 \\
  0 & 1 & 0
\end{pmatrix}$$

次に、中央行横一列カーネルと中央列縦一列カーネルを本節のサンプルに適用したところを示します。

<!-- いずれも 360x222。枠なしバージョンあり -->
横一列 | 縦一列
---|---
<img src="Images/Ch06/img-morph-3.png" width="200"> | <img src="Images/Ch06/img-morph-2.png" width="200">

画像からわかるように、横一列カーネルは水平に走る送電線は温存しますが、設備を縦に走るケーブルは削除しています。縦一列のものは反対に送電線がなくなりますが、垂直に落ちるケーブルは残しています。

モルフォロジー変換については、次にURLが示すOpenCVチュートリアルの翻訳がていねいなのでそちらを参照してください。2016年から更新された気配がありませんが（おそらく鳥取大にあるアーカイブ）、技術に変わりはありません。

````http://labs.eecs.tottori-u.ac.jp/sd/Member/oyamada/OpenCV/html/py_tutorials/py_imgproc/py_morphological_ops/py_morphological_ops.html```

#### cv.morphologyEx関数

コードでモルフォロジー演算のオープニング操作をしているのは39行目の`cv.morphologyEx()`関数です。

```javascript
 37      let morph = new cv.Mat();
 38      let anchor = new cv.Point(-1, -1);
 39      cv.morphologyEx(src, morph, cv.MORPH_CLOSE, kernel, anchor, 1);
 40      cv.imshow('canvasTag1', morph);
```

関数定義を次に示します。

<!-- FunctionDefinition cv.morphologyEx() モルフォロジー演算をする。 -->
```Javascript
cv.morphologyEx(                            // 戻り値なし
    cv.Mat src,                             // 入力画像
    cv.Mat dst,                             // 出力画像
    number op,                              // 演算タイプ
    cv.Point anchor,                        // アンカーポイント
    number iteration = 1,                   // 繰り返し回数
    number borderType = cv.BORDER_CONSTANT  // 画像端でのピクセルの推定方法
    Array borderValue = cv.morphologyDefaultBorderValue()  // 境界値
);
```

第3引数には、操作タイプを次の表に示すOpenCVの定数から指定します。

タイプ | 演算内容
---|---
`cv.MORPH_ERODE` | 収縮処理
`cv.MORPH_DILATE` | 膨張処理
`cv.MORPH_OPEN` | オープニング処理（収縮してから膨張）
`cv.MORPH_CLOSE` | クロージング処理（膨張してから収縮）

第1引数`src`には入力の、第2引数`dst`には出力の`cv.Mat`をそれぞれ指定します。入力画像にチャネル数の制約はありません。複数チャネルならば、それぞれのチャネルにモルフォロジー演算が施されます。出力はサイズもデータ型も入力に合わせられます。

第3引数`op`にはカーネルを指定します。カーネルの大きさは任意ですが、畳み込み演算と同じく、奇数の正方形を用いるのが普通です。

第4引数`anchor`は[6.2節](#62-画像をぼかす "INTERNAL")の`cv.blur()`と同じもので、注目ピクセルの位置です。デフォルトのまま使うことが多いのですが、39行目では続く第5引数を指定したいので、デフォルト値を引数に指定しています。

第5引数`iteration`は処理の繰り返し回数です。`cv.MORPH_OPEN`で2を指定すると、収縮＞膨張＞収縮＞膨張と処理を繰り返します。1回だけでは効果が現れないときに指定します。39行目ではデフォルト1を指定していますが、他の値も試してください。

第6引数`borderType`も[6.2節](#62-画像をぼかす "INTERNAL")の`cv.blur()`と同じもので、画像端でのピクセルの推定方法を定数から指定します。デフォルトは`cv.BORDER_CONSTANT`です。

第7引数`borderValue`は第6引数が`cv.BORDER_CONSTNAT`のときの固定値を指定します。リファレンスは、関数定義に示されている関数から得られるデフォルト値には特別な意味があると書いています。その値は、コンソールから確認すると次の値です。

```javascript
> cv.morphologyDefaultBorderValue() 
< (4)[1.7976931348623157e+308, 1.7976931348623157e+308,
      1.7976931348623157e+308, 1.7976931348623157e+308]
```

モルフォロジー演算を施した画像が得られれば、あとはこれに元画像を貼り付けるだけです。元画像に貼り付ける（`morph.copyTo(src)`）ではなく、元画像を貼り付ける（`src.copyTo(morph)`）なところに注意してください。元画像からは送電線を除いた電柱と変圧器などだけをマスクを使ってコピーしたいからです。 `cv.threshold()`と`cv.Mat.copyTo()`はすでに取り上げたので、説明は割愛します。



### 6.4 顔を検出する


### 6.6 画像の傷を補修する

### 6.7 書類の傾きを補正する

ToneMapping, 
