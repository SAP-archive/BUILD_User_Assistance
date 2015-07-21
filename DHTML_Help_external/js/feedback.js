/* Version 2 2011-10-13 */
/* array to remember the visited sites */
var arrVisitedHelpPages = new Array();
/* URL for checking if navigation in the content Frame has been changed*/
var strContentUrl;
/* URL for the stylesheet to be added */
var strStylesheetUrl = "..\/..\/css\/feedback.css"; // relative to content.htm
/* string for feedback */
var strFeedbackLinkText = "Feedback"; // [[FEEDBACKLINK]] = Feedback
/* URL for the Feedback Icon */
var strFeedbackIconUrl = "..\/..\/images\/s_b_sndn.gif"; // relative to content.htm

/* Message text for feedback rating*/
var strRatingThanksMessage = "Thank you for rating this topic. Your rating was:" + " "; // [[STARRATINGSUCCESSSTART]] = Thank you for rating this topic. Your rating was:
var strEmptyStarUrl = "..\/..\/images\/empty-star-tr.gif"; // relative to content.htm
var strFullStarUrl = "..\/..\/images\/full-star-tr.gif"; // relative to content.htm
var strFeedbackLinkStyle = "fbLinkDiv";
var strRatingThanksStyle = "fbThanks";
var strStarRatingLabelStyle = "fbStarRatingLabel";
var strRatingFeedbackPleaseRate = "Please rate this topic:" + " "; // [[STARRATINGINTRO]] = Please rate this topic:
var strStarRatingDisplayTextStyle = "fbStarText";
var strImageStyle = "fbImg";

/* Message Texts for Comment */
var strThankForComment = "Thank you for your feedback!"; // [[COMMENT_SUCCESSSTART]] = Thank you for your feedback!
var strSubmitComment = "Send Feedback"; // [[COMMENTS_SUBMIT]] = Send Feedback
var strPleaseCommentTopic = "Please send us your feedback about this topic. It will help us improve the quality of the documentation."; // [[COMMENTS_INTRO]] = Please send us your feedback about this topic in English. It will help us improve the quality of the documentation.
var strPleaseCommentFirst =  "Please enter your feedback before you send it."; // [[COMMENTS_MISSINGINFO]] = Please enter your feedback before you send it.
var strThanksCommentStyle = "fbThanksComment";
var strCommentThanksStyle = "fbThanks";
var strSubmitButtonStyle = "fbSubmitButton";

var strFeedbackContainerStyle = "fbContainer";

var intTxtLength = 1000;
var strCharactersLeft = "Remaining characters:" + " "; // [[LOWRATING_CHARACTERSLEFT]] = Remaining characters:
var strCharactersLeftStyle = "fbLengthCounter";
/* URL to the redirect page */
var strSubmitServerUrl = "\/request\/request.asp";

/* Regular expression to check if feedback is shown */
var strRegExpSite = "/*help\.sap\.com*/";

var imgTitle = new Object();
imgTitle["1"]="(1) Poor"; // [[STARRATINGGEN1]] = (1) Poor
imgTitle["2"]="(2) Unsatisfactory"; // [[STARRATINGGEN2]] = (2) Unsatisfactory
imgTitle["3"]="(3) Average"; // [[STARRATINGGEN3]] = (3) Average
imgTitle["4"]="(4) Good"; // [[STARRATINGGEN4]] = (4) Good
imgTitle["5"]="(5) Excellent"; // [[STARRATINGGEN5]] = (5) Excellent

//Array to limit to a list of Objects
//Initial Array shows feedback for all pages
//Undefined Array shows no feedback at all
var arrShowFeedback = new Array();

/*variable to decide if already checked for loiolist, 0 not checked, 1 checked but no file exists, 2 checked and file exists*/
var intGotLoioList = 0;
var strLoioListUrl = "..\/global\/loiolist.txt";
var strLoioList;

/* ========================================================================================================= */
function checkShowFeedback(objDoc)
{
  if(intGotLoioList == 1)
   {return false;}
  getAllowedLoioList();
  if(strLoioList != null)
    {
     if(strLoioList.length == 0)
      {return true;}
     var strLoio = "\/*" + getLoioOfPage(objDoc) + "*";
     var isLoioIncluded = strLoioList.search(strLoio);
     if (isLoioIncluded == -1)
       {return false;}
     else
       {return true;}
    }
  else
    {return false;}
}

