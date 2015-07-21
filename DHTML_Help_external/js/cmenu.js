/**
 * 2015-05-04 BESTL-6116: Version to support dynamic filtering. Support for optional @class additions, post-regeneration callbacks. To merge, look for this JIRA ID.
 */
/**
 * @version 29.06.2007
 * @author  Sergei Troitsky
 * Template version V2 2011-09-16
 */

var gMenu = null;

function CreateMenu(win) {
    gMenu = new CMenu(win);
}

function CMenu(win) {
	this.tm = new TreeMenu("parent.gMenu.tm", win, win.parent, 7*24*60*60*1000);

    this.tm.checkMenu           = "if(parent.gMenu == null || typeof(parent.gMenu) != 'object') {\n"
                                + "  parent.location.reload();\n"
                                + "} else\n";
    this.tm.itemHeight          = 0;
    this.tm.tabWidth            = 9;  // Indentation (part 1)
    this.tm.buttonWidth         = 11; // Width of open / close button
    this.tm.spaceTabButton      = 3;  // Indentation (part 2)
    this.tm.spaceButtonImage    = 0;  // Space after open / close button; done via CSS
    this.tm.spaceImageLink      = 0;  // Space after book / page icon; done via CSS
    this.tm.spaceSelimageLink   = 3;  // not relevant
    this.tm.img1x1         .src = "images/1x1.gif";
    this.tm.imgButtonOpened.src = "images/arrow_open.gif";
    this.tm.imgButtonClosed.src = "images/arrow_closed.gif";
    this.tm.imgSelectedYes .src = "images/select.gif";
    this.tm.imgSelectedNo  .src = "images/nselect.gif";
    this.tm.imgItem        .src = "images/page.gif";
    this.tm.imgItemOpened  .src = "images/open_book.gif";
    this.tm.imgItemClosed  .src = "images/closed_book.gif";
    this.tm.bgcolors[0]         = new TreeMenuBgcolor("#FFFFFF", "#FFFFFF", "#FFFFFF");
    this.tm.bgcolors[1]         = new TreeMenuBgcolor("#FFFFFF", "#FFFFFF", "#FFFFFF");
    this.tm.bgcolors[2]         = new TreeMenuBgcolor("#FFFFFF", "#FFFFFF", "#FFFFFF");
    this.tm.bgcolors[3]         = new TreeMenuBgcolor("#FFFFFF", "#FFFFFF", "#FFFFFF");
    this.tm.bgcolorMarked       = "#F2F2F2";
    this.tm.stsTreeNode         = "Node:"; // [[STATUS_TEXT_TREE_NODE]] "Node:"
    this.tm.stsDocument         = "Document:"; // [[STATUS_TEXT_TREE_DOCUMENT]] "Document:"
    this.tm.stsExpand           = "Trigger this link to expand."; // [[STATUS_TEXT_TREE_EXPAND]] "Trigger this link to expand."
    this.tm.stsCollapse         = "Trigger this link to collapse."; // [[STATUS_TEXT_TREE_COLLAPSE]] "Trigger this link to collapse."
// c5060753; CSN: 1368986 2007; NOTE: with JExS this var can be set to true!
    this.tm.a11y                = true;
// c5060753
    this.tm.a11yEnter           = "Start of the navigation tree."; // [[A11Y_TREE_ENTER]] "Start of the navigation tree."
    this.tm.a11yLeave           = "End of the navigation tree."; // [[A11Y_TREE_LEAVE]]"End of the navigation tree."
    this.tm.a11yLevel           = "Level"; // [[A11Y_TREE_LEVEL]] "Level"
    this.tm.a11yExpanded        = "Expanded"; // [[A11Y_TREE_EXPANDED]] "Expanded"
    this.tm.a11ySelected        = "Selected"; // [[A11Y_TREE_SELECTED]] "Selected"
    this.tm.itemGo              = PH_itemGo;

    this.stsStructLink          = "Structure link:"; // [[STATUS_TEXT_TREE_STRUCTLINK]] "Structure link"
    this.imgItemStructLink      = new Image();
    this.imgItemStructLink.src  = "images/change_book.gif";

    this.Initialize             = CMenu_Initialize;
    this.IsInitialized          = CMenu_IsInitialized;
    this.Add                    = CMenu_Add;
    this.SetLayout              = CMenu_SetLayout;
    this.SetImagePath           = CMenu_SetImagePath;
    this.SetStyleSheet          = CMenu_SetStyleSheet;
    this.SetCodePage            = CMenu_SetCodePage;
    this.SetLevel2Item          = CMenu_SetLevel2Item;
    this.SetTitle               = CMenu_SetTitle;
    this.GenerateTree           = CMenu_GenerateTree;
    this.SelectEntry            = CMenu_SelectEntry;
    this.Explode                = CMenu_Explode;
    this.Contract               = CMenu_Contract;
    this.PrevEntry              = CMenu_PrevEntry;
    this.NextEntry              = CMenu_NextEntry;
    this.Sync                   = CMenu_Sync;
	this.ToggleToC				= CMenu_ToggleToC; /* MJH */
    this.OnRegenerateCallback   = CMenu_OnRegenerateCallback; /* BESTL-6116 */
}

