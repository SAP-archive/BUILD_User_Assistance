/*global TopicFiles, TopicsWordsList, TopicTitles, viewedDocument */
function generateRegExp(request)
{
    var searchExpr, regexp = /(\x20\x20)/g;
    while(request.match(regexp)) {
        // Escape sequence must be written as follows.
        request = request.replace(regexp,"\x20");
    }
    regexp = /(^\x20)|(\x20$)/g;
    while(request.match(regexp)) {
        request = request.replace(regexp,"");
    }
    request = request.replace("*","\\w*");

    searchExpr = new RegExp(request, "i");
    return searchExpr;
}

function normalizeSpace(string)
{
    var regexp = /(\x20\x20)/g;
    while(string.match(regexp)) {
        // Escape sequence must be written as follows.
        string = string.replace(regexp,"\x20");
    }
    regexp = /(^\x20)|(\x20$)/g;
    while(string.match(regexp)) {
        string = string.replace(regexp,"");
    }
    return string;
}

function createSearchResultsArray()
{

    var i = 0, searchResults = new Array(TopicFiles.length);
    for(i = 0; i < searchResults.length; i = i + 1) {
        searchResults[i] = 0;
    }
    return searchResults;
}

function prepareRequest(request)
{
    var regexp = /\\/g;
    request = request.replace(regexp,"\\\\");
    return request;
}

function searchString(request)
{
   	 var searchResults, request1, requestArr, regexp, preparedRequest, element,
        counter = 0, 
        i = 0, 
        j = 0, 
        k = 0, 
        showedLinks = ""
        html=""
        headerHtml=""
        frameset="";
     
    searchResults = createSearchResultsArray();
    request1 = normalizeSpace(request);
    requestArr = request1.split(" "); 
    regexp = new Array(requestArr.length);
    frameset = getFramesetInfo(document.location.href).replace("?search.html", "");

    for(i = 0; i < regexp.length; i = i + 1)
    {
        preparedRequest = prepareRequest(requestArr[i]);
        regexp[i]=generateRegExp(preparedRequest);
    }
    for (j = 0; j < regexp.length; j = j + 1)
    {
        for(i = 0; i < TopicsWordsList.length; i = i + 1)
        {
            if(TopicsWordsList[i]) {
                if (matchExactString(regexp[j], TopicsWordsList[i][0])) {
	                for(k = 0; k < TopicsWordsList[i][1].length; k = k + 1) {
                        searchResults[TopicsWordsList[i][1][k]] += 1;
                    }
                }
            }
        }
    }
    
			if (!request || /^\s*$/.test(request)){
				headerHtml +=	"<span class='searchResults'><span class='searchPageSectionTitle'>" + TXT_ERR_NO_INPUT + "</span>&nbsp;</span>";
			}
    		else {
				
						headerHtml += "<span class='searchResults'><span class='searchPageSectionTitle'>" + TXT_RESULTS_FOR + "</span>" + sanitizeString(request)
						
			    		for(j = 0; j < searchResults.length && counter < 512; j = j + 1)
					    {
					
					        if(searchResults[j] >= regexp.length && TopicFiles[j] !== "" && showedLinks.indexOf(TopicFiles[j]) === -1)
					        {
					
						        if (TopicTitles[j] !== 'null'){
							        html += "<div class=\"searchItem\" onclick=\"displayTopic('" + sanitizeString(TopicFiles[j])  +"?search="+ encodeURIComponent(request) + "')\"><a href=\"" + sanitizeString(TopicFiles[j]) + "?search="+ encodeURIComponent(request) + "\"><span class='searchItemTitle'>" + sanitizeString(TopicTitles[j]) + "</span></a>";
							        
							        if (TopicDescriptions[j] !== '')
							        	html += "<div class=\"searchItemDesc\">" + sanitizeString(TopicDescriptions[j]) + "</div>";
							        	
							        html += "</div>";
					        	}
					
					            counter += 1;
					        }
					}
			
					if (counter == 0) {
						headerHtml +="<div class='searchNoResults'>" + TXT_ERR_NO_RESULTS + "</div>";
						}
					
					headerHtml += "</span>";
			    	headerHtml += "<div class='searchPageSpacer'></div>"
    	}
    	
        document.getElementById("resultsheader").innerHTML = headerHtml;
        document.getElementById("results").innerHTML = html;
      
}

function ViewDocument()
{
    var searchList = document.getElementById("searchList");    
    viewedDocument = open(searchList.options[searchList.selectedIndex].value, "frmTopic");
}


function getParams(){
	var params = getQuerystring("search");

	
	//if (params){
		document.getElementById('txtSearchTerms').value='';
		document.getElementById('search-q').value=params;
	
		searchString(params);
	//}
	
	}
	
function redirect (frmSearch){
     searchTerms = document.getElementById('txtSearchTerms').value;
    
    if (searchTerms.length<1 && document.getElementById('search-q')) {
	 	searchTerms = document.getElementById('search-q').value;   
	 }
    
    window.location = "search.html?search=" + sanitizeString(searchTerms);
   //window.location = "search.html?search=" + searchTerms);
}

function cleanHTML (results) {
	results=results.replace('&', '&amp;');
	results=results.replace('<', '&lt;');
	results=results.replace('>', '&gt;');
	results=results.replace('"', '&quot;');
	results=results.replace('\'', '&#x27;');
	results=results.replace('/', '&#x2F;');
	
	return results;
	}
	
function getQuerystring(name)
	{
	  
      /*if (default_==null) default_=""; 
	  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	  var qs = regex.exec(window.location.href);
	  if(qs == null)
	    return default_;
	  else
	    return qs[1];*/
	    
	//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

	}
	
/*
   From	http://stackoverflow.com/questions/447250/matching-exact-string-with-javascript
 */
function matchExactString(r,str) {
	var mes = str.match(r);
	return mes != null && str == mes[0];
	}
	
function getFramesetInfo (u) {
	
	u = u.replace("?search.html", "");
	var from = u.lastIndexOf("/") +1;
	var to = u.lastIndexOf("?");
	var fileName = "";
	
	if (to < 0) {
		fileName = u.substring(u.lastIndexOf("/")+1);
	}
	else {
		fileName = u.substring(u.lastIndexOf("/")+1, u.lastIndexOf("?"));
		}
	

		return fileName;
	}

function displayTopic(url) {
	window.location=url;
	}	


function sanitizeString (string){
	var s = new Sanitize();
    var elm = document.implementation.createHTMLDocument('http://www.w3.org/1999/xhtml', 'html', null).body;
    
    elm.innerHTML = string;
    cleaned_fragment = s.clean_node(elm);
    elm = document.implementation.createHTMLDocument('http://www.w3.org/1999/xhtml', 'html', null).body;
    elm.appendChild(cleaned_fragment);
    return elm.innerHTML;
	}

	
	