/* ========================================================================================================= */
function getAllowedLoioList()
{
  var i = 0;
  var intPos;
  var intArrIndex;
  var intMemIndex;
  var strStatus;
  var strBody = " ";
  if (intGotLoioList!=0)
    {return;}
  try
    {
     var xmlHttp = new XMLHttpRequest();
     xmlHttp.open("GET", strLoioListUrl, false);
     xmlHttp.send(strBody);
    }
  catch(e)
    {
     intGotLoioList = 1;
     return;
    }
  strStatus = xmlHttp.status;
  if (parseInt(strStatus) != 200)
    {
     intGotLoioList = 1;
     return;
    }
     intGotLoioList = 2;
/* store the text for later searching */
  strLoioList = xmlHttp.responseText.toUpperCase();
}

/* ========================================================================================================= */
function getLoioOfPage(objDoc)
{
  var arrMetaTags = objDoc.getElementsByTagName("meta");
  var strLoio;
/*  first try via function GetLoio()*/
  try
    { strLoio = window.parent.frames[2].GetLoio();
      strLoio = strLoio.toUpperCase();
      return strLoio;
    }
  catch(e){}
  for(var i=0; i< arrMetaTags.length; i++)
    {
/* check if name is set */
    if (arrMetaTags[i].getAttribute("name"))
     {
/* get the Loio */
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "LOIO_GUID" || arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_LOIO_GUID")
      {strLoio = arrMetaTags[i].getAttribute("content");}
     }
    }
  strLoio = strLoio.toUpperCase();
  return strLoio;
}

/* ========================================================================================================= */
function contains(a, obj)
  {
    for(var i = 0; i < a.length; i++)
      {
        if(a[i] == obj){return true;}
      }
    return false;
  }

/* ========================================================================================================= */
function checkContentChanged()
{
 var contentDoc;
 var strContentDocUrl;
 try
   {
    contentDoc = window.parent.frames[2].document;
    strContentDocUrl = contentDoc.URL;
   }
 catch(e)
   {strContentDocUrl = "undefined";}
/* content not yet loaded or no access allowed*/
 if(strContentDocUrl=="undefined")
   {
    window.setTimeout("checkContentChanged()", 200);
    return;
   }
/* objects already inserted */
 if(contentDoc.getElementById("fbLinkDiv"))
   {
    window.setTimeout("checkContentChanged()", 200);
    return;
   }
/* object not yet inserted */
 fb_start();
}

/* ========================================================================================================= */
function fb_start()
{
/* check if called on help.sap.com */
  var thisUrl = document.URL.toLowerCase();
  var isAllowedSite = thisUrl.search(strRegExpSite);
  if (isAllowedSite == -1)
    {return;}
/* check if XML HTTP is available */
  try
    {var xmlHttp = new XMLHttpRequest();}
  catch(e)
    {return;}
  if(!xmlHttp)
   {return;}

  try
    {var contentDoc = window.parent.frames[2].document;}
  catch(e)
    {
     strContentUrl = "undefined";
     window.setTimeout("checkContentChanged()", 200);
     return;
    }

 /* check document is properly loaded */
    if (!(contentDoc.getElementsByTagName("body").length!=0 && contentDoc.getElementsByTagName("body")[0].childNodes.length!=0))
    {
    window.setTimeout("fb_start()", 200);
    return;
    }
/* check if the loaded document contains a loio */
  if(getLoioOfPage(contentDoc) == "")
    {
     strContentUrl = contentDoc.URL;
     if (strContentUrl.length > 12 && strContentUrl.substr(strContentUrl.length-12,12) == "#fbContainer")
       {strContentUrl = strContentUrl.substr(0,strContentUrl.length-12);}
     window.setTimeout("checkContentChanged()", 200);
     return;
    }
/* check if loio list is provided and document is included */
  if(!checkShowFeedback(contentDoc))
    {
     strContentUrl = contentDoc.URL;
     if (strContentUrl.length > 12 && strContentUrl.substr(strContentUrl.length-12,12) == "#fbContainer")
       {strContentUrl = strContentUrl.substr(0,strContentUrl.length-12);}
     window.setTimeout("checkContentChanged()", 200);
     return;
    }
/* add the link to the stylesheet */
  addStylesheetLink(contentDoc);
  var objBodyTag = contentDoc.getElementsByTagName("body");
/* add the Link to the feedback section on the page */
  var newFeedbackDiv = createFeedbackLink(contentDoc);
  objBodyTag[0].insertBefore(newFeedbackDiv, objBodyTag[0].firstChild);
/* add the Feedback Area */
  var newFeedbackArea = createFeedbackArea(contentDoc);
  objBodyTag[0].appendChild(newFeedbackArea);
/* set the content change checker */
  strContentUrl = contentDoc.URL;
  if (strContentUrl.length > 12 && strContentUrl.substr(strContentUrl.length-12,12) == "#fbContainer")
    {strContentUrl = strContentUrl.substr(0,strContentUrl.length-12);}
  window.setTimeout("checkContentChanged()", 200);
}

