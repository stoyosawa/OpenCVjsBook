## 第3章 OpenCV.jsの導入

本章ではJavaScript版OpenCVの導入方法を示します。また、非同期的に読み込まれるOpenCV.jsが利用可能になったことを知る方法、クロスサイトスクリプティングの制約についても説明します。



### 3.1 OpenCV.jsを準備

#### opencv.jsファイル

OpenCV.jsで必要なファイルは`opencv.js`だけです。サイズは約10 MBです。

通常のJavaScriptファイルと同じように、`<script>`から読み込みます。HTMLファイルと同じディレクトリに置いてあれば、`src="opencv.js`のように相対パスで`src`属性を設定します。本書のサンプルコードでは`libs`サブディレクトリに置いてあるので、次のように書いています。

```html
<script async src="libs/opencv.js" type="text/javascript"></script>
```

並行ダウンロードを指示する`async`属性は加えるべきです。ファイルが4k画像6、7枚分くらいのサイズなので、ローディングにはかなり時間がかかります。`async`属性の挙動については次に示すWHATWGの図解がわかりやすいので、そちらを参照してください（4.12.1節）。

```https://html.spec.whatwg.org/multipage/scripting.html#attr-script-async```

JavaScriptだから読めるだろう、と、エディタでは開かないように。中身はC/C++から起こされたWebAssemblyのバイナリコードをBase64表現したもので、ヒトに読めるものではないからです（Base64については[2.3節](./02-ui.md#23-カメラにオンオフボタンを加える "INTERNAL")参照）。

`opencv.js`が準備できれば、`cv`というOpenCV.jsのトップレベルのオブジェクトの変数が利用可能になります（`var cv`で定義されている）。以降、OpenCVの関数や定数は、すべてこのオブジェクトのプロパティとしてアクセスできます。

純然たるJavaScriptファイルなので、`src`属性には次節で示す直接ダウンロード先のURLを指定することもできます。

```html
<script async src="https://docs.opencv.org/master/opencv.js"
	type="text/javascript"></script>
```

この方法は、自機やサーバに`opencv.js`のコピーを用意したくない（あるいはできない）ときに便利です。

#### ダウンロード

`opencv.js`は、次に示すURLのドキュメントページに置かれたZipファイルに同梱されています。

```https://docs.opencv.org/```

ページはバージョン毎に整理されているので、とくに要求がなければ、最上端の最新版からzipをダウンロードします。次の画面では、バージョン4.8.0の「zip」へのリンクです。

<!-- 枠線なし版あり -->
<img src="Images/Ch03/opencv-docs-top.png">

OpenCVのリファレンスマニュアルがすべて含まれているので、ファイルサイズは約100 MBとかなり大きいです。Zipは展開し、`opencv.js`だけを抽出します。参考までに、次にZipファイルを展開したWindows エクスプローラの画面を示します。

<!-- 枠線なし版あり -->
<img src="Images/Ch03/opencv-zip.png">

これ以外のファイルは、必要に応じて適宜利用してください。画像ファイルは、オンラインドキュメントと同じ画像でテストをしたいときに使えます。`opencv.js`以外のJavaScriptファイルも重宝します。たとえば、`utils.js`はOpenCV.jsチュートリアルの内部で用いているもので、チュートリアルのコードを自分の環境で動作させるときに必要になります。

必須なのは`opencv.js`だけなので、次のURLからそれだけをダウンロードすることもできます。

```https://docs.opencv.org/4.8.0/opencv.js```

URLの間にあるディレクトリ名はバージョンで、上記では4.8.0です。より新しいバージョンが出ているようなら、そちらに変更してください。常に最新ビルドのものを使いたいのなら、次のURLです。

```https://docs.opencv.org/master/opencv.js```

<!-- Rocket U+1F680 -->
これは、OpenCVのGet Startedページ（トップページのロケットアイコン🚀の［Get Starated］からアクセス）に掲載されているテスト用HTMLページで用いられています。先ほどチェックしたとことろ、開発者版（dev）のものでしたが、実効的には変わりません。

これらURLにブラウザからアクセスすると中身が表示されます。問題は生じませんが、謎のBase64文字ばかりなので読めません。ターゲットURLからファイルにそのまま落とせる`curl`などのツールからダウンロードするとよいでしょう。

#### 動作試験

`opencv.js`を適切な場所に置いたら、動作試験をします。

ここでは、OpenCV関数の`cv.getBuildInformation()`からOpenCVバージョンなどのビルド情報を表示します。コード`opencv-test.html`を次に示します。

```html
[File] opencv-test.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>OpenCV.js の動作確認</h1>
 11
 12  <p>opencv.jsをロードし、ビルド情報を表示します。</p>
 13
 14  <div>
 15    <pre id="statusTag">OpenCV Loading ...</pre>
 16  </div>
 17
 18  <script>
 19    let statusElem = document.getElementById('statusTag');
 20    var Module = {
 21      onRuntimeInitialized: function() {
 22        statusElem.innerHTML = cv.getBuildInformation();
 23      }
 24    };
 25  </script>
 26
 27  </body>
 28  </html>
```

OpenCVのファイルが読み込まれ利用可能になるまでは、当然ながらOpenCVの機能は一切利用できません。そこで、準備が完了したあとで、各種の処理を始めます。

OpenCV.jsには、トップレベルに`Module`というオブジェクトが用意してあります。そして、その`onRuntimeInitialized`プロパティには、準備が完了したときに実行するコールバック関数を指定できます。`document.addEventListener()`のようなものだと思ってください。ここでは、それは21～23行目で定義した無名関数で、15行目の`<pre>`のテキスト部分（`innerHTML`）を、`cv.getBuildInformation()`の返すビルド情報（文字列）と入れ替えます。

実行します。HTMLを読み込んだ時点では15行目に従って「OpenCV Loading ...」と表示されますが、1秒後くらいにその部分にビルド情報が表示されます。結果を次に示します。

<img src="Images/Ch03/opencv-test.png">

バージョンが4.8.0、そのリリース（ビルド）は2023年6月28日なことがわかります。

また、emscriptenというコンパイラが使われていることも読み取れます。OpenCV.jsにある大量のバイト列は、emscriptenというコンパイラでコンパイルされたWeb Assembly（wasm）コードだからです。ここで用いている`Module`は、そのAPIが定義するグローバルなオブジェクトです。興味のあるかたは、次のURLからemscriptenのAPIリファレンスを参照してください。

```https://emscripten.org/```

#### 読み込みタイミング

画像など非同期的に読み込まれるリソースを読み込み完了後に処理するには、`onclick="..."`のようにイベントリスナーをHTML要素に書き込む、あるいは`addEventListener()`から発生イベントに処理関数を対応付けるのが通例です。

しかし、この手はOpenCV.jsでは使えません。`load`イベントは`opencv.js`がダウンロードされたことしか意味しておらず、機能が利用可能な状態になったことまでは保証していないからです。

次のコード`opencv-load1.html`は、通常の`load`イベントが完了したら、OpenCV（`cv`オブジェクト）に定義されている`cv.CV_8UC1`という定数（値は数値の1）を表示します。

```html
[File] opencv-load1.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async id="scriptTag" src="libs/opencv.js" type="text/javascript">
  7      </script>
  8  </head>
  9  <body>
 10
 11  <h1>OpenCV.js ローディングのタイミング・その1</h1>
 12
 13  <script>
 14    let scriptElem = document.getElementById('scriptTag');
 15    scriptElem.addEventListener('load', function(evt) {
 16      console.log(`OpenCV ready? cv.CV_8UC1 = ${cv.CV_8UC1}`);
 17    });
 18  </script>
 19
 20  </body>
 21  </html>
```

実行すると、コンソールには次のように`undefined`が示されます。ファイルのロードが完了しても、`cv`自体が利用可能ではないからです。

```
OpenCV ready? cv.CV_8UC1 = undefined
```

`opencv.js`のダウンロードから実行準備までにかかる時間も測定してみます。次のコードは、上記に`var Module`を加え、それぞれの完了時間を示します。

```html
[File] opencv-load2.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async id="scriptTag" src="libs/opencv.js" type="text/javascript">
  7      </script>
  8  </head>
  9  <body>
 10
 11  <h1>OpenCV.js ローディングのタイミング・その2</h1>
 12
 13  <script>
 14    let startTime = new Date().getTime();
 15
 16    function showTime() {
 17      let t = new Date().getTime();
 18      return `${t} Δ${t-startTime}`
 19    }
 20
 21    let scriptElem = document.getElementById('scriptTag');
 22    scriptElem.addEventListener('load', function(evt) {
 23      console.log(`onload: ${showTime()}`);
 24    });
 25
 26    var Module = {
 27      onRuntimeInitialized: function() {
 28        console.log(`onRuntimeInitialized: ${showTime()}`);
 29      }
 30    };
 31  </script>
 32
 33  </body>
 34  </html>
```

`showTime()`関数（16～19行目）は現在の時刻とスクリプト開始からの時間（Δ）を示すものです。ローカルサーバ（`http://localhost/`）での実行結果を示します。

```
onload: 1696552801989 Δ401
onRuntimeInitialized: 1696552802746 Δ1158
```

`opencv.js`のロードが完了したのが開始から401ミリ秒後、利用可能になったのは1158ミリ秒後でした。つまり、ロードからずいぶんと遅れてからでないと利用できないことがわかります。つまり、ブラウザ環境の性能にもよりますが、実際に画像処理に取りかかれるのに1秒ほど待たなければなりません。

### 3.2 OpenCV.jsの定数と関数

#### OpenCVの定数

OpenCVプログラミングでは、あらかじめ定義されたいろいろな定数を利用します。たとえば、1チャネル8ビット符号なし整数の画像データ型を指定するときは、普通は定義された直値では書かず、その値を収容した定数名`cv.CV_8UC1`を指定します。

どの定数もトップレベルオブジェクトの`cv`のプロパティとして用意されているので、`cv.XXXX`の形でアクセスできます。

本書でもっともよく用いるのは、先ほどの`CV`で始まる画像のデータ型を示す定数です。他にも、色変換に用いる`COLOR`で始まるもの、2値化処理で閾値のタイプを示す`THRESH`で始まるものも使います。

次のコードは、これら定数名とその値を表示します。定数値（たいていは整数）が得られたとき、それに対応する定数名を調べるのに便利です。

```html
[File] opencv-consts.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>OpenCVの定数</h1>
 11
 12  <div>
 13    <select id="selectTag">
 14      <option value="noop" selected>定数を選択してください</option>
 15      <option value="^CV_\d{1,2}[SUF]">データ型定数</option>
 16      <option value="^COLOR_">色空間変換定数</option>
 17      <option value="^THRESH_">閾値定数</option>
 18      <option value="^INTER_">補間方式定数</option>
 19    </select>
 20  </div>
 21  <div>
 22    <pre id="preTag">定数表</pre>
 23  </div>
 24
 25  <script>
 26    let selectElem = document.getElementById('selectTag');
 27    let preElem = document.getElementById('preTag');
 28
 29    function showConst(evt) {
 30      let re = new RegExp(evt.currentTarget.value);
 31      let keys = Object.keys(cv);
 32
 33      let selected = keys.filter(function(elem) {
 34        return re.test(elem);
 35      }).sort();
 36
 37      preElem.innerHTML = selected.map(function(elem) {
 38        return `${elem} ${cv[elem]}`;
 39      }).join('\n');
 40
 41      console.log(`RegExp ${re} extracted ${selected.length} keys.`);
 42    }
 43
 44    function opencvReady() {
 45      console.log('OpenCV ready.');
 46      selectElem.addEventListener('change', showConst);
 47    }
 48
 49    var Module = {
 50      onRuntimeInitialized: opencvReady
 51    }
 52  </script>
 53
 54  </body>
 55  </html>
```

スクリプティング上、気を付けなければならないのはタイミングです。OpenCVが利用可能になると（49～51行目）、`opencvReady`関数（44～47行目）が起動します。このタイミングで、`<select>`（13～19行目）で値が選択された（`change`イベント）ときに起動する関数`showConst()`（29～42行目）を登録します。つまり、OpenCVが用意できていない間は（開始から1秒ほど）、プルダウンメニューは利用できません。これで、`cv`を参照する関数を準備前に呼び出すことで発生する参照エラーを抑制できます。

`showConst()`関数は、`cv`オブジェクトのキーを`Object.keys()`から取ってきて（31行目）、`<options>`の`value`に仕込んだ定数名のパターンを記述する正規表現でフィルタリング（33行目）している単純なものです。他に知りたい定数があれば、適宜`<option>`にその正規表現を加えてください。

定数名とその値くらいオンラインドキュメントで検索すればよいように思えますが、同じカテゴリーのものをまとめて調べるのが意外と難しいこともあります。

実行結果を次の画面に示します。プルダウンメニューから［データ型定数］（`CV_`で始まる文字列）を選択したときのものです。

<img src="Images/Ch03/opencv-consts.png">

コンソールには次のように用いられた正規表現と抽出した定数名の数が示されます。

```
OpenCV ready.
RegExp /^CV_\d{1,2}[SUF]/ extracted 35 keys.
```

#### OpenCVのコンストラクタと関数

続いては、先と同じ要領でOpenCVのコンストラクタおよび関数（つまり`Function`型）をリストします。

これこそオンラインドキュメントで調べるべきものですが、C/C++版にあってOpenCV.jsにはない関数がかなりあります。そのため、ドキュメントに掲載されたC/C++コードを不用意にそのまま移植すると、そんな関数はないというエラーが頻出することになります。

OpenCV.jsにないものの代表は、[第1章](./01-html5.md "INTERNAL")で説明した入出力関係、また[第2章](./02-ui.md "INTERNAL")で述べたユーザインタフェース関連です。また、contribと呼ばれる最新アルゴリズムのライブラリも、まだ正式版には編入されていないということで、含まれていません。他にも、できそうでもできない関数にはしばしばお目にかかります。

コードは簡単で、先の定数名検索のフィルタリングを`typeof object === 'function`に変更するくらいです。コード`opencv-functions.html`を次に示します。

```html
[File] opencv-functions.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>OpenCV.jsで利用可能なコンストラクタ、関数</h1>
 11
 12  <div>
 13    <pre id="preTag"></pre>
 14  </div>
 15
 16  <script>
 17    let preElem = document.getElementById('preTag');
 18
 19    function listFunctions(obj) {
 20      let keys = Object.keys(obj);
 21      console.log(`${keys.length} entries in CV.`);
 22
 23      let functions = keys.filter(function(key) {
 24        return typeof cv[key] === 'function';
 25      });
 26      console.log(`${functions.length} functions in CV.`);
 27
 28      functions.sort(function(a, b) {
 29        return a.toUpperCase() > b.toUpperCase();
 30      });
 31
 32      preElem.innerHTML = functions.join('\n');
 33    }
 34
 35    var Module = {
 36      onRuntimeInitialized: function() {
 37        console.log(`OpenCV ready`);
 38        listFunctions(cv)
 39      }
 40    };
 41  </script>
 42
 43  </body>
 44  </html>
```

実行例を次に示します。

<img src="Images/Ch03/opencv-functions.png">

コンソールには、`cv`に定義されているプロパティがぜんぶで1564個あり、そのうち関数（コンストラクタも含む）が579個あることがわかります。ちなみに、OpenCVに実装されている関数の数はわかりませんが、画像処理アルゴリズムなら2000ほど実装されているそうです。

```
OpenCV ready
1564 entries in CV.
579 functions in CV.
```


### 3.3 Cross-Orgignの問題

#### 画像のOpenCVへのコピーが失敗する

OpenCVプログラミングでは、`<img>`あるいは`<canvas>`に読み込んだ画像をコピーし、処理し、結果を貼り付けて示します（[1.1節](./01-html5.md#11-画像処理の流れ "INTERNAL")の図）。しかし、この作業は、ローカルファイルシステムから読み込んだHTMLファイル（たとえば、`file:///C:/opencv-cors.html`）で実行するとエラーを上げます。

次のコード`opencv-cors.html`を考えます。

```html
[File] opencv-cors.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link rel=stylesheet type="text/css" href="style.css">
  6    <script async src="libs/opencv.js" type="text/javascript"></script>
  7  </head>
  8  <body>
  9
 10  <h1>img の画像をコピーしようとすると CORS エラーになる</h1>
 11
 12  <div>
 13    <img id="imageTag" width="320" src="samples/miyajima.jpg"/>
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
 25      let src = cv.imread(imgElem);                  // DOMException
 26      cv.imshow('canvasTag', src);
 27      src.delete();
 28    }
 29  </script>
 30
 31  </body>
 32  </html>
```

25行目の`cv.imread()`は`HTMLImageElement`から画像データを読み込む、26行目の`cv.imshow()`はその画像データを`<canvas>`要素に貼り付けるOpenCV.jsの関数です。意図していることは、[1.2節](./01-html5.md#12-画像をキャンバスに表示する "INTERNAL")の`html-image1.html`と変わりありません。しかし、ローカルファイルシステムから実行すると、キャンバスに画像が貼り付けられません。

<img src="Images/Ch03/opencv-cors.png">

コンソールに示されるエラーメッセージを次に示します（紙面で読みやすくなるよう、行番号を加えるなど一部を編集しています）。

```
 1 opencv.js:30 Uncaught (in promise) DOMException:
 2  Failed to execute 'getImageData' on 'CanvasRenderingContext2D':
 3  The canvas has been tainted by cross-origin data.
 4   at Module.imread (file:///C:/libs/opencv.js:30:9984735)
 5   at Object.imgProc[as onRuntimeInitialized](file:///C:/opencv-cors.html:25:18)
 6   at doRun (file:///C:/libs/opencv.js:30:9983689)
 7   at run (file:///C:/libs/opencv.js:30:9983849)
 8   at runCaller (file:///C:/libs/opencv.js:30:9983348)
 9   at removeRunDependency (file:///C:/libs/opencv.js:30:14897)
10   at receiveInstance (file:///C:/libs/opencv.js:30:9786136)
11   at receiveInstantiatedSource (file:///C:/libs/opencv.js:30:9786256)
```

1～3行目がポイントで、「キャンバスがcross-originなデータ」で汚染されているために`DOMException`が上がってきたと述べています。

#### CORS制約の問題

cross-originは、データ（ここでは画像）とHTMLとでオリジン（端的にはドメインとポート番号の組）が異なることを指します。たとえば、HTMLは`https://www.example.com/`から、画像は`https://www.example.net/`から読み込まれているような状態です。それは、ページに他所の怪しいサイトから怪しいデータが入り込んでいる可能性を示すもので、セキュリティ上の問題があります。そのため、ブラウザが他所の画像を、ページに貼り付けるのを拒絶したのです。

異なるオリジン間でのデータ共有のメカニズムをCORS（Cross-Origin Resource Sharing）といいます。ブラウザはどのようなCORS操作なら認めるかをデフォルトで定めており、昨今のセキュリティ問題を反映して、かなり厳しい制約が課せられています。たとえば、`file:///`へのアクセスは、同じディレクトリにあっても拒否されます。

この問題を解消するには3つの方法があります。

1. ローカルでWebサーバを運用する。これなら、画像もHTMLファイルも同じ`http://localhost/`というオリジンを共有することになるので、CORSエラーは発生しません。本書ではこの方法を使っています。
2. インターネット上のWebホスティングサービスにアップロードする。療法は上記と同じです。問題はタダではないことと、フリーなものだと不安なところです。試験用あるいは勉強用に使うぶんにはフリーなものもよいでしょう。
3. CORS設定を一時的に無視するようにブラウザを設定する。この方法は比較的簡単ですが、ブラウザが脆弱になるという問題があります。設定を変更したら、**必ず**もとに戻さなければなりません。

本節では1と3の方法を説明します。

3についてはChrome、Edge、Firefoxのものを紹介します。ここで示す方法は執筆時点の最新バージョンで試していますが、同じ方法が古い、あるいは将来のバージョンでも通用する保証はない点、注意してください。

#### ローカルWebサーバを用意する

apacheあたりを自機にインストールするのが王道ですが、個人用のテストにはやりすぎかもしれません。簡単に済ませるなら、Pythonのワンライナーでしょう。コマンドプロンプト（やコンソール）から自分のHTMLや画像のあるディレクトリに移動し、次のコマンドを実行するだけです。

```
python -m http.server --bind 127.0.0.1
```

`127.0.0.1`はローカルループバックアドレスで、自機内でしか有効ではない（他のホストからはアクセスできない）IPアドレスです。`localhost`という名前（ドメイン名）から参照できます。

> 注意：Python http.serverはデフォルトではアドレス`0.0.0.0`を使います。`0.0.0.0`はワイルドカードなアドレスなので、ローカルネットワーク内のすべてのホストからアクセスできます。同僚や家族の目が気になるなら、`--bind`オプションの指定を忘れないでください。

ブラウザに`http://localhost:8000/`（`http.server`のデフォルトポートは8000番です）と入力すれば、そのディレクトリにあるファイルが一覧できます。次に、筆者の執筆環境のディレクトリから起動したサーバにアクセスしたときの画面を示します。

<img src="Images/Ch03/opencv-cors-python.png">

あとは、好みのファイルをクリックするだけです。

Pythonをインストールしなければならないのが難点ですが、それ自体は難しくはありません（JavaScript本で宣伝するのもなんですが、あると人生が豊かになります）。インストーラは次に示すURLからダウンロードできます。

```https://www.python.org/downloads/```

他にも、1行だけでサーバを実行できるユーティリティや言語はたくさんあります。検索してください。

JavaScriptユーザならNode.jsのほうがよいかもしれません。コードがやや長くなるのがたまに傷ですが、npm（node package manager）に超簡便なWebサーバもあります（検索しましょう）。

> どんなWebサーバであれ、httpsにはself-signed証明書が必要なので、設定はややこしいです。ローカルオンリー運用なら、httpsにする必要はありません。

#### ブラウザのCORS緩和設定（ChromeおよびEdge）
<!-- See https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md -->

> 注意：本節の設定により、ブラウザのセキュリティレベルは著しく低下します。利用はテスト中のみ、アクセス先は`localhost`にかぎります。

ChromeおよびEdgeでは、プログラム実行時のオプションからCORS制限を緩和します。コマンドプロンプト（やコンソール）から次のように実行します。

```
"C:\Program Files\Google\Chrome\Application\chrome" --disable-web-security --user-data-dir="C:\temp\temp"
```

オプションはどちらも指定しなければなりません。後者の`--user-data-dir`にはユーザデータを保存するディレクトリを指定します。ここでは`C:\temp\temp`を指定しています。これで、このディレクトリに各種のデータが保存されます。大量なので、空きディレクトリを指定します。利用が終わったら、ディレクトリごと削除してまかまいません。

オプション指定なので、普段使いしているChrome/Edgeには影響しません。

#### ブラウザのCORS緩和設定（Firefox）
<!-- See https://stackoverflow.com/questions/72811082/security-error-loading-subtitles-on-html-video -->

> 注意：本節の設定により、ブラウザのセキュリティレベルは著しく低下します。利用はテスト中のみ、アクセス先は`localhost`にかぎります。

FirefoxでのCORS制限の緩和方法を紹介します。

URLフィールドに`about:config`と入力することで、「高度な設定」画面に進みます。最初に「注意して進んでください！」と警告されるので、注意しながら［危険性を承知のうえで使用する］をクリックします。

<img src="Images/Ch03/opencv-cors-firefox1.png">

<!-- content.cors.disable を true に変更するという話も出ているが、これは利かない模様 -->
［設定名を検索］するフィールドを上端に示したページが次の画面のように表示されます。`security.fileuri.strict_origin_policy`を入力し、デフォルト値のfalseを、右にある「切り替え」アイコン（⇄）をクリックすることでtrueに変更します。

<!-- 枠なし版あり -->
<img src="Images/Ch03/opencv-cors-firefox2.png">

これでローカルファイルにCORSエラーなしでアクセスできるようになります。

利用が終わったらもとのfalseに戻します。

セキュリティの穴が気になるなら、Firefoxのすべての設定を工場出荷時に戻すリフレッシュを行います。ウィンドウ右上にある設定（≡）ボタンから［ヘルプ］>［他のトラブルシューティング情報］で、右にある［Firefoxをリフレッシュ］です。ボタンをクリックすると次の画面のように警告画面が現れるので、リフレッシュします。

<!-- 枠なし版あり -->
<img src="Images/Ch03/opencv-cors-firefox3.png">


### 3.4 OpenCVドキュメンテーション

#### OpenCV公式リファレンス

OpenCVの関数や定数は次に示すOpenCV公式リファレンスから参照します。

```https://docs.opencv.org/```

トップページには[3.1節](#31-OpenCVjsの準備 "INTERNAL")で示したように各バージョンへのリンクが列挙されているので、利用しているバージョンあるいは最新のものクリックします（本書では4.8.0）。ドキュメントページを次の画面に示します。

<!-- 枠なし版あり -->
<img src="Images/Ch03/opencv-docs-modules.png">

coreやimgprocなどモジュール別に分けられているので、目的の関数や定数をピンポイントに見つけるのはむずかしくなっています。その代わり、右上のサーチフィールドの予測入力が賢いので、入力するにつれ候補を示してくれます。次の画面では`cv.cvtColor()`関数の書式を調べるために、「cvtc」まで打ったところを示しています（先頭の`cv`は不要です）。

<img src="Images/Ch03/opencv-docs-search.png">

このキーワードを含む関数および定数がドロップダウンリストとして表示されるので、目的のものをクリックします。項目によってはさらに細分化されますが、目的の名称と最も近い細目を選びます（たとえば、`cv::cuda::cvtColor()`とあるのはGPUのCUDA用なので目的のものではありません）。

#### 関数定義

公式リファレンスの関数定義には、次に示すようにC/C++とPythonのものしか記載されていません。OpenCV.jsは基本的にC/C++のシグニチャを踏襲しているので、そちらを見ます。次に、`cv.Canny()`関数の関数定義を示します。

<img src="Images/Ch03/opencv-docs-function.png">

表題に「Canny() [1/2]」とあるのは、同名であっても引数の恰好の異なるパターン（シグニチャ）があることを示しています。C++ではこれをオーバーロードと呼びますが、JavaScriptでは使われない技法です（TypeScriptなら見かけ上できますが）。残念ながら、OpenCV.jsでどちらの形式を使っているかは見ただけでは判別できません。

関数名が`cv::Canny`のように`cv`と関数名の間が`::`となっているのはC++の記法なので、これは`.`と読み替えます。この場合は`cv.Canny()`です。

データ型は、適宜JavaScriptのものに読み替えます。たとえば、`dobule`や`int`は`number`です。よく使われるものの対応関係を、細かいニュアンス（`&`や`*`や`<type>`のバリエーションとか）は無視して次に示します。

C/C++のデータ型 | OpenCV.jsのデータ型 | 注意
---|---|---
`bool` | `boolean` | 
`double`、`float`、`int` | `number` | 
`String` | `string`
`InputArray`、`OutputArray` | `cv.Mat` | `Input`は入力画像の、`Output`は結果画像を収容するコンテナをそれぞれ指す。
`Mat` | `cv.Mat` | 画像のコンテナ。[4.1節](./04-mat.md#41-画像の構造を調べる "INTERNAL")参照。
`std::vector<Mat>` | `cv.MatVector` | 画像を複数収容した配列（C++の`Vector`）。
`Point` | `cv.Point` | 画像ピクセルの(x, y)座標を収容する構造体。`Point2f`のように付加情報が加わっているときは中のデータ数とその型を示す（`2f`は2個の浮動小数点数型）。[4.4節](./04-mat.md#44-モノクロで円を描く "INTERNAL")参照。
`Rect` | `cv.Rect` | 四角形の形状（x, y, width, height)を指定する構造体。[4.7節](./04-mat.md#47-部分領域だけ処理する "INTERNAL")参照。
`Scalar` | `cv.Scalar` | 複数（1～4）の数値を収容する構造体。[4.4節](./04-mat.md#44-モノクロで円を描く "INTERNAL")参照。
`Size` | `cv.Size` | 画像の横縦サイズを収容する構造体。[4.4節](./04-mat.md#44-モノクロで円を描く "INTERNAL")参照。

C++の`vector`は型付きの配列（`TypedArray`）のようなもので、同じデータ型を複数個収容します。C++では`vector<InputArray>`のように`<>`の中にデータ型を記述しますが、OpenCV.jsではそれ専用のオブジェクトが用意されます。たとえば、`cv.Point`の配列（ベクター）なら`cv.PointVector`です。これらについては、サンプルコードで使用するときに説明します。


定義がコンストラクタであるときは、JavaScriptの作法にのっとって`new`を加えます。たとえば、C/C++の`Mat()`は、`new cv.Mat()`と読み替えます。

`=`の付いているもの（上画面では`int apertureSize = 3`など）はデフォルト引数です。
