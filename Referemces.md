## 付録 参考文献

OpenCV.jsに関連するオンラインドキュメントを示します（ページタイトルのアルファベット順）。

🇯🇵は日本語、🇺🇸は英語のドキュメントです。オリジナルは英語でも和訳のあるものはそちらのURLを記載しています。

<!-- 国旗絵文字は絵文字コード2つからなる。Sublime Text 3 ではまだ対応していないが、ブラウザなら OK。🇯🇵 U+1F1EF U+1F1F5 🇺🇸 U+1F1FA U+1F1F8 -->

- [Canny Edge Detection](https://docs.opencv.org/3.4/da/d22/tutorial_py_canny.html "LINK") 🇺🇸 https://docs.opencv.org/3.4/da/d22/tutorial_py_canny.html  
OpenCVチュートリアルに載っている、Cannyエッジ検出アルゴリズムの詳細な説明です。サンプルコードはPythonで書かれていますが、理論を学ぶぶんには何語でもかまわないでしょう。

- [emscripten](https://emscripten.org/ "LINK") 🇺🇸 `https://emscripten.org/`  
C/C++で書かれたOpenCVをWeb Assembly（wasm）で利用できるようにコンパイルしたコンパイラ。たとえば`Module`のAPIを知りたいときに参照しますが、OpenCV.jsの開発者でもなければ触れることもないでしょう。

- [HTML Living Standard](https://html.spec.whatwg.org/ "LINK") 🇺🇸 `https://html.spec.whatwg.org/`  
Web技術を開発するWHATWG（Web Hypertext Application Technology Working Group）によるHTMLの標準規格。たいていのことはMDNで済みますが、ほんとうの細部を知りたいときに役立ちます。たとえば`<script>`に`async`を付けたときと付けないときの動作の違いは、本ドキュメントの4.12.1節に図入りで説明されています。

<!-- 地球マーク 🌐 は U+1F310 -->
- [MDN Web docs](https://developer.mozilla.org/ja/docs/Web/JavaScript "LINK") 🇯🇵 `https://developer.mozilla.org/ja/docs/Web/JavaScript`  
JavaScript、HTML/DOM、CSSの仕様やAPIを紹介するサイトはいくつもありますが、ひとつだけ挙げるとしたら、MDN（Mozilla Developpers Network）のものがメソッド、属性、プロパティが細かいところまで書かれているのでお勧めです。もっとも、素っ気ないところがあるので、慣れないと不親切に感じるかもしれません。ほとんどのリファレンスには和訳が用意されているので、検索で英語版がヒットしたら、そのページ右上の🌐から日本語を選択します。

- [OpenCV](https://opencv.org/ "LINK") 🇺🇸 `https://opencv.org/`  
OpenCV本家のメインページ。メソッド・関数の仕様なら［Documentation］から適当なバージョンへのリンクを選択します。

- [OpenCV.jp](http://opencv.jp/ "LINK") 🇯🇵 `http://opencv.jp/`  
日本のOpenCVユーザによる非公式なマニュアル翻訳。Version 2のものなのでかなり古いですが、最新機能には触れていない本書の範囲内ではさほど問題にはなりません。さくっと理解するのには便利でしょう。

- [OpenCV.js Tutorial](https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html "LINK") 🇺🇸 `https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html`  
OpenCV.jsの公式チュートリアル。ある程度はOpenCVおよびJavaScriptの知識がないと、理解するのは難しいかもしれません。また、一部、画面上のコードをそのままコピーしても動作しないものがあります（内部で未記載のユーティリティかを用いているため）。

- [Python Downloads](https://www.python.org/downloads/ "LINK") 🇺🇸 https://www.python.org/downloads/  
Pythonインストーラのダウンロードページです。Windowsならexeファイルが取得できるので、ワンクリックでインストールできます。JavaScriptの書籍でPythonでは申し訳ないですが。

OpenCVに関する書籍はいくつか出版されていますが、おおむね、本書と同じく言語別になっています。JavaScript版の和書は現時点では本書以外には刊行されていないので、購入するのなら、仕様の近いC/C++版がよいでしょう。
