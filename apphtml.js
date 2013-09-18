(function () {

    var step = 1,
        d = document,
        w = window;
    var json = {}, ssMax = 0,
        ssCtr = 0,
        hitApp = 0,
        appId = "",
        tiffFlg = "false";

    // 親JSからパラメータを取得
    var bmBase = 'https://dl.dropboxusercontent.com/s/bv267xh585312kg/apphtml.js';
    var cnt = getJs('cnt'),
        knd = getJs('knd'),
        out = getJs('out'),
        phg = getJs('phg'),
        fmt = unescape(getJs('fmt')); //PHGアフィリエイトIDを追加

    // 見ているサイトがiTunesWebだった場合
    if (location.href.indexOf("https://itunes.apple.com/") != -1) {
        var urlAry = location.href.split("/id");
        appId = urlAry[1];
        urlAry = appId.split("?");
        appId = urlAry[0];
    }

    // 検索キーワードを取得（選択されたキーワードがある場合にはそっちを優先）
    var kwd = '';
    if (appId == "") {
        if (d.selection) kwd = d.selection.createRange().text;
        else if (w.selection) kwd = w.selection.createRange().text;
        else if (w.getSelection) kwd = w.getSelection();
        else if (d.getSelection) kwd = d.getSelection();
        else kwd = '';
        if (kwd == "") kwd = prompt("What do you want to search?", "");
        if (kwd == "" || !kwd) {
            prompt('Result', 'Not Found ...');
            return;
        }
    }

    // bookmarkletの予約語（40個）
    var bmAry = ['appname', 'version', 'price', 'title', 'category', 'appsize', 'pubdate', 'seller', 'sellersite', 'selleritunes', 'url', 'iconurl', 'moveos', 'os', 'gamecenter', 'univ', 'lang', 'rating', 'curverrating', 'curverstar', 'curreviewcnt', 'allverrating', 'allverstar', 'allreviewcnt', 'desc', 'descnew', 'image1', 'image2', 'image3', 'image4', 'image5', 'univimage1', 'univimage2', 'univimage3', 'univimage4', 'univimage5', 'phgurl', 'artist', 'musicname', 'moviename', 'bookname']; //予約語としてphgurlを追加

    // メイン処理（非同期実行を防ぐ為にTimerを利用）
    var timerId = setInterval(function () {
        switch (step) {
        case 1:
            step = 0;
            getWebApi();
            break;
        case 2:
            step = 0;
            dispData();
            break;
        case 3:
            while (d.getElementById("bmlt")) d.getElementById("bmlt").parentNode.removeChild(d.getElementById("bmlt"));
            clearInterval(timerId);
            timerId = null;
            return 0;
        }
    }, 100);

    // iTunes Search API をコールしてJSON形式で値を取得

    function getWebApi() {
        var s = d.createElement("script"),
            src = "";
        if (appId != "") src = "http://itunes.apple.com/jp/lookup?id=" + appId + "&lang=ja_jp&country=JP&entity=" + knd + "&limit=" + cnt;
        if (src == "") src = "http://itunes.apple.com/jp/search?term=" + encodeURIComponent(kwd) + "&lang=ja_jp&country=JP&entity=" + knd + "&limit=" + cnt;

        /*********** iTunes Search APIの戻り値（ここから）***********
		'kind', 'artistId', 'artistName', 'price', 'version', 'description', 'releaseDate',
		'sellerName', 'currency', 'trackId', 'trackName', 'releaseNotes', 'primaryGenreName',
		'primaryGenreId', 'isGameCenterEnabled', 'wrapperType', 'artworkUrl60',
		'artworkUrl100', 'artistViewUrl', 'contentAdvisoryRating', 'trackCensoredName',
		'trackViewUrl', 'fileSizeBytes', 'sellerUrl', 'averageUserRatingForCurrentVersion',
		'userRatingCountForCurrentVersion', 'artworkUrl512', 'trackContentRating',
		'averageUserRating', 'userRatingCount'
		'genreIds', 'features', 'genres', 'supportedDevices', 'languageCodesISO2A',
		'screenshotUrls', 'ipadScreenshotUrls'
		*********** iTunes Search APIの戻り値（ここまで）***********/

        s.charset = "utf-8";
        s.src = src + "&callback=result";
        s.id = "bmlt";
        d.body.appendChild(s);
        w.result = function (data) {
            if (data.resultCount == 0) {
                prompt('Result', 'Not Found ...');
                step = 3;
                return;
            }
            for (var i = 0; i < data.resultCount; i++) {
                json[i] = data.results[i];
                if (knd == "software" || knd == "iPadSoftware" || knd == "macSoftware") {
                    json[i].description = json[i].description.replace(/\n/g, '<br>');
                    if (json[i].releaseNotes) json[i].releaseNotes = json[i].releaseNotes.replace(/\n/g, '<br>');
                }
                var z = json[i],
                    x = new Array(bmAry);
                if (knd == "software" || knd == "iPadSoftware" || knd == "macSoftware") {
                    if (eval(z.price) == 0) x.price = '無料';
                    else x.price = '￥' + fmtNumber(z.price);
                    x.appname = z.trackCensoredName;
                    x.title = x.appname + '（' + x.price + '）';
                }
                if (knd == "song") {
                    x.title = z.trackCensoredName + ' （' + z.artistName + '）';
                }
                if (knd == "album") {
                    x.title = z.collectionCensoredName + ' （' + z.artistName + '）';
                }
                if (knd == "movie") {
                    x.title = z.trackCensoredName + ' （' + z.artistName + '）';
                }
                if (knd == "ebook") {
                    x.title = z.trackCensoredName + ' （' + z.artistName + '）';
                }
                var r = prompt('【' + (i + 1) + '/' + data.resultCount + '】' + x.title, 'OK→次, キャンセル→決定');
                if (!r) {
                    hitApp = i;
                    step = 2;
                    return;
                }
            }
            step = 3;
        }
    }

    // 結果の整理と出力方法ごとの処理

    function dispData() {
        var x = '',
            chk = '';
        var z = json[hitApp],
            pData = fmt;

        // 結果をbookmarklet予約語に変換してfmtを置換
        var bmData = handData(z);
        for (var j = 0; j < bmAry.length; j++) {
            var key = bmAry[j],
                value = bmData[key],
                reg = new RegExp('\\${' + key + '}', 'g');
            pData = pData.replace(reg, value);
        }
        x = pData + '\n';
        chk = pData;
        if (tiffFlg == "true") prompt("Screenshots cannot be displayed because of TIFF files.", "Warning...");
        if (chk != '') {
            // 出力方法ごとの処理（プレビュー表示）
            if (out == "preview") {
                d.body.innerHTML =
                    '<div id="bkmlt_preview">' +
                    "<form><input type='button' value='プレビュー表示を消す' onclick='javascript:" +
                    'var a=document.getElementById("bkmlt_preview");a.parentNode.removeChild(a);' +
                    "'>　<input type='button' value='HTMLを選択する' onclick='javascript:" +
                    'var a=document.getElementById("bkmklt_ret");a.focus();' +
                    "'>　<input type='button' value='HTMLの内容でプレビューを書き直す' onclick='javascript:" +
                    'var a=document.getElementById("bkmklt_ret").value;' +
                    'document.getElementById("bkmklt_rewrite").innerHTML=a;' +
                    "'></form>" + '<textarea style="width:99%;font-size:80%;" rows="10" id="bkmklt_ret"' +
                    'onfocus="javascript:this.select();">' + x + '</textarea><br><br><div id="bkmklt_rewrite">' +
                    x + '</div></div>' + d.body.innerHTML;
            }
            // 出力方法ごとの処理（ポップアップ表示）
            if (out == "popup") {
                prompt("result", x);
            }
            // 出力方法ごとの処理（ポップアップ→Textforce連携）
            if (out == "pop-textforce") {
                prompt("result", x);
                w.location = 'textforce://';
            }
            // 出力方法ごとの処理（Texeforce連携）
            if (out == "textforce") {
                w.location = 'textforce://file?path=/blog.html&method=write&after=quick_look&text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（Texeforce連携しSafariに戻る）
            if (out == "safari-textforce") {
                w.location = 'textforce://file?path=/blog.html&method=write&after=quick_look&text=' + encodeURIComponent(x) + '&callback=' + encodeURIComponent(location.href);
            }
            // 出力方法ごとの処理（DraftPad連携）
            if (out == "draftpad") {
                w.location = 'draftpad:///insert?after=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（するぷろ連携）
            if (out == "slpro") {
                w.location = 'slpro://' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（Moblogger連携）
            if (out == "moblogger") {
                prompt("result", x);
                w.location = 'moblogger://';
            }
            // 出力方法ごとの処理（Mobloggerを起動して追記）
            if (out == "moblogger-app") {
                w.location = 'moblogger://append?text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（Mobloggerを起動してクリップボードにコピー）
            if (out == "moblogger-pb") {
                w.location = 'moblogger://pboard?text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（MyEditor連携）
            if (out == "myeditor") {
                prompt("result", x);
                w.location = 'myeditor://';
            }
            // 出力方法ごとの処理（MyEditorを起動してカーソル位置にコピー）
            if (out == "myeditor-cursor") {
                w.location = 'myeditor://cursor?text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（Rowlineを起動して文末に追加）
            if (out == "rowline") {
                w.location = 'rowline:///set?loc=bottom&view=lines&callback=seeq://&text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（@matubizさん作MyScripts用スクリプト、TextHandlerに送信）
            if (out == "msth") {
                w.location = 'myscripts://run?title=TextHandler&text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（ThumbEditに送る）
            if (out == "thumbedit") {
                w.location = 'thumbedit://?text=' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（ThumbEditに追記）
            if (out == "thumbedit-insert") {
                w.location = 'thumbedit://?text=' + encodeURIComponent(x) + '&mode=insert';
            }
            // 出力方法ごとの処理（PressSync Proに送る）
            if (out == "presssync") {
                w.location = 'presssync:///message?' + encodeURIComponent(x);
            }
            // 出力方法ごとの処理（PressSync Proに送る）
            if (out == "textwell") {
                w.location = 'textwell:///insert?text=' + encodeURIComponent(x);
            }
        }
        step = 3;
    }

    // Bookmarklet予約語へのセット

    function handData(data) {
        var x = new Array(bmAry),
            i, j, tmp, reg;

        //Entity毎にセット
        if (knd == "song") {
            x.musicname = data.trackCensoredName;
            x.url = data.collectionViewUrl;
            x.phgurl = PHGUrl(data.collectionViewUrl, phg);
            if (eval(data.collectionPrice) == 0) x.price = '無料';
            else x.price = '￥' + fmtNumber(data.collectionPrice);
            x.category = data.primaryGenreName;
            x.trackcnt = data.trackCount + '曲';
            x.pubdate = data.releaseDate.slice(0, 4) + '年';
            x.iconurl = data.artworkUrl100;
            //            x.icon30url = data.artworkUrl30;
            //            x.icon60url = data.artworkUrl60;
            //            x.icon100url = data.artworkUrl100;
            //            x.icon170url = data.artworkUrl100.replace("100x100-75", "170x170-75");
            x.artist = data.artistName;
        }
        if (knd == "album") {
            x.musicname = data.collectionCensoredName
            x.url = data.collectionViewUrl;
            x.phgurl = PHGUrl(data.collectionViewUrl, phg);
            if (eval(data.collectionPrice) == 0) x.price = '無料';
            else x.price = '￥' + fmtNumber(data.collectionPrice);
            x.category = data.primaryGenreName;
            x.trackcnt = data.trackCount + '曲';
            x.pubdate = data.releaseDate.slice(0, 4) + '年';
            x.iconurl = data.artworkUrl100;
            //            x.icon60url = data.artworkUrl60;
            //            x.icon100url = data.artworkUrl100;
            //            x.icon170url = data.artworkUrl100.replace("100x100-75", "170x170-75");
            x.artist = data.artistName;
            if (!data.copyright) x.copyr = '';
            else x.copyr = data.copyright;
        }
        if (knd == "movie") {
            x.moviename = data.trackCensoredName;
            if (!data.trackPrice) {
                x.price = '';
            } else if (eval(data.trackPrice) == 0) {
                x.price = '無料';
            } else {
                x.price = '￥' + fmtNumber(data.trackPrice);
            }
            if (!data.trackPrice) x.title = x.moviename;
            else x.title = x.moviename + '（' + x.price + '）';
            x.category = data.primaryGenreName;

            if (!data.trackTimeMillis) x.playtime = 'データなし';
            else x.playtime = sizeTime(data.trackTimeMillis);
            x.pubdate = data.releaseDate.slice(0, 4) + '年';
            x.url = data.trackViewUrl;
            x.phgurl = PHGUrl(data.trackViewUrl, phg);
            //            x.icon227url = data.artworkUrl100.replace("100x100-75", "227x227-75");
            x.iconurl = data.artworkUrl100;
            //            x.icon140url = data.artworkUrl100.replace("100x100-75", "140x140-75");
            //            x.icon60url = data.artworkUrl60;
            //            x.icon30url = data.artworkUrl30;
            x.artist = data.artistName;

            if (!data.shortDescription) {
                if (!data.longDescription) {
                    x.shortdesc = '';
                } else {
                    x.shortdesc = data.longDescription;
                }
            } else {
                x.shortdesc = data.shortDescription;
            } if (!data.longDescription) x.longdesc = '';
            else x.longdesc = data.longDescription;
            x.memo = 'Your comment here';
        }

        if (knd == "ebook") {
            x.bookname = data.trackCensoredName;
            x.price = data.formattedPrice;
            x.title = x.bookname + ' （' + x.price + '）';
            x.category = data.genres[0];
            for (i = 1; i < data.genres.length; i++) x.category = x.category + '、 ' + data.genres[i];
            x.pubdate = data.releaseDate.slice(0, 4) + '年' + Number(data.releaseDate.slice(5, 7)) + '月' + Number(data.releaseDate.slice(8, 10)) + '日';
            x.url = data.trackViewUrl;
            x.phgurl = PHGUrl(data.trackViewUrl, phg);
            x.iconurl = data.artworkUrl100;
            //            x.icon225url = data.artworkUrl100.replace("100x100-75", "225x225-75");
            //            x.icon100url = data.artworkUrl100;
            //            x.icon60url = data.artworkUrl60;
            x.artist = data.artistName;
            x.desc = data.description;
            x.briefdesc = x.desc.substring(0, 200) + "...";
            x.memo = 'Your comment here';
            x.rating = data.averageUserRating;
            if (!data.ratingcnt) x.ratingcnt = '0';
            else x.ratingcnt = fmtNumber(data.userRatingCount);
        }

        if (knd == "software" || knd == "iPadSoftware" || knd == "macSoftware") {
            x.appname = data.trackCensoredName;
            x.version = data.version;
            if (eval(data.price) == 0) x.price = '無料';
            else x.price = '￥' + fmtNumber(data.price);
            x.title = x.appname + ' ' + x.version + '（' + x.price + '）';
            x.category = data.genres[0];
            for (i = 1; i < data.genres.length; i++) x.category = x.category + ', ' + data.genres[i];
            x.appsize = sizeNumber(data.fileSizeBytes);
            x.pubdate = data.releaseDate.replace(/-/g, '/');
            x.pubdate = x.pubdate.replace(/T.*/g, '');
            x.artist = data.artistName;
            x.sellersite = data.sellerUrl;
            x.phgurl = PHGUrl(data.trackViewUrl, phg);
            x.url = data.trackViewUrl;
            tmp = data.artworkUrl100.split(".");
            x.iconurl = data.artworkUrl100;
            //            reg = new RegExp(tmp[tmp.length - 1] + '$');
            //            x.icon100url = data.artworkUrl100.replace(reg, "100x100-75." + tmp[tmp.length - 1]);
            //            x.icon100url = x.icon100url.replace("512x512-75.", "");
            //            x.icon100url = x.icon100url.replace(".tiff", ".png");
            //            x.icon100url = x.icon100url.replace(".tif", ".png");
            //            x.icon75url = data.artworkUrl100.replace(reg, "75x75-65." + tmp[tmp.length - 1]);
            //            x.icon75url = x.icon75url.replace("512x512-75.", "");
            //            x.icon75url = x.icon75url.replace(".tiff", ".png");
            //            x.icon75url = x.icon75url.replace(".tif", ".png");
            //            x.icon53url = data.artworkUrl100.replace(reg, "53x53-75." + tmp[tmp.length - 1]);
            //            x.icon53url = x.icon53url.replace("512x512-75.", "");
            //            x.icon53url = x.icon53url.replace(".tiff", ".png");
            //            x.icon53url = x.icon53url.replace(".tif", ".png");

            // Macの場合は無い（moveos, os, gamecenter, univ）
            x.moveos = "";
            x.os = "";
            x.gamecenter = "";
            x.univ = "";
            if (knd != 'macSoftware') {
                x.moveos = data.supportedDevices[0];
                for (i = 1; i < data.supportedDevices.length; i++) x.moveos = x.moveos + ', ' + data.supportedDevices[i];
                x.os = x.moveos.replace(/.*all.*/g, 'iPhone');
                if (x.os == '') x.os = x.moveos.replace(/.*iPhone.*/g, 'iPhone');
                if (x.os == '') x.os = x.moveos.replace(/.*iPad.*/g, 'iPad');
                if (data.isGameCenterEnabled) x.gamecenter = '<img width="100" alt="GameCenter対応" ' +
                    'src="http://r.mzstatic.com/htmlResources/1043/web-storefront/images/gc_badge.png">';
                if (!x.gamecenter) x.gamecenter = "";
                if (data.ipadScreenshotUrls[0] && data.screenshotUrls[0]) x.univ =
                    '<img alt="+ " src="http://r.mzstatic.com/htmlResources/1043/web-storefront/images/fat-binary-badge-web.png">' +
                    ' iPhone/iPadの両方に対応';
                if (!x.univ) x.univ = "";
            }

            x.lang = data.languageCodesISO2A[0];
            for (i = 1; i < data.languageCodesISO2A.length; i++) x.lang = x.lang + ', ' + data.languageCodesISO2A[i];
            x.rating = data.trackContentRating;
            if ('' + data.averageUserRatingForCurrentVersion == 'null') x.curverrating = '無し';
            else x.curverrating =
                data.averageUserRatingForCurrentVersion;
            x.curverstar = getStar(data.averageUserRatingForCurrentVersion);
            if (!data.userRatingCountForCurrentVersion) {
                x.curreviewcnt = '0件の評価';
            } else {
                x.curreviewcnt = fmtNumber(data.userRatingCountForCurrentVersion) + '件の評価';
            }
            x.curreviewcnt = x.curreviewcnt.replace('n,ull', '0');
            if ('' + data.averageUserRating == 'null') x.allverrating = '無し';
            else x.allverrating = data.averageUserRating;
            x.allverstar = getStar(data.averageUserRating);
            if (!data.userRatingCount) {
                x.allreviewcnt = '0件の評価';
            } else {
                x.allreviewcnt = fmtNumber(data.userRatingCount) + '件の評価';
            }
            x.allreviewcnt = x.allreviewcnt.replace('n,ull', '0');
            x.desc = data.description;
            x.descnew = data.releaseNotes;
            for (i = 1; i <= 5; i++) {
                x['image' + i] = "";
                x['univimage' + i] = "";
            }
            // iPhoneの場合は、UnivスクショにiPad画像をセット（image, univimage）
            if (knd == 'software') {
                for (i = 0; i < data.screenshotUrls.length; i++) {
                    if (data.screenshotUrls[i]) {
                        x['image' + (i + 1)] = '<img alt="ss' + (i + 1) + '" src="' +
                            data.screenshotUrls[i] + '" ' +
                            'width="' + data['image' + (i + 1) + 'width'] + 'px">';
                    }
                }
                for (i = 0; i < data.ipadScreenshotUrls.length; i++) {
                    if (data.ipadScreenshotUrls[i]) {
                        x['univimage' + (i + 1)] = '<img alt="univss' + (i + 1) + '" src="' +
                            data.ipadScreenshotUrls[i] + '" ' +
                            'width="' + data['univimage' + (i + 1) + 'width'] + 'px">';
                    }
                }
            }
            // iPadの場合は、UnivスクショにiPhone画像をセット（image, univimage）
            if (knd == 'iPadSoftware') {
                for (i = 0; i < data.ipadScreenshotUrls.length; i++) {
                    if (data.ipadScreenshotUrls[i]) {
                        x['image' + (i + 1)] = '<img alt="ss' + (i + 1) + '" src="' +
                            data.ipadScreenshotUrls[i] + '" ' +
                            'width="' + data['image' + (i + 1) + 'width'] + 'px">';
                    }
                }
                for (i = 0; i < data.screenshotUrls.length; i++) {
                    if (data.screenshotUrls[i]) {
                        x['univimage' + (i + 1)] = '<img alt="univss' + (i + 1) + '" src="' +
                            data.screenshotUrls[i] + '" ' +
                            'width="' + data['univimage' + (i + 1) + 'width'] + 'px">';
                    }
                }
            }
            // Macの場合は、スクショのみでUnivスクショは無し（image）
            if (knd == 'macSoftware') {
                for (i = 0; i < data.screenshotUrls.length; i++) {
                    if (data.screenshotUrls[i]) {
                        x['image' + (i + 1)] = '<img alt="ss' + (i + 1) + '" src="' +
                            data.screenshotUrls[i] + '" ' +
                            'width="' + data['image' + (i + 1) + 'width'] + 'px">';
                    }
                }
            }
        }
        return x;
    }

    // 親JSからGET形式でパラメータを引継ぐ為の関数

    function getJs(searchKey) {
        var scripts = document.getElementsByTagName("script"),
            urlArg, params = {};
        for (var i = 0; i < scripts.length; i++) {
            var tmp = scripts.item(i);
            if (tmp.src.indexOf(bmBase) != -1) {
                urlArg = tmp.src.slice(bmBase.length + 1);
                break;
            }
        }
        var paramAry, dataKey, dataVal, pos;
        if (urlArg) paramAry = urlArg.split("&");
        if (paramAry) {
            for (var i = 0; i < paramAry.length; i++) {
                var pos = paramAry[i].indexOf('=');
                if (pos > 0) {
                    dataKey = paramAry[i].substring(0, pos);
                    dataVal = paramAry[i].substring(pos + 1);
                }
                if (dataKey == searchKey) return dataVal;
            }
        }
        return null;
    }

    // 数字のカンマ編集

    function fmtNumber(x) {
        var s = '' + x,
            p = s.indexOf('.');
        if (p < 0) p = s.length;
        var r = s.substring(p, s.length);
        for (var i = 0; i < p; i++) {
            var c = s.substring(p - 1 - i, p - 1 - i + 1);
            if (i > 0 && i % 3 == 0) r = ',' + r;
            r = c + r;
        }
        return r;
    }

    // サイズ換算

    function sizeNumber(x) {
        var r = Math.round((eval(x) / 1000000) * 10) / 10;
        r = fmtNumber(r);
        r = r + ' MB';
        return r;
    }

    // 再生時間を変換

    function sizeTime(x) {
        var r = Math.round((eval(x) / 60000));
        r = fmtNumber(r);
        r = r + ' 分';
        return r;
    }

    // PHGアフィリエイトリンクまたはLinkShareリンク生成

    function PHGUrl(url, id) {
        if (phg != "") {
            var affId = '&at=' + id;
            var appUrl = url + affId;
            return appUrl;
        } else
            var appUrl = url;
        return appUrl;
    }

    // スター生成

    function getStar(x) {
        var star = '<img alt="" src="http://r.mzstatic.com/htmlResources/1043/web-storefront/images/rating_star.png">';
        var half = '<img alt="" src="http://r.mzstatic.com/htmlResources/1043/web-storefront/images/rating_star_half.png">';
        var tmp = ('' + x).split(".", 2);
        var ret = '';
        for (var i = 1; i < eval(tmp[0]) + 1; i++) ret = ret + star;
        if (tmp[1]) ret = ret + half;
        if (ret == '') ret = '無し';
        return ret;
    }
})();