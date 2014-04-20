AppHtml/AppHtmlWeb
=======

はじめに
--------

AppHtml は入力したキーワードから iTunes ストアを検索し、以下のコンテンツを指定フォーマットに整形して出力するブックマークレットです。コンテンツの紹介記事やレビュー記事を投稿したいブロガーに最適なツールです。

AppHtmlWeb は AppHtml を Web アプリ化したツールです。

1. iPhone アプリ
2. iPad アプリ
3. Mac アプリ
4. 曲
5. アルバム
6. 映画
7. 電子書籍


基本的な機能
------------

### AppHtml
 1. キーワードから、またはApp StoreやMac App Storeから「リンクをコピー」してURLを直接貼り付けても検索できます。
 2. ブラウザ版ストアでブックマークレットを実行すると、キーワードを入力することなく表示されているコンテンツを検索します。
 3. ブラウザ上でテキストを範囲選択した状態でブックマークレットを実行すると、範囲選択されたテキストでコンテンツを検索します。
 4. 出力されるHTMLコードをiPhoneやiPadの代表的なエディタに自動挿入することができます。
 5. スクリーンショットの画像サイズを指定できます（アプリに限ります）。
 6. PHGアフィリエイトに対応したリンクを作成することができます。
 7. 出力するテンプレートをカスタマイズすることができます。
 8. 設定内容をローカルストレージに保存できます（同一端末・同一ブラウザに限ります）。

### AppHtmlWeb
 1. ブックマークレットの作成が不要です。
 2. キーワードから、またはApp StoreやMac App Storeから「リンクをコピー」してURLを直接貼り付けても検索できます。
 3. 出力されるHTMLコードをiPhoneやiPadの代表的なエディタに自動挿入することができます。
 4. PHGアフィリエイトに対応したリンクを作成することができます。
 5. 出力するテンプレートをカスタマイズのうえ複数のテンプレートを同時に保存することができます（同一端末・同一ブラウザに限ります）。
 6. 設定内容をローカルストレージに保存できます（同一端末・同一ブラウザに限ります）。
 7. 設定内容のエクスポート/インポート機能により設定値や出力テンプレートのバックアップ、デバイス間での共有ができます。

セットアップ
------------

### AppHtml
 1. AppHtml ブックマークレット・メーカーに従い必要項目を入力してブックマークレットを生成します。
 2. 生成したブックマークレットをウェブブラウザのブックマークに登録します。

### AppHtmlWeb
 1. 指定された URL をウェブブラウザのブックマークに登録します。


実行
----

### AppHtml
 1. ウェブブラウザのブックマークから AppHtml を選択します。

### AppHtmlWeb
 1. 指定された URL をウェブブラウザで開きます。


カスタマイズ
------------

### AppHtml
 1. ブックマークレットを生成する段階で書式テンプレートを書き換えることによりカスタマイズすることができます。

### AppHtmlWeb
 1. 設定画面から書式テンプレートを追加することができます。


書式テンプレートの書き換えは HTML および以下の予約語を用いて記述してください。


### 予約語

名称                      | 予約語              | 使用可能な検索対象
--------------------------|---------------------|--------------------
小さいボタン              | ${badgeS}           | すべて
大きいボタン              | ${badgeL}           | すべて
テキストのみ              | ${textonly}         | すべて
名前                      | ${name}             | すべて
ストアへのリンク          | ${url}              | すべて
プレビューURL             | ${preview}          | Song/Movie
価格                      | ${price}            | すべて
カテゴリ                  | ${category}         | すべて
再生時間                  | ${playtime}         | Movie
トラック数                | ${trackcnt}         | Song/Album
リリース日                | ${pubdate}          | すべて
アイコン100               | ${icon100url}       | すべて
アイコン60                | ${icon60url}        | すべて
アーティスト名            | ${artist}           | すべて
アーティストURL           | ${artisturl}        | すべて
販売元                    | ${seller}           | アプリ(iPhone/iPad/Mac)
販売元サイトURL           | ${sellerurl}        | アプリ(iPhone/iPad/Mac)
コピーライト              | ${copyr}            | Album
説明                      | ${desc}             | アプリ(iPhone/iPad/Mac)/Movie/Book
What's New                | ${descnew}          | アプリ(iPhone/iPad/Mac)
短い説明                  | ${shortdesc}        | Movie
バージョン                | ${version}          | アプリ(iPhone/iPad/Mac)
レーティング              | ${rating}           | アプリ(iPhone/iPad/Mac)
評価★                    | ${userrating}       | アプリ(iPhone/iPad/Mac)/Book
レビュー件数              | ${userratingcnt}    | アプリ(iPhone/iPad/Mac)/Book
評価★(現)                | ${curuserrating}    | アプリ(iPhone/iPad/Mac)
レビュー件数(現)          | ${curuserratingcnt} | アプリ(iPhone/iPad/Mac)
サイズ                    | ${appsize}          | アプリ(iPhone/iPad/Mac)
サポートデバイス          | ${moveos}           | iPhone/iPadアプリ
言語                      | ${lang}             | アプリ(iPhone/iPad/Mac)
GameCenter対応            | ${gamecenter}       | iPhone/iPadアプリ
ユニバーサル対応          | ${univ}             | iPhone/iPadアプリ
スクリーンショット1       | ${image1}           | アプリ(iPhone/iPad/Mac)
スクリーンショット2       | ${image2}           | アプリ(iPhone/iPad/Mac)
スクリーンショット3       | ${image3}           | アプリ(iPhone/iPad/Mac)
スクリーンショット4       | ${image4}           | アプリ(iPhone/iPad/Mac)
スクリーンショット5       | ${image5}           | アプリ(iPhone/iPad/Mac)
スクリーンショット(univ)1 | ${univimage1}       | iPhone/iPadアプリ
スクリーンショット(univ)2 | ${univimage2}       | iPhone/iPadアプリ
スクリーンショット(univ)3 | ${univimage3}       | iPhone/iPadアプリ
スクリーンショット(univ)4 | ${univimage4}       | iPhone/iPadアプリ
スクリーンショット(univ)5 | ${univimage5}       | iPhone/iPadアプリ
実行日                    | ${today}           | すべて


既知の問題
----------
 1. 映画コンテンツのうちレンタルのみの場合 iTunes Search API から price の値が返されないため「レンタルのみ」を表示するようにしています。
 2. ボタンのバッジアイコンは、公式Link MakerにあわせてHTMLを返していましたが、style属性内のMedia Queriesの指定方法（@media only screen以降）では機能しないことを確認し、またブログ内で表示崩れが発生する可能性があることから、公式ツールの修正まで当該記述部分を削除します。
 3. その他に既知の問題がある場合はIssuesに記載しています。

免責事項
--------------------------------
本プロジェクトは、これらのツールが所定のデザイン・ガイドラインやアフィリエイト規約等へ準拠していることを保証するものではありません。これらのツールを利用して生じたいかなる損害に対しても一切責任を負いません。

LICENSE
-------

This software is released under the MIT License, see LICENSE.
