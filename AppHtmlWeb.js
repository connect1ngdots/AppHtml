/*
 * ApphtmlWeb.js
 * @version 2.0
 * @author Toshiya NISHIO(http://www.toshiya240.com)
 */

////////////////////////////////////////////////////////////////////////////////
// 設定値の永続化

var storage = {
  set: function(key, obj) {
    this.remove(key);
    window.localStorage.setItem(key, JSON.stringify(obj));
  },
  get: function(key) {
    var val = window.localStorage.getItem(key);
    if (val == null || val == "undefined") {
      return "";
    } else {
      return JSON.parse(val);
    }
  },
  remove: function(key) {
    window.localStorage.removeItem(key);
  },
  clear: function() {
    window.localStorage.clear();
  }
};

function loadConfig() {
  var conf_aff = storage.get("apphtml_conf_aff");
  var conf_count = storage.get("apphtml_conf_count");
  if (conf_count == "") conf_count = 8;
  var conf_out = storage.get("apphtml_conf_out");
  if (conf_out == "") conf_out = "popup";
  var conf_iphone_scs = storage.get("apphtml_conf_iphone_scs");
  if (conf_iphone_scs == "") conf_iphone_scs = 288;
  var conf_iphone_ipd = storage.get("apphtml_conf_iphone_ipd");
  if (conf_iphone_ipd == "") conf_iphone_ipd = 1.5;
  var conf_ipad_scs = storage.get("apphtml_conf_ipad_scs");
  if (conf_ipad_scs == "") conf_ipad_scs = 432;
  var conf_ipad_ipd = storage.get("apphtml_conf_ipad_ipd");
  if (conf_ipad_ipd == "") conf_ipad_ipd = 0.67;
  var conf_mac_scs = storage.get("apphtml_conf_mac_scs");
  if (conf_mac_scs == "") conf_mac_scs = 480;

  $("#conf_aff").val(conf_aff);
  $("#conf_count").val(conf_count);
  $("#conf_out").find("option[value="+conf_out+"]").attr("selected", true);
  $("#conf_iphone_scs").val(conf_iphone_scs);
  $("#conf_iphone_ipd").val(conf_iphone_ipd);
  $("#conf_ipad_scs").val(conf_ipad_scs);
  $("#conf_ipad_ipd").val(conf_ipad_ipd);
  $("#conf_mac_scs").val(conf_mac_scs);
};

function reloadConfig() {
  loadConfig();
  conf_template = storage.get("apphtml_conf_template");
  if (conf_template == "") conf_template = preset();
}

function saveConfig() {
  storage.set("apphtml_conf_aff", $("#conf_aff").val());
  storage.set("apphtml_conf_count", $("#conf_count").val());
  storage.set("apphtml_conf_out", $("#conf_out option:selected").val());
  storage.set("apphtml_conf_iphone_scs", $("#conf_iphone_scs").val());
  storage.set("apphtml_conf_iphone_ipd", $("#conf_iphone_ipd").val());
  storage.set("apphtml_conf_ipad_scs", $("#conf_ipad_scs").val());
  storage.set("apphtml_conf_ipad_ipd", $("#conf_ipad_ipd").val());
  storage.set("apphtml_conf_mac_scs", $("#conf_mac_scs").val());
  storage.set("apphtml_conf_template", conf_template);
  setTemplateSelection();

  return true;
};

////////////////////////////////////////////////////////////////////////////////
// テンプレート定義

var conf_template = {};

function Template(name, content) {
  this.name = name;
  this.content = content;
}

