(function () {

    var step = 1,
        d = document,
        w = window;
    var json = {}, ssMax = 0,
        ssCtr = 0,
        hitApp = 0,
        appId = "";

    // 親JSからパラメータを取得
    var script = d.getElementById("bmlt");
    var cnt = script.cnt,
        knd = script.knd,
        out = script.out,
        phg = script.phg,
        fmt = unescape(script.fmt);

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

    // bookmarkletの予約語（43個）
    var bmAry = ['name', 'url', 'preview', 'price', 'category', 'playtime',
          'trackcnt', 'pubdate', 'icon60url', 'icon100url', 'artist', 'artisturl',
          'seller', 'sellerurl', 'copyr', 'desc', 'shortdesc', 'descnew',
          'version', 'rating', 'userrating', 'userratingcnt', 'curuserrating', 'curuserratingcnt',
          'appsize', 'moveos', 'os', 'gamecenter', 'univ', 'lang',
          'image1', 'image2', 'image3', 'image4', 'image5',
          'univimage1', 'univimage2', 'univimage3', 'univimage4', 'univimage5',
          'badgeL', 'badgeS', 'textonly'];

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
        d.body.appendChild(s);//alert(s.src);
        w.result = function (data) {
            if (data.resultCount == 0) {
                prompt('Result', 'Not Found ...');
                step = 3;
                return;
            }
            //artworkUrl100がないものをresultsから削除
            for (var i = 0; i < data.results.length; i++) {
                if (!data.results[i].artworkUrl100) {
                    data.results.splice(i, 1);
                    i = i - 1;
                }
            }
            for (var i = 0; i < data.results.length; i++) {
                json[i] = data.results[i];
                if (knd == "software" || knd == "iPadSoftware" || knd == "macSoftware") {
                    json[i].description = json[i].description.replace(/\n/g, '<br>');
                    if (json[i].releaseNotes) json[i].releaseNotes = json[i].releaseNotes.replace(/\n/g, '<br>');
                    if (!json[i].supportedDevices) json[i].supportedDevices = "";
                }
                if (knd == "movie") {
                    json[i].shortDescription = json[i].shortDescription.replace(/\n/g, '<br>');
                    json[i].longDescription = json[i].longDescription.replace(/\n/g, '<br>');
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
                var r = prompt('【' + (i + 1) + '/' + data.results.length + '】' + x.title, 'OK→次, キャンセル→決定');
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
            x.name = data.trackCensoredName;
            if (phg != "") x.url = PHGUrl(data.collectionViewUrl, phg);
            else x.url = data.collectionViewUrl;
            x.preview = data.previewUrl;
            if (eval(data.trackPrice) == 0) x.price = '無料';
            else x.price = '￥' + fmtNumber(data.trackPrice);
            x.category = data.primaryGenreName;
            x.trackcnt = data.trackCount + '曲';
            x.pubdate = data.releaseDate.slice(0, 4) + '年';
            x.icon60url = data.artworkUrl60;
            x.icon100url = data.artworkUrl100;
            x.artist = data.artistName;
            if (phg != "") x.artisturl = PHGUrl(data.artistViewUrl, phg);
            else x.artisturl = data.artistViewUrl;
            x.badgeL = '<a href="' + x.url + '" target="itunes_store"style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_itunes-lrg.png) no-repeat;width:110px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_itunes-lrg.svg);}"></a>';
            x.badgeS = '<a href="' + x.url + '" target="itunes_store" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_itunes-sm.png) no-repeat;width:45px;height:15px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_itunes-sm.svg);}"></a>';
            x.textonly = '<a href="' + x.url + '" target="itunes_store">' + x.name + ' - ' + x.artist + '</a>';
        }
        if (knd == "album") {
            x.name = data.collectionCensoredName;
            if(phg != "") x.url = PHGUrl(data.collectionViewUrl, phg);
            else x.url = data.collectionViewUrl;
            if (eval(data.collectionPrice) == 0) x.price = '無料';
            else x.price = '￥' + fmtNumber(data.collectionPrice);
            x.category = data.primaryGenreName;
            x.trackcnt = data.trackCount + '曲';
            x.pubdate = data.releaseDate.slice(0, 4) + '年';
            x.icon60url = data.artworkUrl60;
            x.icon100url = data.artworkUrl100;
            x.artist = data.artistName;
            if (phg != "") x.artisturl = PHGUrl(data.artistViewUrl, phg);
            else x.artisturl = data.artistViewUrl;
            if (!data.copyright) x.copyr = '';
            else x.copyr = data.copyright;
            x.badgeL = '<a href="' + x.url + '" target="itunes_store"style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_itunes-lrg.png) no-repeat;width:110px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_itunes-lrg.svg);}"></a>';
            x.badgeS = '<a href="' + x.url + '" target="itunes_store" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_itunes-sm.png) no-repeat;width:45px;height:15px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_itunes-sm.svg);}"></a>';
            x.textonly = '<a href="' + x.url + '" target="itunes_store">' + x.name + ' - ' + x.artist + '</a>';
        }
        if (knd == "movie") {
            x.name = data.trackCensoredName;
            if (phg != "") x.url = PHGUrl(data.trackViewUrl, phg);
            else x.url = data.trackViewUrl;
            x.preview = data.previewUrl;
            if (!data.trackPrice) {
                x.price = '';
            } else if (eval(data.trackPrice) == 0) {
                x.price = '無料';
            } else {
                x.price = '￥' + fmtNumber(data.trackPrice);
            }
            x.category = data.primaryGenreName;
            if (!data.trackTimeMillis) x.playtime = 'データなし';
            else x.playtime = sizeTime(data.trackTimeMillis);
            x.pubdate = data.releaseDate.slice(0, 4) + '年';
            x.icon60url = data.artworkUrl60;
            x.icon100url = data.artworkUrl100;
            x.artist = data.artistName;
            if (!data.shortDescription) {
                if (!data.longDescription) {
                    x.shortdesc = '';
                } else {
                    x.shortdesc = data.longDescription;
                }
            } else {
                x.shortdesc = data.shortDescription;
            }
            if (!data.longDescription) x.longdesc = '';
            else x.desc = data.longDescription;
			x.badgeL = '<a href="' + x.url + '" target="itunes_store"style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_itunes-lrg.png) no-repeat;width:110px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_itunes-lrg.svg);}"></a>';
			x.badgeS = '<a href="' + x.url + '" target="itunes_store" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_itunes-sm.png) no-repeat;width:45px;height:15px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_itunes-sm.svg);}"></a>';
			x.textonly = '<a href="' + x.url + '" target="itunes_store">' + x.name + ' - ' + x.artist + '</a>';
        }

        if (knd == "ebook") {
            x.name = data.trackCensoredName;
            if (phg != "") x.url = PHGUrl(data.trackViewUrl, phg);
            else x.url = data.trackViewUrl;
            x.price = data.price;
            x.category = data.genres[0];
            for (i = 1; i < data.genres.length; i++) x.category = x.category + '、 ' + data.genres[i];
            x.pubdate = data.releaseDate.slice(0, 4) + '年' + Number(data.releaseDate.slice(5, 7)) + '月' + Number(data.releaseDate.slice(8, 10)) + '日';
			x.icon60url = data.artworkUrl60;
            x.icon100url = data.artworkUrl100;
            x.artist = data.artistName;
            if (phg != "") x.artisturl = PHGUrl(data.artistViewUrl, phg);
            else x.artisturl = data.artistViewUrl;
            x.desc = data.description;
            if (!data.averageUserRating) x.userrating = '無し';
            else x.userrating = data.averageUserRating;
            if (!data.userRatingCount) x.userratingcnt = '0件の評価';
            else x.userratingcnt = fmtNumber(data.userRatingCount) + '件の評価';
            x.badgeL = '<a href="' + x.url + '" target="itunes_store"style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_bookstore-lrg.png) no-repeat;width:146px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_bookstore-lrg.svg);}"></a>';
			x.badgeS = '<a href="' + x.url + '" target="itunes_store" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_bookstore-sm.png) no-repeat;width:65px;height:15px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_bookstore-sm.svg);}"></a>';
			x.textonly = '<a href="' + x.url + '" target="itunes_store">' + x.name + ' - ' + x.artist + '</a>';
        }

        if (knd == "software" || knd == "iPadSoftware" || knd == "macSoftware") {
            x.name = data.trackCensoredName;
            if (phg != "") x.url = PHGUrl(data.trackViewUrl, phg);
            else x.url = data.trackViewUrl;
            if (eval(data.price) == 0) x.price = '無料';
            else x.price = '￥' + fmtNumber(data.price);
            x.category = data.genres[0];
            for (i = 1; i < data.genres.length; i++) x.category = x.category + ', ' + data.genres[i];
            x.pubdate = data.releaseDate.replace(/-/g, '/');
            x.pubdate = x.pubdate.replace(/T.*/g, '');
            x.icon60url = data.artworkUrl60;
            x.icon100url = data.artworkUrl100;
            x.artist = data.artistName;
            if (phg != "") x.artisturl = PHGUrl(data.artistViewUrl, phg);
            else x.artisturl = data.artistViewUrl;
			x.seller = data.sellerName;
            if (phg != "") x.sellerurl = PHGUrl(data.sellerUrl, phg);
            else x.sellerurl = data.sellerUrl;
            x.desc = data.description;
            x.descnew = data.releaseNotes;
            x.version = data.version;
            x.rating = data.trackContentRating;
            if ('' + data.averageUserRatingForCurrentVersion == 'null') x.curverrating = '無し';
            else x.curverrating = data.averageUserRatingForCurrentVersion;
            if (!data.userRatingCountForCurrentVersion) {
                x.curuserratingcnt = '0件の評価';
            } else {
                x.curuserratingcnt = fmtNumber(data.userRatingCountForCurrentVersion) + '件の評価';
            }
            x.curuserratingcnt = x.curuserratingcnt.replace('n,ull', '0');
            if ('' + data.averageUserRating == 'null') x.userrating = '無し';
            else x.userrating = data.averageUserRating;
            if (!data.userRatingCount) {
                x.userratingcnt = '0件の評価';
            } else {
                x.userratingcnt = fmtNumber(data.userRatingCount) + '件の評価';
            }
            x.userratingcnt = x.userratingcnt.replace('n,ull', '0');
            x.appsize = sizeNumber(data.fileSizeBytes);
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
                if (data.isGameCenterEnabled) x.gamecenter = 'GameCenter対応';
                if (!x.gamecenter) x.gamecenter = "";
                if (data.ipadScreenshotUrls[0] && data.screenshotUrls[0]) x.univ = 'iPhone/iPadの両方に対応';
                if (!x.univ) x.univ = "";
            }
            x.lang = data.languageCodesISO2A[0];
            for (i = 1; i < data.languageCodesISO2A.length; i++) x.lang = x.lang + ', ' + data.languageCodesISO2A[i];
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
                    //                }
                    //                for (i = 0; i < data.ipadScreenshotUrls.length; i++) {
                    //                    if (data.ipadScreenshotUrls[i]) {
                    //                        x['univimage' + (i + 1)] = '<img alt="univss' + (i + 1) + '" src="' +
                    //                            data.ipadScreenshotUrls[i] + '" ' +
                    //                            'width="' + data['univimage' + (i + 1) + 'width'] + 'px">';
                    //                    }
                }
            }
            // iPadの場合
            if (knd == 'iPadSoftware') {
                for (i = 0; i < data.ipadScreenshotUrls.length; i++) {
                    if (data.ipadScreenshotUrls[i]) {
                        x['image' + (i + 1)] = '<img alt="ss' + (i + 1) + '" src="' +
                            data.ipadScreenshotUrls[i] + '" ' +
                            'width="' + data['image' + (i + 1) + 'width'] + 'px">';
                    }
                    //                }
                    //                for (i = 0; i < data.screenshotUrls.length; i++) {
                    //                    if (data.screenshotUrls[i]) {
                    //                        x['univimage' + (i + 1)] = '<img alt="univss' + (i + 1) + '" src="' +
                    //                            data.screenshotUrls[i] + '" ' +
                    //                            'width="' + data['univimage' + (i + 1) + 'width'] + 'px">';
                    //                    }
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
            if (knd == 'software' || knd == 'iPadSoftware'){
	            x.badgeL = '<a href="' + x.url + '" target="itunes_store"style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_appstore-lrg.png) no-repeat;width:135px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_appstore-lrg.svg);}"></a>';
	            x.badgeS = '<a href="' + x.url + '" target="itunes_store" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_appstore-sm.png) no-repeat;width:61px;height:15px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_appstore-sm.svg);}"></a>';
	            x.textonly = '<a href="' + x.url + '" target="itunes_store">' + x.name + ' - ' + x.artist + '</a>';
            }
            if (knd == 'macSoftware'){
	            x.badgeL = '<a href="' + x.url + '" target="itunes_store"style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_macappstore-lrg.png) no-repeat;width:165px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/ja_jp//images/web/linkmaker/badge_macappstore-lrg.svg);}"></a>';
	            x.badgeS = '<a href="' + x.url + '" target="itunes_store" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_macappstore-sm.png) no-repeat;width:81px;height:15px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets//images/web/linkmaker/badge_macappstore-sm.svg);}"></a>';
	            x.textonly = '<a href="' + x.url + '" target="itunes_store">' + x.name + ' - ' + x.artist + '</a>';
            }
        }
        return x;
    }

    // 親JSからGET形式でパラメータを引継ぐ為の関数
    function getJs(searchKey) {
        var script = document.getElementById("bmlt");
        var delim = script.src.indexOf("?");
        if (delim > 0) {
            urlArg = script.src.slice(delim + 1);
        }
        var paramAry, dataKey, dataVal;
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
})();
