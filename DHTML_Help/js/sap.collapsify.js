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

		/*
		 * These options will be exposed. Variations of these strings may be
		 * provided during the build process. These strings should be used for
		 * @alt and @title attributes
		 */
		this.options = {
			imagePath : 'images/',// fix the bug for path in chm outputs
			expandText : 'Display Content',
			collapseText : 'Hide Content'
		};

		this.opts = $.extend(this.options, opts);
		this.init();
	}

	Collapsify.prototype.init = function() {
		var self = this;

		self.editClass(self.$el);
		self.addSpan(self.$el);

	};
	//  This code will synchronized old implementation with new version. in case of data name="collapsible" value="yes" in CMS
	Collapsify.prototype.editClass = function(elem) {
		var self = this;
		var isSection_Collapsible = elem.find('.collapsible').length;
		var parent = elem.parent();
		if (isSection_Collapsible > 0) {
			elem.removeClass('collapsible');
			if (elem.hasClass('expanded')) {
				parent.addClass('collapsible expanded');
			}
			else{
				parent.addClass('collapsible');
			}
		}
	};

	// add a span/image to each collapsible element
	Collapsify.prototype.addSpan = function(elem) {
		var self = this;
		
		var img = $('<img/>').addClass('collapse-icon imgcollapse').attr({
			'src' : self.options.imagePath + 'arrowdn.gif',
			'title' : self.options.collapseText,
			'alt' : self.options.collapseText,
			'style' : 'display:inline; float:left;'
		}).on('click', function(event) {
			event.stopPropagation();
			self.toggle(elem, $(this));
		});
		//Expand element on load
		if (elem.hasClass('expanded')) {
			self.toggle(elem, img);
		}
			
		// Make titles click-able
		elem.find('.title, .section_title').addClass('collapsibleTitle').attr({
			'title' : self.options.collapseText
		}).on('click', function(event) {
			event.stopPropagation();
			self.toggle(elem, img);
		});
		// for the table
		if (elem.hasClass('collapsible')) {
			elem.find('.tablecap').addClass('collapsibleTitle') .attr({
			'title' : self.options.collapseText
			}).on('click', function(event){ 
			event.stopPropagation();
			self.toggle(elem, img); 
			});
		}
		// for the image
		if (elem.hasClass('collapsible')) {
			elem.find('.figcap').addClass('collapsibleTitle') .attr({
			'title' : self.options.collapseText,
			'alt' : self.options.collapseText 
			}).on('click', function(event){ 
			event.stopPropagation();
			self.toggle(elem, img); 
			});
		}

		var span = $('<span/>').append(img);
		var isTitle = elem
				.find('.title, caption, .section_title, .figcap, exampletitle').length;
		var isCodeblock = elem.hasClass('pre'); // exception for codeblock that
		// has no title(include in
		// collapsible checks)
		var elemType = elem.prop('tagName'); // test for the type of element.

		if (elem.hasClass('section_title')) {// section that trigged by data name="collapsible" value="yes" in CMS
			elem.addClass('collapsibleTitle').attr({
				'title' : self.options.collapseText
			}).on('click', function(event) {
				event.stopPropagation();
				self.toggle(elem, img);
			});
			elem = elem.parent();
			span.prependTo(elem);
		}
		// only add span/image to the elements that have title
		// if ((isTitle > 0) || (isCodeblock == true)){//comment it out to be
		// compatible with old implementation. waiting for the feedback from DUX
		// team on the codeblock not having a title.
		if (isTitle > 0) {
			switch (true) {
			case elemType == 'TABLE':
				// case for table
				span.insertBefore(elem);
				break;
			case elemType == 'DIV':
				switch (true) {
				case (elem.hasClass('example') && elem.hasClass('sap-example')):// sap_example
					span.insertAfter(elem.children('.exampletitle'));
					break;
				case (elem.hasClass('example') && !(elem
						.hasClass('sap-example'))): // example
					// Fix for cases that text inside an example is not wrap in
					// <p>
					$('.collapsible').contents().each(
							function() {
								if (this.nodeType == 3
										&& $.trim(this.nodeValue) != '') {
									$(this).wrap(
											'<div class="textwrapped"></div>');
								}
							});
					span.insertBefore(elem.children('.authorexampletitle'));
					break;
				case elem.hasClass('fig'):// image
					span.prependTo(elem.find('.figcap'));
					break;
				case elem.hasClass('topic'):// nested topics
					span.prependTo(elem);
					break;
				case elem.hasClass('section'):// section
					span.prependTo(elem);
					break;
				}
				break;
			case elemType == 'PRE':
				span.insertBefore(elem);
				break;
			default:
				break;
			}
		}
	};

	// toggle visibility of children, collapsible icon
	Collapsify.prototype.toggle = function(elem, img) {
		var elemType = elem.prop('tagName'); // test for the type of element.
		var self = this;

		switch (true) {
		case elemType == 'TABLE':
			// case for table
			elem.children().not('.title, caption').toggle();
			break;
		case elemType == 'DIV':
			switch (true) {
			case (elem.hasClass('example') && elem.hasClass('sap-example')):
				// case for sap example
				elem.children().not('span').toggle();
				break;
			case elem.hasClass('example'):
				// case for regular example
				elem.children().not('.title, h2, span, .collapse-icon')
						.toggle();
				break;
			case elem.hasClass('fig'):
				// case for image
				elem.children().children().not('.figcap').toggle();
				break;
			case elem.hasClass('topic'):
				// case for nested topics
				elem.children().children().not('.title,h2, .collapse-icon')
						.toggle();
				break;
			case elem.hasClass('section'):// section
				elem.children().not('.title, span, .section_title').toggle(); // exclude
				// certain
				// elements
				// as
				// required.
				break;
			}
			break;
		case elemType == 'PRE':
			// case for codeblock
			elem.not('span, .collapse-icon').toggle();
			break;
		default:
			break;
		// others
		}
		
		if (img.attr('src').lastIndexOf(self.options.imagePath + 'arrowdn.gif') > -1) {
			img.attr({
				'src' : self.options.imagePath + 'arrowrt.gif',
				'title' : self.options.expandText,
				'alt' : self.options.expandText
			}).removeClass().addClass('collapse-icon ' + 'imgcollapse');
			
			// toggle title's hover text
			elem.find('.title, .tablecap, .section_title, .figcap').attr({
				'title' : self.options.expandText
			});
		} else {
			img.attr({
				'src' : self.options.imagePath + 'arrowdn.gif',
				'title' : self.options.collapseText,
				'alt' : self.options.collapseText
			}).removeClass().addClass('collapse-icon ' + 'imgexpand');

			// toggle title's hover text
			elem.find('.title, .tablecap, .section_title, .figcap').attr({
				'title' : self.options.collapseText	
			});

		}

	};

	$.fn.collapsify = function(opts) {
		return this.each(function() {
			new Collapsify(this, opts);

		});
	};

})(jQuery, document, window);