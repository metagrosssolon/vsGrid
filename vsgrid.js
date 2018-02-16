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

		// Initialized dynamic values
		var curPage 	= 1; 
		var curLimit 	= Math.floor(pageLimit[0]);
		var pages 		= dataLength / curLimit;
		var paginationState = 1; 
		
		// Declared DOM object
		var $style;
		var $thead;
		var $tbody;
		var $pageLimitBox;
		var $pageLimit;
		var $pagination;
		
		// vsGrid Functions
		$.fn.vsGrid.createTable = function(o) {
			var _style_s = "";
			
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
				_style_s += '#' + id + ' thead th:nth-child(' + _nth + ')'
					  +  ', #' + id + ' tbody td:nth-child(' + _nth + ')' 
					  +  '{' + _row.style + ' min-width : ' + _row.width + 'px; width : ' + _row.width + 'px; }';
			}
			
			// vsGrid size
			_style_s += '#' + id + ' { width : ' + width + 'px; height : ' + height + 'px; }';

			// panel-t and panel-b width
			_style_s += '#' + id + ' #vs-panel-t , #' + id + ' #vs-panel-b { height : 20px; }';

			// thead width
			_style_s += '#' + id + ' thead { width : ' + (width - 17) + 'px; }';

			// tbody size
			_style_s += '#' + id + ' tbody { width : ' + width + 'px; height : ' + ((height - $thead.height()) - 40) + 'px; }';
			
			// Append vsGrid custom styles
			$style.append(_style_s);
		};
		
		$.fn.vsGrid.createPageLimit = function(o) {
			var _rowTo 	 = curPage * curLimit;
			var _rowFrom  = (_rowTo - curLimit) + 1;
			var _pLimit_s = 'Showing ' + _rowFrom + ' to ' + _rowTo + ' of ' + dataLength + ' rows <select name="vs-pagelimit" id="vs-pagelimit">';

			for (let i = 0; i < pageLimit.length; i++) {
				var _pl = Math.floor(pageLimit[i]);
				_pLimit_s += '<option value="' + _pl + '">' + _pl + '</option>';
			}
			_pLimit_s += '</select> rows per page.';

			$pageLimitBox.html(_pLimit_s);
			$pageLimit = $pageLimitBox.find("#vs-pagelimit");
			
			$pageLimit.off("change").on("change", function() {
				curLimit = parseInt(this.value);
				pages = Math.floor(dataLength / this.value);

				// Create pagination
				$.fn.vsGrid.createPagination();

				// Update tbody
				$pagination.find(".vs-page:nth-child(2)").click();
			}).val(curLimit);

			// Reset the scroll
			$tbody.scrollTop(0).scrollLeft(0);
			$thead.scrollLeft(0);
		}
		
		$.fn.vsGrid.createPagination = function(o,isLast) {
			var _pagination_s 	= '<li id="vs-page-first" class="vs-page except">First</li>';
			
			if (isLast) {
				if (pages <= 7) {
					for (let i = 1; i <= pages - 1; i++) {
						_pagination_s += '<li class="vs-page">' + i + '</li>';
					}
					_pagination_s += '<li class="vs-page active">' + pages + '</li>';
					paginationState = 3;
				} else {
					_pagination_s += '<li class="vs-page">1</li><li id="vs-page-ellipsis" class="vs-page except">...</li>';
					for (let i = 4; i >= 0; i--) {
						var _page = pages - i;
						_pagination_s += '<li class="vs-page ' + ((curPage === _page) ? "active" : "") + '">' + _page + '</li>';
					}
					paginationState = 3;
				}
			} else {
				if (pages <= 7) {
					_pagination_s += '<li class="vs-page active">1</li>';
					for (let i = 2; i <= pages; i++) {
						_pagination_s += '<li class="vs-page">' + i + '</li>';
					}
					paginationState = 1;
				} else {
					if (curPage >= 5 && curPage <= pages - 4) {
						_pagination_s += '<li class="vs-page">1</li><li id="vs-page-ellipsis" class="vs-page except">...</li>';
						_pagination_s += '<li class="vs-page">' + (curPage - 1) + '</li>';	
						_pagination_s += '<li class="vs-page active">' + (curPage) + '</li>';	
						_pagination_s += '<li class="vs-page">' + (curPage + 1) + '</li>';	
						_pagination_s += '<li id="vs-page-ellipsis" class="vs-page except">...</li><li class="vs-page">' + pages + '</li>';
						paginationState = 2;
					} else {
						for (let i = 1; i <= 5; i++) {
							_pagination_s += '<li class="vs-page ' + ((curPage === i) ? "active" : "") + '">' + i + '</li>';
						}
						_pagination_s += '<li id="vs-page-ellipsis" class="vs-page except">...</li><li class="vs-page">' + pages + '</li>';
						paginationState = 1;
					}
				}
			}
			
			_pagination_s += '<li id="vs-page-last" class="vs-page except">Last</li>';

			$pagination.html(_pagination_s);
			console.log("done", paginationState);

			// On click event
			$pagination.off("click", ".vs-page:not(#vs-page-ellipsis)")
			.on("click", ".vs-page:not(#vs-page-ellipsis)", function() {
				var _$self = $(this);
				
				$pagination.find(".active").removeClass("active");
				if (_$self.hasClass("except")) {
					var _id = _$self.attr("id");
					
					if (_id === "vs-page-first") {
						curPage = 1;
					} else if (_id === "vs-page-last") {
						curPage = pages;
					}
				} else {
					curPage = parseInt(_$self.addClass("active").text());
				}

				// Update pagination
				if (curPage === 1) {
					if (paginationState !== 1) $.fn.vsGrid.createPagination();
				} else if (curPage === pages) {
					if (paginationState !== 3) $.fn.vsGrid.createPagination({},true);
				} 

				if (pages > 7) {
					if (curPage === 4) {
						if (paginationState !== 1) $.fn.vsGrid.createPagination();
					}
					if (curPage >= 5 && curPage <= pages - 4) {
						if (paginationState !== 2) { $.fn.vsGrid.createPagination(); }
						else {
							$pagination.find(".vs-page").removeClass("active");
							$pagination.find(".vs-page:nth-child(4)").text(curPage - 1);
							$pagination.find(".vs-page:nth-child(5)").addClass("active").text(curPage);
							$pagination.find(".vs-page:nth-child(6)").text(curPage + 1);
						}
					} else if (curPage === pages - 3) {
						if (paginationState !== 3) $.fn.vsGrid.createPagination({},true);
					}
				}
				
				// Update tbody display
				$.fn.vsGrid.createTBody();

				// Update page limit
				$.fn.vsGrid.createPageLimit();
			});
		}
		
		$.fn.vsGrid.createTHead = function(o) {
			var _thead_s 	= '<tr>';
			for (let i = 0; i < rowsLength; i++) {
				var _row = rows[i];
				_thead_s 	+= 	'<th>' + _row.column + '</th>';
			}
			_thead_s 	+=	'</tr>';
			$thead.html(_thead_s);
		}
		
		$.fn.vsGrid.createTBody = function(o) {
			var _end 		= curLimit * curPage;
			var _start 		= _end - curLimit;
			var _tbody_s 	= "";

			if (curLimit === undefined && curPage === undefined) {
				// NO limit and page
				for (let i = 0; i < dataLength; i++) {
					var _data = data[i];

					_tbody_s += '<tr>';
					for (let ii = 0; ii < rowsLength; ii++) {
						var _row = rows[ii];
						_tbody_s += '<td>' + _data[_row.column] + '</td>';
					}
					_tbody_s += '</tr>';
				}
			} else {
				// HAS limit and page
				for (let i = _start; i < _end; i++) {
					var _data = data[i];

					_tbody_s += '<tr>';
					for (let ii = 0; ii < rowsLength; ii++) {
						var _row = rows[ii];
						_tbody_s += '<td>' + _data[_row.column] + '</td>';
					}
					_tbody_s += '</tr>';
				}
			}

			$tbody.html(_tbody_s).on("scroll", function(){
				// Add scroll event
				$thead.scrollLeft($(this).scrollLeft());
			});
		}
		
		// Default initialization
		$.fn.vsGrid.createTable();
		$.fn.vsGrid.createPageLimit();
		$.fn.vsGrid.createPagination();
		$.fn.vsGrid.createTHead();
		$pagination.find(".vs-page:nth-child(2)").click();
	
		// To make chainable
		return $self;
	}
};