function defaultTemplate() {
  return [
    new Template('小さいボタン', '${badgeS}'),
    new Template('大きいボタン', '${badgeL}'),
    new Template('テキストのみ', '${textonly}'),
    new Template('アイコン付き(小)', '<span class="appIcon"><img class="appIconImg" height="60" src="${icon60url}" style="float:left;margin: 0px 15px 15px 5px;"></span><span class="appName"><strong><a href="${url}" target="itunes_store">${name}</a></strong></span><br><span class="appCategory">カテゴリ: ${category}</span><br><span class="badgeS" style="display:inline-block; margin:6px">${badgeS}</span><br style="clear:both;">'),
    new Template('アイコン付き(大)', '<span class="appIcon"><img class="appIconImg" height="100" src="${icon100url}" style="float:left;margin: 0px 15px 15px 5px;"></span><span class="appName"><strong><a href="${url}" target="itunes_store">${name}</a></strong></span><br><span class="appCategory">カテゴリ: ${category}</span><br><span class="badgeL" style="display:inline-block; margin:4px">${badgeL}</span><br style="clear:both;">')
  ];
};

function preset() {
  return {
    'software': defaultTemplate(),
    'iPadSoftware': defaultTemplate(),
    'macSoftware': defaultTemplate(),
    'song': defaultTemplate(),
    'album': defaultTemplate(),
    'movie': defaultTemplate(),
    'ebook': defaultTemplate()
  };
};

var selectedTemplateIndex = undefined;

function saveTemplate() {
  var addmode = (selectedTemplateIndex == -1);

  var name = $("#template-editor-name").val();
  var content = $("#template-editor-content").val();
  if (!name || !content) {
    showError("名前と内容を入力してください。");
    return false;
  }
  var title = $("#template-list-title").text();
  var kind = entity[title];
  if (addmode) {
    conf_template[kind].push(new Template(name, content));
  } else {
    var selectedTemplate = conf_template[kind][selectedTemplateIndex];
    selectedTemplate.name = name;
    selectedTemplate.content = content;
  }

  var title = $("#template-list-title").text();
  showTemplateList(title, {transition:"slideup", reverse:true});

  return true;
}

function deleteTemplate() {
  // TODO: 確認ダイアログを表示した方がよいか？
  var title = $("#template-list-title").text();
  var kind = entity[title];
  conf_template[kind].splice(selectedTemplateIndex, 1);

  var title = $("#template-list-title").text();
  showTemplateList(title, {transition:"slideup", reverse:true});
}

function addTemplate() {
  showTemplateEditor(-1);
}

////////////////////////////////////////////////////////////////////////////////
// 画面共通

var entity = {
  'iPhone App': 'software',
  'iPad App':   'iPadSoftware',
  'Mac App':    'macSoftware',
  'Song':       'song',
  'Album':      'album',
  'Movie':      'movie',
  'Book':       'ebook',
};

////////////////////////////////////////////////////////////////////////////////
// 検索画面

function setKindSelection() {
  $kind = $("#kind");
  $kind.empty();
  for (var label in entity) {
    $kind.append($("<option>").text(label).val(entity[label]));
  }
  $("#kind option").eq(0).attr("selected", true);
}

function setTemplateSelection() {
  var $templateSelection = $("#template");
  $templateSelection.empty();
  var kind = $("#kind option:selected").val();
  var selectedTemplate = conf_template[kind];
  for (var i = 0; i < selectedTemplate.length; i++) {
    var text = selectedTemplate[i].name;
    var val = selectedTemplate[i].content;
    $templateSelection.append($("<option>").text(text).val(val));
  }
  $("#template option").eq(0).attr("selected", true);
};

$(document).on("change", "#kind", function() {
  setTemplateSelection();
  $("#template").selectmenu("refresh");
});

function search() {
  var kind = $("#kind option:selected").val();
  var fmt = $("#template option:selected").val();

  var d = document,
      e = d.createElement('script');
  var url = "apphtml.js";
  if (!url.match(/\?/)) url += '?t=' + (new Date()).getTime();
  e.out = $("#conf_out").val();
  e.cnt = $("#conf_count").val();
  e.knd = kind;
  e.phg = $("#conf_aff").val();
  e.scs = getScs(kind);
  e.ipd = getIpd(kind);
  e.fmt = encodeURIComponent(fmt);
  e.charset = 'utf-8';
  e.src = url;
  e.id = 'bmlt';
  d.body.appendChild(e);
};

