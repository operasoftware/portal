(function()
{
    var nodes = document.getElementsByClassName('l11n');
    for(var i=0, node; node = nodes[i]; i++) {
        var key = node.textContent;
        if(_STRINGS[key]) {
            node.textContent = _STRINGS[key];
        }
    }

    window._getString = function(name) {
        if(_STRINGS[name]) {
            return _STRINGS[name];
        }
        else {
            return name;
        }
    }
}());
