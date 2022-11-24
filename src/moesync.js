/**
 * -------------------------------------------------------------------------
 * 开发者：User:实验性：无用论废人 OOUI实现：User:屠麟傲血
 * -------------------------------------------------------------------------
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
$(function () {
    /*函数执行体*/
    if (mw.config.get("wgAction") === 'edit' || mw.config.get("wgIsArticle")) {
        mw.util.addPortletLink("p-cactions", "javascript:;", "同步主站", "ca-sync", "同步主站同名" + wgULS("页面", "頁面"));
        $('#ca-sync').click(function () {
            mw.notify(wgULS("请求中...", "請求中..."));
            // ------------------
            $('#moe-background').remove();
            moesync_body();
            moesync_jsonp();
        });
    }
    /*預備變量*/
    var moe_data = "";
    var api = new mw.Api();
    //点名批评 mediawiki.ForeignApi 不能直接用！
    var zhmoeapi = new mw.ForeignApi("https://zh.moegirl.org.cn/api.php", { anonymous: true });
    var neterr = wgULS('网络连接出错', "網路連接出錯", null, null, "網絡連接出錯");
    // 预备函数(请求)
    function moesync_jsonp() {
    	zhmoeapi.get({
            action:"parse",
            format:"json",
            page: mw.config.get("wgPageName"),
            prop:"wikitext"
        }).then(function (result) {
            moe_data = result.parse.wikitext['*'];
            moesync_compare();
        },function (e) {
            moesync_dont();
            if (e=="missingtitle") {
            	mw.notify('主站' + wgULS('无对应页面', "無對應頁面"), { type: "warn" });
            }else {
            	mw.notify(neterr, { type: "error" });
            }
        });
    }
    function moesync_compare() {
        api.post({
            'action': 'compare',
            'format': 'json',
            'fromtitle': mw.config.get("wgPageName"),
            'toslots': 'main',
            'totext-main': moe_data,
            'prop': 'diff|size'
        }).then(function (data) {
           if (data.compare['*']) {
                $('#moesync-diff').append(data.compare['*']);
                mw.notify(wgULS("请求", "請求") + '完成', { type: "success" });
            } else {
                moesync_dont();
                mw.notify('主站' + wgULS('与镜像站内容一致', "與鏡像站內容一致"), { type: "warn" });
            }
        },function (e) {
            if (e=="missingtitle") {
            	moesync_compare_create();
            }else {
                moesync_dont();
                mw.notify(neterr, { type: "error" });
            }
        });
    }
    function moesync_compare_create() {
        api.post({
            'action': 'compare',
            'format': 'json',
            'fromslots': 'main',
            'fromtext-main': '',
            'toslots': 'main',
            'totext-main': moe_data,
            'prop': 'diff|size'
        }).then(function (data) {
            $('#moesync-diff').append(data.compare['*']);
            mw.notify(wgULS("请求", "請求") + '完成', { type: "success" });
        },function (e) {
            moesync_dont();
            mw.notify(neterr, { type: "error" });
        });
    }
    function moesync_edit(summary, watchpage, minoredit) {
        var params = {
            action: 'edit',
            format: 'json',
            title: mw.config.get('wgPageName'),
            text: moe_data,
            summary: summary,
            tags: 'Automation tool',
            watchlist: watchpage,
            };
        if (minoredit) {
            params.minor = true;
        } else {
            params.notminor = true;
        }
        api.postWithToken('csrf', params).done(function (data) {
            mw.notify(wgULS("即将刷新……", "即將刷新……"), {
                title: "提交完成",
                type: "success",
                tag: "moesync"
            });
            $('#moe-background').hide(200);
            setTimeout(location.reload(), 1000);
        });
    }
    // 报错时关闭提交按钮
    function moesync_dont() {
    	$("#moe-background .oo-ui-processDialog-actions-primary").remove();
        $("#diff-summary input").attr("disabled", "disabled");
        $("#watchlist input").attr("disabled", "disabled");
        $("#minor input").attr("disabled", "disabled");
        $('.oo-ui-fieldLayout').css("color","#72777d");
    }
    // 预备函数(DOM构造)
    var syncDialog = /** @class */ (function (_super) {
        __extends(syncDialog, _super);
        function syncDialog(config) {
            // Parent constructor
            return _super.call(this, config) || this;
        }
        syncDialog.prototype.initialize = function () {
            // Parent method
            _super.prototype.initialize.call(this);
            this.panelLayout = new OO.ui.PanelLayout({
                scrollable: false,
                expanded: false,
                padded: true
            });
            this.summaryBox = new OO.ui.TextInputWidget({
                value: "// 同步萌百" + wgULS("页面", "頁面"),
            });
            var summaryField = new OO.ui.FieldLayout(this.summaryBox, {
                label: wgULS("编辑摘要", "編輯摘要"),
                align: "top",
                id: "diff-summary",
            });
            this.watchlistBox = new OO.ui.CheckboxInputWidget({
                selected: true,
            });
            var watchlistField = new OO.ui.FieldLayout(this.watchlistBox, {
                label: wgULS("监视本页", "監視此頁面"),
                align: "inline",
                id: "watchlist",
            });
            this.minorBox = new OO.ui.CheckboxInputWidget({
                selected:false,
            });
            var minorField = new OO.ui.FieldLayout(this.minorBox, {
                label: wgULS("小编辑", "小編輯"),
                align: "inline",
                id: "minor",
            });
            this.panelLayout.$element.append(summaryField.$element, watchlistField.$element, minorField.$element); //按钮合成
            this.content = new OO.ui.BookletLayout({ padded: true, expanded: false, id: "moe-diff-div" });
            this.content.$element.append('<table class="diff moe-diff">' +
                '<colgroup>' +
                '<col class="diff-marker">' +
                '<col class="diff-content">' +
                '<col class="diff-marker">' +
                '<col class="diff-content">' +
                '</colgroup>' +
                '<tbody id="moesync-diff">' +
                '<tr>' +
                '<td colspan="2" class="diff-lineno" id="mw-diff-left-l1">' +
                wgULS("镜像站（编辑前内容）：", "鏡像站（編輯前內容）：") +
                '</td>' +
                '<td colspan="2" class="diff-lineno">' +
                '主站' + wgULS("（编辑后内容）：", "（編輯後內容）：") +
                '</td>' +
                '</tr> ' +
                '</tbody>' +
                '</table>');
            this.$body.append(this.content.$element, this.panelLayout.$element);
        };
        syncDialog.prototype.getActionProcess = function (action) {
            var _this = this,trcount = $("tbody#moesync-diff > tr").eq(1).length;
            if (action === "cancel") {
                return new OO.ui.Process(function () {
                    _this.close({ action: action });
                }, this);
            }else if (trcount == 0 && action === "submit") {
                return new OO.ui.Process(function () {
                	mw.notify(wgULS("API未加载完成，请您坐和放宽", "API未加載完成，請您坐和放寬"), {
                		type: "error",
                		title: wgULS("镜像站提醒您", "鏡像站提醒您"),
                		tag: "unloaded"
                	});
                }, this);
            }else if (action === "submit" && trcount == 1) {
                return new OO.ui.Process(function () {
                    var summary = _this.summaryBox.getValue();
                    var watchpage = _this.watchlistBox.isSelected() ? "watch" : "nochange";
                    var minoredit = _this.minorBox.isSelected();
                    moesync_edit(summary, watchpage, minoredit);
                }, this);
            }
            // Fallback to parent handler
            return _super.prototype.getActionProcess.call(this, action);
        };
        syncDialog.prototype.getBodyHeight = function () {
            return Math.round($(window).height() * 0.9);
        };
        syncDialog.static = __assign(__assign({}, _super.static), { name: "moesync", title:"同步萌百同名"+wgULS("页面","頁面"), actions: [
                {
                    action: "cancel",
                    label: "取消",
                    flags: ["safe", "close", "destructive"],
                },
                {
                    action: "submit",
                    label: wgULS("提交编辑", "提交編輯"),
                    flags: ["primary", "progressive"],
                },
            ] });
        return syncDialog;
    }(OO.ui.ProcessDialog));
    function moesync_body() {
        var diffWindow = new syncDialog({
            id: "moe-background",
            size: 'larger'
        });
        // Create and append a window manager, which opens and closes the window.
        var windowManager = new OO.ui.WindowManager();
        $("body").append(windowManager.$element);
        windowManager.addWindows([diffWindow]);
        // Open the window!
        setTimeout(windowManager.openWindow(diffWindow),200);
    }
});
