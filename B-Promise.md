## 付録B 非同期読み込みの扱い

本付録では、OpenCV.jsなど非同期的に利用可能になる外部リソースを`Promise`でくるむことで、「すべて準備完了した」タイミングを検知する方法を示します。例として、CSSが1つ、OpenCV.jsを含めてスクリプトが2つ、ビデオが1つの計4つのリソースを持つコードを考えます。そして、要求されるリソースが揃ったところでビデオを再生します。

`Promise`そのもののは細かくは説明しないので、詳細は次にURLを示すMDNの「プロミスの使用」、あるいは関連書籍を参照してください。検索すれば基礎的なものから高度なものまでいろいろ出てきますので、そちらを参考にするのもよいでしょう。

```https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises```



#### B.1 イベントをPromise化する

ここでは、`HTMLVideoElement.addEventListener(event, function)`を`Promise`でくるむことで、ビデオの準備ができたタイミングでビデオを再生する方法を示します。

コード`promise-event.html`を次に示します。

```html
[File] promise-event.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link id="linkTag" rel=stylesheet href="style.css"/>
  6    <script async id="overlayTag" src="libs/overlay.js"></script>
  7    <script async id="opencvTag" src="libs/opencv.js"></script>
  8  </head>
  9  <body>
 10
 11  <h1>イベントを Promise 化する</h1>
 12
 13  <div>
 14    <video id="videoTag" width="320" controls src="samples/ny.mp4"/>
 15  </div>
 16
 17  <script>
 18    function completed(resolve, reject) {
 19      let elem = document.getElementById('videoTag');
 20      elem.addEventListener('loadeddata', function(evt) {
 21        let message = `loadeddata ${evt.target.id} at ${performance.now()}`;
 22        resolve(message);
 23      });
 24    }
 25
 26    function play(val) {
 27      console.log(val);
 28      let videoElem = document.getElementById('videoTag');
 29      videoElem.muted = true;
 30      videoElem.play();
 31    }
 32
 33    let promise = new Promise(completed);
 34    promise.then(play);
 35  </script>
 36
 37  </body>
 38  </html>
```

`Promise`オブジェクトは、非同期的に実行される関数を引数に定義したコンストラクタから生成します（33行目）。この実行関数が、18～24行目で定義した`completed`関数です。実行関数の処理が完了すると、`Promise`オブジェクトの`.then()`関数が起動し、その引数に指定した関数`play`を実行します（34行目）。これで、`completed`→`play`の順に逐次的に実行されます。

```javascript
 33    let promise = new Promise(completed);
 34    promise.then(play);
```

`Promise`コンストラクタに指定する実行関数`completed`の引数には、成功したときと失敗したときに実行する関数を指定します（18行目）。関数名はなんでもよいのですが、慣習的に`resolve`と`reject`が使われます。成功裏に終了したことを「解決」、失敗だったときは「拒否」というからです。

```javascript
//                        成功時    失敗時
 18    function completed(resolve, reject) {
```

実効関数の中には、非同期的な処理を記述します。ここではイベント登録の`addEventListener()`です（20～23行目）。登録自体は逐次的に完了しますが、そのリスナー関数はイベントが上がらなければなにもしないので「非同期的」です。

```javascript
 20      elem.addEventListener('loadeddata', function(evt) {
 21        let message = `loadeddata ${evt.target.id} at ${performance.now()}`;
 22        resolve(message);
 23      });
```

リスナー関数（無名関数）はビデオの準備が完了したら、18行目の第1引数で記述した`resolve()`を実行します。この関数は21行目の文字列`message`を返します。実行結果であるこの`message`は、`Promise`の`.then()`の引数の関数に引き渡されます。ここでは26～31行目で定義した`play(val)`の`val`です。つまり、`val = message`です。

```javascript
 26    function play(val) {
```

`play()`関数は受け取ったメッセージをコンソールに表示し、ビデオ再生を始めます。コンソール出力を次に示します。

```
loadeddata videoTag at 68.10000002384186
```



#### B.2 OpenCV初期化をPromise化する

続いて、OpenCVの初期化完了を検出する`Promise`を作成します。

コード`promise-opencv.html`を次に示します。

```html
[File] promise-opencv.html
  1  <!DOCTYPE html>
  2  <html lang="ja-JP">
  3  <head>
  4    <meta charset="UTF-8">
  5    <link id="linkTag" rel=stylesheet href="style.css"/>
  6    <script async id="overlayTag" src="libs/overlay.js"></script>
  7    <script async id="opencvTag" src="libs/opencv.js"></script>
  8  </head>
  9  <body>
 10
 11  <h1>OpenCV 初期化検出を Promise 化する</h1>
 12
 13  <div>
 14    <video id="videoTag" width="320" controls src="samples/ny.mp4"/>
 15  </div>
 16
 17  <script>
 18    function opencvCompleted(resolve, reject) {
 19      Module = {
 20        onRuntimeInitialized: function() {
 21          let message = `opencvInitialized at ${performance.now()}`
 22          resolve(message);
 23        }
 24      }
 25    }
 26
 27    function play(val) {
 28      console.log(val);
 29      let videoElem = document.getElementById('videoTag');
 30      videoElem.muted = true;
 31      videoElem.play();
 32    }
 33
 34    new Promise(opencvCompleted)
 35    .then(play);
 36  </script>
 37
 38  </body>
 39  </html>
```

