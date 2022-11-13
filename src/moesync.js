/**
  * 添加此脚本后，会在右上角“更多”一览众出现“同步主站”的小工具。
  * 第一次点击该工具为与主站的同名条目差异对比。
  * 对比成功会在页底出现提交的按钮，提交后可以手动同步条目（将主站内容同步至镜像站）。
  * 代码堆放至github：https://github.com/VOCALOID-lower/Wiki-JS/blob/main/src/moesync.js
  * 
  */
"use strict";

$(function () {
	// body
	if (mw.config.get("wgIsArticle") && mw.config.get("skin") == 'vector') {
		var ca_sync = '<li id="ca-sync" class="mw-list-item">' +
			'<a href="javascript:;">' +
			'<span>' +
			'同步主站' +
			'</span>' +
			'</a>' +
			'</li>';
		$('nav#p-cactions ul.vector-menu-content-list').append(ca_sync);
		$('#ca-sync').click(function () {
			mw.notify('请求中...');
			// ------------------
			$('#moe-background').remove();
			moesync_body();
			$('#moe-background').show(200);
			// ------------------
			moesync_jsonp();
		});
	}

	// 预备变量
	var moe_data = "";
	var api = new mw.Api();

	// 预备函数(请求)
	function moesync_jsonp() {
		$.ajax({
			url: 'https://zh.moegirl.org.cn/api.php?action=parse&format=json&page=' + mw.config.get("wgPageName") + '&prop=wikitext',
			type: 'get',
			dataType: 'jsonp',
			jsonpCallback: "_ajax_callback",
			data: {},
			success: function (data) {
				if (data.parse) {
					moe_data = data.parse.wikitext['*'];
					moesync_compare();
				} else {
					mw.notify('主站无对应页面');
				}
			},
			error: function () {
				mw.notify('网络连接出错');
			}
		});
	}

	function moesync_compare() {
		$.ajax({
			type: 'POST',
			url: '/api.php',
			data: {
				'action': 'compare',
				'format': 'json',
				'fromtitle': mw.config.get("wgPageName"),
				'toslots': 'main',
				'totext-main': moe_data,
				'prop': 'diff|size'
			},
			success: function (data) {
				if (data.compare) {
					if (data.compare['*']) {
						$('#moesync-diff').append(data.compare['*']);
						moesync_input();
						mw.notify('请求完成');
					} else {
						mw.notify('主站与镜像站内容一致');
					}
				} else if (data.error.code === "missingtitle") {
					moesync_compare_create();// 页面不存在情况
				}
			},
			error: function () {
				mw.notify('网络连接出错');
			}
		});
	}

	function moesync_compare_create() {
		$.ajax({
			type: 'POST',
			url: '/api.php',
			data: {
				'action': 'compare',
				'format': 'json',
				'fromslots': 'main',
				'fromtext-main': '',
				'toslots': 'main',
				'totext-main': moe_data,
				'prop': 'diff|size'
			},
			success: function (data) {
				$('#moesync-diff').append(data.compare['*']);
				moesync_input();
				mw.notify('请求完成');
			},
			error: function () {
				mw.notify('网络连接出错');
			}
		});
	}

	function moesync_edit(summary) {
		api.postWithToken('csrf', {
			action: 'edit',
			format: 'json',
			title: mw.config.get('wgPageName'),
			text: moe_data,
			summary: summary + '// 同步萌百页面工具',
			tags: 'Automation tool'
		}).done(function (data) {
			document.getElementById("diff-input").value = "提交完成！";
		});
	}

	// 预备函数(DOM构造)
	function moesync_input() {
		var input = '<div class="meo-diff-input" style="padding-bottom: 80px;">' +
			'<span class="meo-diff-submit" style="left: 24px;position: fixed;padding-top: 23px;margin-right: 8px;display: inline-block;line-height: normal;vertical-align: middle;">' +
			'<input id="diff-input" type="submit" value="提交编辑" class="" style="line-height: 1.42857143em;background-color: #f8f9fa;color: #202122;padding: 5px 12px;border: 1px solid #a2a9b1;border-radius: 2px;font-weight: bold;text-decoration: none;font-family: inherit;font-size: inherit;">' +
			'</span>' +
			'<span class="meo-diff-summary" style="width: 580px;left: 156px;position: fixed;padding-top: 23px;">' +
			'<input id="diff-summary" type="text" placeholder="编辑摘要" style="background-color: #fff;color: #000;border: 1px solid #a2a9b1;border-radius: 2px;padding: 5px 8px;font-size: inherit;font-family: inherit;line-height: 1.42857143em;width: 100%;">' +
			'</span>' +
			'</div>';

		$('#moe-diff-div').after(input);
		moesync_click();
	}


	function moesync_click() {
		var input = document.getElementById("diff-input");
		input.onclick = function () {
			document.getElementById("diff-input").value = "提交中...";
			let summary = document.getElementById("diff-summary").value;
			moesync_edit(summary);
		};
	}

	function moesync_body() {
		$('body').append('<div id="moe-background" style="position: fixed;top: 70px;left: 10%;z-index: 100;width: 80%;height: 622px;background-color: rgb(255 255 255 / 95%);border: solid 2px #b79a48;backdrop-filter: blur(2px);border-radius: 19px;overflow-y: scroll;">' +
			'<div id="moe-diff-div" class="moe-diff" style="display:block">' +
			'<table class="diff moe-diff">' +
			'<colgroup>' +
			'<col class="diff-marker">' +
			'<col class="diff-content">' +
			'<col class="diff-marker">' +
			'<col class="diff-content">' +
			'</colgroup>' +
			'<tbody id="moesync-diff">' +
			'<tr>' +
			'<td colspan="2" class="diff-lineno" id="mw-diff-left-l1">' +
			'镜像站（编辑前内容）：' +
			'</td>' +
			'<td colspan="2" class="diff-lineno">' +
			'主站（编辑后内容）：' +
			'</td>' +
			'</tr> ' +
			'</tbody>' +
			'</table>' +
			'</div>' +
			'<div id="hidemoe" style="box-sizing:content-box;z-index: 100;position:fixed;top: 2px;right: 1%;" title="隐藏界面">' +
			'<span style="font-size:150%">' +
			'×' +
			'</span>' +
			'</div>' +
			'</div>');

		$('#moe-background').hide();

		// 关闭函数
		$("#hidemoe").click(function () {
			$('#moe-background').hide(200);
		});
	}

});