/* ========================================================================================================= */
function addStylesheetLink(objDoc)
{
/*<link rel="stylesheet" type="text/css" href="../../css/feedback.css" charset="UTF-8" />*/
  var objHeadTag = objDoc.getElementsByTagName("head");
/* Create the Link-tag */
  var newStylesheetLink = objDoc.createElement("Link");
/* rel attribute */
  var newAttrib = objDoc.createAttribute("rel");
  newAttrib.nodeValue = "stylesheet";
  newStylesheetLink.setAttributeNode(newAttrib);
/* type attribute */
  newAttrib = objDoc.createAttribute("type");
  newAttrib.nodeValue = "text/css";
  newStylesheetLink.setAttributeNode(newAttrib);
/* href attribute */
  newAttrib = objDoc.createAttribute("href");
  newAttrib.nodeValue = strStylesheetUrl;
  newStylesheetLink.setAttributeNode(newAttrib);
/* charset attribute */
  newAttrib = objDoc.createAttribute("charset");
  newAttrib.nodeValue = "UTF-8";
  newStylesheetLink.setAttributeNode(newAttrib);
/* append the newly created stylesheet link to the document head */
  objHeadTag[0].appendChild(newStylesheetLink);
}

/* ========================================================================================================= */
function createFeedbackLink(objDoc)
  {
/* create the div-Tag for the feedback link. */
  var newElemDiv = objDoc.createElement("Div");
/* set the Id of the div-Tag */
  var newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbLinkDiv";
  newElemDiv.setAttributeNode(newAttrib);
/* set the class of the div-Tag */
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strFeedbackLinkStyle;
  newElemDiv.setAttributeNode(newAttrib);
/* Create the link */
  var newElemA = objDoc.createElement("A");
/* set the href of the a-Tag */
  newAttrib = objDoc.createAttribute("href");
  newAttrib.nodeValue = "#fbContainer";
  newElemA.setAttributeNode(newAttrib);
/* set the title of the a-Tag */
  newAttrib = objDoc.createAttribute("title");
  newAttrib.nodeValue = strFeedbackLinkText;
  newElemA.setAttributeNode(newAttrib);
/* Append the link to the Div-tag */
  newElemDiv.appendChild(newElemA);
/* Create the image */
  var newElemImg = objDoc.createElement("Img");
/* set the class of the img-Tag */
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = "fbImg";
  newElemImg.setAttributeNode(newAttrib);
/* set the alternative text of the img-Tag */
  newAttrib = objDoc.createAttribute("alt");
  newAttrib.nodeValue = strFeedbackLinkText;
  newElemImg.setAttributeNode(newAttrib);
/* set the source of the img-Tag */
  newAttrib = objDoc.createAttribute("src");
  newAttrib.nodeValue = strFeedbackIconUrl;
  newElemImg.setAttributeNode(newAttrib);
/* insert the image into the link */
  newElemA.appendChild(newElemImg);
/* add the Text to the link */
  var newTextNode = objDoc.createTextNode(" " + strFeedbackLinkText);
  newElemA.appendChild(newTextNode);
  return newElemDiv;
  }