構造は前節と同じです。ただ、前節では`Promise`オブジェクトをいったん変数に格納し、その変数に`.then()`を作用させましたが、ここでは直接ドットで連結しています。この書き方のほうが多いようです。

`Promise`の実行関数`opencvCompleted()`（18～25行目）の中身は、OpenCV.jsの準備ができたことを示す`onRuntimeInitialized`への関数登録に変更されていますが、基本は変わりません。準備ができれば登録関数が非同期的に起動し、`resolve()`関数から`.then()`にメッセージが伝わります。

28行目の出力を次に示します。OpenCV.jsはページ起動から1194ミリ秒後に準備できました。

```
opencvInitialized at 778.6000000238419
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
  6    <script async id="overlayTag" src="libs/overlay.js"></script>
  7    <script async id="opencvTag" src="libs/opencv.js"></script>
  8  </head>
  9  <body>
 10
 11  <h1>すべてのリソースを Promise 化する</h1>
 12
 13  <div>
 14    <video id="videoTag" width="320" controls src="samples/ny.mp4"/>
 15  </div>
 16
 17
 18  <script>
 19    let promises = [];
 20    let tags = {
 21      linkTag: 'load',
 22      overlayTag: 'load',
 23      videoTag: 'loadeddata'
 24    };
 25
 26    function returnCompleted(tag) {
 27      let event = tags[tag];
 28      let elem = document.getElementById(tag);
 29
 30      return function completed(resolve, reject) {
 31        elem.addEventListener(event, function(evt) {
 32          let message = `${evt.type} ${tag} at ${performance.now()}`;
 33          resolve(message);
 34        });
 35      };
 36    }
 37
 38    function opencvCompleted(resolve, reject) {
 39      Module = {
 40        onRuntimeInitialized: function() {
 41          let message = `opencvInitialized at ${performance.now()}`
 42          resolve(message);
 43        }
 44      }
 45    }
 46
 47    Object.keys(tags).forEach(function(tag) {
 48      promises.push(new Promise(returnCompleted(tag)));
 49    });
 50    promises.push(new Promise(opencvCompleted));
 51
 52    function play(val) {
 53      console.log(val.join('\n'));
 54      let videoElem = document.getElementById('videoTag');
 55      videoElem.muted = true;
 56      videoElem.play();
 57    }
 58
 59    Promise.all(promises)
 60    .then(play);
 61  </script>
 62
 63  </body>
 64  </html>
```

38～45行目のOpenCV.js用実行関数は同じものです。その他のリソース用のものは、引数に`id`属性値を指定することで`completed()`関数を返す関数`returnCompleted()`を用意しました（26～36行目）。対象となるHTML要素とイベントが異なる以外、処理は変わらないので、共通化できるからです。こうすれば、同じコードを3回コピーせずとも、47行目のように`id`属性名のループを組めます。リソース（HTML要素）の`id`名と待ち受けるイベントの組は、オブジェクトで表現しています（20～24行目）。

複数のリソースがあり、それらすべてが用意できたときのみ`.then()`の関数を起動するには、`Promise`の配列を用意します。

```javascript
 19    let promises = [];
 ︙
 47    Object.keys(tags).forEach(function(tag) {
 48      promises.push(new Promise(returnCompleted(tag)));
 49    });
 50    promises.push(new Promise(opencvCompleted));
```

最初に空の配列を用意し（19行目）、ループ内で`Array.push()`で順次加えています。

`Promise`がすべて成功したときのみ処理を実行するには、`Promise.all()`関数を用います（59～60行目）。それ以外は、単体の`Promise`と恰好は同じです。`Promise.all()`の引数には、`Promise`の配列を指定します。

```javascript
 59    Promise.all(promises)
 60    .then(play);
```

複数の`Promise`がそれぞれメッセージを返してくるので、`play()`関数の引数にはメッセージの配列が引き渡されます。53行目が前の2つのと異なるのは、文字列配列を行単位で印字したいからです。

```javascript
 52    function play(val) {
 53      console.log(val.join('\n'));
```

戻ってくる配列の順序は、`Promise`の配列と同じです。これは20行目のオブジェクトと同じ順番なので、linkTag、overlayTag、videoTagの順で、最後にOpenCV.jsが来ます。

実行結果を次に示します。

```
load linkTag at 41.30000001192093
load overlayTag at 56.09999996423721
loadeddata videoTag at 66.19999998807907
opencvInitialized at 792.59999996423726
```
