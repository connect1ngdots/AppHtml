(function () {

	var step = 1, d = document, w = window;
	var json = {}, ssMax = 0, ssCtr = 0, hitApp = 0, appId = "", tiffFlg = "false";

	// 親JSからパラメータを取得
	var bmBase = 'https://dl.dropboxusercontent.com/s/xvjr3je5zn7l0gd/apphtml.js';
	var cnt = getJs('cnt'), knd = getJs('knd'), out = getJs('out'), aff = getJs('aff'), phg = getJs('phg');//PHGアフィリエイトIDを追加
	var scs = getJs('scs'), ipd = getJs('ipd'), fmt = unescape(getJs('fmt'));
	
	// PHG_IDが空欄でかつLinkShare_IDが入力されていた場合、警告を表示。
	if (phg == '' && aff != "") {
		var lsWarning = confirm("iTunesのLinkShareアフィリエイトは2013年10月1日に終了します。\n新たに開始されているPHGアフィリエイトプログラムへの申込を行いますか？\n\nまだ行わない。→[キャンセル]/申込を行う。→[OK]");
	}
	if (lsWarning) {
		w.location = 'https://phgconsole.performancehorizon.com/login/itunes/jp';
		return;
	}

	// 見ているサイトがiTunesWebだった場合
	if (location.href.indexOf("http://itunes.apple.com/") != -1) {
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
		else if (d.getSelection) kwd = d.getSelection(); else kwd = '';
		if (kwd == "") kwd = prompt("Input App name.", "");
		if (kwd == "" || !kwd) {
			prompt('Result', 'Not Found ...');
			return;
		}
	}

	// bookmarkletの予約語（40個）
	var bmAry = ['appname', 'version', 'price', 'title', 'category', 'appsize', 'pubdate', 'seller', 'sellersite', 'selleritunes', 'linkshareurl', 'url', 'icon175url', 'icon100url', 'icon75url', 'icon53url', 'moveos', 'os', 'gamecenter', 'univ', 'lang', 'rating', 'curverrating', 'curverstar', 'curreviewcnt', 'allverrating', 'allverstar', 'allreviewcnt', 'desc', 'descnew', 'image1', 'image2', 'image3', 'image4', 'image5', 'univimage1', 'univimage2', 'univimage3', 'univimage4', 'univimage5','phgurl'];//予約語としてphgurlを追加
	
	// メイン処理（非同期実行を防ぐ為にTimerを利用）
	var timerId = setInterval(function() {
		switch(step) {
		case 1: step = 0; getWebApi(); break;
		case 2: step = 0; getWidth(); break;
		case 3: step = 0; dispData(); break;
		case 4:
		while (d.getElementById("bmlt")) d.getElementById("bmlt").parentNode.removeChild(d.getElementById("bmlt"));
		clearInterval(timerId); timerId = null; return 0;
		}
	}, 100);

	// iTunes Search API をコールしてJSON形式で値を取得
	function getWebApi() {
		var s = d.createElement("script"), src = "";
		if (appId != "") src = "http://itunes.apple.com/jp/lookup?id=" + appId + "&lang=ja_jp&country=JP&entity=" + knd + "&limit=" + cnt;
		if (src == "" ) src = "http://itunes.apple.com/jp/search?term=" + encodeURIComponent(kwd) + "&lang=ja_jp&country=JP&entity=" + knd + "&limit=" + cnt;

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
		w.result = function(data) {
			if (data.resultCount == 0) {
				prompt('Result', 'Not Found ...'); step = 4; return;
			}
			for (var i = 0; i < data.resultCount; i++) {
				json[i] = data.results[i];
				json[i].description = json[i].description.replace(/\n/g, '<br>');
				if (json[i].releaseNotes) json[i].releaseNotes = json[i].releaseNotes.replace(/\n/g, '<br>');
				var z = json[i], x = new Array(bmAry);
				x.appname = z.trackCensoredName;
				x.version = z.version;
				if (eval(z.price) == 0) x.price = '無料'; else x.price = '￥' + fmtNumber(z.price);
				x.title = x.appname + ' ' + x.version + '（' + x.price + '）';
				var r = prompt('【' + (i + 1) + '/' + data.resultCount + '】' + x.title, 'OK→次, キャンセル→決定');
				if (!r) {
					hitApp = i; step = 2; return;
				}
			}
			step = 4;
		}
	}

	// スクショの縦横チェック（裏で画像をロード）
	function getWidth() {
		var i;
		ssMax = json[hitApp].screenshotUrls.length;
		if (knd == 'software') {
			ssMax = ssMax + json[hitApp].ipadScreenshotUrls.length;
			for (i = 0; i < json[hitApp].screenshotUrls.length; i++) {
				loadImg(i, "image", json[hitApp].screenshotUrls[i], eval(scs));
			}
			for (i = 0; i < json[hitApp].ipadScreenshotUrls.length; i++) {
				loadImg(i, "univimage", json[hitApp].ipadScreenshotUrls[i], eval(scs) * eval(ipd));
			}
		}
		if (knd == 'iPadSoftware') {
			ssMax = ssMax + json[hitApp].ipadScreenshotUrls.length;
			for (i = 0; i < json[hitApp].ipadScreenshotUrls.length; i++) {
				loadImg(i, "image", json[hitApp].ipadScreenshotUrls[i], eval(scs));
			}
			for (i = 0; i < json[hitApp].screenshotUrls.length; i++) {
				loadImg(i, "univimage", json[hitApp].screenshotUrls[i], eval(scs) * eval(ipd));
			}
		}
		if (knd == 'macSoftware') {
			for (i = 0; i < json[hitApp].screenshotUrls.length; i++) {
				loadImg(i, "image", json[hitApp].screenshotUrls[i], eval(scs));
			}
		}
	}

	// 縦横判定の結果としてWidthを計算
	function loadImg(i, type, src, x) {
		var aw, ah, img = new Image(), ret;

		// スクショが.tifの場合にはスキップ
		if (src.indexOf(".tif") != -1) {
			ssCtr = ssCtr + 1;
			json[hitApp][type + (i + 1) + "width"] = 0;
			if (ssCtr == ssMax) step = 3;
			tiffFlg = "true";
			return;
		}

		img.src = src;
		img.onload = function () {
			aw = img.width;
			ah = img.height;
			if (aw > ah) {
				ret = Math.round(x);
			} else {
				ret = Math.round(x * (aw / ah));
			}
			img.onload = "";
			img = void 0;
			ssCtr = ssCtr + 1;
			json[hitApp][type + (i + 1) + "width"] = ret;
			// alert(type + (i + 1) + 'width, aw=' + aw + ', ah=' + ah + ', ret=' + ret + ', x=' + x);
			if (ssCtr == ssMax) step = 3;
		}
	}

	// 結果の整理と出力方法ごとの処理
	function dispData() {
		var x = '', chk='';
		var z = json[hitApp], pData = fmt;

		// 結果をbookmarklet予約語に変換してfmtを置換
		var bmData = handData(z);
		for (var j = 0; j < bmAry.length; j++) {
			var key = bmAry[j], value = bmData[key], reg = new RegExp('\\${' + key + '}', 'g');
			pData = pData.replace(reg, value);
		}
		x = pData + '\n';
		chk = pData;
		if (tiffFlg == "true") prompt("Screenshots cannot be displayed because of TIFF files.","Warning...");
		if (chk != '') {
			// 出力方法ごとの処理（プレビュー表示）
			if (out == "preview" ) {
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
            	w.location = 'thumbedit://?text=' + encodeURIComponent(x) +'&mode=insert';
            }
            // 出力方法ごとの処理（PressSync Proに送る）
            if (out == "presssync") {
            	w.location = 'presssync:///message?' + encodeURIComponent(x);
            }
        }
		step = 4;
	}

	// Bookmarklet予約語へのセット
	function handData(data) {
		var x = new Array(bmAry), i, j, tmp, reg;

		x.appname = data.trackCensoredName;
		x.version = data.version;
		if (eval(data.price) == 0) x.price = '無料'; else x.price = '￥' + fmtNumber(data.price);
		x.title = x.appname + ' ' + x.version + '（' + x.price + '）';
		x.category = data.genres[0];
		for (i = 1; i < data.genres.length; i++) x.category = x.category + ', ' + data.genres[i];
		x.appsize = sizeNumber(data.fileSizeBytes);
		x.pubdate = data.releaseDate.replace(/-/g, '/');
		x.pubdate = x.pubdate.replace(/T.*/g, '');
		x.seller = data.artistName + ' - ' + data.sellerName;
		x.sellersite = data.sellerUrl;
		if (phg != '') x.selleritunes = linkShareUrl(data.artistViewUrl, phg); else x.selleritunes = linkShareUrl(data.artistViewUrl, aff);//alert(x.selleritunes);
		if (phg != '') x.phgurl = linkShareUrl(data.trackViewUrl, phg); else x.linkshareurl = linkShareUrl(data.trackViewUrl, aff);//alert(x.affurl);
		x.url = data.trackViewUrl;//alert(x.url);
		tmp = data.artworkUrl100.split(".");
		reg = new RegExp(tmp[tmp.length - 1] + '$');
		x.icon175url = data.artworkUrl100.replace(reg, "175x175-75." + tmp[tmp.length - 1]);
		x.icon175url = x.icon175url.replace("512x512-75.", "");
		x.icon175url = x.icon175url.replace(".tiff", ".png");
		x.icon175url = x.icon175url.replace(".tif", ".png");
		x.icon100url = data.artworkUrl100.replace(reg, "100x100-75." + tmp[tmp.length - 1]);
		x.icon100url = x.icon100url.replace("512x512-75.", "");
		x.icon100url = x.icon100url.replace(".tiff", ".png");
		x.icon100url = x.icon100url.replace(".tif", ".png");
		x.icon75url = data.artworkUrl100.replace(reg, "75x75-65." + tmp[tmp.length - 1]);
		x.icon75url = x.icon75url.replace("512x512-75.", "");
		x.icon75url = x.icon75url.replace(".tiff", ".png");
		x.icon75url = x.icon75url.replace(".tif", ".png");
		x.icon53url = data.artworkUrl100.replace(reg, "53x53-75." + tmp[tmp.length - 1]);
		x.icon53url = x.icon53url.replace("512x512-75.", "");
		x.icon53url = x.icon53url.replace(".tiff", ".png");
		x.icon53url = x.icon53url.replace(".tif", ".png");

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
		if ('' + data.averageUserRatingForCurrentVersion == 'null') x.curverrating = '無し'; else x.curverrating =
		 data.averageUserRatingForCurrentVersion;
		x.curverstar = getStar(data.averageUserRatingForCurrentVersion);
		if (!data.userRatingCountForCurrentVersion) {
			x.curreviewcnt = '0件の評価';
		} else {
			x.curreviewcnt = fmtNumber( data.userRatingCountForCurrentVersion) + '件の評価';
		}
		x.curreviewcnt = x.curreviewcnt.replace('n,ull', '0');
		if ('' + data.averageUserRating == 'null') x.allverrating = '無し'; else x.allverrating = data.averageUserRating;
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
		return x;
	}

	// 親JSからGET形式でパラメータを引継ぐ為の関数
	function getJs(searchKey) {
		var scripts = document.getElementsByTagName("script"), urlArg, params = {};
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
		var s = '' + x, p = s.indexOf('.');
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

	// PHGアフィリエイトリンクまたはLinkShareリンク生成
	function linkShareUrl(url, id) {
		if (phg != "") {
			var affId = '&at=' + id;
			var appUrl = url + affId;
			return appUrl;
		} else
		var main = 'http://click.linksynergy.com/fs-bin/stat?';
		var fixParam = '&offerid=94348&type=3&subid=0&tmpid=2192&RD_PARM1=';
		var partnerId = '&partnerId=30'
		var appUrl = encodeURIComponent(encodeURIComponent(url + partnerId));
		return main + 'id=' + id + fixParam + appUrl;
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
