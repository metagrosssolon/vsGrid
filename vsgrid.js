$.fn.vsGrid = function(options) {
	var elemLength = this.length;
	// Don't act on absent elements - via Paul Irish's advice
	if ( elemLength ) {
		// Default initialization
		var defaults = {
			data : {}
			,rows : [{}]
			,size : { width : 700 , height : 400 }
			,pageLimit : [ 25 , 50 , 100 ]
		};
		
		// Merge object2 into object1, recursively
		var settings = $.extend( true , defaults, options );
		
		// Initialized DOM objects
		var self 		= this[0];
		var $self 		= $(self);
		
		// Initialized objects
		var data 		= settings.data;
		var rows 		= settings.rows;
		var width 		= settings.width;
		var height		= settings.height;
		var pageLimit 	= settings.pageLimit;
		
		// Initialized fixed values
		var id 			= $self.attr('id');
		var rowsLength 	= rows.length;
		var dataLength 	= data.length;
		
		// Declared DOM object
		var $style;
		var $thead;
		var $tbody;
		var $pageLimitBox;
		var $pageLimit;
		var $pagination;
		
		// Declared dynamic values
		var pages;
		
		// vsGrid Functions
		$.fn.vsGrid.createTable = function(o) {
			var style_s = "";
			
			// Create vsGrid DOM structure
			self.innerHTML = 	    '<div id="vs-panel-t">'
								+       '<div class="vs-search-box">'
								+           '<label for="vs-search">'
								+               '<svg viewBox="0 0 24 24" height="100%" width="100%" preserveAspectRatio="xMidYMid meet">'
								+                   '<g><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></g>'
								+               '</svg>'
								+           '</label>'
								+           '<input id="vs-search" name="vs-search" type="text" placeholder="Search for" />'
								+       '</div>'
								+   '</div>'
								+   '<table>'
								+       '<thead></thead>'
								+       '<tbody></tbody>'
								+   '</table>'
								+   '<div id="vs-panel-b">'
								+       '<div class="vs-pagelimit-box"></div>'
								+       '<div class="vs-pagination-box">'
								+           '<ul id="vs-pagination" name="vs-pagination"></ul>'
								+       '</div>'
								+   '</div>';
			
			$thead 			= $self.find("thead");
			$tbody 			= $self.find("tbody");
			$pageLimitBox   = $self.find(".vs-pagelimit-box");
			$pagination		= $self.find("#vs-pagination");
			
			// Create #vsGrid-cus-style style tag
			$style = $("#vsGrid-cus-style");
			if ( ! $style.length) { $('head').append('<style id="vsGrid-cus-style"></style>'); $style = $("#vsGrid-cus-style"); }

			for (let i = 0; i < rowsLength; i++) {
				//Create per column styles
				var _row = rows[i];
				var _nth = i + 1;
				style_s += '#' + id + ' thead th:nth-child(' + _nth + ')'
					  +  ', #' + id + ' tbody td:nth-child(' + _nth + ')' 
					  +  '{' + _row.style + ' min-width : ' + _row.width + 'px; width : ' + _row.width + 'px; }';
			}
			
			// vsGrid size
			style_s += '#' + id + ' { width : ' + width + 'px; height : ' + height + 'px; }';

			// panel-t and panel-b width
			style_s += '#' + id + ' #vs-panel-t , #' + id + ' #vs-panel-b { height : 20px; }';

			// thead width
			style_s += '#' + id + ' thead { width : ' + (width - 17) + 'px; }';

			// tbody size
			style_s += '#' + id + ' tbody { width : ' + width + 'px; height : ' + ((height - $thead.height()) - 40) + 'px; }';
			
			// Append vsGrid custom styles
			$style.append(style_s);
		};
		
		$.fn.vsGrid.createPageLimit = function(o) {
			var curPage  = o.curPage;
			var curLimit = o.curLimit;
			var rowTo 	 = curPage * curLimit;
			var rowFrom  = (rowTo - curLimit) + 1;
			var pLimit_s = 'Showing ' + rowFrom + ' to ' + rowTo + ' of ' + dataLength + ' rows <select name="vs-pagelimit" id="vs-pagelimit">';

			for (let i = 0; i < pageLimit.length; i++) {
				var _pl = Math.floor(pageLimit[i]);
				pLimit_s += '<option value="' + _pl + '">' + _pl + '</option>';
			}
			pLimit_s += '</select> rows per page.';

			$pageLimitBox.html(pLimit_s);
			$pageLimit = $pageLimitBox.find("#vs-pagelimit");
			
			$pageLimit.off("change").on("change", function() {
				// Create pagination
				pages = Math.floor(dataLength / this.value);
				$.fn.vsGrid.createPagination({ pages : pages });
				$pagination.find(".vs-page:nth-child(2)").click();
			}).val(curLimit);
			$tbody.scrollTop(0);
		}
		
		$.fn.vsGrid.createPagination = function(o,isLast) {
			var pages 			= o.pages;
			var pagination_s 	= '<li id="vs-page-first" class="vs-page except">First</li>';
			
			if (isLast) {
				if (pages <= 5) {
					for (let i = 1; i <= pages - 1; i++) {
						pagination_s += '<li class="vs-page">' + i + '</li>';
					}
					pagination_s += '<li class="vs-page active">' + pages + '</li>';
				} else {
					pagination_s += '<li class="vs-page">1</li><li id="vs-page-ellipsis" class="vs-page except">...</li><li class="vs-page">' + (pages - 2) + '</li><li class="vs-page">' + (pages - 1) + '</li><li class="vs-page active">' + pages + '</li>';
				}
			} else {
				if (pages <= 5) {
					pagination_s += '<li class="vs-page active">1</li>';
					for (let i = 2; i <= pages; i++) {
						pagination_s += '<li class="vs-page">' + i + '</li>';
					}
				} else {
					pagination_s += '<li class="vs-page active">1</li><li class="vs-page">2</li><li class="vs-page">3</li><li id="vs-page-ellipsis" class="vs-page except">...</li><li class="vs-page">' + pages + '</li>';
				}
			}
			
			pagination_s += '<li id="vs-page-last" class="vs-page except">Last</li>';

			$pagination.html(pagination_s);

			// On click event
			$pagination.off("click", ".vs-page:not(#vs-page-ellipsis)")
			.on("click", ".vs-page:not(#vs-page-ellipsis)", function() {
				var _$self = $(this);
				var _pageNo;
				
				$pagination.find(".active").removeClass("active");
				if (_$self.hasClass("except")) {
					var _id = _$self.attr("id");
					
					if (_id === "vs-page-first") {
						$.fn.vsGrid.createPagination({ pages : pages });
						_pageNo = 1;
					} else if (_id === "vs-page-last") {
						$.fn.vsGrid.createPagination({ pages : pages }, true);
						_pageNo = pages;
					}
				} else {
					_pageNo = _$self.addClass("active").text();
				}
				
				// Update tbody display
				$.fn.vsGrid.createTBody({
					curLimit : $pageLimit.val()
					,curPage : parseInt(_pageNo)
				});
				$.fn.vsGrid.createPageLimit({ curLimit : $pageLimit.val() , curPage : parseInt(_pageNo) });
			});
		}
		
		$.fn.vsGrid.createTHead = function(o) {
			var thead_s 	= '<tr>';
			for (let i = 0; i < rowsLength; i++) {
				var _row = rows[i];
				thead_s 	+= 	'<th>' + _row.column + '</th>';
			}
			thead_s 	+=	'</tr>';
			$thead.html(thead_s);
		}
		
		$.fn.vsGrid.createTBody = function(o) {
			var curLimit = o.curLimit;
			var curPage = o.curPage;
			var end = curLimit * curPage;
			var start = end - curLimit;
			var tbody_s = "";

			if (curLimit === undefined && curPage === undefined) {
				// NO limit and page
				for (let i = 0; i < dataLength; i++) {
					var _data = data[i];

					tbody_s += '<tr>';
					for (let ii = 0; ii < rowsLength; ii++) {
						var _row = rows[ii];
						tbody_s += '<td>' + _data[_row.column] + '</td>';
					}
					tbody_s += '</tr>';
				}
			} else {
				// HAS limit and page
				for (let i = start; i < end; i++) {
					var _data = data[i];

					tbody_s += '<tr>';
					for (let ii = 0; ii < rowsLength; ii++) {
						var _row = rows[ii];
						tbody_s += '<td>' + _data[_row.column] + '</td>';
					}
					tbody_s += '</tr>';
				}
			}

			$tbody.html(tbody_s).on("scroll", function(){
				// Add scroll event
				$thead.scrollLeft($(this).scrollLeft());
			});
		}
		
		// Default initialization
		$.fn.vsGrid.createTable();
		$.fn.vsGrid.createPageLimit({ curLimit : Math.floor(pageLimit[0]) , curPage : 1 });
		$.fn.vsGrid.createPagination({ pages : dataLength / Math.floor(pageLimit[0]) });
		$.fn.vsGrid.createTHead();
		$pagination.find(".vs-page:nth-child(2)").click();
	
		// To make chainable
		return $self;
	}
};