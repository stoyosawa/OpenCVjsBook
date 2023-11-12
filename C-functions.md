<!-- The file is automatically generated. -->
### 付録C OpenCV関数リスト
本書で取り上げたOpenCVの関数およびクラスコンストラクタを名称順に示します。

関数名 | 本書の節 | 説明
---|---|---
`cv.add()` | 6.8 | 画像を加算する。 
`cv.addWeighted()` | 6.8 | 画像を重み付け加算する。 
`cv.BackgroundSubtractorMOG2d()` | 7.5 | 背景抜きアルゴリズムを実装したMOG2のコンストラクタ。 
`cv.BackgroundSubtractorMOG2d.apply()` | 7.5 | 背景抜きを実行する。 
`cv.bilateralFilter()` | 6.2 | バイラテラルフィルタを用いて画像を平滑化する。 
`cv.bitwise_not()` | 5.2 | 画像のピクセル値をビット単位で反転する（ネガになる）。 
`cv.blur()` | 6.2 | 画像を平滑化する。 
`cv.calcOpticalFlowFarneback()` | 7.6 | オプティカルフローを計算する。 
`cv.Canny()` | 6.3 | キャニー法を用いたエッジ検出。
`cv.CascadeClassifier()` | 6.7 | Haarカスケード分類器オブジェクトを生成する。 
`cv.CascadeClassifier.detectMultiScale()` | 6.7 | カスケード分類器を実行する。 
`cv.CascadeClassifier.load()` | 6.7 | Haarカスケード分類器にデータファイルを取り込む。 
`cv.Circle()` | 4.4 | 中心座標と半径を収容したオブジェクトのコンストラクタ。 
`cv.circle()` | 7.4 | 円を描く。 
`cv.convertScaleAbs()` | 5.8 | 画像ピクセル値を加減乗除する。 
`cv.cvtColor()` | 5.1 | 色空間を変換する（RGBからHSVなど）。 
`cv.divide()` | 6.8 | 画像を除算する。 
`cv.equalizeHist()` | 6.7 | 画像のヒストグラムを均等化することでコントラストを上げる。 
`cv.flip()` | 7.2 | 画像を上下左右に反転する。 
`cv.FS_createDataFile()` | 6.7 | データから仮想ファイルを作成します。 
`cv.GassianBlur()` | 6.2 | ガウス関数を使って画像を平滑化する。 
`cv.getBuildInformation()` | 3.1 | OpenCVのビルド情報を返す。 
`cv.getRotationMatrix2D()` | 6.6 | アフィン変換用の変換行列を生成する。 
`cv.HoughTransformP()` | 6.6 | 白黒画像から直線を検出する。 
`cv.imread()` | 4.1 | `HTMLImageElement`上の画像を`cv.Mat`に取り込む。 
`cv.imshow()` | 4.1 | 第2引数の`cv.Mat`を第1引数の`<canvas>`に貼り付ける。 
`cv.Laplacian()` | 6.3 | 2次微分をかけることで画像のエッジを抽出する。
`cv.line()` | 6.6 | 線分を描画する。 
`cv.Mat()` | 4.4 | `cv.Mat`を生成するコンストラクタ。 
`cv.Mat.clone()` | 4.7 | `cv.Mat`のコピーを生成する。 
`cv.Mat.convertTo()` | 6.4 | 作用元の`cv.Mat`の型変換をする  
`cv.Mat.copyTo()` | 5.8 | 画像をコピーする。 
`cv.Mat.ones()` | 6.6 | 要素をすべて1で埋めた`cv.Mat`を生成する。 
`cv.Mat.roi()` | 4.7 | `cv.Mat`にROIを設定する。 
`cv.Mat.ucharPtr()` | 4.3 | `cv.Mat.data`の指定の位置からのピクセル値を`Uint8Array`で返す。 
`cv.matFromArray()` | 5.3 | 配列から`cv.Mat`を生成する。 
`cv.matFromImageData()` | 4.2 | `ImageData`オブジェクトを`cv.Mat`に取り込む。 
`cv.MatVector()` | 5.4 | `cv.Mat`専用のVector（配列）を生成するコンストラクタ。 
`cv.mean()` | 5.4 | `cv.Mat`のチャネル単位の平均値計算する。 
`cv.medianBlur()` | 6.2 | 中間値フィルタを用いて画像を平滑化する。 
`cv.morphologyEx()` | 6.5 | モルフォロジー演算をする。 
`cv.multiply()` | 6.8 | 画像を乗算する。 
`cv.Point()` | 4.4 | 座標位置(x, y)を収容したオブジェクトのコンストラクタ。 
`cv.polylines()` | 6.4 | 頂点を線で連結したグラフィックスを描く。 
`cv.QRCodeDetector()` | 6.4 | QRコードの検出と解読を行うクラスのコンストラクタ。 
`cv.QRCodeDetector.decode()` | 6.4 | QRコードを解読する。 
`cv.QRCodeDetector.detect()` | 6.4 | QRコードの4隅を検出する。 
`cv.Rect()` | 4.7 | 左上頂点座行、横幅、高さを収容したオブジェクトのコンストラクタ。 
`cv.rectangle()` | 6.7 | 矩形（辺が水平垂直）を描画する。 
`cv.resize()` | 6.1 | 画像をリサイズする。 
`cv.Scalar()` | 4.4 | 1～4個の数値を収容するコンテナのコンストラクタ（色指定に使う）。 
`cv.Size()` | 4.4 | 横と縦の大きさを収容したオブジェクトのコンストラクタ。 
`cv.Sobel()` | 6.3 | 1次微分をかけることで画像のエッジを抽出する。
`cv.split()` | 5.4 | マルチチャネル（カラー）画像を1チャンネルの配列（`cv.MatVector`）に分解する。 
`cv.subtract()` | 6.8 | 画像を減算する。 
`cv.threshold()` | 5.7 | 画像を2値化する。 
`cv.transform()` | 5.3 | 行列式からピクセル値を変換する。 
`cv.VideoCapture` | 7.1 | ビデオキャプチャコンストラクタ。 
`cv.VideoCapture.read()` | 7.1 | ビデオキャプチャからフレームを1枚読む。 
`cv.warpAffine()` | 6.6 | 画像にアフィン変換を施す（回転、拡大縮小、平行移動、せん断）。 
