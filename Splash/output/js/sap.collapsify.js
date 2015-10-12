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
			'src' : self.options.imagePath + 'arrowdn.gif',
			'title' : self.options.collapseText,
			'alt' : self.options.collapseText,
			'style' : 'display:inline; float:left;'
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

		if (elem.hasClass('example') && !(elem.hasClass('sap-example'))) {// example
			// Fix for cases that text inside an example is not wrap in
			// <p> tags
			$('.collapsible').contents().each(function() {
				if (this.nodeType == 3 && $.trim(this.nodeValue) != '') {
					$(this).wrap('<div class="textwrapped"></div>');
				}
			});
		}
		
		var target = elem.find('.section_title, .tablecap, .figcap, .title')
				.first();
		target.attr('title', self.options.collapseText).wrap(div);
		img.insertBefore(target);

		//default is collapsed on load
		self.toggle(elem, img);
		// Expand element on load when triggerd by @outputclass = "collapsible expanded"
		if (elem.hasClass('expanded')) {
			self.toggle(elem, img);
		}

	};
	
	// toggle visibility of children, collapsible icon
	Collapsify.prototype.toggle = function(elem, img) {
		var self = this, elemType = elem.prop('tagName');

		if (img.attr('src').lastIndexOf(self.options.expandedIcon) >= 1) {
			img.attr({
				'src' : self.options.imagePath + self.options.collapsedIcon,
				'title' : self.options.expandText,
				'alt' : self.options.expandText
			}).removeClass().addClass('collapse-icon collapse');
			elem.find('.title, .section_title, .tablecap, .figcap').first().attr('title',
					self.options.expandText);
		} else {
			img.attr({
				'src' : self.options.imagePath + self.options.expandedIcon,
				'title' : self.options.collapseText,
				'alt' : self.options.collapseText
			}).removeClass().addClass('collapse-icon expand');
			elem.find('.title, .section_title, .tablecap, .figcap').first().attr('title',
					self.options.collapseText);

		}

		if (elemType === 'TABLE') {
			elem.children().not('.title, caption').toggle();

		} else if (elemType === 'DIV') {
			if (elem.hasClass('fig')) {
				elem.find('.image').toggle();
			}

			else if (elem.hasClass('example')) {
				elem.children().not('.col-wrapper,.exampletitle, .title')
						.toggle();
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