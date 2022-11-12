/** 
  * 为移动端(mzh)添加萌皮(moeskin)的分类条；
  * 带有Hotcat（可能502加载不全），但没有样式。
  * 
  */
(async function () {
    if (mw.config.get('skin') !== 'minerva') {
        return;
    }
 
    document.getElementsByTagName("style")[0].append(`
    #catlinks {
        border: none;
        background-color: rgb(245 245 245);
        padding-left: 1rem;
        border-left: 4px solid rgb(142 212 149);
        border-radius: 0.2rem;
        text-align: left;
    }
 
    .catlinks {
        border: 1px solid #a2a9b1;
        background-color: #f8f9fa;
        padding: 5px;
        margin-top: 1em;
        clear: both;
    }
 
    .catlinks ul {
        display: inline;
        margin: 0;
        padding: 0;
        list-style: none;
        list-style-type: none;
        list-style-image: none;
    }
 
    .catlinks li:first-child {
        padding-left: 0.25em;
        border-left: 0;
    }
 
    .catlinks li {
        display: inline-block;
        line-height: 1.25em;
        border-left: 1px solid #a2a9b1;
        margin: 0.125em 0;
        padding: 0 0.5em;
        zoom: 1;
    }`);// 规避WAF
 
    const MWapi = new mw.Api();
    let params = {
        'action': 'parse',
        'format': 'json',
        'page': mw.config.get('wgPageName'),
        'prop': 'categorieshtml',
        'contentmodel': 'wikitext'
    }
 
    try {
        var data = await MWapi.post(params);
    } catch (err) {
        console.log(err);
    }
 
    let addText = data['parse']['categorieshtml']['*'];
    $('#content').append(addText);
 
    mw.loader.load('/index.php?title=MediaWiki:Gadget-HotCat.js&action=raw&ctype=text/javascript');
})();
