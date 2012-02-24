(function() {
    var delayTimer = null;
    var data;
    var portalURL = "http://portal.opera.com/portal/tabs/?tab_name=Opera%20Portal";
    var cell = opera.contexts.speeddial;
        cell.url = "http://portal.opera.com/portal/tabs/?tab_name=Opera%20Portal";

    function getSources() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', widget.preferences.baseURI + "?boxes=100&per_box=3", true);
        xhr.onreadystatechange = function(event) {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    data = JSON.parse(xhr.responseText);
                    refresh();
                }
                else if(!widget.preferences.sources) {
                    document.getElementById('content').innerHTML = 
                        "<h2>Error. Will reattempt in 5 minutes.</h2>";
                }
            }
        }
        xhr.send();
    }

    function swap() {
        var focused = document.getElementsByClassName('focused')[0];
        focused.className = '';
        if(focused.nextSibling) {
            focused = focused.nextSibling;
        }
        else {
            focused = focused.parentNode.firstChild;
        }
        focused.className = 'focused';
        var url = document.getElementsByClassName('focused')[0].dataset['url'];
        cell.title = focused.title;
        cell.url = portalURL + "&ext_url=" + encodeURIComponent(url); 
    }

    function setRefreshTimer() {
        clearInterval(delayTimer);
        delayTimer = setInterval(swap, parseInt(widget.preferences.delay) * 1000);
    }

    function refresh() {
        var sources = {};
        if(!widget.preferences.sources) {
            sources[data[0].box_title] = 3;
        }
        else {
            JSON.parse(widget.preferences.sources).forEach(function(source) {
                sources[source.name] = source.count;
            });
        }

        var posts = data.filter(function(post) {
            if(sources[post.box_title]) {
                sources[post.box_title]--;
                return true;
            }
            return false;
        });

        if(posts.length == 0) {
            posts = data.slice(0,2);
        }
           
        var div = document.createElement('div');
        for(var i=0, post; post = posts[i]; i++) {
            var image = post.post_image ? 
                '<figure><img src="' + post.post_image + '"></figure>' : '';

            post.post_title = hyphenate(post.post_title);
                        
            if(post.box_type == "feed") {
                var article = document.createElement('article');
                article.dataset.url = post.url;
                article.title = post.box_title;
                article.innerHTML = image;
                var h2 = document.createElement('h2');
                h2.innerHTML = post.post_title;
                article.appendChild(h2);
                var p = document.createElement('p');
                p.textContent = post.post_content;
                article.appendChild(p);
                div.appendChild(article);
            } else if(post.box_type == "sports") {
                var status = (post.status == "Played") ? 
                    " (FINAL)" : 
                    (" (" + post.datetime + ")");
                var article = document.createElement('article');
                article.innerHTML = image;
                var h2 = document.createElement('h2');
                h2.textContent = post.competition_name;
                article.appendChild(h2);
                var p = document.createElement('p');
                p.textContent = post.team_B_name + ' @ ' + post.team_A_name;
                var p2 = document.createElement('p');
                p2.textContent = post.fs_B + '-' + post.fs_A + status;
                article.appendChild(p);
                article.appendChild(p2);
                div.appendChild(article);
            }
        }
        
        var content = document.getElementById('content');
        div.firstChild.className = 'focused';
        div.id = 'content';
        content.parentNode.replaceChild(div, content);
        cell.title = posts[0].box_title;
        cell.url = portalURL + "&ext_url=" + encodeURIComponent(posts[0].url); 
    }

    function reconfigure(ev) {
        if (ev.storageArea != widget.preferences) return;
        switch(ev.key) {
            case 'delay':  setRefreshTimer(); break;
            case 'sources': getSources(); break;
        }
    }

    function hyphenate(text) {
        var arr = text.split(' ');
        for(var i = 0; i < arr.length; i++) {
            arr[i] = en.hyphenate(arr[i]).join('&shy;');
        }
        return arr.join(' ');
    }

    function init() {
        setRefreshTimer();
        window.addEventListener('storage', reconfigure, false);
        setInterval(getSources, 300000);
        getSources();
    }

    document.addEventListener('DOMContentLoaded', init, false);
}())
