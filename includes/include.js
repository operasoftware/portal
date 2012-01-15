// ==UserScript==
// @include http://portal.opera.com/*
// ==/UserScript==

(function() {
    var data;

    var highlightPost = function(url) {
        var anchors = document.querySelectorAll('a[href="' + url + '"]');
        var anchor;
        for(var i=0; i < anchors.length; i++) {
            if(anchors[i].parentNode.parentNode.tagName == "ARTICLE") {
                anchor = anchors[i];
            }
        }
        if(!anchor) {
            return false;
        }
        var box = anchor.parentNode.parentNode.parentNode;
        var article = anchor.parentNode.parentNode;

        var opened = box.getElementsByClassName('opened')
        if(opened) opened[0].className = ''; 
        article.className = 'opened';
        article.style.backgroundColor = "rgba(255, 215, 0, 0.7)";
        var pos = findPos(article);
        window.scrollTo(0, pos - 200);
        setTimeout(function() { 
            article.style.OTransition = "background-color 5s"; 
            article.style.backgroundColor = "white";
        }, 2000);
        return true;
    }

    var init = function() {
        var url = getURL();
        if(url) {
            var timer = setInterval(function() {
                var success = highlightPost(url);
                if(success) {
                    clearInterval(timer);
                }
            }, 100);
        }
    }

    var getURL = function() {
        var components = window.location.search.substring(1).split('&');
        var url;
        for(var i=0; i < components.length; i++) {
            var parts = components[i].split('=');
            if(parts[0] == 'ext_url') {
                url = decodeURIComponent(parts[1]);
                break;
            }
        }
        return url;
    }

    function findPos(obj) {
        var curtop = 0;
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return curtop;
    }

    init();
})()