/* ========================================================================================================= */
function createFeedbackRating(objDoc,strRatingCategory)
  {
/* create the div-Tag for the rating area. */
  var newElemDiv = objDoc.createElement("Div");
/* create the p-Tag for the heading. */
  var newElemP = objDoc.createElement("P");
  newElemDiv.appendChild(newElemP);
// set the Id of the p-Tag
  var newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbThanks" + strRatingCategory;
  newElemP.setAttributeNode(newAttrib);
// set the class of the p-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strRatingThanksStyle;
  newElemP.setAttributeNode(newAttrib);
  newElemP.style.display="none";
// add the text
  var newTextNode = objDoc.createTextNode(strRatingThanksMessage);
  newElemP.appendChild(newTextNode);
// add the span as placeholder for the result
  var newElemSpan = objDoc.createElement("Span");
// set the Id of the span-Tag
  newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "ratingScore" + strRatingCategory;
  newElemSpan.setAttributeNode(newAttrib);
// add the empty text
  newTextNode = objDoc.createTextNode(" ");
  newElemSpan.appendChild(newTextNode);
// append the span
  newElemP.appendChild(newElemSpan);
// create the form
  var newElemForm = objDoc.createElement("Form");
// set the Id of the form
  newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbRatingForm" + strRatingCategory;
  newElemForm.setAttributeNode(newAttrib);
// set the method of the form
  newAttrib = objDoc.createAttribute("method");
  newAttrib.nodeValue = "Post";
  newElemForm.setAttributeNode(newAttrib);
// set the margin
  newElemForm.style.margin=0;
// set the action of the form
  newAttrib = objDoc.createAttribute("action");
  newAttrib.nodeValue = "";
  newElemForm.setAttributeNode(newAttrib);
// append the form
  newElemDiv.appendChild(newElemForm);
// append the span
  newElemSpan = objDoc.createElement("Span");
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strStarRatingLabelStyle;
  newElemSpan.setAttributeNode(newAttrib);
// add the text
  newTextNode = objDoc.createTextNode(strRatingFeedbackPleaseRate);
  newElemSpan.appendChild(newTextNode);
  newElemForm.appendChild(newElemSpan);
// add the first image
  var newElemImg = createRatingImage(objDoc, "1", strRatingCategory);
  newElemForm.appendChild(newElemImg);
// second image
  newElemImg = createRatingImage(objDoc, "2", strRatingCategory);
  newElemForm.appendChild(newElemImg);
// third image
  newElemImg = createRatingImage(objDoc, "3", strRatingCategory);
  newElemForm.appendChild(newElemImg);
// fourth image
  newElemImg = createRatingImage(objDoc, "4", strRatingCategory);
  newElemForm.appendChild(newElemImg);
// fifth image
  newElemImg = createRatingImage(objDoc, "5", strRatingCategory);
  newElemForm.appendChild(newElemImg);
// create the span for displaying the selction
  newElemSpan = objDoc.createElement("Span");
// set the Id of the span-Tag
  newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbStarValue" + strRatingCategory;
  newElemSpan.setAttributeNode(newAttrib);
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strStarRatingDisplayTextStyle;
  newElemSpan.setAttributeNode(newAttrib);
// append the span
  newElemForm.appendChild(newElemSpan);
// add the empty text
  newTextNode = objDoc.createTextNode(" ");
  newElemSpan.appendChild(newTextNode);

// return the create div-tag
  return newElemDiv;
  }

/* ========================================================================================================= */
function createRatingImage(objDoc, strNumber, strRatingCategory)
  {
// add the images for the rating
  var newElemImg = objDoc.createElement("Img");
// add the id
  var newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbStar" + strRatingCategory + strNumber;
  newElemImg.setAttributeNode(newAttrib);
// add the class
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strImageStyle;
  newElemImg.setAttributeNode(newAttrib);
// add the src
  newAttrib = objDoc.createAttribute("src");
  newAttrib.nodeValue = strEmptyStarUrl;
  newElemImg.setAttributeNode(newAttrib);
// add the alt text
  newAttrib = objDoc.createAttribute("alt");
  newAttrib.nodeValue = imgTitle[strNumber];
  newElemImg.setAttributeNode(newAttrib);
// add the title text
  newAttrib = objDoc.createAttribute("title");
  newAttrib.nodeValue = imgTitle[strNumber];
  newElemImg.setAttributeNode(newAttrib);
// add the onmouseover
  newElemImg.onmouseover = fbRate;
// add the onmouseout
  newElemImg.onmouseout = fbClearStars;
// add the onclick for submit
  newElemImg.onclick = fbSubmitRatingForm;
// return the image
  return newElemImg;
  }

