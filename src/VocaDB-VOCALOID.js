/** 
  * 利用[https://vocadb.net/ VocaDB]的数据，生成moegirl上的模板。
  * 采用JSONP获取数据。
  * 代码堆放至github：https://github.com/VOCALOID-lower/Wiki-JS/blob/main/src/VocaDB-VOCALOID.js
  * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
  * 
  * 加载该脚本后，请在页面[[Special:VocaDB]]进行操作。
  * 注意一天内不要使用太多次“获取P主歌曲列表”，容易超过VocaDB API请求上限。
  * 由于正则包含负向预查，可能不支持Safari等浏览器。
  * 
  * ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  * 
  */
"use strict";

$(function () {
	const action = () => {
		let ps_1 = '<p><del>若获取有误，建议自行到VocaDB修改</del></p>';
		let ps_2 = '<p>补充：该获取最多获取500首，且只包含niconico的投稿，其余手动补充；</p><p>排除了recover等作品，但在VocaDB大部分专辑曲重新投稿是算recover的，记得检查。</p>';

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
			<input class="getid" type="number" name="sid" placeholder="vocadb歌曲页面ID">
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
		<div id="ar" class="getbuttom">获得请求</div>
		<!-- 
		
		-->
		<h2>获取专辑曲目列表</h2>
		<form id="templeform_album" class="getid">
			<input class="getid" type="number" name="alid" placeholder="vocadb专辑页面ID">
		</form>
		<br>
		<div id="album" class="getbuttom">获得请求</div>
		<br>`);

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
	//预备函数
	const api = new mw.Api();

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

	const _IsInIt = (a, b, c) => {
		if (a.indexOf(b) == -1) {
			var d = a + b + c;
		} else {
			var d = a;
		}
		return d
	}

	const second_change = time => {
		let m = parseInt(time / 60)
		let s = parseInt(time % 60)
		s = s < 10 ? '0' + s : s
		return `${m}:${s}`
	}

	const lj = (name, links) => {
		//内链
		if (links) {
			if (links.indexOf('NicoNicoDouga') != -1) {
				name = `[[${name}]]`;
			}
		}
		//语言
		if (name) {
			if (name.search(ja) != -1) {
				name = `{{lj|${name}}}`;
			}
			return name
		} else if (name == undefined) {
			name = '';
			return name
		} else {
			return name
		}
	}

	const isAllEqual = array => {
		return !array.some(value => {
			return value !== array[0];
		});
	}

	const tran = async (template) => {
		let obj = {};
		let params = {
			'format': 'json',
			'action': 'expandtemplates',
			'text': `{{:Template:${template}}}`,
		}

		try {
			var response = await api.postWithToken('csrf', params) || '';
		} catch (err) { // 防止502
			return tran(template);
		}

		if (response) {
			let data = response;
			(data['expandtemplates']['*']).replace(/\[\[(.+?)(\|(.+?))?\]\]/ig, (a, b, c, d) => {
				obj[d ? d.replace(/^(<(?<a>.+?)( .+)?>)?(.+?)(<\/(\k<a>)>)?$/ig, "$4").replace(/^(-\{)?(.+?)(\}-)?$/ig/* JS没有平衡组只能出此下策 */, "$2") : b] = b;
			})
			return obj;
		} else { // 防止502
			return tran(template);
		}

	};

	//star
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

		let x_b =
			'|nnd_id   = ' + NicoNico + '\n' +
			'|yt_id    = ' + YouTube + '\n' +
			'|bb_id    = ' + Bilibili + '\n';
		let x_c =
			'|image    = ' + thumbUrl + '\n';
		let x_d =
			'|投稿日期 = ' + (publishtime || '').replace(/(\d{4})-(\d{2})-(\d{2}).+/i, '$1年$2月$3日') + '\n';
		if (data.name.search(ja) != -1) {
			var x_e =
				'|标题     = ' + `{{lj|${data.name}}}` + '\n';
		} else {
			var x_e =
				'|标题     = ' + data.name + '\n';
		}

		let ararr = [];
		for (let i of data.artistString.replace(/^(.+?)( feat.+)?$/, "$1").split(', ')) {
			ararr.push(await tran(i))
		}

		let tran_table = ararr.reduce((a, b) => Object.assign(a, b), {})

		let x_f = tran_table[data.name] || '';

		let y =
			'{{Producer_Song' + '\n' +
			x_b +
			x_a.replaceAll('<br>', '&lt;br&gt;') +
			'|歌曲描述 = ' + '\n' +
			x_d +
			'|条目     = ' + x_f + '\n' +
			x_e +
			x_c + '}}' + '\n\n';

		console.log('finish');
		return y;
	}

	const getting_C_ = async (data) => {
		//step1
		let return_data = [];
		for (let b in data["items"]) {
			if (data["items"][b]["songType"] !== 'Original') break;
			return_data.push(await getting_A(data["items"][b]["id"]));
		}

		return return_data;
	}

	const getting_D_ = async (data) => {
		let tracklist = '';
		//let artistString = '';
		let a = 1;
		let b = 0;
		let br = '、';
		data.map(this_data => {
			let singer = '';
			let music = '';
			let lyrics = '';
			for (let j = 0; j < this_data.song.artists.length; j++) {
				let artistsname = this_data.song.artists[j].name || '';
				let categories_split = this_data.song.artists[j].categories.split(', ');
				let effectiveRoles_split = this_data.song.artists[j].effectiveRoles.split(', ');
				for (let k = 0; k < effectiveRoles_split.length || k < categories_split.length; k++) {
					switch (effectiveRoles_split[k]) {
						case 'Producer':
							lyrics = _IsInIt(lyrics, artistsname, br);
							music = _IsInIt(music, artistsname, br);
							break;
						case 'Lyricist':
							lyrics = _IsInIt(lyrics, artistsname, br);
							break;
						case 'Composer':
							music = _IsInIt(music, artistsname, br);
							break;
						case 'Vocalist':
							singer = _IsInIt(singer, `[[${artistsname}]]`, br);
							break;
						default:
							break;
					}

					switch (categories_split[k]) {
						case 'Lyricist':
							lyrics = _IsInIt(lyrics, artistsname, br);
							break;
						case 'Composer':
							music = _IsInIt(music, artistsname, br);
							break;
						case 'Vocalist':
							singer = _IsInIt(singer, `[[${artistsname}]]`, br);
							break;
						default:
							break;
					}
				}
				if (music == '' || lyrics == '') {
					for (let k = 0; k < this_data.song.artists.length; k++) {
						if (this_data.song.artists[k].categories.indexOf('Producer') != -1) {
							music = _IsInIt(music, this_data.song.artists[k].name, br);
							lyrics = _IsInIt(lyrics, this_data.song.artists[k].name, br);
							break;
						}
					}
				}
			}

			//去多余顿号
			singer = singer.substring(0, singer.length - 1);
			music = music.substring(0, music.length - 1);
			lyrics = lyrics.substring(0, lyrics.length - 1);

			music = lj(music);
			lyrics = lj(lyrics);
			singer = lj(singer);

			if (this_data.discNumber == b) {
				a++;
				tracklist = tracklist +
					`| title${a} = ` + lj(this_data.name, this_data.song.pvServices) + '\n' +
					`| singer${a} = ` + singer + '\n' +
					`| music${a} = ` + music + '\n' +
					`| lyrics${a} = ` + lyrics + '\n' +
					`| length${a} = ` + second_change(this_data.song.lengthSeconds) + '\n\n'
			} else {
				a = 1;
				b++;
				if (tracklist != '') {
					tracklist += '}}' + '\n' + '￥这是一个伪分割符￥';
				}
				tracklist = tracklist + '\n' +
					`==== Disc ${b} ====` + '\n\n' +
					'{{tracklist' + '\n' +
					'| headline = ' + 'Disc' + ' ' + b + '\n' +
					'| singer_credits = yes' + '\n' +
					'| music_credits = yes' + '\n' +
					'| lyrics_credits = yes' + '\n\n' +
					/*
					 * 便于查看
					 */
					`| title${a} = ` + lj(this_data.name, this_data.song.pvServices) + '\n' +
					`| singer${a} = ` + singer + '\n' +
					`| music${a} = ` + music + '\n' +
					`| lyrics${a} = ` + lyrics + '\n' +
					`| length${a} = ` + second_change(this_data.song.lengthSeconds) + '\n\n';
			}
		})
		tracklist += '}}' + '\n\n' + '{{-}}';

		// part 2
		let disc = tracklist.split('￥这是一个伪分割符￥');
		for (let i = 0; i < disc.length; i++) {
			let music = disc[i].match(/(?<=music\d+ ?= ?).+/ig);
			if (isAllEqual(music)) {
				disc[i] = disc[i].replace(/\n\| ?music\d+ ?= ?.+/ig, '');
				disc[i] = disc[i].replace(/(\| ?headline.+?\n)/ig, '$1| all_music =' + music[0] + '\n');
				disc[i] = disc[i].replace('music_credits = yes', 'music_credits = no')
			}
		}
		for (let i = 0; i < disc.length; i++) {
			let lyrics = disc[i].match(/(?<=lyrics\d+ ?= ?).+/ig);
			if (isAllEqual(lyrics)) {
				disc[i] = disc[i].replace(/\n\| ?lyrics\d+ ?= ?.+/ig, '');
				disc[i] = disc[i].replace(/(\| ?headline.+?\n)/ig, '$1| all_lyrics =' + lyrics[0] + '\n');
				disc[i] = disc[i].replace('lyrics_credits = yes', 'lyrics_credits = no')
			}
		}
		for (let i = 0; i < disc.length; i++) {
			let singer = disc[i].match(/(?<=singer\d+ ?= ?).+/ig);
			if (isAllEqual(singer)) {
				disc[i] = disc[i].replace(/\n\| ?singer\d+ ?= ?.+/ig, '');
				disc[i] = disc[i].replace(/(\| ?headline.+?\n)/ig, '$1| all_singer =' + singer[0] + '\n');
				disc[i] = disc[i].replace('singer_credits = yes', 'singer_credits = no')
			}
		}
		if (disc.length == 1) {
			disc[0] = disc[0].replace('==== Disc 1 ====' + '\n\n', '');
		}

		return disc.join('');
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

	const getting_D = async (alid) => {
		let return_data = await $.getJSON(`https://vocadb.net/api/albums/${alid}/tracks?fields=Artists`);

		return getting_D_(return_data);
	}

	//页面操作
	$(() => {
		$('#song').click(() => { //防WAF
			star_song();
		});
		$('#ar').click(() => { //防WAF
			star_ar();
		});
		$('#album').click(() => { //防WAF
			star_album();
		});
	});

	const star_song = async () => {
		change();

		var fms = document.getElementById('templeform_song');
		let a = await getting_A(fms.elements.sid.value);
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

	const star_album = async () => {
		change();

		var fml = document.getElementById('templeform_album');
		let d = await getting_D(fml.elements.alid.value);

		document.getElementById('change').innerHTML = `<pre>${d}</pre>`;
	}

	if (mw.config.get('wgPageName').toLowerCase() === "special:vocadb") action();

});
