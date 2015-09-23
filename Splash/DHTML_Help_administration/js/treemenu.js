 /**
 * 2015-05-04 BESTL-6116: Version to support dynamic filtering. Support for optional @class additions, post-regeneration callbacks. To merge, look for this JIRA ID.
 */
/**
 * @version 4 2012-03-16
 * @author  Sergei Troitsky
 * @author  Aleksej Tscherepanow (c5060753)
 * @author  MK (D032118)
 */
// 07.05.2007 - fixed: selection of the item multiply included in a structure
// 29.06.2007 - fixed: accessibility off

//=======================================================================
// Point
//=======================================================================

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Rect(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

//=======================================================================
// BrowserInfo
//=======================================================================

function BrowserInfo(win) {
    this.NN_SCROLLBAR_WIDTH  = 20;
    this.NN_SCROLLBAR_HEIGHT = 20;

    this.m_window = win;

    this.browser  = "";
    this.version  = 0.0;
    this.platform = "";
    this.isIE     = false;
    this.isOP     = false;
    this.isNN6    = false;
    this.isNN     = false;

    var ua = navigator.userAgent;
    do {
        var i = ua.indexOf("MSIE");
        if(i >= 0) {
            this.isIE    = true;
            this.browser = "MSIE";
            this.version = parseFloat(ua.substring(i + 5, i + 9));
            break;
        }
        i = ua.indexOf("Opera/");
        if(i >= 0) {
            this.isOP    = true;
            this.browser = "OP";
            this.version = parseFloat(ua.substring(i + 6, i + 10));
            break;
        }
        i = ua.indexOf("Netscape6/");
        if(i >= 0) {
            this.isNN6   = true;
            this.isNN    = true;
            this.browser = "NN";
            this.version = parseFloat(ua.substring(i + 10, i + 14));
            break;
        }
        i = ua.indexOf("Mozilla/");
        if(i >= 0) {
            this.isNN    = true;
            this.browser = "NN";
            this.version = parseFloat(ua.substring(i + 8, i + 12));
            break;
        }
        if(ua.indexOf("Win" ) >= 0) { this.platform = "Win" ; break; }
        if(ua.indexOf("Mac" ) >= 0) { this.platform = "Mac" ; break; }
        if(ua.indexOf("OS/2") >= 0) { this.platform = "OS/2"; break; }
        if(ua.indexOf("X11" ) >= 0) { this.platform = "UNIX"; break; }
    }
    while(false);

    this.isBodyStyleSheet  = this.isIE && this.version < 5.0;
    this.isMarkTypeImage   = typeof(document.layers) != "undefined";
    this.isMarkTypeBgcolor = !this.isMarkTypeImage;

    this.getElementById    = BrowserInfo_getElementById;
    this.getAnchor         = BrowserInfo_getAnchor;
    this.getCSS            = BrowserInfo_getCSS;
    this.getScrollArea     = BrowserInfo_getScrollArea;
    this.getAnchorPos      = BrowserInfo_getAnchorPos;
    this.go                = BrowserInfo_go;
}

function BrowserInfo_getElementById(id) {
    if((this.isIE && this.version >= 5.5) || (this.isNN && this.version >= 6.0) || (this.isOP)) {
        var obj = this.m_window.document.getElementById(id);
        return typeof(obj) == "undefined" ? null : obj;
    }
    else if(this.isIE) {
        var obj = this.m_window.document.all.item(id);
        return typeof(obj) == "undefined" ? null : obj;
    }
    else if(this.isNN) {
        var obj = this.m_window.document[id];
        return typeof(obj) == "undefined" ? null : obj;
    }
    else {
        return null;
    }
}

function BrowserInfo_getAnchor(id) {
    if(this.isNN || (this.isOP && this.version >= 6.0)) {
	   	var obj = this.m_window.document.getElementById(id);
        return typeof(obj) == "undefined" ? null : obj;
    }
    else { 
        return this.getElementById(id);
    }
}


function BrowserInfo_getCSS(name, def) {
    if(this.isNN) {
        var obj = this.m_window.document.ids[name];
        if(typeof(obj) != "undefined" && obj != null && typeof(obj.color) != "undefined") {
            return obj.color;
        }
    }
    else if(this.isIE) {
        if(this.m_window.document.styleSheets.length != 0) {
            var id = "#" + name;
            var css = this.m_window.document.styleSheets(0);
            for(var i = 0; i < css.rules.length; i++) {
                var rule = css.rules(i);
                if(rule.selectorText == id) {
                    if(typeof(rule.style.color) != "undefined" && rule.style.color != null) {
                        return rule.style.color;
                    }
                    break;
                }
            }
        }
    }
    return def;
}

function BrowserInfo_getScrollArea() {
    if(this.isIE && this.version < 9) {
        var b = this.m_window.document.body;
        return new Rect(b.scrollLeft, b.scrollTop, b.clientWidth, b.clientHeight);
    }
    else if(this.isNN || this.isOP || (this.isIE && this.version >= 9)) { //MJH
        var w      = this.m_window;
        var width  = w.innerWidth ;
        var height = w.innerHeight;
      
   	   if (typeof(this.m_window.scrollbars) !== 'undefined' && typeof (this.m_window.parent.scrollbars) !== 'undefined') {
	      if(this.isNN && this.version < 6.0 && (this.m_window.scrollbars.visible
		        || (typeof(this.m_window.parent) != "undefined" && this.m_window.parent.scrollbars.visible))) {
		            width  -= this.NN_SCROLLBAR_WIDTH ; if(width  < 0) width  = 0;
		            height -= this.NN_SCROLLBAR_HEIGHT; if(height < 0) height = 0;
		        }
		        return new Rect(w.pageXOffset, w.pageYOffset, width, height);
		   	}   
       	else {
	       	return new Rect(0, 0, 0, 0);
	       	}
   }
    else {
        return new Rect(0, 0, 0, 0);
    }
}

function BrowserInfo_getAnchorPos(name) {
    var a = this.getAnchor(name);
    if(a == null) {
        return new Point(0, 0);
    }
    else if(this.isIE || this.isOP || this.isNN) { //MJH
        var x = 0;
        var y = 0;
        for(; a != null; a = a.offsetParent) {
            x += a.offsetLeft;
            y += a.offsetTop;
        }
        return new Point(x, y);
    }
    //else if(this.isNN) { MJH
	  //  console.log(a.offsetTop);
        //return new Point(a.x, a.y);
    //}
    else {
        return new Point(0, 0);
    }
}

function BrowserInfo_go(href, target) {
    if(typeof(target) != "object") {
        window.open(href);
    }
    else if(this.browser.isNN && this.browser.version >= 4.6 && this.browser.version < 6.0) {
        var doc = target.document;
        var color = doc.bgColor;
        doc.open();
        doc.close();
        doc.bgColor = color;
        target.location.replace(href);
    }
    else {
        target.location.href = href;
    }
}

//=======================================================================
// TreeMenuCookie
//=======================================================================

function TreeMenuCookie(window, expire) {
    this.m_read           = TreeMenuCookie_m_read;
    this.m_read2          = TreeMenuCookie_m_read2;
    this.m_trim           = TreeMenuCookie_m_trim;
    this.m_char2bits      = TreeMenuCookie_m_char2bits;
    this.m_bits2char      = TreeMenuCookie_m_bits2char;

    this.m_stateRadix     = 32;
    this.m_stateBits      = 5;
    this.m_stateHEX       = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
    this.m_nameState      = "tmState";
    this.m_nameLevel2     = "tmLvl2";
    this.m_nameMarked     = "tmMrkd";

    this.m_window         = window;
    this.m_expire         = typeof(expire) == "undefined" || isNaN(expire) ? 7*24*60*60*1000 : expire;
    this.m_state          = "";
    var state = this.m_read(this.m_nameState);
    for(var i = 0; i < state.length; i++) {
        this.m_state += this.m_char2bits(state.charAt(i));
    }

    this.getState         = TreeMenuCookie_getState;
    this.setState         = TreeMenuCookie_setState;
    this.setStateOpenAll  = TreeMenuCookie_setStateOpenAll;
    this.setStateCloseAll = TreeMenuCookie_setStateCloseAll;
    this.save             = TreeMenuCookie_save;

    this.level2           = this.m_read(this.m_nameLevel2);
    this.marked           = parseInt(this.m_read(this.m_nameMarked));
    if(isNaN(this.marked)) this.marked = -1;

    this.x_alert          = TreeMenuCookie_x_alert;
    
    this.m_scrollY = "scrY"; //NEW MJH
}

function TreeMenuCookie_save(opts) {
    var saveScroll = true;
	
	if (opts != null)
		saveScroll=opts;
    
		
	var expire = new Date();
    expire.setTime(expire.getTime() + this.m_expire);
    expire = expire.toGMTString();

    //NEW MJH
    var scrY;
    if (this.m_window.gMenu.tm.browser.isIE){
	   	if (this.m_window.gMenu.tm.browser.version == '9'){
				scrY = frames['TreeData'].pageYOffset; //IE9 
		   	  	}
		 else {
				scrY = frames['TreeData'].document.body.scrollTop;	 //earlier
			 }
	}
	else {
		scrY = frames['TreeData'].pageYOffset; //Chrome FF
	}
    var state = "";
    var l = this.m_state.length / this.m_stateBits;
    for(var i = 0; i < l; i++) {
        state += this.m_bits2char(this.m_state.substr(i * this.m_stateBits, this.m_stateBits));
    }

    var doc = this.m_window.document;
    doc.cookie = this.m_nameState  + "=" + state       + "; expires=" + expire;
    doc.cookie = this.m_nameMarked + "=" + this.marked + "; expires=" + expire;
    doc.cookie = this.m_nameLevel2 + "=" + this.level2 + "; expires=" + expire;
    
    //MJH NEW
    if (saveScroll){
   	doc.cookie = this.m_scrollY + "=" + scrY + "; expires=" + expire;

   		}
   }

function TreeMenuCookie_getState(index) {
    if(index < 0 || index >= this.m_state.length) {
        return false;
    }
    else {
        return this.m_state.charAt(index) == "1";
    }
}

function TreeMenuCookie_setState(index, state) {
    if(index >= 0) {
        for(var i = this.m_state.length; i <= index; i++) {
            this.m_state += "0";
        }
        var newState = "";
        if(index > 0) {
            newState = this.m_state.substring(0, index);
        }
        newState += state == true ? "1" : "0";
        if(index + 1 < this.m_state.length) {
            newState += this.m_state.substring(index + 1);
        }
        this.m_state = newState;
    }
}

function TreeMenuCookie_setStateOpenAll(count) {
    var state = "";
    for(count /= 5; count > 0; count--) {
        state += "11111";
    }
    this.m_state = state;
}

function TreeMenuCookie_setStateCloseAll() {
    this.m_state = "";
}

function TreeMenuCookie_m_read(key) {
    var cookie = this.m_window.document.cookie;
    var length = cookie.length;

    var end = 0;
    for(var index = 0; index < length; index = end + 1) {
        end = cookie.indexOf(";", index);
        if(end == -1) {
            end = length;
        }
        var value = this.m_read2(key, cookie.substring(index, end));
        if(value != null) {
            return value;
        }
    }

    return "";
}

function TreeMenuCookie_m_read2(key, str) {
    var eq = str.indexOf("=");
    if(eq == -1) {
        return null;
    }
    else {
        var k = this.m_trim(str.substring(0, eq));
        return k == key ? this.m_trim(str.substring(eq + 1)) : null;
    }
}

function TreeMenuCookie_m_trim(str) {
    for(var i = 0; i < str.length; i++) {
        if(str.charAt(i) != " ") {
            for(var j = str.length - 1; j >= i; j--) {
                if(str.charAt(j) != " ") {
                    return str.substring(i, j + 1);
                }
            }
        }
    }
    return "";
}

function TreeMenuCookie_m_char2bits(ch) {
    var r = "";
    var c = parseInt(ch, this.m_stateRadix);
    if(isNaN(c)) {
        for(var i = 0; i < this.m_stateBits; i++) {
            r += "0";
        }
    }
    else {
        for(var i = 0; i < this.m_stateBits; i++) {
            r = ((c % 2) == 1 ? "1" : "0") + r;
            c >>>= 1;
        }
    }
    return r;
}

function TreeMenuCookie_m_bits2char(bits) {
    for(var i = bits.length; i < this.m_stateBits; i++) {
        bits += "0";
    }
    var r = this.m_stateHEX.charAt(parseInt(bits, 2));
    return r != "" ? r : "0";
}

function TreeMenuCookie_x_alert() {
    var s = this.m_window.document.cookie + "\n\n";
    s += this.m_nameState  + " = '" + this.m_state + "'\n";
    s += this.m_nameLevel2 + " = '" + this.level2  + "'\n";
    s += this.m_nameMarked + " = "  + this.marked  + "\n" ;
    alert(s);
}

//=======================================================================
// TreeMenuBgcolor
//=======================================================================

function TreeMenuBgcolor(level, high, shad) {
    this.level = level;
    this.high  = high ;
    this.shad  = shad ;
}

//=======================================================================
// TreeMenuItem
//=======================================================================

function TreeMenuItem(level, index, parent, state, title) {
    this.level         = level;
    this.index         = index;
    this.parent        = parent;
    this.state         = state;
    this.title         = title;
    this.inode         = -1;
    this.target        = null;
    this.status        = "";
    this.id            = "";
    this.href          = "";
    this.hrefNewWindow = "";
    this.image         = "";
    this.imageOpened   = "";
}

//=======================================================================
// TreeMenu
//=======================================================================

function TreeMenu(treeJSName, treeWindow, cookieWindow, cookieExpire) {
    this.itemGetHref            = TreeMenu_itemGetHref;
    this.itemGetTarget          = TreeMenu_itemGetTarget;
    this.itemGetHrefNewWindow   = TreeMenu_itemGetHrefNewWindow;
    this.itemGo                 = TreeMenu_itemGo;

    this.add                    = TreeMenu_add;
    this.setLevel2              = TreeMenu_setLevel2;
    this.generated              = TreeMenu_generated;
    this.generate               = TreeMenu_generate;
    this.openAll                = TreeMenu_openAll;
    this.closeAll               = TreeMenu_closeAll;
    this.selectNext             = TreeMenu_selectNext;
    this.selectPrev             = TreeMenu_selectPrev;
    this.markItem               = TreeMenu_markItem;
    this.onRegenerateCallback  = TreeMenu_onRegenerateCallback;  /* BESTL-6116 */

    this.onRegenerateCallbackFn = null; /* BESTL-6116 */
    this.dir                    = "ltr"; // | "rtl"
    this.target                 = null;
    this.title                  = "";
    this.stylesheet             = "";
    this.charset                = "";
    this.head                   = "";
    this.checkMenu              = "";


    // MK (D032118): Changed
    this.cls                    = getCssClass();
    // Original: this.cls                    = "";


    this.itemHeight             = "";
    this.tabWidth               = 1;
    this.buttonWidth            = 1;
    this.spaceTabButton         = 0;
    this.spaceButtonImage       = 0;
    this.spaceImageLink         = 0;
    this.spaceSelimageLink      = 0;
    this.bgcolors               = new Array();
    this.bgcolorMarked          = "white";

    this.img1x1                 = new Image();
    this.imgButtonOpened        = new Image();
    this.imgButtonClosed        = new Image();
    this.imgItem                = new Image();
    this.imgItemOpened          = new Image();
    this.imgItemClosed          = new Image();
    this.imgSelectedYes         = new Image();
    this.imgSelectedNo          = new Image();

    this.plainMessage           = "This feature is only supported for Internet Explorer and Netscape 4.";

    this.stsTreeNode            = "Tree Node";
    this.stsDocument            = "Document";
    this.stsExpand              = "Click here to expand the node";
    this.stsCollapse            = "Click here to collapse the node";

    this.a11y                   = false;
    this.a11yEnter              = "Entering navigation tree";
    this.a11yLeave              = "Leaving navigation tree";
    this.a11yLevel              = "Level";
    this.a11yExpanded           = "Expanded";
    this.a11ySelected           = "Selected";

    this.browser                = new BrowserInfo(treeWindow);

    this.a_parents              = new Array();
    this.a_parents[0]           = this;
    this.a_state                = "";

    this.m_markItem             = TreeMenu_m_markItem;
    this.m_getStatus            = TreeMenu_m_getStatus;

    this.m_isPlain              = !(this.browser.isIE || (this.browser.isNN && this.browser.version < 6.0));
    this.m_jsname               = treeJSName;
    this.m_window               = treeWindow;
    this.m_reload               = false;
    this.m_generated            = false;
    this.m_all                  = new Array();
    this.m_ids                  = new Array();
    // c5060753
    this.m_multi_ids            = new Array();
    this.m_index                = 0;
    // c5060753
    this.m_items                = new Array();
    this.m_nodes                = new Array();
    this.m_cookie               = new TreeMenuCookie(
                                  typeof(cookieWindow) != "undefined" ? cookieWindow : treeWindow,
                                  cookieExpire);
    this.m_nameAnchor           = "TMA";
    this.m_nameTd               = "TMT";
    this.m_nameLink             = "TML";
    this.m_nameImageButton      = "TMB";
    this.m_nameImageItem        = "TMI";
    this.m_nameImageSelected    = "TMS";
    this.m_scrollDelta          = 20;
    this.m_xmp                  = false;//true;

    this.g_write                = TreeMenu_g_write;
    this.g_itemLTR              = TreeMenu_g_itemLTR;
    this.g_itemRTL              = TreeMenu_g_itemRTL;

    this.g_write_count          = 1;


    // MK (D032118): Changed
    this.g_a11yimg_tab          = '<img tabindex="';
    // Original: this.g_a11yimg_tab          = '<img border=0 tabindex="';


    this.g_a11yimg_src          = '" src="';
    this.g_a11yimg_idx          = '" name="';
    this.g_a11yimg_alt          = '" alt="';


    // MK (D032118): Changed
    this.g_img_src              = '<img tabindex="-1" src="';
    // Original: this.g_img_src              = '<img tabindex="-1" border=0 src="';


    this.g_eos                  = '" ';
    this.g_eot                  = '\n>';
    this.g_eost                 = '"\n>';

    // MK (D032118): Deleted
    // this.g_anchor               = '<a tabindex="-1" name="' + this.m_nameAnchor;

    this.g_btn_tab              = '<a href="" tabindex="';

    // MK (D032118): Changed
    this.g_btn_over             =   '';
    // Original: this.g_btn_over             =   '" onmouseover="return ' + this.m_jsname + '.n_over(';

    // MK (D032118): Changed
    this.g_btn_out              = '';
    // Original: this.g_btn_out              = ');" onmouseout="return '  + this.m_jsname + '.n_out(';

    // MK (D032118): Changed
    this.g_btn_toggle           = '" onclick="return '     + this.m_jsname + '.n_toggle(';
    // Original: this.g_btn_toggle           = ');" onclick="return '     + this.m_jsname + '.n_toggle(';

    this.g_btn_end              = ');"\n>';

    this.n_over                 = TreeMenu_n_over;
    this.n_out                  = TreeMenu_n_out;
    this.n_toggle               = TreeMenu_n_toggle;

    this.i_over                 = TreeMenu_i_over;
    this.i_out                  = TreeMenu_i_out;
    this.i_click                = TreeMenu_i_click;
    this.i_show                 = TreeMenu_i_show;
    this.i_mark                 = TreeMenu_i_mark;
    this.i_go                   = TreeMenu_i_go;
	this.toggleToC				= TreeMenu_ToC; /*MJH*/   
}

function getCssClass(){
	return frames['TreeData'].document.body.className;
	}

/* BESTL-6116 new addClass argument */
function TreeMenu_add(
    level, state, id, title, href, target, hrefNewWindow, image, imageOpened, status, addClass
) {

    var parent = this.a_parents[level];
	
        if(typeof(parent) == "undefined") {
        return null;
    }

    if(typeof(parent.m_items) == "undefined") {
        var inode = this.m_nodes.length;
        this.m_nodes[inode] = parent;
        this.a_state += parent.state == 1 ? "1" : "0";
        parent.inode = inode;
        parent.m_items = new Array();
    }

    var parIndex = parent.m_items.length;
    var allIndex = this.m_all.length;
    var item     = new TreeMenuItem(level, allIndex, parent, state, title);
    item.target  = target;
    item.addClass = addClass; /* BESTL-6116 */

    if(typeof(id) != "undefined" && id != null && id != "") {
        item.id = id;
        // c5060753
        var m_ids_item = this.m_ids[id];
        if(typeof(m_ids_item) != "undefined") {
            this.m_multi_ids[m_ids_item.index] = m_ids_item;
            this.m_multi_ids[item.index] = item;
        }
        this.m_ids[id] = item;
        // c5060753
    }

    if(typeof(href         ) == "string") item.href          = href         ;
    if(typeof(hrefNewWindow) == "string") item.hrefNewWindow = hrefNewWindow;
    if(typeof(image        ) == "string") item.image         = image        ;
    if(typeof(imageOpened  ) == "string") item.imageOpened   = imageOpened  ;
    if(typeof(status       ) == "string") item.status        = status       ;

    parent.m_items[parIndex ] = item;
    this.a_parents[level + 1] = item;
    this.m_all    [allIndex ] = item;

    return item;
}

function TreeMenu_generated() {
    return this.m_generated;
}

function TreeMenu_setLevel2(id) {
    this.m_cookie.level2 = id;
    this.m_cookie.save();
    if(this.generated()) {
        this.m_generated = false;
        this.generate();
        this.m_generated = true;
    }
}

function TreeMenu_markItem(id) {
    if(this.generated()) {
        this.m_markItem(id);
    }
    else {
        this.m_window.setTimeout(this.m_jsname + ".markItem('" + id + "')", 500);
    }
}

/* BESTL-6116 */
function TreeMenu_onRegenerateCallback(callbackFunction) {
    this.onRegenerateCallbackFn = callbackFunction;
}

function TreeMenu_openAll() {
    if(this.m_isPlain) {
        alert(this.plainMessage);
    }
    else if(this.generated()) {
        this.m_generated = false;
        this.m_cookie.setStateOpenAll(this.m_nodes.length);
        this.m_cookie.save(false);
        this.generate("open all");

        //this.i_show(this.m_cookie.marked);
        var sa = this.browser.getScrollArea();

        // MK (D032118): Changed
        var ap = this.browser.getAnchorPos(this.m_nameLink + this.m_cookie.marked);
        // Original: var ap = this.browser.getAnchorPos(this.m_nameAnchor + this.m_cookie.marked);

        if(ap.y - this.m_scrollDelta < sa.y) {
            this.m_window.scrollTo(sa.x, ap.y - this.m_scrollDelta);
        }
        else if(ap.y >= sa.y + sa.h) {
	        this.m_window.scrollTo(sa.x, ap.y - sa.h + this.m_scrollDelta);
        }

        this.m_generated = true;
    }
}

function TreeMenu_closeAll() {
    if(this.m_isPlain) {
        alert(this.plainMessage);
    }
    else if(this.generated()) {
        this.m_generated = false;
        this.m_cookie.setStateCloseAll();
        this.m_cookie.save(false);
        this.generate("close all");
        this.m_generated = true;
    }
}

function TreeMenu_selectNext() {

    if(this.generated()) {
        this.m_generated = false;
        var length = this.m_all.length;
        var marked = this.m_cookie.marked;
        var next   = marked == -1 ? 0 : marked + 1;
        if(length != 0) {
            while(next < length && this.itemGetHref(this.m_all[next]) == "") {
                next++;
            }
            if(next < length) {
                this.i_show(next);
                var a = this.browser.getAnchor(this.m_nameLink + next);
                if(a != null) {
	              this.i_go(next, a);
                }
            }
        }
        this.m_generated = true;
    }
}

function TreeMenu_selectPrev() {
    if(this.generated()) {
        this.m_generated = false;
        var length = this.m_all.length;
        var marked = this.m_cookie.marked;
        var prev   = marked == -1 ? length - 1 : marked - 1;
        if(length != 0) {
            while(prev >= 0 && this.itemGetHref(this.m_all[prev]) == "") {
                prev--;
            }
            if(prev >= 0) {
                this.i_show(prev);
                var a = this.browser.getAnchor(this.m_nameLink + prev);
                if(a != null) {
                    this.i_go(prev, a);
                }
            }
        }
        this.m_generated = true;
    }
}

function TreeMenu_m_markItem(id) {
    if(this.generated()) {
        this.m_generated = false;
        // c5060753
        for(var i=0; i < this.m_multi_ids.length; i++) {
            var item = this.m_multi_ids[i];
            if(typeof(item) != "undefined" && item.id == id) {
                var act_item = this.m_ids[id];
                if(this.m_index == item.index && this.m_index != act_item.index) {
                    this.m_ids[id] = item;
                }
            }
        }
        // c5060753
        var item = this.m_ids[id];
        if(typeof(item) != "undefined") {
            this.i_show(item.index);
        }
        this.m_generated = true;
    }
}

function TreeMenu_m_getStatus(item, marked) {
    // c5060753
    if(!this.a11y) {
        return "";
    }
    // c5060753
    var inode  = item.inode;


    // MK (D032118): Changed
                 var status = this.a11yLevel + ' ' + (item.level + 1) + ': ';
    // Original: var status = this.a11yLevel + ' ' + (item.level + 1) + ' ';


    if(inode == -1) {
        status += item.status == '' ? this.stsDocument : item.status;
        status += ' ' + item.title;
        if(marked) {
            status += '. ' + this.a11ySelected;
        }
    }
    else if(this.m_isPlain) {
        status += this.stsTreeNode + ' ' + item.title;
        if(marked) {
            status += '. ' + this.a11ySelected;
        }
    }
    else {
        status += this.stsTreeNode + ' ' + item.title;
        if(marked) {
            status += '. ' + this.a11ySelected;
        }
        if(this.m_cookie.getState(inode)) {
            status += '. ' + this.a11yExpanded + '. ' + this.stsCollapse;
        }
        else {
            status += '. ' + this.stsExpand;
        }
    }
    return status;
}

//=======================================================================
// TreeMenu::item
//=======================================================================

function TreeMenu_itemGetHref(item) {
    return item.href;
}

function TreeMenu_itemGetTarget(item) {
    return item.target != null ? item.target : this.target;
}

function TreeMenu_itemGetHrefNewWindow(item) {
    return item.hrefNewWindow != "" ? item.hrefNewWindow : item.href;
}

function TreeMenu_itemGo(item) {
    var href   = this.itemGetHref  (item);
    var target = this.itemGetTarget(item);
    this.browser.go(href, target);
}

//=======================================================================
// TreeMenu::generate
//=======================================================================

/* BESTL-6116 Refactoring of regeneration to support optional @class addition to <tr> */
function TreeMenu_item_tr(item) {
   var trClass = "";
   if (typeof(item.addClass) != "undefined" && item.addClass != null && item.addClass != "") {
       trClass = " class=\"" + item.addClass + "\" ";
   }
   return "<tr" + trClass + ">";
}

function TreeMenu_generate(method) {

    /*
     * init
     */

    this.t_init = new Date(); //t??

    if(!this.m_reload) {
        if(this.m_isPlain) {
            method = 'open all';
            this.m_cookie.setStateOpenAll(this.m_nodes.length);
            this.m_cookie.save();
        }
        else if(this.m_cookie.m_state == '') {
            this.m_cookie.m_state = this.a_state;
            this.m_cookie.save();
        }

        this.g_startLevel = 0;
        this.g_maxLevel   = this.bgcolors.length - 1;
        this.g_level2     = this.m_cookie.level2 == '' ? null : this.m_ids[this.m_cookie.level2];
        if(typeof(this.g_level2) == 'undefined') {
            this.g_level2 = null;
        }
        if(this.g_maxLevel != -1 && this.g_level2 != null) {
            this.g_startLevel = this.g_level2.level;
        }

        this.g_itemHeight = this.itemHeight != '' ? ' height="' + this.itemHeight + '"' : '';
        this.g_cls        = this.cls == '' ? '' : ' class="' + this.cls + '"';


        // MK (D032118): Changed
        this.g_space_1    = '<img tabindex="-1" src="' + this.img1x1.src + '" width="';
        // Original: this.g_space_1    = '<img tabindex="-1" border=0 src="' + this.img1x1.src + '" width=';


        // MK (D032118): Changed
        this.g_space_2    = '" height="1"\n>';
        // Original: this.g_space_2    = ' height=1\n>';


        // MK (D032118): Changed
        /* BESTL-6116 Refactoring of regeneration to support optional @class addition to <tr> */
        this.g_item_id    = '<td ' + this.g_itemHeight + ' id="' + this.m_nameTd;
        // Original: this.g_item_id    = '<tr><td nowrap align="left"' + this.g_cls + this.g_itemHeight + ' id="' + this.m_nameTd;


        this.g_imgSelNo   = this.g_img_src + this.imgSelectedNo.src + '" name="' + this.m_nameImageSelected;


        // MK (D032118): Changed
        this.g_bgcolor_1  = '';
        // Original: this.g_bgcolor_1  = '<tr><td height=1 bgcolor="';


        // MK (D032118): Changed
        this.g_bgcolor_2  = '';
        // Original: this.g_bgcolor_2  = '"><img tabindex="-1" border=0 src="' + this.img1x1.src + '"></td></tr\n>';


        // MK (D032118): Changed
        this.g_link_tab   = '<a tabindex="';
        // Original: this.g_link_tab   = '<a' + this.g_cls + ' tabindex="';


        this.g_link_name  = '" name="' + this.m_nameLink;
        // MK (D032118): Changed
        this.g_link_href  = '" target="SAP_TEXT" href="';
        // Original: this.g_link_href  = '" href="';
        // MK (D032118): Changed
        this.g_link_over  = '' ;
        // Original: this.g_link_over  =        '" onmouseover="return ' + this.m_jsname + '.i_over(' ;
        // MK (D032118): Changed
                     this.g_link_out   = ''  ;
        // Original: this.g_link_out   = ',this);" onmouseout="return '  + this.m_jsname + '.i_out('  ;
        // MK (D032118): Changed
                     this.g_link_click = '" onclick="return '       + this.m_jsname + '.i_click(';
        // Original: this.g_link_click = ');" onclick="return '     + this.m_jsname + '.i_click(';
        this.g_link_end   = ',this,event);"\n>';
    }

    /*
     * calc max level
     */

    if(this.g_maxLevel != -1) {
        this.g_maxLevel = this.bgcolors.length - 1;
        if(this.g_level2 == null) {
            var items  = this.m_all;
            var length = items.length;
            if(method == 'open all') {
                for(var index = 0; index < length; index++) {
                    var level = items[index].level;
                    if(level > this.g_maxLevel) {
                        this.g_maxLevel = level;
                    }
                }
            }
            else if(method != 'close all') {
                var lastLevel = -1;
                var visible   = true;
                for(var index = 0; index < length; index++) {
                    var item  = items[index];
                    var level = item.level;
                    if(level <= lastLevel) {
                        lastLevel = level;
                        inode     = item.inode;
                        visible   = inode != -1 && this.m_cookie.getState(inode);
                    }
                    else if(level > lastLevel && visible) {
                        lastLevel = level;
                        inode     = item.inode;
                        visible   = inode != -1 && this.m_cookie.getState(inode);
                        if(lastLevel > this.g_maxLevel) {
                            this.g_maxLevel = lastLevel;
                        }
                    }
                }
            }
        }
        else {
            var items       = this.m_all;
            var length      = items.length;
            var level2level = this.g_level2.level;
            if(method == 'open all') {
                for(var index = this.g_level2.index; index < length; index++) {
                    var level = items[index].level - level2level; if(level <= 0) break;
                    if(level > this.g_maxLevel) {
                        this.g_maxLevel = level;
                    }
                }
            }
            else if(method != 'close all') {
                var lastLevel = -1;
                var inode     = this.g_level2.inode;
                var visible   = inode != -1 && this.m_cookie.getState(inode);
                for(var index = this.g_level2.index; index < length; index++) {
                    var item  = items[index];
                    var level = item.level - level2level; if(level <= 0) break;
                    if(level <= lastLevel) {
                        lastLevel = level;
                        inode     = item.inode;
                        visible   = inode != -1 && this.m_cookie.getState(inode);
                    }
                    else if(level > lastLevel && visible) {
                        lastLevel = level;
                        inode     = item.inode;
                        visible   = inode != -1 && this.m_cookie.getState(inode);
                        if(lastLevel > this.g_maxLevel) {
                            this.g_maxLevel = lastLevel;
                        }
                    }
                }
            }
        }
    }

    this.g_write_index = this.g_write_count;
    this.g_lastLevel   = 0;
    this.g_html        = '';
    this.g_tabindex    = 1;
    this.g_document    = this.m_window.document;
    this.g_document.open();

    /*
     * header
     */

    this.t_header = new Date(); //t??
    var html = '';

    if(this.m_reload) {
        // MK (D032118): Changed
        html =  '<html dir="' + this.dir + '"><head><title>' + this.title + '</title>\n';
        // Original: html =  '<html><head><title>' + this.title + '</title>\n';
        html += '<meta http-equiv="Cache-Control" content="no-cache">\n';
        html += '<meta http-equiv="Pragma" content="no-cache">\n';
        html += '<meta http-equiv="Expires" content="0">\n';

        if(this.charset != '') {
            html += '<meta http-equiv="Content-Type" content="text/html; charset=' + this.charset + '">\n';
        }

        // The <LINK REL=STYLESHEET> does not work inside <HEAD> for IE 4.*
        // (in case of regenerated /document.open(), write(), close()/ html page)
        // But for Netscape it's important to place LINK tag inside HEAD section.
        if(this.stylesheet != '' && !this.browser.isBodyStyleSheet) {
            html += '<link rel="stylesheet" href="' + this.stylesheet + '" type="text/css">\n';
        }

        html += this.head;
        html += '</head><body' + this.g_cls + '>\n';

        // The <LINK REL=STYLESHEET> does not work inside <HEAD> for IE 4.*
        // (in case of regenerated /document.open(), write(), close()/ html page)
        if(this.stylesheet != '' && this.browser.isBodyStyleSheet) {
            html += '<link rel="stylesheet" href="' + this.stylesheet + '" type="text/css">\n';
        }
    }

    if(this.m_xmp) {
        html += '<xmp>\n';
    }


    // MK (D032118): Deleted
    // if(this.a11y) {
    //     html += this.g_a11yimg_tab; html += this.g_tabindex; this.g_tabindex++;
    //     html += this.g_a11yimg_src; html += this.img1x1.src;
    //     html += this.g_a11yimg_alt; html += this.a11yEnter;
    //     html += this.g_eost;
    // }


    // MK (D032118): Changed
    html += '<table width="100%"\n>';
    // Original: html += '<table width="100%" border=0 cellpadding=0 cellspacing=0\n>';


    this.g_write(html);

    /*
     * body
     */

    this.t_body = new Date(); //t??
    // MK (D032118): Changed
    if(this.dir == 'ltr' || this.dir == 'rtl') {
    // Original: if(this.dir == 'ltr') {
        if(this.g_level2 == null) {
            if(method == 'close all') {
                var items  = this.m_items;
                var length = items.length;
                for(var index = 0; index < length; index++) {
                    this.g_itemLTR(items[index], false);
                }
            }
            else if(method == 'open all') {
                var items  = this.m_all;
                var length = items.length;
                for(var index = 0; index < length; index++) {
                    this.g_itemLTR(items[index], true);
                }
            }
            else {
                var items     = this.m_all;
                var length    = items.length;
                var lastLevel = -1;
                var inode     = -1;
                var visible   = true;
                for(var index = 0; index < length; index++) {
                    var item  = items[index];
                    var level = item.level;
                    if(level < lastLevel) {
                        inode   = item.inode;
                        visible = inode != -1 && this.m_cookie.getState(inode);
                        this.g_itemLTR(item, visible);
                        lastLevel = level;
                    }
                    else if(level == lastLevel) {
                        inode   = item.inode;
                        visible = inode != -1 && this.m_cookie.getState(inode);
                        this.g_itemLTR(item, visible);
                    }
                    else if(level > lastLevel && visible) {
                        inode   = item.inode;
                        visible = inode != -1 && this.m_cookie.getState(inode);
                        this.g_itemLTR(item, visible);
                        lastLevel = level;
                    }
                }
            }
        }
        else {
            if(method == 'close all') {
                this.g_itemLTR(this.g_level2, false);
            }
            else if(method == 'open all') {
                var items       = this.m_all;
                var length      = items.length;
                var level2level = this.g_level2.level;
                for(var index = this.g_level2.index; index < length; index++) {
                    var item  = items[index]; if(item.level <= level2level) break;
                    this.g_itemLTR(item, true);
                }
            }
            else {
                var items       = this.m_all;
                var length      = items.length;
                var level2level = this.g_level2.level;
                var lastLevel   = level2level;
                var inode       = this.g_level2.inode;
                var visible     = inode != -1 && this.m_cookie.getState(inode);
                for(var index = this.g_level2.index; index < length; index++) {
                    var item  = items[index];
                    var level = item.level; if(level <= level2level) break;
                    if(level < lastLevel) {
                        inode   = item.inode;
                        visible = inode != -1 && this.m_cookie.getState(inode);
                        this.g_itemLTR(item, visible);
                        lastLevel = level;
                    }
                    else if(level == lastlevel) {
                        inode   = item.inode;
                        visible = inode != -1 && this.m_cookie.getState(inode);
                        this.g_itemLTR(item, visible);
                    }
                    else if(level > lastLevel && visible) {
                        inode   = item.inode;
                        visible = inode != -1 && this.m_cookie.getState(inode);
                        this.g_itemLTR(item, visible);
                        lastLevel = level;
                    }
                }
            }
        }
    }
    else {
        //todo
    }

    /*
     * footer
     */

    this.t_footer = new Date(); //t??
    html = '</table>\n';


    // MK (D032118): Deleted
    // if(this.a11y) {
    //     html += this.g_a11yimg_tab; html += this.g_tabindex; this.g_tabindex++;
    //     html += this.g_a11yimg_src; html += this.img1x1.src;
    //     html += this.g_a11yimg_alt; html += this.a11yLeave;
    //     html += this.g_eost;
    // }

    if(this.m_xmp) {	
        html += '</xmp>\n';
    }

    if(this.m_reload) {
        html += '</body>\n';
        html += '<script language=JavaScript>\n';
        html += this.checkMenu;
        html += '{if(' + this.m_jsname + '.generated()) {\n';
        html += '  ' + this.m_jsname + '.m_cookie.m_state = "' + this.m_cookie.m_state + '";\n';
        html += '  ' + this.m_jsname + '.m_cookie.save();\n';
        html += '}}\n';
        html += '</script>\n';
        html += '</html>';
    }

    this.g_write(html);

     //NEW: MH (I818670)

     //if (!this.browser.isIE){
 	    
	     if (!this.m_generated){
		    
		var scrollMe = readCookie("scrY");
	   frames['TreeData'].scrollTo(0,scrollMe);
	    }
	//}
    
    /*
     * term
     */

    this.t_term = new Date(); //t??
    this.g_document.write(this.g_html);
    this.g_document.close();
    /* BESTL-6116 support post-regeneration callback */
    // Fire the onRegenerateCallback function if there is one
    // installed, passing the document to which the tree was written.
    if(this.m_reload) {
       if (typeof this.onRegenerateCallbackFn == "function") {
           this.onRegenerateCallbackFn(this.g_document);
       }
    }
    this.g_document = null;
    this.g_html     = '';
    this.t_end = new Date(); //t??

    if(!this.m_reload) {
        this.m_reload    = true;
        this.m_generated = true;
    }

    if(this.m_cookie.marked != -1) {
        this.i_mark(this.m_cookie.marked);
    }
}

function TreeMenu_g_write(html) {
    if(this.g_write_index == 1) {
        this.g_document.write(html);
    }
    else {
        this.g_write_index--;
        if(this.g_write_index > 0) {
            this.g_html += html;
        }
        else {
            this.g_document.write(this.g_html);
            this.g_document.write(html);
            this.g_write_index = this.g_write_count;
            this.g_html = '';
        }
    }
}

function TreeMenu_g_itemLTR(item, state) {

    /*
     * start
     */

    var html  = '';
    var level = item.level - this.g_startLevel;
    var index = item.index;
    var inode = item.inode;

    /*
     * bgcolor
     */

    if(this.g_maxLevel == -1) {
        var bgcolor = 'white';
    }
    else {
        var cLevel = level - (this.g_maxLevel - this.bgcolors.length + 1);
        var lLevel = this.g_lastLevel - (this.g_maxLevel - this.bgcolors.length + 1);

        if(cLevel < 0) cLevel = 0;
        if(lLevel < 0) lLevel = 0;

        if(cLevel != lLevel) {
            var bgcolor = this.bgcolors[cLevel];
            bgcolor = cLevel > lLevel ? bgcolor.shad : bgcolor.high;


            // MK (D032118): Changed
            html += this.g_bgcolor_1;
            // Original: html += this.g_bgcolor_1 + bgcolor + this.g_bgcolor_2;


        }
        else if(level != this.g_lastLevel) {
            var bgcolor = this.bgcolors[0];


            // MK (D032118): Changed
            html += this.g_bgcolor_1;
            // Original: html += this.g_bgcolor_1 + bgcolor.shad + this.g_bgcolor_2;


            // MK (D032118): Changed
            html += this.g_bgcolor_1;
            // Original: html += this.g_bgcolor_1 + bgcolor.high + this.g_bgcolor_2;


        }

        this.g_lastLevel = level;
        var bgcolor = this.bgcolors[cLevel].level;
    }

    //item.m_bgcolor = bgcolor;

    /*
     * start item
     */


    // MK (D032118): Changed
    /* BESTL-6116 Refactoring of regeneration to support optional @class addition to <tr> */
    html += TreeMenu_item_tr(item) + this.g_item_id + index + '" class="treeLevel' + item.level + '" bgcolor="' + bgcolor + '"\n>';
    // ORIGINAL: html += this.g_item_id + index + '" bgcolor="' + bgcolor + '"\n>';


    // MK (D032118): Deleted
    // html += this.g_anchor + index + '"\n>';
    // Update of the navigation tree is now done via "TML" instead of "TMA"

    /*
     * tab
     */

    var width = level * (this.tabWidth + this.spaceTabButton);
    if(width != 0) {
        html += this.g_space_1 + width + this.g_space_2;
    }

    /*
     * button & image
     */

    var a11y = this.m_getStatus(item, false);
    if(inode == -1) {
        var width = this.buttonWidth + this.spaceButtonImage;
        if(width != 0) {
            html += this.g_space_1 + width + this.g_space_2;
        }

        var src = item.image != '' ? item.image : this.imgItem.src;
        html += this.g_a11yimg_tab; html += this.g_tabindex; this.g_tabindex++;
        html += this.g_a11yimg_src; html += src;


        // MK (D032118): New
        html += '" title="' + a11y;
        // END new.


        html += this.g_a11yimg_idx; html += this.m_nameImageItem + index;
		


        // MK (D032118): Deleted
        // html += this.g_a11yimg_alt; html += a11y;


        html += this.g_eost;
    }
    else {
        if(!this.m_isPlain) {
            html += this.g_btn_tab   ; html += '-1';

            // MK (D032118): Deleted
            // html += this.g_btn_over  ; html += inode;
            // html += this.g_btn_out   ; html += inode;

            // MK (D032118): New
            html += '" title="' + a11y;
            // END new.

            html += this.g_btn_toggle; html += inode;
            html += this.g_btn_end;
        }

        var buttonSrc = state ? this.imgButtonOpened.src : this.imgButtonClosed.src;
        html += this.g_a11yimg_tab; html += '-1';
        html += this.g_a11yimg_src; html += buttonSrc;
        html += this.g_a11yimg_idx; html += this.m_nameImageButton + index;

       
        // MK (D032118): Deleted
        // html += this.g_a11yimg_alt; html += a11y;


        html += this.g_eost;

        if(this.spaceButtonImage != 0) {
            html += this.g_space_1 + this.spaceButtonImage + this.g_space_2;
        }

        if(item.image != '') {
            var imageSrc = state && item.imageOpened != '' ? item.imageOpened : item.image;
        }
        else {
            var imageSrc = state ? this.imgItemOpened.src : this.imgItemClosed.src;
        }
        html += this.g_a11yimg_tab; html += this.g_tabindex; this.g_tabindex++;
        html += this.g_a11yimg_src; html += imageSrc;
        html += this.g_a11yimg_idx; html += this.m_nameImageItem + index;


        // MK (D032118): Deleted
        // html += this.g_a11yimg_alt; html += a11y;


        html += this.g_eost;

        if(!this.m_isPlain) {
            html += '</a\n>';
        }
    }

    /*
     * space between image and link
     */

    if(this.spaceImageLink != 0) {
        html += this.g_space_1 + this.spaceImageLink + this.g_space_2;
    }

    /*
     * (non)selected image
     */

    if(this.browser.isMarkTypeImage) {
        html += this.g_imgSelNo + index + this.g_eost;
        if(this.spaceSelimageLink != 0) {
            html += this.g_space_1 + this.spaceSelimageLink + this.g_space_2;
        }
    }

    /*
     * link
     */

    html += this.g_link_tab  ; html += this.g_tabindex; this.g_tabindex++;
    html += this.g_link_name ; html += index;

    html += "\"id=\"TML" + index + ""; //mh
    
    // MK (D032118): New
    html += '" title="' + item.title;

    html += this.g_link_href ; html += this.itemGetHrefNewWindow(item);

    // MK (D032118): Deleted
    // html += this.g_link_over ; html += index;
    // html += this.g_link_out  ; html += index;

    html += this.g_link_click; html += index;
    html += this.g_link_end;
    html += item.title;
    html += '</a\n>';

    /*
     * end
     */

    html += '</td></tr>\n';
    this.g_write(html);
}

function TreeMenu_g_itemRTL(item, state) {
    //todo
}

//=======================================================================
// TreeMenu::n_
//=======================================================================

function TreeMenu_n_over(inode) {
    // c5060753
    if(this.a11y) {
  this.m_window.status = this.m_cookie.getState(inode) ? this.stsCollapse : this.stsExpand;
    } else {
      this.m_window.status = "";
    }
    // c5060753
    return true;
}

function TreeMenu_n_out(inode) {
    this.m_window.status = '';
    return true;
}

function TreeMenu_n_toggle(inode) {
    if(this.generated()) {
        this.m_generated = false;

        var sa = this.browser.getScrollArea();
        this.m_cookie.setState(inode, !this.m_cookie.getState(inode));
        this.m_cookie.save();
        this.generate();
        if(sa.x != 0 || sa.y != 0) {
	        this.m_window.scrollTo(sa.x, sa.y);
        }

        if(this.browser.isIE && this.browser.version >= 5.0) {
            var item = this.m_nodes[inode];
            if(typeof(item) != 'undefined') {
                var tag = this.browser.getElementById(this.m_nameImageItem + item.index);
                if(tag != null) {
                    tag.focus();
                }
            }
        }

        this.m_generated = true;
    }
    return false;
}

//=======================================================================
// TreeMenu::i_
//=======================================================================

function TreeMenu_i_over(index, a) {
    var item = this.m_all[index];
    if(typeof(item) != 'undefined') {
        var status = item.status != '' ? item.status :
                     item.inode != -1 ? this.stsTreeNode : this.stsDocument;
    // c5060753
        if(this.a11y) {
          this.m_window.status = status + ' ' + item.title;
        } else {
          this.m_window.status = item.title;
        }
    }
    // c5060753
    return true;
}

function TreeMenu_i_out(index) {
    this.m_window.status = '';
    return true;
}

function TreeMenu_i_click(index, a, e) {
    if(this.generated()) {
        if(!this.browser.isNN || this.browser.version < 6.0 || e.which != 3) {
            // c5060753
            this.m_index = index;
            // c5060753
            this.m_generated = false;
            this.i_mark(index);
            this.i_go(index, a);
            this.m_generated = true;
        }
    }
    return false;
}

function TreeMenu_i_show(index) {
    var allLength = this.m_all.length;
    if(index < 0 || index >= allLength) {
        return;
    }

    var item = this.m_all[index];
    var itemVisible = true;
    for(var itemParent = item.parent; itemParent != this; itemParent = itemParent.parent) {
        itemVisible = this.m_cookie.getState(itemParent.inode);
        if(!itemVisible) {
            break;
        }
    }

    var marked = this.m_cookie.marked;
    var markedVisible = false;
    if(marked > 0 && marked < allLength) {
        markedVisible = true;
        for(var markedParent = this.m_all[marked].parent; markedParent != this; markedParent = markedParent.parent) {
            markedVisible = this.m_cookie.getState(markedParent.inode);
            if(!markedVisible) {
                break;
            }
        }
    }

    var sa = this.browser.getScrollArea();
    // MK (D032118): Changed
    var mp = markedVisible ? this.browser.getAnchorPos(this.m_nameLink + marked) : new Point(0, 0);
    // Original: var mp = markedVisible ? this.browser.getAnchorPos(this.m_nameAnchor + marked) : new Point(0, 0);


    if(itemVisible) {
        this.i_mark(index);
    }
    else {
        for(; itemParent != this; itemParent = itemParent.parent) {
            this.m_cookie.setState(itemParent.inode, true);
        }
        this.m_cookie.save();

        this.m_cookie.marked = index;
        this.m_cookie.save();

        this.generate();

        if(!markedVisible || mp.y - this.m_scrollDelta < sa.y || mp.y >= sa.y + sa.h) {
            // MK (D032118): Changed
            var ap = this.browser.getAnchorPos(this.m_nameLink + index);
            // Original var ap = this.browser.getAnchorPos(this.m_nameAnchor + index);
               this.m_window.scrollTo(sa.x, ap.y - sa.h / 2);
        }
        else {
	        this.m_window.scrollTo(sa.x, sa.y);
            itemVisible = true;
        }
    }

    if(itemVisible) {
        // MK (D032118): Changed
        var ap = this.browser.getAnchorPos(this.m_nameLink + index);
        // Original: var ap = this.browser.getAnchorPos(this.m_nameAnchor + index);
        if(ap.y - this.m_scrollDelta < sa.y) {

	       this.m_window.scrollTo(sa.x, ap.y - this.m_scrollDelta);  
	       //this.m_window.scrollTo(sa.x, readCookie("scrY")); 
	    
        }
        else if(ap.y >= sa.y + sa.h) {
	        this.m_window.scrollTo(sa.x, ap.y - sa.h + this.m_scrollDelta);
        }
    }
}

function TreeMenu_i_mark(index) {
    var marked = this.m_cookie.marked;
    var markedItem = marked == -1 ? null : this.m_all[marked];
    var item = this.m_all[index];
    var tag = null;

    if(marked != -1 && typeof(markedItem) != 'undefined') {
        var alt = this.m_getStatus(markedItem, false);
        tag = this.browser.getElementById(this.m_nameImageButton + marked);
        if(tag != null) {
            tag.alt = alt;
        }
        tag = this.browser.getElementById(this.m_nameImageItem + marked);
        if(tag != null) {
            tag.alt = alt;
        }
    }

    if(this.browser.isMarkTypeBgcolor) {
        if(marked != -1 && typeof(markedItem) != 'undefined') {
            //MH (I818670) : Changed
	        tag = frames['TreeData'].document.getElementById(this.m_nameTd + marked);
             if(tag != null) {
                if (tag.className.match(/(?:^|\s)selected(?!\S)/)) {
	                tag.className=tag.className.replace( /(?:^|\s)selected(?!\S)/g , '' );
	                }	            
	            //tag.style.backgroundColor = markedItem.m_bgcolor;
            }
        }

        //MH (I818670) : Changed
        tag = frames['TreeData'].document.getElementById(this.m_nameTd + index);
        if(tag != null) {
	       	tag.className += " selected";
	         //tag.style.backgroundColor = this.bgcolorMarked;
           
        }
    }
    else {
        if(marked != -1) {
            tag = this.browser.getElementById(this.m_nameImageSelected + marked);
            if(tag != null) {
                tag.src = this.imgSelectedNo.src;
            }
        }

        tag = this.browser.getElementById(this.m_nameImageSelected + index);
        if(tag != null) {
            tag.src = this.imgSelectedYes.src;
        }
    }

    if(typeof(item) != 'undefined') {
        var alt = this.m_getStatus(item, true);
        tag = this.browser.getElementById(this.m_nameImageButton + index);
        if(tag != null) {
            tag.alt = alt;
        }
        tag = this.browser.getElementById(this.m_nameImageItem + index);
        if(tag != null) {
            tag.alt = alt;
        }
    }

    this.m_cookie.marked = typeof(item) == 'undefined' ? -1 : index;
    this.m_cookie.save();
}

function TreeMenu_i_go(index, a) {
    var item = this.m_all[index];
    if(typeof(item) != 'undefined') {
        if(item.href != '') {
            this.itemGo(item);
        }
        this.i_over(index, a);//??
    }
}

//NEW: MH (I818670)
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return "";
}
function TreeMenu_ToC(minText, expandText){
	 var treeFrame = parent.document.getElementById('tree_frameset');
	 var treeCtrlFrame = window.frames[0];
	 var treeDataFrame = window.frames[1];
	 var treeSubFrame = parent.window.frames[1].document.getElementById('sub_tree');
	 
	 var elementsToHideWhenCollapsed = treeCtrlFrame.document.getElementsByClassName('hide-when-collapsed');
	 var clName = treeCtrlFrame.document.getElementById("toggleToc").className;
	
	 TreeMenuCookie_save;
	 if( clName.lastIndexOf("contracted") < 1 ){
		for (i=0;i<elementsToHideWhenCollapsed.length;i++) {
			elementsToHideWhenCollapsed[i].className += " hidden"; 	
		}
		
		elementsToHideWhenCollapsed = treeDataFrame.document.getElementsByTagName('TABLE');
		for (i=0;i<elementsToHideWhenCollapsed.length;i++) {
			elementsToHideWhenCollapsed[i].className += " hidden"; 
		}
	 
		var elementsToContractWhenCollapsed = treeCtrlFrame.document.getElementsByClassName("contract-when-collapsed");
		for (i=0;i<elementsToContractWhenCollapsed.length;i++) {
			elementsToContractWhenCollapsed[i].className += " contracted"; 
		}
	 
		var elementsToMoveWhenCollapsed = treeCtrlFrame.document.getElementsByClassName("move-when-collapsed");
		for (i=0;i<elementsToMoveWhenCollapsed.length;i++) {
			elementsToMoveWhenCollapsed[i].className += " collapse"; 
		}
	 
		treeCtrlFrame.document.getElementById("toggleToc").className += " contracted";
		/* treeCtrlFrame.document.getElementById("toggleToc").title ="Expand the navigation sidebar"; */
		treeCtrlFrame.document.getElementById("toggleToc").title = expandText;
		
		treeFrame.cols  = '5%,*';
		treeSubFrame.rows = '100%,*'; 
	}
	 else{
		for (i=0;i<elementsToHideWhenCollapsed.length;i++) {	
		elementsToHideWhenCollapsed[i].className = elementsToHideWhenCollapsed[i].className.replace(/\bhidden\b/,'');
		}
	 
		elementsToHideWhenCollapsed = treeDataFrame.document.getElementsByTagName('TABLE');
		for (i=0;i<elementsToHideWhenCollapsed.length;i++) {
		elementsToHideWhenCollapsed[i].className = elementsToHideWhenCollapsed[i].className.replace(/\bhidden\b/,'');
		}

		var elementsToContractWhenCollapsed = treeCtrlFrame.document.getElementsByClassName("contract-when-collapsed");
		for (i=0;i<elementsToContractWhenCollapsed.length;i++) {	
         elementsToContractWhenCollapsed[i].className = elementsToContractWhenCollapsed[i].className.replace(/\bcontracted\b/,'');		
		}
		
		var elementsToMoveWhenCollapsed = treeCtrlFrame.document.getElementsByClassName("move-when-collapsed");
		for (i=0;i<elementsToMoveWhenCollapsed.length;i++) {
			elementsToMoveWhenCollapsed[i].className = elementsToMoveWhenCollapsed[i].className.replace(/\bcollapse\b/,'');
		}
		
		treeCtrlFrame.document.getElementById("toggleToc").className = treeCtrlFrame.document.getElementById("toggleToc").className.replace(/\bcontracted\b/,'');
		/* treeCtrlFrame.document.getElementById("toggleToc").title ="Minimize the navigation sidebar"; */
		treeCtrlFrame.document.getElementById("toggleToc").title = minText;

		treeFrame.cols  = '30%,*';
		treeSubFrame.rows = '5%,*';
		
		var scrollMe = readCookie("scrY");
	    frames['TreeData'].scrollTo(0,scrollMe);
	 }  
}