/** 利用[https://vocadb.net/ VocaDB]的数据，生成moegirl上的模板。
  * 采用JSONP获取数据。
  * 代码堆放至github：https://github.com/VOCALOID-lower/Wiki-JS/blob/main/src/VocaDB-VOCALOID.js
  * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
  * 
  * 加载该脚本后，请在页面[[Special:VocaDB]]进行操作。
  * 注意一天内不要使用太多次“获取P主歌曲列表”，容易超过VocaDB API请求上限。
  * 
  * ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  */
"use strict";

const action = () => {
	let ps_1 = '<span><del>若获取有误，建议自行到VocaDB修改</del></span>';
	let ps_2 = '<span>补充：该获取最多获取500首，且只包含niconico的投稿，其余手动补充。</span>';

	document.getElementsByTagName("style")[0].append(`
	div.getbuttom{
		background-color: #5fa7f3;
		width: 140px;
		line-height: 38px;
		text-align: center;
		font-weight: bold;
		color: #fff;
		text-shadow:1px 1px 1px #333;
		border-radius: 5px;
		margin:0 20px 20px 0;
		position: relative;
		overflow: hidden;
	}
	input.getid{
		border-color: #000;
		font-size: 12px;
		height:30px;
		border-radius:4px;
		border:1px solid #c8cccf;
		color:#986655;
		outline:0;
		text-align:left;
		padding-left: 10px;
		display: block;
		cursor: pointer;
		box-shadow: 2px 2px 5px 1px #ccc;
	}`);

	$('#bodyContent').html(`${ps_1}
	<hr>
	<div id="change" style="
	overflow: scroll;
	user-modify: read-write;
	-webkit-user-modify: read-write;
	-moz-user-modify: read-write;
	max-height: 500px;
	">生成于此处</div>
	<hr>
	<!-- 
	
	-->
	<h2>获取歌曲</h2>
	<form id="templeform_song" class="getid">
		<input class="getid" type="number" name="vocaid" placeholder="vocadb歌曲页面ID">
	</form>
	<br>
	<div id="song" class="getbuttom">获得请求</div>
	<br>
	<!-- 
	
	-->
	<h2>获取P主歌曲列表</h2>
	${ps_2}
	<form id="templeform_ar" class="getid">
		<input class="getid" type="number" name="arid" placeholder="vocadbP主页面ID">
	</form>
	<br>
	<div id="ar" class="getbuttom">获得请求</div>`);

	if (mw.config.get("skin") === "minerva") {
		$('h1#section_0').text('Special:VocaDB');
	} else {
		document.getElementsByTagName("h1")[0].textContent = "Special:VocaDB";
	}
	document.title = 'Special:VocaDB';
}

const change = () => {
	document.getElementById('change').innerHTML = 'loading...';
}

//action
const ja = /[\u2E80-\u2FDF\u3040-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7FF]/i;

const IsInIt = (a, b, c) => {
	if (b.search(ja) != -1) {
		b = `{{lj|${b}}}`;
	}
	if (a.indexOf(b) == -1) {
		var d = a + b + c;
	} else {
		var d = a;
	}
	return d
}

const getting_A_ = async (data, pageid) => {
	let br = '<br>';
	let Lyricist = '';
	let Composer = '';
	let Illustrator = '';
	let Animator = '';
	let Vocalist = '';

	data.artists.map(this_artists => {
		let artistsname = this_artists.name || '';
		let categories_split = this_artists.categories.split(', ');
		let effectiveRoles_split = this_artists.effectiveRoles.split(', ');

		for (let j = 0; j < effectiveRoles_split.length || j < categories_split.length; j++) {
			switch (effectiveRoles_split[j]) {
				case 'Producer':
					Lyricist = IsInIt(Lyricist, artistsname, br);
					Composer = IsInIt(Composer, artistsname, br);
					break;
				case 'Lyricist':
					Lyricist = IsInIt(Lyricist, artistsname, br);
					break;
				case 'Composer':
					Composer = IsInIt(Composer, artistsname, br);
					break;
				case 'Vocalist':
					Vocalist = IsInIt(Vocalist, artistsname, br);
					break;
				case 'Animator':
					Animator = IsInIt(Animator, artistsname, br);
					break;
				case 'Illustrator':
					Illustrator = IsInIt(Illustrator, artistsname, br);
					break;
				default:
					break;
			}

			switch (categories_split[j]) {
				case 'Lyricist':
					Lyricist = IsInIt(Lyricist, artistsname, br);
					break;
				case 'Composer':
					Composer = IsInIt(Composer, artistsname, br);
					break;
				case 'Vocalist':
					Vocalist = IsInIt(Vocalist, artistsname, br);
					break;
				case 'Animator':
					Animator = IsInIt(Animator, artistsname, br);
					break;
				case 'Illustrator':
					Illustrator = IsInIt(Illustrator, artistsname, br);
					break;
				default:
					break;
			}

		}
	})
	if (Composer == '' || Lyricist == '') {
		for (let i = 0; i < data.artists.length; i++) {
			if (data.artists[i].categories.indexOf('Producer') != -1) {
				Composer = IsInIt(Composer, data.artists[i].name, br);
				Lyricist = IsInIt(Lyricist, data.artists[i].name, br);
				break;
			}
		}
	}
	let x_a =
		'|作曲     = ' + Composer.substring(0, Composer.length - 4) + '\n' +
		'|填词     = ' + Lyricist.substring(0, Lyricist.length - 4) + '\n' +
		'|视频制作 = ' + Animator.substring(0, Animator.length - 4) + '\n' +
		'|画师     = ' + Illustrator.substring(0, Illustrator.length - 4) + '\n' +
		'|演唱者   = ' + Vocalist.substring(0, Vocalist.length - 4).replace(/<br>/g, '、') + '\n';
	return getting_B(x_a, pageid);
}

