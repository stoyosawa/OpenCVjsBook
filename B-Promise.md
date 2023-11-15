## 付録B 複数の非同期読み込みの扱い

読み込むべきリソースが複数ある場合、これらすべてが準備できなければ処理をスタートできないことがあります。たとえば、OpenCV.jsと外部のスクリプトがすべて利用可能になったときにのみ、画像処理を始めるなどです。`window.onload=`を使う手は、OpenCV.jsがロード完了後もしばらくは有効にはならないので使えません。

本付録では`Promise`を用いることで、複数のリソースが「すべて準備完了した」タイミングを検知します。

`Promise`そのものの説明は省いているので、詳細は次にURLを示すMDNの「プロミスの使用」、あるいは関連書籍を参照してください。検索すれば基礎的なものから高度なものまでいろいろ出てきますので、そちらを参考にするのもよいでしょう。

```https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises```



#### B.1 イベントをPromise化する

`load`や`change`などのイベントは、HTML要素内で`onload=function()`のように処理関数を指定する、あるいは事後的に`Element.addEventListener(event, function)`のようにDOMオブジェクト`Element`にイベントとその処理関数を登録することでイベント発生時に処理をします。ここでは、このイベント処理関数を`Promise`でくるみ、その解決後に処理を行います。

コード`promise-event.html`を次に示します。

```html
[File] promise-event.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link id="linkTag" rel=stylesheet href="style.css"/>
  6    <script async id="scrTagOverlay" src="libs/overlay.js"></script>
  7    <script async id="scrTagOpencv" src="libs/opencv.js"></script>
  8    <script async id="scrTagNtc" src="https://chir.ag/projects/ntc/ntc.js"></script>
  9  </head>
 10  <body>
 11
 12  <h1>イベントを Promise 化する</h1>
 13
 14  <div>
 15    <img id="imageTag" src="samples/color-gradation.png"/>
 16  </div>
 17
 18  <script>
 19    let scrElemNtc = document.getElementById('scrTagNtc');
 20
 21    let promise = new Promise(function(resolve, reject) {
 22      scrElemNtc.addEventListener('load', function() {
 23        resolve(`loaded Ntc at ${performance.now()}`);
 24      });
 25    });
 26
 27    promise.then(function(val) {
 28      console.log(val);
 29    });
 30  </script>
 31
 32  </body>
 33  </html>
```

CSSを1本（5行目）とスクリプトを3本（6～8行目）の計4つがここでの外部リソースです。本節では、8行目の`ntc.js`にのみ着目します。

`Promise`は`new Promise()`から生成します（21行目）。引数には、非同期に実行される関数（ここでは無名関数`function()`）を指定します。その第1引数には実行が成功したときの関数（ここでは`resolve`）、第2引数には失敗したときの関数（`reject`）を指定します。

```javascript
//                                       成功時    失敗時
21    let promise = new Promise(function(resolve, reject) {
```

実効関数の中に、処理を記述します。ここではイベント登録の`addEventListener()`です（22～24行目）。

```javascript
 22      scrElemNtc.addEventListener('load', function() {
 23        resolve(`loaded Ntc at ${performance.now()}`);
 24      });
```

リスナー関数（これも無名関数）は、`ntc.js`の読み込みが完了したら`resolve()`を実行します。この`resolve`は21行目の成功時の関数です。ここでは、ページのここまでの稼働時間を含んだ文字列を返すことが成功時の処理です。

ちなみに、`performace.now()`はページが開始してから（定義はもっと細かいですがだいたいそのくらい）の時間をミリ秒単位で返します。

`Promise`の実行関数が成功裏に終わると、その`then()`関数に`resolve()`が返す文字列が引き渡されます（27～29行）。

```javascript
 27    promise.then(function(val) {
 28      console.log(val);
 29    });
```

27行目の`val`が23行目の`resolve()`の引数の値です。

28行目の出力を次に示します。ページ起動から1332ミリ秒後に`ntc.js`の読み込みが完了しています。

```
loaded Ntc at 1332.1000000238419
```



#### B.2 OpenCV初期化をPromiseする

続いて、OpenCVの初期化完了を検出する`Promise`を作成します。

コード`promise-opencv.html`を次に示します。

```html
[File] promise-opencv.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link id="linkTag" rel=stylesheet type="text/css" href="style.css"/>
  6    <script async id="scriptTagOverlay" src="libs/overlay.js"></script>
  7    <script async id="scriptTagOpencv" src="libs/opencv.js"></script>
  8    <script async id="scriptTagNtc" src="https://chir.ag/projects/ntc/ntc.js"></script>
  9  </head>
 10  <body>
 11
 12  <h1>OpenCV 初期化検出を Promise 化する</h1>
 13
 14  <div>
 15    <img id="imageTag" src="../Codes/samples/color-gradation.png"/>
 16  </div>
 17
 18  <script>
 19    let promise = new Promise(function(resolve, reject) {
 20      Module = {
 21        onRuntimeInitialized: function() {
 22          resolve(`opencvInitialized at ${performance.now()}`);
 23        }
 24      }
 25    });
 26
 27    promise.then(function(val) {
 28      console.log(val);
 29    });
 30  </script>
 31
 32  </body>
 33  </html>
```

