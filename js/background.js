(function() {
    var delayTimer = null;
    var data;
    var buffer = {};
    var portalURL = "http://portal.opera.com/portal/tabs/?utm_source=DesktopBrowser&utm_medium=Speeddial&utm_campaign=SDE&tab_name=Opera%20Portal";
    var cell = opera.contexts.speeddial;
        cell.url = "http://portal.opera.com/portal/tabs/?utm_source=DesktopBrowser&utm_medium=Speeddial&utm_campaign=SDE&tab_name=Opera%20Portal";
    var prefs = widget.preferences;

    function error() {
        opera.postError('ERROR: Something goes here');
    }

    function parseSources(callback, request) {
        var items = JSON.parse(request.responseText);
        callback(items);
    }

    function parseFeed(callback, request) {
        callback(JSON.parse(request.responseText));
    }

    function getFeed(feed, callback) {
        _XHR(prefs.baseURI + "boxes/" + feed.id + "?per_box=" + feed.count, parseFeed.bind(undefined, callback));
    }

    function getSources(callback) {
        _XHR(prefs.baseURI + "all_boxes", callback);
    }

    function _XHR(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function(event) {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    callback(xhr);
                }
                else {
                    error();
                }
            }
        }
        xhr.timeout = 10000;
        xhr.ontimeout = error;
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
        delayTimer = setInterval(swap, parseInt(prefs.delay) * 1000);
    }

    // Cache images to avoid image-caching bug in SDE-context
    function imageBuffer(src) {
        if(!src) {
            return document.createElement('span');
        }
        if(!buffer[src]) {
            var figure = document.createElement('figure');
            var img = document.createElement('img');
            img.src = src;
            figure.appendChild(img);
            buffer[src] = figure;
        }
        return buffer[src];
    }

    function setFirstSource(request) {
        var data = JSON.parse(request.responseText);
        var box = data.boxes[0];
        prefs.sources = JSON.stringify([{id: box.id, count: 3}]);
        getFeeds();
    }

    function getFeeds() {
        if(!prefs.sources) {
            return getSources(setFirstSource);
        }
        var sources = JSON.parse(prefs.sources);

        var data = [];
        sources.forEach(function(source) {
            getFeed(source, function(result) {
                data.push(result);
                if(data.length == sources.length) {
                    refreshFeeds(data);
                }
            });
        });
    }

    function refreshFeeds(feedData) {
        var posts = feedData.reduce(function(arr, feed) {
            return arr.concat(feed);
        }, []);
           
        var div = document.createElement('div');
        for(var i=0, post; post = posts[i]; i++) {
            var image = imageBuffer(post.post_image);

            post.post_title = hyphenate(post.post_title);
                        
            var article = document.createElement('article');
            article.dataset.url = post.url;
            article.title = post.box_title;
            article.appendChild(image);
            var h2 = document.createElement('h2');
            h2.innerHTML = post.post_title;
            article.appendChild(h2);
            var p = document.createElement('p');
            p.innerHTML = post.post_content;
            p.innerHTML = p.textContent;
            article.appendChild(p);
            div.appendChild(article);
        }
        
        var content = document.getElementById('content');
        div.firstChild.className = 'focused';
        div.id = 'content';
        content.parentNode.replaceChild(div, content);
        cell.title = posts[0].box_title;
        cell.url = portalURL + "&ext_url=" + encodeURIComponent(posts[0].url); 
    }

    function reconfigure(ev) {
        if(ev.key == 'sources') {
            getFeeds();
        }
    }

    function hyphenate(text) {
        var arr = text.split(' ');
        for(var i = 0; i < arr.length; i++) {
            arr[i] = en.hyphenate(arr[i]).join('&shy;');
        }
        return arr.join(' ');
    }

    function transformSources(request) {
        var oldSources = JSON.parse(prefs.sources);
        var newSources = JSON.parse(request.responseText).boxes;
        var sources = oldSources.map(function(source) {
            for(var i=0, newSource; newSource = newSources[i]; i++) {
                if(newSource.name == source.name) {
                    return {id: newSource.id, count: source.count};
                }
            }
            return null;
        }).filter(function(source) {
            return source !== null;
        });
        var finalSources = sources.length == 0 ? 
            {id: newSources[0].id, count: 3} : sources;
        prefs.sources = JSON.stringify(finalSources);
        init();
    }

    function checkSourceFormat() {
        if(prefs.sources) {
            var sources = JSON.parse(prefs.sources);
            if(sources[0].name) {
                getSources(transformSources);
                return true;
            }
        }
        return false;
    }

    function init() {
        // Check if settings are from the old API, and transform if necessary.
        if(checkSourceFormat()) {
            return;
        };
        setRefreshTimer();
        window.addEventListener('storage', reconfigure, false);
        setInterval(getFeeds, 300000);
        getFeeds();
    }

    document.addEventListener('DOMContentLoaded', init, false);
}())
