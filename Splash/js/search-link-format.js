function getSearchResultsHref(filename, request) {
    return filename;
}

function displayTopic(url) {
	window.location=url;
}

function getSearchResultsLink(filename, request, linktext) {
    return "<a href=\"" + getSearchResultsHref(filename, request) + "\">" + linktext + "</a>"; 
}

function redirect (frmSearch) {

    // Check browser compatibitily
    if (window.opera || navigator.userAgent.indexOf("Konquerer") > -1) {
        alert(txt_browser_not_supported);
        return;
    }

    searchTerms = document.getElementById('txtSearchTerms').value;
    
    if (searchTerms.length<1) {
	 	searchTerms = document.getElementById('search-q').value;   
	    }
    if (searchTerms.length < 1) {
        document.getElementById('results').innerHTML = "<span class=\"searchError\">" + TXT_ERR_NO_INPUT + "</span>";
    } else {
        window.location = "search.html?search=" + searchTerms;
    }
}