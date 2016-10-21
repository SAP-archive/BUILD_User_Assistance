/**
 * Created by I323504 on 18/11/2015.
 */
new Clipboard("#copy");
var textQuote = function(text,time)
{
    this.text = text;
    this.time = time;
    if(text.length>1000)
    {
        this.text = "The text that was entered here has too many characters. The length of the textQuote cannot exceed 250 characters";
    }
};
var textQuotes = [];
var counter =0;
textQuotes[0] = new textQuote("Hi, welcome to the second entry in the  Fiori Developers Guide. " +
    "Keep an eye on this box, as it will display relevant code snippets as the video progresses. ","00:01");
textQuotes[1] = new textQuote("mytext at 30","00:30");
textQuotes[2] = new textQuote("tableSupplierTitleName = Supplier","01:50");
textQuotes[3] = new textQuote('<Text text = "{SupplierName}" />'  ,"02:40");
var times = [];
var x =0;
var currentTime;
var selectedIndex = 0;
var countText = -1;
for(y =0;y<textQuotes.length;y++)
{
    times[y] = convertToSeconds(textQuotes[y].time);
}
var video = document.getElementById("video1");
var player = document.getElementById("player");






function onPlayerReady(event) {
    event.target.playVideo();
    function timeUpdater()
    {
        monitorLoopYT();
    }
    setInterval(timeUpdater,100);

}


























video.ontimeupdate = function()
{
    monitorLoopHTML();
};

function videoListener(textQuote)
{
    var textDisplayed = textQuote.text;
    // $("#copy").attr("data-clipboard-text",$("#codeHolder").html());
    $("#codeHolder").text(textDisplayed);
    $("#hiddenTextArea").text(textDisplayed);
    $("#codeHolder").html(function(index,html)
    {
        return html.replace(new RegExp("&lt;br&gt;","g"), "<br>");
    });
    $("#hiddenTextArea").html(function(index,html)
    {
        return html.replace(new RegExp("&lt;br&gt;","g"), "<br>");
    });
}
function convertToSeconds(time)
{
    var time1 = time;
    var chars = time1.split('');
    var timeInSeconds = (parseInt(chars[0]*600) + parseInt(chars[1]*60) +parseInt(chars[3]*10)+ parseInt(chars[4]));
    return timeInSeconds;
}
$("#toggler").click(
    function() {
        $(".textHolder").slideToggle();
        if ($("#toggler").html() === "Hide Text") {
            $("#toggler").html("Show Text");
        }
        else {
            $("#toggler").html("Hide Text");
        }
    }
);
function bloop()
{
    return textQuotes[1].text;
}

function monitorLoopHTML()
{
    if (currentTime<video.currentTime)
    {
        for(i = 0;i<textQuotes.length;i++)
        {
            if(parseInt(video.currentTime)>times[i]&&i>countText)
            {
                selectedIndex = i;
                x = selectedIndex;
                videoListener(textQuotes[selectedIndex]);
                countText = i;
            }
        }
        currentTime = video.currentTime;
    }
    else
    {
        for(i = 0;i<textQuotes.length;i++)
        {
            if(parseInt(video.currentTime)>times[i])
            {
                selectedIndex = i;
                x = selectedIndex;
                videoListener(textQuotes[selectedIndex]);
                countText = i;
            }
        }
        currentTime = video.currentTime;
    }
}

function monitorLoopYT()
{
    if (currentTime<player.getCurrentTime())
    {
        for(i = 0;i<textQuotes.length;i++)
        {
            if(parseInt(player.getCurrentTime())>times[i]&&i>countText)
            {
                selectedIndex = i;
                x = selectedIndex;
                videoListener(textQuotes[selectedIndex]);
                countText = i;
            }
        }
        currentTime = player.getCurrentTime();
    }
    else
    {
        for(i = 0;i<textQuotes.length;i++)
        {
            if(parseInt(player.getCurrentTime())>times[i])
            {
                selectedIndex = i;
                x = selectedIndex;
                videoListener(textQuotes[selectedIndex]);
                countText = i;
            }
        }
        currentTime = player.getCurrentTime();
    }
}