構造は前節と同じです。違いは`Promise`の実行関数の中身が、OpenCV.jsの準備ができたことを示す`onRuntimeInitialized`への関数登録になっているところです。この関数も、前節と同じく、`resolve()`関数でここまでの時間を組んだ文字列を返しています。

28行目の出力を次に示します。OpenCV.jsはページ起動から1194ミリ秒後に準備できました。

```
opencvInitialized at 1194.8999999761581
```



#### B.3 すべてのリソースをPromise化する

最後に、4つすべてのリソースがすべて読み込みに成功したときのみ処理を実行するコードを作成します。

コード`promise-all.html`を次に示します。

```html
[File] promise-all.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link id="linkTag" rel=stylesheet href="style.css"/>
  6    <script async id="scrTagOverlay" src="libs/overlay.js"></script>
  7    <script async id="scrTagOpencv" src="libs/opencv.js"></script>
  8    <script async id="scrTagNtc" src="https://chir.ag/projects/ntc/ntc.js"></script>
  9  </head>
 10  <body>
 11
 12  <h1>すべてのリソースを Promise 化する</h1>
 13
 14  <div>
 15    <img id="imageTag" src="samples/color-gradation.png"/>
 16  </div>
 17
 18  <script>
 19    let promises = [];
 20    let tags = ['linkTag', 'scrTagOverlay', 'scrTagOpencv', 'scrTagNtc'];
 21
 22    tags.forEach(function(tag) {
 23      promises.push(new Promise(function(resolve, reject) {
 24        let elem = document.getElementById(tag);
 25        elem.addEventListener('load', function() {
 26          resolve(`loaded ${tag} at ${performance.now()}`);
 27        });
 28      }));
 29    });
 30
 31    promises.push(new Promise(function(resolve,reject){
 32      window.addEventListener('load', function() {
 33        resolve(`loaded window at ${performance.now()}`);
 34      });
 35    }));
 36
 37    promises.push(new Promise(function(resolve, reject) {
 38      Module = {
 39        onRuntimeInitialized: function() {
 40          resolve(`opencvInitialized at ${performance.now()}`);
 41        }
 42      }
 43    }));
 44
 45    Promise.all(promises)
 46    .then(function(values) {
 47      console.log(values.join('\n'));
 48    });
 49  </script>
 50
 51  </body>
 52  </html>
```

`Promise`はぜんぶで6つ作成します。これらは配列`promises`（19行目）に収容します。

4つは5～8行目のリソースのもので、その`id`属性値は20行目の`tag`に収容してあります。22～29行目では`tags`をループして、順次生成した`Promise`を配列に追加しています（23行目の`Promises.push()`）。`Promise`の生成方法は[付録B.1](#B1-イベントをPromise化する "INTERNAL")で見た通りです。

1つは`windows`です。上記4つを含めたすべてが読み込まれたときに`load`イベントが発火します（31～35行目）。やり方は他のイベントと変わりません。

最後の1つはOpenCVの準備完了で（37～43行目）、これも[付録B.2](#B2-OpenCV初期化をPromiseする "INTERNAL")の通りです。

これら6つの`Promise`がすべて成功したときのみ処理を実行するには、`Promises.all()`関数（45～48行目）を用います。引数には、ここまでで生成した`Promise`の配列（`promises`）を指定します（45行目）。Promiseのすべての実行関数が成功裏に終わると、その`then()`関数にそれぞれのresolve()が返す文字列が配列として引き渡されます（46行）。

配列要素の順番は、`promises`配列と同じです。つまり、最初の要素（46行目の`values`の`[0]`）は`linkTag`のもので、最後の要素がOpenCV準備完了のものです。

実行結果を次に示します。

```
loaded linkTag at 44.699999928474426
loaded scrTagOverlay at 45.09999990463257
loaded scrTagOpencv at 795.7999999523163
loaded scrTagNtc at 1720.6999999284744
loaded window at 1720.7999999523163
opencvInitialized at 1227.0999999046326
```

最後に準備ができたのが`scrTagNtc`で1.7秒後です。OpenCV.jpはそれよりもやや早い1.2秒後に準備が完了しています。このようなケースでは、OpenCV.jsの準備完了だけを契機に処理を始めると、`scrTagNtc`に依存した処理が失敗することになります。

`<script>`で読み込むすべてのリソースの`Promise`を作成する必要は、実はありません。`windows.onload`がこれらをカバーしてくるので、22～29行目は不要です。それぞれのリソースの完了タイミングを見るためにあえて加えているだけです。
