
$(function() {
    $('#showdiv1').click(function() {
        $('div[id^=div]').hide();
        $('#div1').show();
    });
    $('#showdiv2').click(function() {
        $('div[id^=div]').hide();
        $('#div2').show();
    });

    $('#showdiv3').click(function() {
        $('div[id^=div]').hide();
        $('#div3').show();
    });

    $('#showdiv4').click(function() {
        $('div[id^=div]').hide();
        $('#div4').show();
    });

})