const getting_B_ = async (x_a, data) => {
	let YouTube = '';
	let NicoNico = '';
	let Bilibili = '';
	let thumbUrl = '';
	let publishtime = '';

	if (data.pvServices.indexOf('NicoNicoDouga') != -1) {
		for (let i = 0; i < data.pvs.length; i++) {
			if (data.pvs[i].service == 'NicoNicoDouga' && data.pvs[i].pvType == 'Original') {
				NicoNico = data.pvs[i].url.replace(/.+watch\//i, '');
				thumbUrl = data.pvs[i].thumbUrl;
				publishtime = data.pvs[i].publishDate;

				if (data.pvs[i].url.replace(/.+watch\/sm/i, '') > 23648995) {
					thumbUrl += '.M';
				}
				break;

			}
		}
	}
	if (data.pvServices.indexOf('Youtube') != -1) {
		for (let i = 0; i < data.pvs.length; i++) {
			if (data.pvs[i].service == 'Youtube' && data.pvs[i].pvType == 'Original') {
				YouTube = data.pvs[i].url.replace(/.+youtu\.be\//i, '');
				break;

			}
		}
	}
	if (data.pvServices.indexOf('Bilibili') != -1) {
		for (let i = 0; i < data.pvs.length; i++) {
			if (data.pvs[i].service == 'Bilibili' && data.pvs[i].pvType == 'Original') {
				Bilibili = data.pvs[i].url.replace(/.+video\//i, '');
				break;
			}
		}
	}
	if (!(publishtime)) {
		publishtime = data.pvs[0].publishDate;
	}

	var x_b =
		'|nnd_id   = ' + NicoNico + '\n' +
		'|yt_id    = ' + YouTube + '\n' +
		'|bb_id    = ' + Bilibili + '\n';
	var x_c =
		'|image    = ' + thumbUrl + '\n';
	var x_d =
		'|投稿日期 = ' + (publishtime || '').replace(/(\d{4})-(\d{2})-(\d{2}).+/i, '$1年$2月$3日') + '\n';
	if (data.name.search(ja) != -1) {
		var x_e =
			'|标题     = ' + `{{lj|${data.name}}}` + '\n';
	} else {
		var x_e =
			'|标题     = ' + data.name + '\n';
	}
	let y =
		'{{Producer_Song' + '\n' +
		x_b +
		x_a +
		'|歌曲描述 = ' + '\n' +
		x_d +
		'|条目     = ' + '\n' +
		x_e +
		x_c + '}}' + '\n\n';

	console.log('finish');
	return y;
}

const getting_C_ = async (data) => {
	//step1
	/* 
	let return_data = await data["items"].map((a, b) => {
		return getting_A(data["items"][b]["id"])
	})
	*/
	let return_data = [];
	for (let b in data["items"]) {
		if (data["items"][b]["songType"] !== 'Original') break;
		return_data.push(await getting_A(data["items"][b]["id"]));
	}

	return return_data;
}

const getting_A = async (pageid) => {
	//step1
	let return_data = await $.getJSON(`https://vocadb.net/api/songs/${pageid}?fields=Artists`);

	return getting_A_(return_data, pageid);
}

const getting_B = async (x_a, pageid) => {
	//step2
	let return_data = await $.getJSON(`https://vocadb.net/api/songs/${pageid}?fields=PVs`);

	return getting_B_(x_a, return_data);
}

const getting_C = async (arid) => {
	let return_data = await $.getJSON(`https://vocadb.net/api/songs?artistId%5B%5D=${arid}&artistParticipationStatus=OnlyMainAlbums&pvServices=NicoNicoDouga&maxResults=500`);
	/* 
	let return_data = await $.getJSON("https://vocadb.net/api/songs", {
		params: {
			"artistId[]": arid,
			"artistParticipationStatus": "OnlyMainAlbums",
			"maxResults": 500,
			"pvServices": "NicoNicoDouga",
		}
	});
	*/

	return getting_C_(return_data);
}

$(() => {
	$('#song').click(() => { //防WAF
		star_song();
	});
	$('#ar').click(() => { //防WAF
		star_ar();
	});
});

const star_song = async () => {
	change();

	var fms = document.getElementById('templeform_song');
	let a = await getting_A(fms.elements.vocaid.value);
	document.getElementById('change').innerHTML = `<pre>${a}</pre>`;

}

const star_ar = async () => {
	change();

	var fma = document.getElementById('templeform_ar');
	let c = await getting_C(fma.elements.arid.value);

	let _c = c.sort((a, b) => {
		let __re = /\d{4}年\d{2}月\d{2}日/ig, _re = /[年月日]/ig;
		let _a = (a.match(__re) || ['9999年99月99日'])[0].replace(_re, "");
		let _b = (b.match(__re) || ['9999年99月99日'])[0].replace(_re, "");

		if (_a < _b) return -1;
		else if (_a > _b) return 1;
		return 0;
	}).join("");

	document.getElementById('change').innerHTML = `<pre>${_c}</pre>`;
}

if (mw.config.get('wgPageName').toLowerCase() === "special:vocadb") action()