function getScs(kind) {
  switch (kind) {
  case 'software':
    return $("#conf_iphone_scs").val();
  case 'iPadSoftware':
    return $("#conf_ipad_scs").val();
  case 'macSoftware':
    return $("#conf_mac_scs").val();
  }
}

function getIpd(kind) {
  switch (kind) {
  case 'software':
    return $("#conf_iphone_ipd").val();
  case 'iPadSoftware':
    return $("#conf_ipad_ipd").val();
  case 'macSoftware':
    return 0;
  }
}

////////////////////////////////////////////////////////////////////////////////
// 設定画面

function showTemplateList(title, option) {
  if (!option) {
    option = {};
    option.transition = 'slide';
  }
  $("#template-list-title").text(title);
  var $templateListView = $("#template-list-view");
  $templateListView.empty();
  var kind = entity[title];
  var selectedTemplate = conf_template[kind];
  for (var i = 0; i < selectedTemplate.length; i++) {
    var text = selectedTemplate[i].name;
    var val = selectedTemplate[i].content;
    var $li = $("<li>");
    $li.append($("<a>").text(text).attr(
          'href', 'javascript:showTemplateEditor("'+i+'");'));
    $templateListView.append($li);
  }
  $.mobile.changePage("#template-list", option);
  $templateListView.listview("refresh");
}

function showTemplateEditor(index) {
  var addmode = (index == -1);
  selectedTemplateIndex = index;

  var title = $("#template-list-title").text();
  $("#template-editor-title").text(title);

  var kind = entity[title];

  if (!addmode) {
    var selectedTemplate = conf_template[kind][index];

    $("#template-editor-name").val(selectedTemplate.name);
    $("#template-editor-content").val(selectedTemplate.content);
  }

  var $placeholderList = $("#placeholder-list");
  $placeholderList.empty();
  for (var i = 0; i < placeholderList.length; ++i) {
    var ph = placeholderList[i];
    if (kind in ph.avail) {
      var $li = $("<li>");
      $li.append(
          $("<a>").text(ph.name).attr(
            'href', 'javascript:insertPlaceholder("'+i+'");'));
      $placeholderList.append($li);
    }
  }

  if (addmode) {
    $("#template-editor-delete-btn-area").hide();
  } else {
    $("#template-editor-delete-btn-area").show();
  }
  $.mobile.changePage("#template-editor", {transition: "slideup"});
  $placeholderList.listview("refresh");
}

$(document).on("swipeleft", "#template-editor", function() {
  $("#template-editor-panel").panel("open");
});

////////////////////////////////////////////////////////////////////////////////
// 予約語入力支援

var allEntity = {
  software:"",
  iPadSoftware:"",
  macSoftware:"",
  song:"",
  album:"",
  movie:"",
  ebook:""
};

var appEntity = {
  software:"",
  iPadSoftware:"",
  macSoftware:"",
};

var iOSEntity = {
  software:"",
  iPadSoftware:"",
};

var appAndEbookEntity = {
  software:"",
  iPadSoftware:"",
  macSoftware:"",
  ebook:""
};

function Placeholder(name, kwd, avail) {
  this.name = name;
  this.kwd = kwd;
  this.avail = avail;
};

