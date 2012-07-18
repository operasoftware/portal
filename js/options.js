(function() {

    function fetchSources(callback) {
        var req = new XMLHttpRequest();
        req.open('GET', widget.preferences['baseURI']+"all_boxes", true);
        req.onreadystatechange = function() {
            if(req.readyState == 4) {
                if(req.status == 200) {
                    callback(req.responseText);
                }
            }
        }
        req.send();
    }

    function saveSources() {
        var sourceElements = document.querySelectorAll('#source-list li');
        var sourceData = Array.prototype.map.call(sourceElements, 
            function(li) {
                var select = li.querySelector('select');
                return { 
                    id: select.options[select.selectedIndex].value,
                    count: li.querySelector('input').value
                };
            }
        );
        widget.preferences.sources = JSON.stringify(sourceData);
        window.close();
    }

    function getSelectedSources() {
        var savedSources = widget.preferences.sources;
        if(savedSources) {
            return JSON.parse(savedSources);
        }
        else {
            return [];
        }
    }

    function createListElement(select, source) {
        var li = document.createElement('li');
        var countInput = document.createElement('input');
            countInput.type = 'number';
            countInput.step = 1;
            countInput.min = 1;
            countInput.max = 5;
            countInput.value = source ? source.count : 3;
        var span = document.createElement('span');
            span.className = 'l11n';
            span.textContent = _getString('posts');
        var button = document.createElement('button');
            button.type = 'button';
            button.textContent = '✖';
            button.className = 'remove-source';
            button.addEventListener('click', function() {
                li.parentElement.removeChild(li);
            }, false);

        if(source) {
            Array.prototype.forEach.call(select.options, function(option, index) {
                if(option.value == source.id) {
                    select.selectedIndex = index;
                }
            });
        }

        li.appendChild(select);
        li.appendChild(countInput);
        li.appendChild(span);
        li.appendChild(button);

        return li;
    }

    function addSource(select) {
        document.getElementById('source-list')
            .appendChild(createListElement(select.cloneNode(true)));
    }

    function initSourceList(selectedSources, sourceList) {
        var sources = JSON.parse(sourceList).boxes;
        var select = document.createElement('select');
        sources.forEach(function(source) {
            var option = document.createElement('option');
            option.value = source.id;
            option.textContent = source.name;
            select.appendChild(option);
        });

        var ul = document.getElementById('source-list');
            ul.innerHTML = '';
        if(selectedSources.length > 0) {
            selectedSources.forEach(function(source) {
                ul.appendChild(createListElement(select.cloneNode(true), source));
            });
        }
        else {
            ul.appendChild(createListElement(select.cloneNode(true)));
        }

        document.getElementById('new-source').addEventListener('click', 
            addSource.bind(undefined, select), false
        );
    }

    function init() {
        var selectedSources = getSelectedSources();
        fetchSources(initSourceList.bind(undefined, selectedSources));
        document.getElementById('save-button')
            .addEventListener('click', saveSources, false);
    }
    document.addEventListener('DOMContentLoaded', init, false);
}())
