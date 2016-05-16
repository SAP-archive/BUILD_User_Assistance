//change date  July 10, 2015
//revised on Nov. 10, 2015
/**
 * June 2015 Authors : i818670, i844448 Add collapsible functionality to the
 * elements when (outputclass="collapsible") is set for the elements in CSM All
 * elements will be collapsed on the load © Copyright 2015 SAP SE. All rights
 * reserved
 */
;
(function($, doc, win) {
	"use strict";

	function Collapsify(el, opts) {
		this.$el = $(el);

		this.options = {
				imagePath : 'images/',// fix the bug for path in chm outputs
				expandText : 'Display Content',
				collapseText : 'Hide Content',
				codeblockText: 'Code Sample',
				expandedIcon : 'arrowdn.gif',
				collapsedIcon : 'arrowrt.gif'
		};

		this.opts = $.extend(this.options, opts);
		this.init();
	}

	Collapsify.prototype.init = function() {
		var self = this;
		self.addDiv(self.$el);
	};

	Collapsify.prototype.addDiv = function(elem) {
		var self = this;
		var img = $('<img/>').addClass('collapse-icon expand').attr({
			'src' : self.options.imagePath + self.options.expandedIcon,
			'title' : self.options.collapseText,
			'alt' : self.options.collapseText
			//'style' : 'display:inline; float:left;'
		});

		var div = $('<div/>').addClass('col-wrapper').on('click', function(event) {
			event.stopPropagation();
			self.toggle(elem, img);
		});

		// This code will synchronized old implementation with new version. in
		// case of data name="collapsible" value="yes" in CMS when <data name="collapsed" value="no"/> then "expanded" class will be added.
		// Test for the element to be section_title
		if (elem.hasClass('section_title')) {
			var isSection_Collapsible = elem.filter('.collapsible').length;
			var parent = elem.parent();
			if (isSection_Collapsible > 0) {
				elem.removeClass('collapsible');
				if (elem.hasClass('expanded')) {
					parent.addClass('collapsible expanded');
				} else {
					parent.addClass('collapsible');
				}
				elem = parent;
			}
		}

		//BESTL 8322 
		if ( (elem.hasClass('example')||elem.hasClass('prereq')||elem.hasClass('context')||elem.hasClass('result')||elem.hasClass('postreq')||elem.hasClass('pre'))||elem.hasClass('sap-example') ){// example
			// Fix for cases that text inside an example, result, prereq, codeblock is not wrap in <p> tag
			// sap-example must be excluded
			elem.contents().each(function() {
				if (this.nodeType == 3 && $.trim(this.nodeValue) != '') {
					$(this).wrap('<div class="textwrapped"></div>');
				}
			});
		}
		//Adding the image icon to the elements
		
		//Nov 10, remove the code on sap-example and example

		//codeblock collapsible
		if (elem.hasClass('pre')){
			//codeblock dose not have a title. Create fake codeblock-title to use it after the collapsible icon. use Code sample as hover
			var target = elem;			
			target.attr('title', self.options.collapseText).wrap(div);
			target.wrap('<div class="codeblock-title" title="' + self.options.expandText + '">' + self.options.codeblockText + '</div>');
			img.insertBefore(target.parent());
		}
		//steps, steps-unordered, steps with stepsection collapsible
		if (elem.hasClass('steps') || elem.hasClass('steps-unordered')|| elem.hasClass('steps-ordered')){
			//find the "Procedure" and add the image icon before it.
			var findProcedure = elem.siblings('.tasklabel').children('.sectiontitle ');
			var target = findProcedure;		
			target.attr('title', self.options.expandText).wrap(div);
			img.insertBefore(target);
		}

		 if (elem.hasClass('table')){
		 //move the table caption outside of <table> to fix the bug for IE7. (collapsible image and table caption dose not display in chm and older IE)
			var target = elem.parent();
			var tableTitle = elem.find('.tablecap').first();	
			tableTitle.attr('title', self.options.collapseText).wrap(div);	
			img.insertBefore(tableTitle);
			$(target).prepend($(elem.find('.col-wrapper')));		
		}
		
		//all others collapsible
		else {
			var target = elem.find('.section_title, .tablecap, .figcap, .title, .sectiontitle, .relinfotitle, .subsectiontitle, .exampletitle')
			.first();
			target.attr('title', self.options.collapseText).wrap(div);
			img.insertBefore(target);
		}
		
		//default is collapsed on load
		self.toggle(elem, img);
		// Elements with @outputclass = "collapsible expanded" are not expanded on load with small screen (<= 768px), this is required for mobile devices
		
		var width = $(window).width();

		if (elem.hasClass('expanded') && width > 768) {
			self.toggle(elem, img);
		}

	};

	// toggle visibility of children, collapsible icon, and title hover
	Collapsify.prototype.toggle = function(elem, img) {
		var self = this, elemType = elem.prop('tagName');

		if (img.attr('class').lastIndexOf('expand') >= 1) {
			img.attr({
				'src' : self.options.imagePath + self.options.collapsedIcon,
				'title' : self.options.expandText,
				'alt' : self.options.expandText
			}).removeClass().addClass('collapse-icon collapse');
			elem.find('.title, .section_title, .tablecap, .figcap, .sectiontitle, .relinfotitle, .subsectiontitle, .exampletitle').first().attr('title',
					self.options.expandText);
		} else {
			img.attr({
				'src' : self.options.imagePath + self.options.expandedIcon,
				'title' : self.options.collapseText,
				'alt' : self.options.collapseText
			}).removeClass().addClass('collapse-icon expand');
			elem.find('.title, .section_title, .tablecap, .figcap, .sectiontitle, .relinfotitle, .subsectiontitle, .exampletitle').first().attr('title',
					self.options.collapseText);
		}
		if (elemType === 'PRE'){
			// case for codeblock
			elem.toggle();
		}	
		if (elemType === 'OL'){
			// case for steps
			var findUL = elem.closest('ul').find('.collapsible');
			var findOL = elem.closest('ul').find('.collapsible');
			//if step has stepsection, there will be more than on OL or UL avoid running toggle multiple times.
			if ( (findUL.length < 1) || (findOL.length < 1)) {
				elem.toggle();
				elem.siblings('.li.stepsection').toggle();			
				elem.siblings('.ol').toggle();
				elem.siblings('.ul').toggle();
				}
		}	
		if (elemType === 'UL'){
			// case for steps-unorderd
			var findUL = elem.closest('ul').find('.collapsible');
			var findOL = elem.closest('ul').find('.collapsible');
			//if step has stepsection, there will be more than on OL or UL avoid running toggle multiple times
			if ( (findUL.length < 1) || (findOL.length < 1)) {	 
				elem.toggle();
				elem.siblings('.li.stepsection').toggle();
				elem.siblings('.ul').toggle();
				elem.siblings('.ol').toggle();
			}
		}	
		if (elemType === 'TABLE') {
			elem.children().not('.title, caption,.tablecap, .col-wrapper').toggle();

		} else if (elemType === 'DIV') {
			if (elem.hasClass('fig')) {
				elem.find('.image').toggle();
			}
			else if (elem.hasClass('example')) {
				elem.children().not('.col-wrapper,.exampletitle')
				.toggle();
			}
			else if (elem.hasClass('prereq') || elem.hasClass('context') || elem.hasClass('result') || elem.hasClass('postreq')){
				elem.children().not('.tasklabel').toggle();
			}
			else if (elem.hasClass('related-links')) {
				elem.find('div.relinfo').children().not('.col-wrapper,.relinfotitle').toggle();
				elem.find('div.linklist').not('.col-wrapper,.relinfotitle').toggle();
			}
			else if (elem.hasClass('sectiondiv')) {
				elem.children().not('.col-wrapper,.subsectiontitle').toggle();
				}
			else {
				elem.closest('div').children().not(
				'.col-wrapper, .section_title').toggle();
			}
		}

	};

	$.fn.collapsify = function(opts) {
		return this.each(function() {
			new Collapsify(this, opts);

		});
	};

})(jQuery, document, window);