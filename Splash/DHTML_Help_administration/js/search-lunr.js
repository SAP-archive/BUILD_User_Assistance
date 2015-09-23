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
    var headerHtml = "";
    var html = ""
    if (window.searchIndex) {
        var results = window.searchIndex.search(request);
        headerHtml += "<div><span class='searchPageSectionTitle'>" + TXT_RESULTS_FOR + "</span>" + jQuery.sap.encodeHTML(request);
        var counter = 0;
        for (i = 0; i < results.length && counter < 512; i++) {
            var href = results[i].ref;
            var score = results[i].score;
            var topicDetails = getTopicDetails(href);
            if (topicDetails) {
                html += "<div class=\"searchItem\" onclick=\"displayTopic('" + getSearchResultsHref(href, request) + "')\">" 
                     + getSearchResultsLink(href, request, topicDetails.title + " [score " + (Math.floor(score * 10000) / 100) + "]");
                if (topicDetails.shortdesc && topicDetails.shortdesc.length > 0) {
                    html += "<div class=\"searchItemDesc\">" + jQuery.sap.encodeHTML(topicDetails.shortdesc) + "</div>";
                }
                html += "</div>";
                counter++;
            }
        }
        if (counter == 0) {
            headerHtml += "<div class='searchNoResults'>" + TXT_ERR_NO_RESULTS + "</div>";
        }
        headerHtml += "</div>";;
        headerHtml += "<div class='searchPageSpacer'></div>"
        document.getElementById("resultsheader").innerHTML = headerHtml;
        document.getElementById("results").innerHTML = html;
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