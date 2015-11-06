

$(function() {
    $('#showdiv1').click(function() {
        $('div[id^=div]').hide();
        $('#div1').show();
    });
    $('#showdiv2').click(function() {
        $('div[id^=div]').hide();
        $('#div2').show();
        $('#iframe2').attr('src', 'DHTML_Help_administration/frameset.htm');
    });

    $('#showdiv3').click(function() {
        $('div[id^=div]').hide();
        $('#div3').show();
    });
    $('#showdiv4').click(function() {
        $('div[id^=div]').hide();
        $('#iframe2').attr('src', 'DHTML_Help_administration/frameset.htm?search.html');
        $('#div2').show(); 
    });
     $('#showdiv5').click(function() {
        $('div[id^=div]').hide();
        $('#div5').show();
    });

})