/* ========================================================================================================= */
/* Create the Textarea for the feedback */
function createFeedbackText(objDoc)
  {
// create the div-Tag for the rating area.
  var newElemDiv = objDoc.createElement("Div");
// create the p-Tag for the heading.
  var newElemP = objDoc.createElement("P");
  newElemDiv.appendChild(newElemP);
// set the Id of the p-Tag
  var newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = strThanksCommentStyle;
  newElemP.setAttributeNode(newAttrib);
// set the class of the p-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strCommentThanksStyle;
  newElemP.setAttributeNode(newAttrib);
  newElemP.style.display="none";
// add the text
  var newTextNode = objDoc.createTextNode(strThankForComment);
  newElemP.appendChild(newTextNode);
// add the Div
  var newElemDiv2 = objDoc.createElement("Div");
// set the Id of the form
  newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbCommentingForm";
  newElemDiv2.setAttributeNode(newAttrib);
// set the margin
  newElemDiv2.style.margin=0;
// append the Div to the surrounding Div
  newElemDiv.appendChild(newElemDiv2);
// Create the Comment Heading
  newElemP = objDoc.createElement("P");
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = "fbStarRatingLabel";
  newElemP.setAttributeNode(newAttrib);
// add the text
  newTextNode = objDoc.createTextNode(strPleaseCommentTopic);
  newElemP.appendChild(newTextNode);
  newElemDiv2.appendChild(newElemP);
// Add the Textarea
  var newElemTA = objDoc.createElement("Textarea");
  newElemDiv2.appendChild(newElemTA);
// add the name attribute
  newAttrib = objDoc.createAttribute("name");
  newAttrib.nodeValue = "fbComment";
  newElemTA.setAttributeNode(newAttrib);
// add the id attribute
  newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbComment";
  newElemTA.setAttributeNode(newAttrib);
// add the wrap attribute
  newAttrib = objDoc.createAttribute("wrap");
  newAttrib.nodeValue = "hard";
  newElemTA.setAttributeNode(newAttrib);
// add the cols attribute
  newAttrib = objDoc.createAttribute("cols");
  newAttrib.nodeValue = "80";
  newElemTA.setAttributeNode(newAttrib);
// add the rows attribute
  newAttrib = objDoc.createAttribute("rows");
  newAttrib.nodeValue = "5";
  newElemTA.setAttributeNode(newAttrib);
// add the keyup handler
  newElemTA.onkeyup = fbRestrictTextLength;
// add a new paragraph for line break and display of the rest text
  var newElemBr = objDoc.createElement("Br");
  newElemDiv2.appendChild(newElemBr);
// add the span for the opening bracket
  var newElemSpan = objDoc.createElement("Span");
  newElemDiv2.appendChild(newElemSpan);
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strCharactersLeftStyle;
  newElemSpan.setAttributeNode(newAttrib);
// append the span
  newElemDiv2.appendChild(newElemSpan);
// add the empty text
  newTextNode = objDoc.createTextNode("(");
  newElemSpan.appendChild(newTextNode);
// add the span for the counter text
  newElemSpan = objDoc.createElement("Span");
  newElemDiv2.appendChild(newElemSpan);
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strCharactersLeftStyle;
  newElemSpan.setAttributeNode(newAttrib);
// add the text
  newTextNode = objDoc.createTextNode(strCharactersLeft);
  newElemSpan.appendChild(newTextNode);
// add the span for the number
  newElemSpan = objDoc.createElement("Span");
  newElemDiv.appendChild(newElemSpan);
// set the Id of the span-Tag
  newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbComment" + "_CharactersLeft";
  newElemSpan.setAttributeNode(newAttrib);
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strCharactersLeftStyle;
  newElemSpan.setAttributeNode(newAttrib);
// append the span
  newElemDiv2.appendChild(newElemSpan);
// add the empty text
  newTextNode = objDoc.createTextNode(intTxtLength.toString());
  newElemSpan.appendChild(newTextNode);
// add the span for the closing bracket
  var newElemSpan = objDoc.createElement("Span");
  newElemDiv2.appendChild(newElemSpan);
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strCharactersLeftStyle;
  newElemSpan.setAttributeNode(newAttrib);
// append the span
  newElemDiv2.appendChild(newElemSpan);
// add the empty text
  newTextNode = objDoc.createTextNode(")");
  newElemSpan.appendChild(newTextNode);
// add a new paragraph for line break
  newElemP = objDoc.createElement("P");
  newElemDiv2.appendChild(newElemP);
// set the class of the span-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = "tobedefined";
  newElemP.setAttributeNode(newAttrib);
// add the button
  var newElemBtn = objDoc.createElement("Button");
  newElemP.appendChild(newElemBtn);
// set the class of the input-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strSubmitButtonStyle;
  newElemBtn.setAttributeNode(newAttrib);
// set the text of the input-Tag
  newTextNode = objDoc.createTextNode(strSubmitComment);
  newElemBtn.appendChild(newTextNode);
// set the onclick Handler
  newElemBtn.onclick = fbSubmitCommentForm;
// return the create div-tag
  return newElemDiv;
  }

