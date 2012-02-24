(function() {
    var options = "";

    function getSources() {
        var agent = new XMLHttpRequest();
        agent.open('GET', widget.preferences['baseURI']+"?boxes=100&per_box=1", false, '', '');
        agent.send()
        if (agent.status<400) {
            return JSON.parse(agent.responseText);
        }
        return [];
    }
    function addItem(refNode, data) {
        if (!data) data = {'id':"", 'count':3};
        var row = document.getElementById('sources').insertBefore(document.createElement('tr'), refNode);
        row.innerHTML = sourceHTML;
        var options = row.getElementsByTagName('option');
        for (var b = 0; b < options.length; b++) {
            if (options[b].value==data['name']) {
                options[b].selected = true;
                break;
            }
        }
        row.getElementsByTagName('input')[0].value = data['count'];
        row.getElementsByTagName('button')[0].addEventListener('click', less, false);
        row.getElementsByTagName('button')[1].addEventListener('click', more, false);
    }
    function save(ev) {
        var rows = document.getElementById('sources').getElementsByTagName('tr');
        var data = []
        for (var a = 0; a < rows.length; a++) {
            data.push({'name':rows[a].getElementsByTagName('select')[0].value, 'count':rows[a].getElementsByTagName('input')[0].value});
        }
        data = JSON.stringify(data);
        if (widget.preferences['source'] != data) widget.preferences.setItem('sources', data);
        var delay = document.getElementsByName('secondsperpost')[0].value;
        if (widget.preferences['delay'] != delay) widget.preferences.setItem('delay', delay);
        ev.preventDefault();
        window.close();
    }
    function less(ev) {
        var row = ev.target.parentNode.parentNode
        table = row.parentNode;
        table.removeChild(row);
        if (!table.firstChild) addItem();
        ev.preventDefault();
    }
    function more(ev) {
        addItem(ev.target.parentNode.parentNode.nextSibling)
        ev.preventDefault();
    }

    function init() {
        var allSources = getSources().filter(function(source) {
            return source.box_type == 'feed';
        });

        var sources;
        if (widget.preferences.sources) {
            sources = JSON.parse(widget.preferences.sources);
        }
        else {
            sources = [{name: allSources[0].box_title, count: 3}];
            widget.preferences.sources = JSON.stringify(sources);
        }

        for (var i = 0, source; source = allSources[i]; i++) {
            options += '<option value="' + source.box_title + '">' + source.box_title + '</option>';
        }
        sourceHTML = '<td><select>'+options+'</select></td><td><label><span><input type="number" step="1" min="1" max="3"></span><span>' + _getString('posts') + '</span></label></td><td><button class="minus"><span>-</span></button><button class="plus"><span>+</span></button></td>';
        document.getElementsByName('secondsperpost')[0].value = widget.preferences['delay'];
        document.getElementsByTagName('form')[0].addEventListener('submit', save, false);
        for (var a = 0; a < sources.length; a++) {
            addItem(null, sources[a]);
        }
    }
    document.addEventListener('DOMContentLoaded', init, false);
}())