function CMenu_Initialize   (          ) {                                  }
function CMenu_IsInitialized(          ) { return this.tm.generated();      }
function CMenu_SetLayout    (          ) {                                  }
function CMenu_SetImagePath (          ) {                                  }
function CMenu_SetStyleSheet(stylesheet) { this.tm.stylesheet = stylesheet; }
function CMenu_SetCodePage  (codepage  ) { this.tm.charset = codepage;      }
function CMenu_SetLevel2Item(id, init  ) { this.tm.setLevel2(id);           }
function CMenu_SetTitle     (title     ) { this.tm.title = title;           }
function CMenu_GenerateTree (          ) { this.tm.generate();              }
function CMenu_SelectEntry  (id        ) { this.tm.markItem(id);            }
function CMenu_Explode      (          ) { this.tm.openAll();               }
function CMenu_Contract     (          ) { this.tm.closeAll();              }
function CMenu_PrevEntry    (          ) { this.tm.selectPrev();            }
function CMenu_NextEntry    (          ) { this.tm.selectNext();            }
function CMenu_ToggleToC    (minText, expandText) { this.tm.toggleToC(minText, expandText); } /* MJH */

/* BESTL-6116 new addClass argument. */
function CMenu_Add(mother, display, myURL, indent, outputWindow, newItem, key, addClass) {
    var state  = indent <= 0 ? 1 : 0;
    //var href   = "../../" + myURL; //HERE
    var href = myURL;
    var image  = outputWindow == "" ? "" : this.imgItemStructLink.src;
    var status = outputWindow == "" ? "" : this.stsStructLink;

    /* BESTL-6116 new addClass argument. */
    var item = this.tm.add(
    //  level,  state, id,  title,   href, target,       hrefNewWindow, image, imageOpened, status, addClass);
        indent, state, key, display, href, outputWindow, "",            image, "",          status, addClass);
}

function CMenu_Sync() {
    this.tm.m_cookie.setStateCloseAll();
    this.tm.m_cookie.marked = -1;
    this.tm.m_cookie.save();
    this.tm.m_window.parent.parent.SAP_TEXT.history.go(0);
}

/* BESTL-6116 */
function CMenu_OnRegenerateCallback(callbackFunction) {
    this.tm.onRegenerateCallback(callbackFunction);
}

function PH_itemGo(item) {
    var target = item.target;
    if(target == "") {
        this.m_window.parent.parent.SAP_TEXT.location = item.href;
    }
    else if(typeof(target) == "string") {
        if(target.substring(0, 1) == "_") {
            target = target.substring(1);
        }
        top[target].location = item.href;
    }
}
