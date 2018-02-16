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
		var tmr			= 0;
		var curPage 	= 1; 
		var curLimit 	= Math.floor(pageLimit[0]);
		var pages 		= dataLength / curLimit;
		var paginationState = 1; 
		
		// Declared DOM object
		var $style;
		var $thead;
		var $tbody;
		var $search;
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
			$search 		= $self.find("#vs-search");
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
		
		$.fn.vsGrid.createPageLimit = function(o,isUpdate) {
			var _rowTo 	 = curPage * curLimit;

			if (isUpdate) {
				var _rowFrom  = (_rowTo - curLimit) + 1;
				$pageLimitBox.find("span").text('Showing ' + _rowFrom + ' to ' + _rowTo + ' of ' + dataLength + ' rows');
			} else {
				var _pLimit_s = '<span>Showing 1 to ' + _rowTo + ' of ' + dataLength + ' rows</span><select name="vs-pagelimit" id="vs-pagelimit">';

				for (let i = 0; i < pageLimit.length; i++) {
					var _pl = Math.floor(pageLimit[i]);
					_pLimit_s += '<option value="' + _pl + '">' + _pl + '</option>';
				}
				_pLimit_s += '</select> rows per page.';

				$pageLimitBox.html(_pLimit_s);
				$pageLimit = $pageLimitBox.find("#vs-pagelimit");
				
				$pageLimit.off("change").on("change", function() {
					curLimit = parseInt(this.value);
					pages = Math.floor(dataLength / curLimit);
					curPage = 1;
					// Update page limit
					$.fn.vsGrid.createPageLimit({},true);
					// Update pagination
					$.fn.vsGrid.createPagination();
					// Update tbody
					$.fn.vsGrid.createTBody({data : data});
				}).val(curLimit);
			}

			// Reset the scroll
			$tbody.scrollTop(0).scrollLeft(0);
			$thead.scrollLeft(0);
		}
		
		$.fn.vsGrid.createPagination = function(o,isLast) {
			var _pagination_s 	= '<li id="vs-page-first" class="vs-page">First</li>';

			if (isLast) {
				if (pages <= 5) {
					for (let i = 1; i <= pages - 1; i++) {
						_pagination_s += '<li class="vs-page">' + i + '</li>';
					}
					_pagination_s += '<li class="vs-page active">' + pages + '</li>';
				} else {
					for (let i = pages - 4; i <= pages - 1; i++) {
						_pagination_s += '<li class="vs-page">' + i + '</li>';
					}
					_pagination_s += '<li class="vs-page active">' + pages + '</li>';
				}
				paginationState = 3;
			} else {
				if (pages <= 5) { 
					_pagination_s += '<li class="vs-page active">1</li>';
					for (let i = 2; i <= pages; i++) {
						_pagination_s += '<li class="vs-page">' + i + '</li>';
					}
				} else {
					_pagination_s += '<li class="vs-page active">1</li><li class="vs-page">2</li><li class="vs-page">3</li><li class="vs-page">4</li><li class="vs-page">5</li>';
				}
				paginationState = 1;
			}
			
			_pagination_s += '<li id="vs-page-last" class="vs-page">Last</li>';

			$pagination.html(_pagination_s);

			// On click event
			$pagination.off("click", ".vs-page")
			.on("click", ".vs-page", function() {
				var _$self = $(this);
				var _id = _$self.attr("id");
				
				$pagination.find(".active").removeClass("active");
				if (_id === "vs-page-first") {
					curPage = 1;
				} else if (_id === "vs-page-last") {
					curPage = pages;
				} else {
					curPage = parseInt(_$self.text());
				}

				// Update pagination
				if (curPage === 1) {
					if (paginationState !== 1) $.fn.vsGrid.createPagination();
				} else if (curPage === pages) {
					if (paginationState !== 3) $.fn.vsGrid.createPagination({},true);
				} else if (pages > 5) {
					if (curPage >= 4 && curPage <= pages - 3) {
						for (let i = 2,x = curPage - 2; i <= 6; i++,x++) {
							if (curPage === x) $pagination.find(".vs-page:nth-child(" + i + ")").addClass("active").text(x);
							else $pagination.find(".vs-page:nth-child(" + i + ")").text(x);
						}
					} else if (curPage >= pages - 2) {
						for (let i = 2,x = pages - 4; i <= 6; i++,x++) {
							if (curPage === x) $pagination.find(".vs-page:nth-child(" + i + ")").addClass("active").text(x);
							else $pagination.find(".vs-page:nth-child(" + i + ")").text(x);
						}
					} else if (curPage <= 3) {
						for (let i = 2,x = 1; i <= 6; i++,x++) {
							if (curPage === x) $pagination.find(".vs-page:nth-child(" + i + ")").addClass("active").text(x);
							else $pagination.find(".vs-page:nth-child(" + i + ")").text(x);
						}
					}
					paginationState = 2;
				} else { _$self.addClass("active"); }
				
				// Update tbody display
				$.fn.vsGrid.createTBody({data : data});

				// Update page limit
				$.fn.vsGrid.createPageLimit({},true);
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
			var _source		= o.data;
			var _length		= _source.length;
			var _end 		= curLimit * curPage;
			var _start 		= _end - curLimit;
			var _tbody_s 	= "";

			console.log("_source",_source,"_length",_length);

			if (curLimit === undefined && curPage === undefined) {
				// NO limit and page
				for (let i = 0; i < _length; i++) {
					var _data = _source[i];

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
					var _data = _source[i];

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

		$.fn.vsGrid.search = function(o) {
			$search.off("keyup").on("keyup", function() {
				clearTimeout(tmr);
				tmr = setTimeout(function() {
					var _pattern = new RegExp(this.value, "i");
					var _result = [];

					for (let i = 0; i < dataLength; i++) {
						var _data = data[i];

						for (let ii = 0; ii < rowsLength; ii++) {
							var _row = rows[ii];
							if (_pattern.test(_data[_row.column] + "")) {
								_result.push(_data);
								break;
							}
						}
					}
					$.fn.vsGrid.createPageLimit();
					$.fn.vsGrid.createPagination();
					$.fn.vsGrid.createTBody({data : _result});
				}, 500);
			});
		}
		
		// Default initialization
		$.fn.vsGrid.createTable();
		$.fn.vsGrid.createPageLimit();
		$.fn.vsGrid.createPagination();
		$.fn.vsGrid.createTHead();
		$.fn.vsGrid.createTBody({data : data});
		$.fn.vsGrid.search();	
	
		// To make chainable
		return $self;
	}
};