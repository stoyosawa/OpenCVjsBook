### 付録A 参考文献

本書で参照した関連するオンラインドキュメントをまとめて示します。

🇯🇵は日本語、🇺🇸は英語のドキュメントです。オリジナルは英語でも、公式非公式を問わず和訳のあるものは、そちらのURLを記載しています。

<!-- 国旗絵文字は絵文字コード2つからなる。Sublime Text 3 ではまだ対応していないが、ブラウザなら OK。🇯🇵 U+1F1EF U+1F1F5 🇺🇸 U+1F1FA U+1F1F8 -->

- [chair.ag「ntc.js（Name that Color JavaScript）](https://chir.ag/projects/ntc/ "LINK") 🇺🇸 `https://chir.ag/projects/ntc/`   
Chirag Mehta（`https://chir.ag/`）が開発した、RGB値から最も直近の色を検索するJavaScriptモジュール。現在、1566色が定義されています。

- [emscripten](https://emscripten.org/ "LINK") 🇺🇸 `https://emscripten.org/`  
C/C++で書かれたOpenCVをWeb Assembly（wasm）で利用できるようにコンパイルしたコンパイラ。たとえば`Module`のAPIを知りたいときに参照しますが、OpenCV.jsの開発者でもなければ魔除け用です。

- [emscripten「File System API」](https://emscripten.org/docs/api_reference/Filesystem-API.html "LINK") 🇺🇸 `https://emscripten.org/docs/api_reference/Filesystem-API.html`  
`cv.FS_createDataFile()`が内部で使っているemscriptenのファイルシステムの詳細。この関数を直接説明するドキュメントではないですが、仮想的なファイルがどのように扱われているかを知るのに重宝します。

- [evangelion.co.jp「WEB会議などで使える『エヴァンゲリオン壁紙』登場！](https://www.evangelion.co.jp/news/web_screen/ "LINK") 🇯🇵 `https://www.evangelion.co.jp/news/web_screen/`  
エヴァンゲリオン公式の提供の、あの「SOUND ONLY」などの壁紙です。なお、「個人的利用を目的として提供しています。商業利用、企業宣伝等には利用できません」。

- [Github murtazahassan「OpenCV-Python-Tutorials-and-Projects」](https://github.com/murtazahassan/OpenCV-Python-Tutorials-and-Projects/blob/master/Intermediate/Custom%20Object%20Detection/haarcascades/haarcascade_frontalcatface.xml "LINK") 🇺🇸 `https://github.com/murtazahassan/OpenCV-Python-Tutorials-and-Projects/blob/master/Intermediate/Custom%20Object%20Detection/haarcascades/haarcascade_frontalcatface.xml`  
猫顔検出用のHarrカスケード分類器のモデルデータ。Murtaza Hassan（murtazahassan）さんが作成したチュートリアルリポジトリに含まれています。

- [Github opencv「Haarカスケード分類器のモデルデータ」](https://github.com/opencv/opencv/tree/master/data/haarcascades "LINK") 🇺🇸 `https://github.com/opencv/opencv/tree/master/data/haarcascades`  
OpenCVのオフィシャルGithubに置かれたHarrカスケード分類器のモデルデータ（xmlファイル）。現在17ファイルが登録されています。

- [Github nagadomi「lbpcascade_animeface」](https://github.com/nagadomi/lbpcascade_animeface "LINK") 🇺🇸 `https://github.com/nagadomi/lbpcascade_animeface`  
アニメ顔検出用のカスケード分類器のモデルデータ。nagadomiさんの作品。

- [IANA「Language Subtag Registry」](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry) 🇺🇸 `https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry`  
現在登録されている言語タグをすべて収容したリスト。言語タグは`<track>`の`srclang`属性で指定できるja（日本語）などの文字列です。蛇足ですが、日本語にはjpx（琉球語も含む日本語族）、ojp（日本の古語）、jsl（日本語の手話）といった言語タグも定義されています。さらに蛇足ですが、クリンゴン語はtlhです。

- [MDN「Code values for keyboard events」](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values "LINK") 🇺🇸 `https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values`  
`keydown`や`keyup`イベントで取得されるキーボードのキーコード（`code`プロパティ）の値のリスト。

- [MDN「<color\>」](https://developer.mozilla.org/ja/docs/Web/CSS/color_value "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/CSS/color_value`  
CSSがサポートしている色空間のリスト。

- [MDN「filter」](https://developer.mozilla.org/ja/docs/Web/CSS/filter) 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/CSS/filter`  
CSSプロパティから基本的な画像処理を実行できる`filter`の説明。関数は現在10個定義されています。  

- [MDN「HTMLMediaElement」](https://developer.mozilla.org/ja/docs/Web/API/HTMLMediaElement "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/API/HTMLMediaElement`  
`HTMLVideoElement`の親クラスの`HTMLMediaElement`の詳細ページ。`HTMLVideoElement`で利用できるメソッドやプロパティのほとんどはこのクラスから継承しています。

- [MDN「WebAssembly」](https://developer.mozilla.org/ja/docs/WebAssemblyt "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/WebAssembly`  
C/C++で書かれたコードをJavaScriptで利用する方法であるWebAssembly（WASM）の解説。

- [MDN「XMLHttpRequest」](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest`  
スクリプト内から別途HTTP通信を行う`XMLHttpRequest`クラスの詳細ページ。

- [MDN「プロミスの使用」](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises`  
MDNの「JavaScriptガイド」に掲載されている`Promise`の用法。

<!-- 地球マーク 🌐 は U+1F310 -->
- [MDN「Web docs」](https://developer.mozilla.org/ja/docs/Web/JavaScript "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/JavaScript`  
JavaScript、HTML/DOM、CSSの仕様やAPIを紹介するサイトはいくつもありますが、ひとつだけ挙げるとしたら、MDN（Mozilla Developpers Network）のものがメソッド、属性、プロパティが細かいところまで書かれているのでお勧めです。もっとも、素っ気ないところがあるので、慣れないと不親切に感じるかもしれません。ほとんどのリファレンスには和訳が用意されているので、検索で英語版がヒットしたら、そのページ右上の🌐から日本語を選択します。

- [OpenCV](https://opencv.org/ "LINK") 🇺🇸 `https://opencv.org/`  
OpenCV本家のメインページ。メソッド・関数の仕様なら［Documentation］から適当なバージョンへのリンクを選択します。

- [OpenCVリファレンス「Drawing Functions」](https://docs.opencv.org/4.8.0/d6/d6e/group__imgproc__draw.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/d6/d6e/group__imgproc__draw.html`  
OpenCVのグラフィックス描画関数一覧（`cv.line()`、`cv.rectangle()`など）。

- [OpenCVリファレンス「Operations on arrays」](https://docs.opencv.org/4.8.0/d2/de8/group__core__array.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/d2/de8/group__core__array.html`  
OpenCVの行列`cv.Mat`操作関数一覧（`cv.add()`、`cv.addWeighted()`など）。 

- [OpenCVチュートリアル「Background Subtraction 」](https://docs.opencv.org/4.8.0/d8/d38/tutorial_bgsegm_bg_subtraction.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/d8/d38/tutorial_bgsegm_bg_subtraction.html`  
OpenCVチュートリアルに掲載されている背景抜き（`cv.BackgroundSubtractor`クラス）のおおざっぱな説明。

- [OpenCVチュートリアル「Canny Edge Detection」](https://docs.opencv.org/4.8.0/da/d22/tutorial_py_canny.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/da/d22/tutorial_py_canny.html`  
OpenCVチュートリアルに掲載されているCannyフィルタの理論的解説と関数用法の説明。

- [OpenCVチュートリアル「Cascade Classifier」](https://docs.opencv.org/4.8.0/db/d28/tutorial_cascade_classifier.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/db/d28/tutorial_cascade_classifier.html`  
OpenCVチュートリアルに掲載されているHaar特徴をもとにしたカスケード分類器の解説とサンプルコード（C++、Java、Python版あり）。

- [OpenCVチュートリアル「Laplace Operator」](https://docs.opencv.org/4.8.0/d5/db5/tutorial_laplace_operator.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/d5/db5/tutorial_laplace_operator.html`  
OpenCVチュートリアルに掲載されているラプラシアンフィルタの理論的解説と関数用法の説明。

- [OpenCVチュートリアル「Sobel Derivatives」](https://docs.opencv.org/4.8.0/d2/d2c/tutorial_sobel_derivatives.html "LINK") 🇺🇸 `https://docs.opencv.org/4.8.0/d2/d2c/tutorial_sobel_derivatives.html`  
OpenCVチュートリアル記載のソベルフィルタの理論的解説と関数用法の説明。

- [OpenCVチュートリアル「モルフォロジー変換」](http://labs.eecs.tottori-u.ac.jp/sd/Member/oyamada/OpenCV/html/py_tutorials/py_imgproc/py_morphological_ops/py_morphological_ops.html "LINK") 🇯🇵 `http://labs.eecs.tottori-u.ac.jp/sd/Member/oyamada/OpenCV/html/py_tutorials/py_imgproc/py_morphological_ops/py_morphological_ops.html`  
古いOpenCVチュートリアルの翻訳。モルフォロジー演算について日本語で学べるので重宝します。おそらくは鳥取大の先生の個人的なアーカイブなので、長持ちはしないかもしれません。

- [OpenCV.jp](http://opencv.jp/ "LINK") 🇯🇵 `http://opencv.jp/`  
日本のOpenCVユーザによる非公式なマニュアル翻訳。Version 2のものなのでかなり古いですが、最新機能には触れない本書の範囲内ではさほど問題にはなりません。さくっと理解するのには便利でしょう。

- [OpenCV.js Tutorials](https://docs.opencv.org/4.8.0/d5/d10/tutorial_js_root.html "LINK") 🇺🇸 `https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html`  
OpenCV.jsの公式チュートリアル。ある程度はOpenCVおよびJavaScriptの知識がないと、理解するのは難しいかもしれません。また、一部、画面上のコードをそのままコピーしても動作しないものがあります（内部で未記載のユーティリティに依存しているため）。

- [Python Downloads](https://www.python.org/downloads/ "LINK") 🇺🇸 `https://www.python.org/downloads/`  
Pythonインストーラのダウンロードページです。Windowsならexeファイルが取得できるので、ワンクリックでインストールできます。JavaScriptの書籍でPythonでは申し訳ないですが。

- [RFC 4648「The Base16, Base32, and Base64 Data Encodings」](https://www.rfc-editor.org/info/rfc4648 "LINK") 🇺🇸 `https://www.rfc-editor.org/info/rfc4648`  
`HTMLCanvasElement.toDataURL()`から得られる画像データのフォーマット（エンコーディング方法）であるBase64を規定するインターネット標準文書。

- [RFC 5466「Tags for Identifying Languages」](https://www.rfc-editor.org/rfc/rfc5646.html) 🇺🇸 `https://www.rfc-editor.org/rfc/rfc5646.html`  
`<track>`の`srclang`属性で指定できるja（日本語）などの言語タグを規定するインターネット標準文書。言語タグ文字列をどのように構成するかの規定なので、読んでもおもしろくないかもしれません。

- [Viola & Johnes「Rapid Object Detection using a Boosted Cascade of Simple Features」](https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/viola-cvpr-01.pdf) 🇺🇸 `https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/viola-cvpr-01.pdf`  
Haar特徴をもとにしたカスケード分類器のオリジナルの論文（2001）。

- [W3C「HTMLVideoElement.requestVideoFrameCallback()」](https://wicg.github.io/video-rvfc/ "LINK") 🇺🇸 `https://wicg.github.io/video-rvfc/`  
W3Cのワーキンググループが開発中のフレーム単位でのビデオ処理のためのメソッドの仕様。まだ「勧告」（標準規格）のレベルには達していないドラフト段階です。

- [W3C「WebCodecs」](https://w3c.github.io/webcodecs/ "LINK") 🇺🇸 `https://w3c.github.io/webcodecs/#videoencoder-interface`  
W3Cのワーキンググループが開発中の、ビデオコーデックに直接アクセスすることでフレーム単位の処理を可能とするAPIの仕様。まだドラフト段階です。

- [W3C「WebVTT: The Web Video Text Tracks Format」](https://www.w3.org/TR/webvtt1/ "LINK") 🇺🇸 `https://www.w3.org/TR/webvtt1/`  
W3Cのワーキンググループが開発中のHTMLビデオ字幕の仕様。ただし、まだ「勧告」には至っていない「Candidate Recommendation」（標準候補）段階です。

- [WHATWG「HTML Living Standard」](https://html.spec.whatwg.org/ "LINK") 🇺🇸 `https://html.spec.whatwg.org/`  
Web技術を開発するWHATWG（Web Hypertext Application Technology Working Group）によるHTMLの標準規格。たいていのことはMDNで済みますが、ほんとうの細部を知りたいときに役立ちます。たとえば`<script>`に`async`を付けたときと付けないときの動作の違いは、本ドキュメントの4.12.1節に図入りで説明されています。

- [Wikipedia「HSV色空間」](https://ja.wikipedia.org/wiki/HSV色空間) 🇯🇵 `https://ja.wikipedia.org/wiki/HSV色空間`  
HSV（HueーSaturationーValue）色空間の説明。類似の色空間にHSLがあり、HTML4/CSSはこちらを使っています。

- [Wikipedia「IEEE 754」](https://ja.wikipedia.org/wiki/IEEE_754 "LINK") 🇯🇵 `https://ja.wikipedia.org/wiki/IEEE_754`  
浮動小数点数の内部表現方法。本書で使う`cv.CV_32F`は32ビット版で、JavaScriptの`number`は64ビット版です。

- [Wikipedia「色差」](https://ja.wikipedia.org/wiki/色差 "LINK") 🇯🇵 `https://ja.wikipedia.org/wiki/色差`  
2つの色の距離（類似度）を測る方法。

- [Wikipedia「ハフ変換」](https://ja.wikipedia.org/wiki/ハフ変換 "LINK") 🇯🇵 `https://ja.wikipedia.org/wiki/ハフ変換`  
画像から直線や円などを検出するハフ変換の概説。

- [YouTube, First Principles of Computer Vision「Gaussian Mixture Model | Object Tracking」(https://www.youtube.com/watch?v=0nz8JMyFF14 "LINK") 🇺🇸 `https://www.youtube.com/watch?v=0nz8JMyFF14`  
コロンビア大学計算機科学部提供のGMMに関するビデオ。細かいところまで非常によく説明されていてわかりやすいです。

- [原色大辞典](https://www.colordic.org/ "LINK") 🇯🇵 `https://www.colordic.org/`   
Web色見本のサイトで、和色のまとまったリストが得られます。

OpenCVに関する書籍はいくつか出版されていますが、おおむね言語別になっています。JavaScript版の和書は現時点では本書以外には刊行されていないので、購入するのなら、APIの近いC/C++版がよいでしょう。

