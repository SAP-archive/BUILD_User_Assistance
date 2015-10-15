/**
 * Creates topic links for search results list. Replace with a transtype version if 
 * you require special treatem of the @href or other attributes.
 *
 *   Copyright 2015 SAP SE.  All rights reserved
 */
 
function getSearchResultsHref(filename, request) {
    return encodeURI(filename);
}

function displayTopic(url) {
	window.location=url;
}

function getSearchResultsLink(filename, request, linktext) {
    //return "<a href=\"" + getSearchResultsHref(filename, request) + "\">" + linktext + "</a>"; 
    var na = document.createElement("a");
    na.setAttribute("href", getSearchResultsHref(filename, request));
    na.appendChild(document.createTextNode(linktext));
    return na;
}

function redirect (frmSearch) {
    // Check browser compatibitily
    if (window.opera || navigator.userAgent.indexOf("Konquerer") > -1) {
        alert(txt_browser_not_supported);
        return;
    }
    searchTerms = frmSearch.txtSearchTerms.value
    if (searchTerms.length < 1) {
        document.getElementById('results').innerHTML = "<span class=\"searchError\">" + TXT_ERR_NO_INPUT + "</span>";
    } else {
        window.location = "search.html?search=" + searchTerms;
    }
}