/* ========================================================================================================= */

/* Create the Feedback Area */
function createFeedbackArea(objDoc)
  {
// create the div-Tag for the feedback area.
  var newElemDiv = objDoc.createElement("Div");
// set the Id of the div-Tag
  var newAttrib = objDoc.createAttribute("id");
  newAttrib.nodeValue = "fbContainer";
  newElemDiv.setAttributeNode(newAttrib);
// set the class of the div-Tag
  newAttrib = objDoc.createAttribute("class");
  newAttrib.nodeValue = strFeedbackContainerStyle;
  newElemDiv.setAttributeNode(newAttrib);
// Add the Feedback Rating Area
  var newElemRating = createFeedbackRating(objDoc, "General");
  newElemDiv.appendChild(newElemRating);
// Add the Feedback Text Area
  var newElemText = createFeedbackText(objDoc);
  newElemDiv.appendChild(newElemText);
// Return the Feedback area
  return newElemDiv;
  }

/* ========================================================================================================= */

/* Show and hide the rating stars on mouseover */
function fbRate()
  {
  var contentDoc = window.parent.frames[2].document;
  var starsNumber = parseInt(this.id.substr(this.id.length-1,1));
  var strRateCat = this.id.substr(6,this.id.length-7);
  for (var i = 1; i <= starsNumber; i++)
    {
    contentDoc.getElementById("fbStar" + strRateCat + i).setAttribute("src", strFullStarUrl);
    }
  for (var i = starsNumber + 1; i <= 5; i++)
    {
    contentDoc.getElementById("fbStar" + strRateCat + i).setAttribute("src", strEmptyStarUrl);
    }
    contentDoc.getElementById("fbStarValue" + strRateCat).firstChild.nodeValue = contentDoc.getElementById("fbStar" + strRateCat + starsNumber).getAttribute("title");
  }

/* Resets the stars to initial state on mouseout */
function fbClearStars()
  {
  var contentDoc = window.parent.frames[2].document;
  var starsNumber = parseInt(this.id.substr(this.id.length-1,1));
  var strRateCat = this.id.substr(6,this.id.length-7);
  for (var i = 1; i <= 5; i++)
    {
     contentDoc.getElementById("fbStar" + strRateCat + i).setAttribute("src", strEmptyStarUrl);
    }
    contentDoc.getElementById("fbStarValue" + strRateCat).firstChild.nodeValue = " ";
  }

/* function to submit the rating form */
function fbSubmitRatingForm()
  {
   var contentDoc = window.parent.frames[2].document;
   var strPostBody = getDocumentInfo();
   var strRateCat = this.id.substr(6,this.id.length-7);

// attach the rating and the category
  strPostBody = strPostBody + "Rating=" + this.id.substr(this.id.length-1,1) + "\r\n";
  strPostBody = strPostBody + "RatingCategory=" + strRateCat.toUpperCase() + "\r\n";
  try
    {
     var xmlHttp = new XMLHttpRequest();
     var strSubmitUrl = strSubmitServerUrl;
     xmlHttp.open("POST", strSubmitUrl, true);
     xmlHttp.send(strPostBody);
    }
  catch(e){}
// Replace the Rating with the Result.
  contentDoc.getElementById("fbRatingForm"+strRateCat).style.display = "none";
  contentDoc.getElementById("fbThanks"+strRateCat).style.display = "block";
  contentDoc.getElementById("ratingScore"+strRateCat).firstChild.nodeValue = this.getAttribute("title");
  }

