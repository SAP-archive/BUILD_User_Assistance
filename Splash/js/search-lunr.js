/**
 * lunr.js search integration for DHTML.
 *  © Copyright 2015 SAP SE.  All rights reserved
 */
function getParams() {
    var params = getQuerystring("search");
    
    if (params) {
        params = decodeURIComponent(params);
        document.getElementById('txtSearchTerms').value = params;
        $.getJSON('js/topic-data.json')
        .done(function (data) {
            console.log("JSON for topic data done.");
            window.topicData = data.topics;
            $.getJSON('js/lunr-index.json')
            .done(function (data) {
                console.log("JSON for index done.");
                window.searchIndex = lunr.Index.load(data);
                searchString(unescape(params));
            }).fail(function () {
                console.log("JSON load of search index failed!");
            });
        }).fail(function () {
            console.log("JSON load of search topic data failed!");
        })
    }
}

function searchString(request) {
  if (window.searchIndex) {
    var resultsHeaderFragment = document.createDocumentFragment();
    var header = document.createElement("div");
    var label = document.createElement("span");
    label.setAttribute("class", "searchPageSectionTitle");
    label.appendChild(document.createTextNode(TXT_RESULTS_FOR));
    header.appendChild(label);
    header.appendChild(document.createTextNode(request));
    resultsHeaderFragment.appendChild(header);
    var spacer = document.createElement("div");
    spacer.setAttribute("class","searchPageSpacer");
    resultsHeaderFragment.appendChild(spacer);
  
    var results = window.searchIndex.search(request);

    if (results.length > 0) { 
        var resultsFragment = document.createDocumentFragment();
        var counter = 0;
        for (var i = 0; i < results.length && counter < 512; i++) {
            var href = results[i].ref;
            var score = results[i].score;
            var topicDetails = getTopicDetails(href);
            if (topicDetails) {
                var divSearchItem = document.createElement("div");
                divSearchItem.setAttribute("class", "searchItem");
                divSearchItem.setAttribute("onclick", "displayTopic('" + getSearchResultsHref(href, request) + "')");
                divSearchItem.appendChild(getSearchResultsLink(href, request, topicDetails.title + " [score " + (Math.floor(score * 10000) / 100) + "]"));
                if (topicDetails.shortdesc && topicDetails.shortdesc.length > 0) {
                    var shortDescDiv = document.createElement("div");
                    shortDescDiv.setAttribute("class", "searchItemDesc");
                    shortDescDiv.appendChild(document.createTextNode(topicDetails.shortdesc));
                    divSearchItem.appendChild(shortDescDiv);
                }
                resultsFragment.appendChild(divSearchItem);
                counter++;
            }
        }
        
        document.getElementById("resultsheader").appendChild(resultsHeaderFragment);
        document.getElementById("results").appendChild(resultsFragment);
    } else {
        var noResultsDiv = document.createElement("div");
        noResultsDiv.setAttribute("class", "searchNoResults");
        noResultsDiv.appendChild(document.createTextNode(TXT_ERR_NO_RESULTS));
        resultsHeaderFragment.appendChild(noResultsDiv);
        document.getElementById("resultsheader").appendChild(resultsHeaderFragment);
     }
  } else {
    console.log("No search run for \"" + request + "\" because there's no search index.");
  }
}

function getTopicDetails(file) {
    if (! window.topicData) {
        console.log("No topic data.");
        return null;
    }
    for (t = 0; t < topicData.length; t++) {
        if (topicData[t].file === file) return topicData[t];
    }
    return null;
}

function getQuerystring(key, default_) {
    if (default_ == null) default_ = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
    return default_; else
    return qs[1];
}