var placeholderList = [
new Placeholder('小さいボタン',              '${badgeS}',           allEntity),
new Placeholder('大きいボタン',              '${badgeL}',           allEntity),
new Placeholder('テキストのみ',              '${textonly}',         allEntity),
new Placeholder('名前',                      '${name}',             allEntity),
new Placeholder('ストアへのリンク',          '${url}',              allEntity),
new Placeholder('プレビューURL',             '${preview}',          {song:"", movie:""}),
new Placeholder('価格',                      '${price}',            allEntity),
new Placeholder('カテゴリ',                  '${category}',         allEntity),
new Placeholder('再生時間',                  '${playtime}',         {movie:""}),
new Placeholder('トラック数',                '${trackcnt}',         {song:"", album:""}),
new Placeholder('リリース日',                '${pubdate}',          allEntity),
new Placeholder('アイコン100',               '${icon100url}',       allEntity),
new Placeholder('アイコン60',                '${icon60url}',        allEntity),
new Placeholder('アーティスト名',            '${artist}',           allEntity),
new Placeholder('アーティストURL',           '${artisturl}',        allEntity),
new Placeholder('販売元',                    '${seller}',           appEntity),
new Placeholder('販売元サイトURL',           '${sellerurl}',        appEntity),
new Placeholder('コピーライト',              '${copyr}',            {album:""}),
new Placeholder('説明',                      '${desc}',             {software:"", iPadSoftware:"", macSoftware:"", movie:"", ebook:""}),
new Placeholder('What\'s New',               '${descnew}',          appEntity),
new Placeholder('短い説明',                  '${shortdesc}',        {movie:""}),
new Placeholder('バージョン',                '${version}',          appEntity),
new Placeholder('レーティング',              '${rating}',           appEntity),
new Placeholder('評価★',                    '${userrating}',       appAndEbookEntity),
new Placeholder('レビュー件数',              '${userratingcnt}',    appAndEbookEntity),
new Placeholder('評価★(現)',                '${curuserrating}',    appEntity),
new Placeholder('レビュー件数(現)',          '${curuserratingcnt}', appEntity),
new Placeholder('サイズ',                    '${appsize}',          appEntity),
new Placeholder('サポートデバイス',          '${moveos}',           iOSEntity),
new Placeholder('言語',                      '${lang}',             appEntity),
new Placeholder('GameCenter対応',            '${gamecenter}',       iOSEntity),
new Placeholder('ユニバーサル対応',          '${univ}',             iOSEntity),
new Placeholder('スクリーンショット1',       '${image1}',           appEntity),
new Placeholder('スクリーンショット2',       '${image2}',           appEntity),
new Placeholder('スクリーンショット3',       '${image3}',           appEntity),
new Placeholder('スクリーンショット4',       '${image4}',           appEntity),
new Placeholder('スクリーンショット5',       '${image5}',           appEntity),
new Placeholder('スクリーンショット(univ)1', '${univimage1}',       iOSEntity),
new Placeholder('スクリーンショット(univ)2', '${univimage2}',       iOSEntity),
new Placeholder('スクリーンショット(univ)3', '${univimage3}',       iOSEntity),
new Placeholder('スクリーンショット(univ)4', '${univimage4}',       iOSEntity),
new Placeholder('スクリーンショット(univ)5', '${univimage5}',       iOSEntity)
];

function insertPlaceholder(index) {
  var ph = placeholderList[index];
  var content = $("#template-editor-content").get(0);
  var orig = content.value;
  var pos = content.selectionStart;
  var npos = pos + ph.kwd.length;
  content.value = orig.substr(0, pos) + ph.kwd + orig.substr(pos);
  content.setSelectionRange(npos, npos);
  $("#template-editor-panel").panel("close");
  content.focus();
}

////////////////////////////////////////////////////////////////////////////////
// その他

function showError(msg) {
  $("#error_msg").text(msg);
  $dialog = $("<a href='#error_page' data-rel='dialog'></a>");
  $dialog.get(0).click();
  $dialog.remove();
}


////////////////////////////////////////////////////////////////////////////////
// 初期化

$(function() {
  loadConfig();
});

$(document).on("pagebeforecreate", "#main", function() {
  conf_template = storage.get("apphtml_conf_template");
  if (conf_template == "") conf_template = preset();

  setKindSelection();
  setTemplateSelection();
});