/* function to submit the comment form */
function fbSubmitCommentForm()
  {
   var contentDoc = window.parent.frames[2].document;
   if(contentDoc.getElementById("fbComment").value == "")
     {
      alert(strPleaseCommentFirst);
      return;
     }
   var strPostBody = getDocumentInfo();
// add the textareas content
  strPostBody = strPostBody + "Comment=" + contentDoc.getElementById("fbComment").value;
  try
    {
     var xmlHttp = new XMLHttpRequest();
     var strSubmitUrl = strSubmitServerUrl;
     xmlHttp.open("POST", strSubmitUrl, true);
     xmlHttp.send(strPostBody);
    }
  catch(e){}

// Replace the Comment with the Result.
  contentDoc.getElementById("fbCommentingForm").style.display = "none";
  contentDoc.getElementById("fbThanksComment").style.display = "block";
  }

// Function to retrieve the meta info of the document
function getDocumentInfo()
  {
   var contentDoc = window.parent.frames[2].document;
   var strPostBody = "charset=" + contentDoc.charset + "\r\n";
   strPostBody = strPostBody + "Url=" + contentDoc.URL + "\r\n";
   var strLoioClass = "";

/* handle the Loio separately */
   var strLoio = getLoioOfPage(contentDoc);
   strPostBody = strPostBody + "Loio=" + strLoio + "\r\n";

/* get the meta tags */
  var arrMetaTags = contentDoc.getElementsByTagName("meta");
  for(var i=0; i< arrMetaTags.length; i++)
    {
/* check if name is set */
    if (arrMetaTags[i].getAttribute("name"))
     {
/* attach the LOIO */
/*
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "LOIO_GUID" || arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_LOIO_GUID")
      {strPostBody = strPostBody + "Loio=" + arrMetaTags[i].getAttribute("content") + "\r\n";}
*/
/* attach the Release */
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "RELEASE" || arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_RELEASE")
      {strPostBody = strPostBody + "Release=" + arrMetaTags[i].getAttribute("content") + "\r\n";}
/* attach the IndustryRelease */
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "INDUSTRYRELEASE" || arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_INDUSTRY_RELEASE")
      {strPostBody = strPostBody + "IndustryRelease=" + arrMetaTags[i].getAttribute("content") + "\r\n";}
/* attach the IndustryRelease */
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "APPLICATION" || arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_INDUSTRY")
      {strPostBody = strPostBody + "Application=" + arrMetaTags[i].getAttribute("content") + "\r\n";}
/* attach the Language */
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "LANGUAGE")
      {strPostBody = strPostBody + "Language=" + arrMetaTags[i].getAttribute("content") + "\r\n";}
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_LANGUAGE")
      {strPostBody = strPostBody + "KW_Language=" + arrMetaTags[i].getAttribute("content") + "\r\n";}
/* attach the LOIO class */
    if (arrMetaTags[i].getAttribute("name").toUpperCase() == "SAP.KW_LOIO_CLASS" && strLoioClass=="")
      {strLoioClass=arrMetaTags[i].getAttribute("content");}
     }
    }
  if (strLoioClass==""){strLoioClass="IWB_EXTHLP";}
  strPostBody = strPostBody + "Loio_Class=" + strLoioClass + "\r\n";
  return strPostBody;
  }

/* restrict the length of the comment */
function fbRestrictTextLength()
{
  var contentDoc = window.parent.frames[2].document;
  var intCurrTxtLength = this.value.length;
  var intLengthRest = intTxtLength - intCurrTxtLength;
  if(intLengthRest < 0)
    {
      this.value = this.value.substring(0,intTxtLength);
      intLengthRest = 0;
    }
  var strCommentRestLengthId = this.id + "_CharactersLeft";
  contentDoc.getElementById(strCommentRestLengthId).firstChild.nodeValue = intLengthRest.toString();
}
