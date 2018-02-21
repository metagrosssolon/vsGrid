$.fn.vsGrid = function(options) {
	var elemLength = this.length;
	// Don't act on absent elements - via Paul Irish's advice
	if ( elemLength ) {
		// Default initialization
		var defaults = {
			data : {}
			,rows : [{}]
			,size : { width : 600 , height : 400 }
			,pageLimit : [ 25 , 50 , 100 ]
			,search : { column : ["*"] , ignoreCase : true }
		};
		
		// Merge object2 into object1, recursively
		var settings = $.extend( true , defaults, options );
		
		// Initialized DOM objects
		var self 		= this[0];
		var $self 		= $(self);
		
		// Initialized objects
		var data 		= settings.data;
		var rows 		= settings.rows;
		var width 		= settings.size.width;
		var height		= settings.size.height;
		var pageLimit 	= settings.pageLimit;
		var searchCol   = settings.search.column;
		var searchCase  = settings.search.ignoreCase;
		
		// Initialized fixed values
		var id 			= $self.attr('id');
		var rowsLength 	= rows.length;
		var dataLength 	= data.length;

		// Initialized dynamic values
		var tmr			= 0;
		var curPage 	= 1; 
		var curLimit 	= Math.ceil(pageLimit[0]);
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
					var _pl = Math.ceil(pageLimit[i]);
					_pLimit_s += '<option value="' + _pl + '">' + _pl + '</option>';
				}
				_pLimit_s += '</select> rows per page.';

				$pageLimitBox.html(_pLimit_s);
				$pageLimit = $pageLimitBox.find("#vs-pagelimit");
				
				$pageLimit.off("change").on("change", function() {
					curLimit = parseInt(this.value);
					pages = Math.ceil(dataLength / curLimit);
					curPage = 1;
					// Update page limit
					$.fn.vsGrid.createPageLimit({},true);
					// Update pagination
					$.fn.vsGrid.createPagination();
					// Update tbody
					$.fn.vsGrid.createTBody();
				}).val(curLimit);
			}

			// Reset the scroll
			$tbody.scrollTop(0).scrollLeft(0);
			$thead.scrollLeft(0);
		};
		
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
			//console.log("state",paginationState);

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
					$pagination.find(".vs-page:nth-child(2)").addClass("active");
				} else if (curPage === pages) {
					if (paginationState !== 3) $.fn.vsGrid.createPagination({},true);
					$pagination.find(".vs-page:nth-last-child(2)").addClass("active");
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
				$.fn.vsGrid.createTBody();

				// Update page limit
				$.fn.vsGrid.createPageLimit({},true);
			});
		};
		
		$.fn.vsGrid.createTHead = function(o) {
			var _thead_s 	= '<tr>';
			for (let i = 0; i < rowsLength; i++) {
				var _row = rows[i];
				_thead_s 	+= 	'<th>' + _row.column + '</th>';
			}
			_thead_s 	+=	'</tr>';
			$thead.html(_thead_s);
		};
		
		$.fn.vsGrid.createTBody = function(o) {
		    var _max        = curLimit * curPage;
			var _end 		= (dataLength < curLimit) ? dataLength : (dataLength < _max) ? dataLength : _max;
			var _start 		= (dataLength < curLimit) ? 0 : (dataLength < _max) ? _max - curLimit : _end - curLimit;
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
		};

		$.fn.vsGrid.search = function(o) {
			$search.off("keyup").on("keyup", function() {
				var _pattern = new RegExp(this.value, (searchCase) ? "i" : "");
				var _result = [];
				
				// Set these to default
				data = settings.data;
				dataLength = data.length;
				
				for (let i = 0; i < dataLength; i++) {
					var _data = data[i];
                    
                    // If all
                    if (searchCol[0] === "*") {
    					for (let ii = 0; ii < rowsLength; ii++) {
    						if (_pattern.test(_data[rows[ii].column] + "")) {
    							_result.push(_data);
    							break;
    						}
    					}
                    } else {
                        for (let ii = 0; ii < searchCol.length; ii++) {
    						if (_pattern.test(_data[searchCol[ii]] + "")) {
    							_result.push(_data);
    							break;
    						}
    					}
                    }
				}
				
				// Change these values
				data = _result;
				dataLength = data.length;
				curPage = 1;
				curLimit = $pageLimit.val();
				pages = Math.ceil(dataLength / curLimit);
				
				$.fn.vsGrid.createPageLimit();
				$.fn.vsGrid.createPagination();
				$.fn.vsGrid.createTBody();
			});
		};
		
		// Default initialization
		$.fn.vsGrid.createTable();
		$.fn.vsGrid.createPageLimit();
		$.fn.vsGrid.createPagination();
		$.fn.vsGrid.createTHead();
		$.fn.vsGrid.createTBody();
		$.fn.vsGrid.search();	
	
		// To make chainable
		return $self;
	}
}; 




var bs = zsi.bs.ctrl;
var gUnqWCData = [];
var data = [
  {
    "wire_size": "16.00",
    "wire_type": "3TCD",
    "wire_color": "YE/RD",
    "wire_qty": 1,
    "ttl_length": 1.36
  },
  {
    "wire_size": "35.00",
    "wire_type": "3SCD",
    "wire_color": "GR/RD",
    "wire_qty": 1,
    "ttl_length": 2.535
  },
  {
    "wire_size": "35.00",
    "wire_type": "3SCD",
    "wire_color": "RD",
    "wire_qty": 1,
    "ttl_length": 1.49
  },
  {
    "wire_size": "4.00",
    "wire_type": "2TBD",
    "wire_color": "BK",
    "wire_qty": 1,
    "ttl_length": 1.17
  },
  {
    "wire_size": "4.00",
    "wire_type": "2TBD",
    "wire_color": "BK/VT",
    "wire_qty": 1,
    "ttl_length": 0.41
  },
  {
    "wire_size": "4.00",
    "wire_type": "2TBD",
    "wire_color": "BK/WH",
    "wire_qty": 3,
    "ttl_length": 1.655
  },
  {
    "wire_size": "4.00",
    "wire_type": "2TBD",
    "wire_color": "RD",
    "wire_qty": 1,
    "ttl_length": 0.63
  },
  {
    "wire_size": "4.00",
    "wire_type": "2TBD",
    "wire_color": "WH/RD",
    "wire_qty": 1,
    "ttl_length": 1.76
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "BK",
    "wire_qty": 1,
    "ttl_length": 2.615
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "BK/GR",
    "wire_qty": 1,
    "ttl_length": 0.505
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "BK/YE",
    "wire_qty": 2,
    "ttl_length": 3.12
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "RD",
    "wire_qty": 1,
    "ttl_length": 1.18
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "VT/OR",
    "wire_qty": 1,
    "ttl_length": 0.685
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "WH/RD",
    "wire_qty": 1,
    "ttl_length": 0.98
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "YE/GR",
    "wire_qty": 1,
    "ttl_length": 0.48
  },
  {
    "wire_size": "4.00",
    "wire_type": "3TBD",
    "wire_color": "YE/RD",
    "wire_qty": 1,
    "ttl_length": 1.18
  },
  {
    "wire_size": "40.00",
    "wire_type": "3SCD",
    "wire_color": "BK/VT",
    "wire_qty": 1,
    "ttl_length": 0.27
  },
  {
    "wire_size": "40.00",
    "wire_type": "3SCD",
    "wire_color": "RD",
    "wire_qty": 2,
    "ttl_length": 2.155
  },
  {
    "wire_size": "6.00",
    "wire_type": "3TBD",
    "wire_color": "BR/RD",
    "wire_qty": 1,
    "ttl_length": 1.095
  },
  {
    "wire_size": "6.00",
    "wire_type": "3TBD",
    "wire_color": "BU/RD",
    "wire_qty": 2,
    "ttl_length": 2.86
  },
  {
    "wire_size": "6.00",
    "wire_type": "3TBD",
    "wire_color": "GY/RD",
    "wire_qty": 4,
    "ttl_length": 0.685
  },
  {
    "wire_size": "COAX",
    "wire_type": "COAX",
    "wire_color": "BK",
    "wire_qty": 4,
    "ttl_length": 5.58
  }
];



zsi.ready(function() {
    $("#grid2").addColResize({
        width : 400
        ,height : 300
    });
    
    
    $("#grid").loadTable2({
        rows : data
        ,width : 600
        ,height : 400
        ,dataRows : [ 
            { text : "Wire Size"    , width : 150 , style : "text-align:left;"  , name : "wire_size" , class : "wiresize" }
            ,{ text : "Wire Type"   , width : 150 , style : "text-align:left;"  , name : "wire_type" , class : "wiretype"}
            ,{ text : "Wire Color"  , width : 150 , style : "text-align:left;"  , name : "wire_color" }
            ,{ text : "Quantity"    , width : 150 , style : "text-align:center;" , name : "wire_qty" }
            ,{ text : "Length"      , width : 150 , style : "text-align:center;" , name : "ttl_length" }
        ]
        ,onComplete : function(data) {
            editWCTable(data);
            $("#grid tbody").autoHideScroll2({
                isHoverBR : true
            });
        }
    });
});

function editWCTable(data) {
    var _$wcTable       = $("#grid");
    var _$tbody         = _$wcTable.find("tbody");
    var _$trs           = _$tbody.find("tr");
    var _onClick        = [];
    var _curWireSize    = "";
    var _length         = data.length;
    
    // get unique wire color
    gUnqWCData = []; // reset
    $.each(data, function(i, v) {
        var _grep = $.grep(gUnqWCData, function(x) { return v.wire_type === x.wire_type && v.wire_size === x.wire_size; });
        if (_grep.length === 0) {
            v.index = i;
            gUnqWCData.push(v);
        }
    });
    
    // loop the unique ang get the length
    $.each(gUnqWCData, function(i, v) {
        // For wiretype
        var _grep = $.grep(data, function(x) { return v.wire_type === x.wire_type && v.wire_size === x.wire_size; });
        $.each(_grep, function(_i, _v) {
            _onClick.push(_v);
        });
        
        _$trs.eq(v.index).find("td.wiretype").attr({
            rowspan : _grep.length
            ,class : "wiretype hasRowspan"
            ,onClick : "displayWireColor(" + JSON.stringify(_onClick) + ");"
        });
        
        if (_curWireSize !== v.wire_size.toString()) {
            _curWireSize = v.wire_size;
            
            var _onClick2 = [];
            var _rowspan = 0;
            
            for (var x = 0; x < _length; x++) {
                var _row = data[x];
                if (_row.wire_size.toString() === _curWireSize) {
                    for (var y = x; y < _length; y++, x++) {
                        var _row2 = data[y];
                        if (_row2.wire_size.toString() !== _curWireSize) {
                            break;
                        } else { _rowspan++; _onClick2.push(_row2); }
                    }
                }
            }
            
            _$trs.eq(v.index).find("td.wiresize").attr({
                rowspan : _rowspan
                ,class : "wiresize hasRowspan"
                ,onClick : "displayWireColor(" + JSON.stringify(_onClick2) + ");"
            });
            _onClick = [];
        }
    });
    
    // Remove the wiresize and wiretype without rowspan
    _$tbody.find("td.wiresize:not(.hasRowspan), td.wiretype:not(.hasRowspan)").remove();
}


$.fn.autoHideScroll2 = function(o) {
    o = o || {};
    o.isHoverBR = o.isHoverBR || false;
    
    for (let i = 0; i < this.length; i++) {
        var _this = this[i];
        var _$target = $(_this);
        var _tmr = 0;
        
        if ((_this.offsetWidth || _this.offsetHeight) && _$target.css("overflow")) {
            if ( ! o.isHoverBR ) {
                _$target.mouseover(function() { this.style.overflow = "auto"; });
            } else {
                _$target.mousemove(function (e) {
                    var _offset = _$target.offset();
                    if ((this.offsetWidth - 17) < e.pageX - _offset.left
                        || (this.offsetHeight - 17) < e.pageY - _offset.top) {
                        this.style.overflow = "auto";
                        console.log("sud");
                    } else { this.style.overflow = "hidden"; }
                });
            }
            _$target.mouseout(function() {  clearTimeout(_tmr); _tmr = setTimeout(function() { this.style.overflow = "hidden";} , 500); });
        } else { alert("Style height, width, and overfow are undefined."); }
    }
    
    return this;
}; 

$.fn.loadTable2 = function(o) {
    var __obj   = this;
    
    // If there is not .zTable div parent
    if ( ! __obj.parent().hasClass("zTable")) { console.log("%czTable div parent is not found.", "color:red;"); return false; }
    else {
        zsi.__setTableObjectsHistory(__obj,o);
        
        var isOnEC  = ( ! isUD(o.onEachComplete));
        if (isOnEC){    
            var _strFunc = o.onEachComplete.toString();
            var _args = _strFunc
            .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
            .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
            .split(/,/);
            if (_args.length < 1) console.warn("You must implement these parameters: tr,data");
        }
        
        if ( ! __obj.find("thead").length) __obj.append("<thead/>"); 
        if ( ! __obj.find("tbody").length) __obj.append("<tbody/>"); 
        
        if (__obj.length) {
            // Initialize object parameters
            var width           = o.width
                ,height         = o.height
                ,dataRows       = o.dataRows
                ,dRowsLength    = dataRows.length
                ,onComplete     = o.onComplete
                ,blankRowsLimit = o.blankRowsLimit
            
            // Initialize DOM objects
                ,$ztable        = __obj.closest(".zTable")
                ,$thead         = __obj.find("thead")
                ,$ths           = $thead.find("th")
                ,$tbody         = __obj.find("tbody")
            
            // Initialize variables 
                ,tw             = new zsi.easyJsTemplateWriter()
                ,bs             = zsi.bs.ctrl
                ,svn            = zsi.setValIfNull
                ,hasSpan        = (__obj.html().indexOf('span='))  ? true : false
            ;
            
            // Set table width and height
            $ztable.css({
                width : width
                ,height : height
            });
            
            // Create table headers
            tw.tr().in();
            if ($ths.length === 0) {
                for (var i = 0; i < dRowsLength; i++) {
                    var _dr = dataRows[i];
                    tw.th({ 
                        value : _dr.text 
                        ,style : _dr.style + "min-width:" + _dr.width + "px;width:" + _dr.width + "px;"
                    });
                }
                $thead.html(tw.html());   
                $ths = $thead.find("th");
            }
            
            // Add sorting functions
            if (typeof o.sortIndexes !== ud && zsi.__getTableObject(__obj).isInitiated === false) {
                var indexes     = o.sortIndexes
                    ,arrowUp    = "<span class='arrow-up'></span>"
                    ,arrowDown  = "<span class='arrow-down'></span>"
                    ,arrows     = arrowUp + arrowDown
                ;
                
                for (var x = 0; x < indexes.length; x++) {
                    $($ths[indexes[x]]).append(
                        tw.new().span({ class : "zSort" })
                        .in().a({ href : "javascript:void(0);" })
                        .in().span({ class : "sPane" , value : arrows }).html()
                    );
                }
                
                var aObj    = __obj.find(".zSort a");
                var url     = o.url; 
                
                aObj.click(function() {
                    var _$self  = $(this);
                    var i       = aObj.index(this);
                    zsi.table.sort.colNo = indexes[i];
                    
                    $(".sPane").html(arrows);
                    
                    var className = _$self.attr("class");
                    
                    if (typeof className === ud) { 
                        aObj.removeAttr("class");
                        _$self.addClass("asc").find(".sPane").html(arrowUp);
                    } else {
                        if (className.indexOf("asc") > -1) {
                            _$self.removeClass("asc").addClass("desc").find(".sPane").html(arrowDown);
                            zsi.table.sort.orderNo = 1;
                        } else {
                            _$self.removeClass("desc").addClass("asc").find(".sPane").html(arrowUp);
                            zsi.table.sort.orderNo = 0;
                        }
                    }
                    
                    zsi.table.__sortParameters = "@col_no=" + zsi.table.sort.colNo + ",@order_no=" + zsi.table.sort.orderNo; 
                    
                    o.url = (url.indexOf("@") < 0 ? url + " " : url + "," ) + zsi.table.__sortParameters + (zsi.table.__pageParameters === "" ? "" : "," + zsi.table.__pageParameters);
                    __obj.loadTable(o);
                });
            }
            
            // Create table data
            var createTr = function(data) {
                tw.new().tr({ class : zsi.getOddEven() }).in()
                .custom(function() {
                    for (var i = 0; i < dRowsLength; i++) {
                        var _info = dataRows[i];
                        var _td = {
                            style : _info.style + "min-width:" + _info.width + "px;width:" + _info.width + "px;"
                        };
                        
                        if (hasSpan) _td.attr = 'colindex="' + i + '"';
                        if ( ! isUD(_info.attr)) _td.attr += _info.attr;
                        if ( ! isUD(_info.class)) _td.class = _info.class;
                        if (_info.onRender) {
                            _td.value = _info.onRender(data);
                        } else {
                            if (isUD(_info.type)) {
                                _td.value = data[_info.name];
                            } else {
                                if ( ! isUD(_info.displayText)) {
                                    _td.value = bs({ name        : _info.name  
                                                    ,style       : _info.style 
                                                    ,type        : _info.type  
                                                    ,value       : svn(data , _info.name , _info.defaultValue) 
                                                    ,displayText : svn(data , _info.displayText) 
                                                });
                                } else {
                                    _td.value = bs({name : _info.name , style : _info.style , type : _info.type , value : svn(data , _info.name , _info.defaultValue )});
                                }
                            }
                             
                            if (i === 0 || i === o.selectorIndex) {
                                if ( ! isUD(o.selectorType)) {
                                    _td.value += (data !== null ? bs({name: (o.selectorType==="checkbox" ? "cb" : (o.selectorType==="radio" ? "rad" : "ctrl" )),type:o.selectorType}) : "" );
                                }
                            }
                        }
                        this.td(_td);
                    }
                    return this;
                });
                
                $tbody.append(tw.html());
                var _tr = $tbody.find("tr:last-child");
                if (isOnEC) {
                    o.onEachComplete(_tr,data);
                }
            };
            
            var addScrollbar = function() {
                $tbody.css({
                    width : width
                    ,height : height - $thead.height()
                }).on("scroll", function() {
                    $thead.scrollLeft($(this).scrollLeft());
                });
                
                $ztable.css({
                    "background-color" : ($tbody[0].scrollHeight > $tbody.height() - 17) ? "#DA160A" : "#ffffff"
                });
                
                $thead.css({
                    "width" : width - (($tbody[0].scrollHeight > $tbody.height() - 17) ? 17 : 0)
                });
            };
            
            if (typeof o.isNew !== ud) { if (o.isNew == true) __obj.clearGrid(); } 
            
            if (o.url || o.data) {
                if ($thead.length > 0) __obj.clearGrid(); 
                var params = {
                    dataType : "json"
                    ,cache : false
                    ,success : function(data) {
                        var _num_rows = data.rows.length;
                        var _$recordsNum = __obj.find("#recordsNum");
                        
                        if (dRowsLength) {
                            $.each(data.rows, function() {
                                createTr(this);
                            });
                        }
                        
                        // Set pagination
                        if (_$recordsNum.length) {
                            __obj.find("#recordsNum").html(_num_rows);
                            if (typeof zsi.page.__pageNo === ud || zsi.page.__pageNo === null) {
                                zsi.page.__pageNo = 1;
                                zsi.__setPageCtrl(o, o.url, data, __obj);
                            }
                        }
                        
                        // Set table initiated.
                        zsi.__getTableObject(__obj).isInitiated = true;
                        
                        // Add tr click event.
                        __obj.addClickHighlight();
                        addScrollbar();
                        if (onComplete) onComplete(data);
                        __obj.addColResize(o); // This must be after onComplete()
                    }          
                };
                
                if (typeof o.data !== ud) {
                    if(typeof zsi.config.getDataURL === ud) {
                        alert("zsi.config.getDataURL is not defined in AppStart JS.");
                        return;
                    }
                    params.url = zsi.config.getDataURL;
                    params.data = JSON.stringify(o.data);
                    params.type = "POST";
                } else params.url = o.url;
        
                __obj.bind('refresh', function() {
                    if (zsi.tmr) clearTimeout(zsi.tmr);
                    zsi.tmr = setTimeout(function() {
                        __obj.loadTable(o);
                    }, 1);   
                });
                
                $.ajax(params);
            } else if (o.rows.length && dRowsLength) {
                $.each(o.rows, function() {
                    createTr(this);
                });
                
                // Add tr click event.
                __obj.addClickHighlight();   
                addScrollbar();
                if (onComplete) onComplete(data);
                __obj.addColResize(o); // This must be after onComplete()
            } else {
                if (typeof blankRowsLimit === ud) blankRowsLimit = 5;
                for (var y = 0; y < blankRowsLimit; y++) {
                    createTr();
                }
                if (typeof o.onEachComplete === ud) {
                    
                    addScrollbar();
                    if (onComplete) onComplete();
                    __obj.addColResize(o); // This must be after onComplete()
                }
                // Add tr click event.
                __obj.addClickHighlight();
            }
        }
    }
};

$.fn.addColResize = function(o) {
    var __obj   = this;
    
    // Initialize object parameters
    var width           = o.width
        ,height         = o.height
        ,hasSpan        = (__obj.html().indexOf('span='))  ? true : false
    
    // Initialize DOM objects
        ,$ztable        = __obj.closest(".zTable")
        ,$thead         = __obj.find("thead")
        ,$ths           = $thead.find("tr:last-child th")
        ,$tbody         = __obj.find("tbody")
    
    // Initialize variables 
        ,tw             = new zsi.easyJsTemplateWriter()
        ,cache          = []
    ;
    
    if ( ! __obj.parent().hasClass("zTable")) { console.log("%czTable div parent is not found.", "color:red;"); return false; }
    else {
        if (__obj.length) {
            // This is only applicable if parameter hasSpan has a true value 
            if (hasSpan) {
                var $ths = $thead.find("tr:last-child th");
                var thsL = $ths.length;
                var $trs = $tbody.find("tr");
                var trsL = $trs.length;
                
                var temp = {};
                for (let i = 0; i < thsL; i++) {
                    var _$th = $($ths[i]);
                    _$th.attr("colindex", i);
                    temp[i] = _$th;
                }
                cache.push(temp);
                
                for (let i = 0; i < trsL; i++) {
                    var _$tr = $($trs[i]);
                    
                    var _$tds = _$tr.children("td");
                    var _tdsL = _$tds.length;
                    
                    var _temp = {};
                    
                    for (let _i = 0; _i < _tdsL; _i++) {
                        var _$td = $(_$tds[_i]);
                        _temp[_$td.attr("colindex")] = _$td;
                    }
                    cache.push(_temp);
                }
            }
            
            var _cr = [];
            var _posX = 0;
            // Create the cr
            tw.new().div({ class : "crPanel" , style : "left:" + __obj[0].offsetLeft + "px; top:" + __obj[0].offsetTop + "px;"}).in();
            $.each($ths, function(i,v) {
                _posX += v.offsetWidth;
                _cr.push({ 
                    x : _posX 
                   ,width : v.offsetWidth
                });
                
                tw.div({ 
                    class : (_posX >= width) ? "cr hidden" : "cr"
                    ,style : "left:" + _posX + "px; height : " + (height - 17) + "px; top:0;"
                });
            });
            $ztable.append(tw.html());
            
            // Dynamic positioning and display of crs
            var _$crPanel   = $ztable.find(".crPanel");
            var _$cr        = _$crPanel.find(".cr");
            var _crL        = _cr.length;
            var _objOffL    = __obj[0].offsetLeft;
            $tbody.on("scroll", function() {
                var _left = _objOffL - $tbody.scrollLeft();
                
                _$crPanel.css({ "left" : _left + "px" });
                for (var i = 0; i < _crL; i++) {
                    var _info = _cr[i];
                    var _x = _info.x + _left;
                    if ( _x >= width || _x <= _objOffL) $(_$cr[i]).addClass("hidden");
                    else $(_$cr[i]).removeClass("hidden");
                }
            });
            
            // On click cr
            var _$curCr;
            var _crIndex;
            var __cr;
            var _limit;
            var _pageX;
            _$cr.off("mousedown").on("mousedown", function(e) {
                _$curCr     = $(this);
                _crIndex    = _$curCr.index();
                __cr        = _cr[_crIndex];
                _limit      = (_crIndex === 0) ? 25 : _cr[_crIndex - 1].x + 25;
                _pageX      = e.pageX;
                
                _$curCr.addClass("active");
                $ztable.addClass("noSelect");
            });
            
            // On move an release
            var _originX;
            var _pageX2;
            $ztable.off("mousemove").on("mousemove", function(e) {
                if ( ! isUD(_$curCr) && e.target.classList[0] !== "cr") {
                    var _x = (e.pageX - $(this).offset().left) + $tbody.scrollLeft();
                    if (_x > _limit) {
                        _$curCr.css({ "left" : _x });
                        _originX = _x;
                        _pageX2 = e.pageX;
                    }
                }
            });
            
            $(window).on("mouseup", function(e) {
                if ( ! isUD(_$curCr)) {
                    _$curCr.removeClass("active");
                    $ztable.removeClass("noSelect");
                    
                    var _newW = (_pageX2 >= _pageX) ? __cr.width + (_originX - __cr.x) : __cr.width - (__cr.x - _originX);
                    __cr.width = _newW;
                    
                    if (hasSpan) {
                        for (let i = 0; i < cache.length; i++) {
                            var _c = cache[i];
                            for (var key in _c) {
                                if (_crIndex === parseInt(key)) {
                                    _c[key].css({
                                        "width" : _newW
                                        ,"min-width" : _newW
                                    });
                                }
                            }
                        }
                    } else {
                        var _nth = _crIndex + 1;
                        $ztable.find("th:nth-child(" + _nth + ") , td:nth-child(" + _nth + ")").css({
                            "width" : _newW
                            ,"min-width" : _newW
                        });
                    }
                    
                    // Adjust the cr position
                    _posX = 0;
                    for (var i = 0; i < _crL; i++) {
                        var _info = _cr[i];
                        
                        _posX += _info.width;
                        _info.x = _posX;
                        
                        if ( _info.x >= width || _info.x <= _objOffL) {
                            $(_$cr[i]).addClass("hidden").css({ "left" : _info.x + "px" });
                        } else {
                            $(_$cr[i]).removeClass("hidden").css({ "left" : _info.x + "px" });
                        }
                    }
                    
                    // Reset
                    _$curCr = undefined;
                    
                    // Resize tbody and change color if there is a scroll
                    $tbody.css({
                        width : width
                        ,height : height - $thead.height()
                    });
                    $ztable.css({
                        "background-color" : ($tbody[0].scrollWidth > $tbody.width() - 17) ? "#DA160A" : "#ffffff"
                    });
                }
            });
        }
    }
}; 



$.fn.loadTable          = function(o) {
                var __obj   = this;
                
                // If there is not .zTable div parent
                if ( ! __obj.parent().hasClass("zTable")) { console.log("%czTable div parent is not found.", "color:red;"); return false; }
                else {
                    zsi.__setTableObjectsHistory(__obj,o);
                    
                    var isOnEC  = ( ! isUD(o.onEachComplete));
                    if (isOnEC){    
                        var _strFunc = o.onEachComplete.toString();
                        var _args = _strFunc
                        .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
                        .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
                        .split(/,/);
                        if (_args.length < 1) console.warn("You must implement these parameters: tr,data");
                    }
                    
                    if (__obj.length) {
                        // Initialize object parameters
                        var width           = o.width
                            ,height         = o.height
                            ,dataRows       = o.dataRows
                            ,dRowsLength    = dataRows.length
                            ,onComplete     = o.onComplete
                            ,blankRowsLimit = o.blankRowsLimit
                        
                        // Initialize DOM objects
                            ,$ztable        = __obj.closest(".zTable")
                            ,$thead         = (!__obj.find("thead").length) ? $ztable.append("<thead/>") : __obj.find("thead")
                            ,$ths           = $thead.find("th")
                            ,$tbody         = (!__obj.find("tbody").length) ? $ztable.append("<tbody/>") : __obj.find("tbody")
                        
                        // Initialize variables 
                            ,tw             = new zsi.easyJsTemplateWriter()
                            ,bs             = zsi.bs.ctrl
                            ,svn            = zsi.setValIfNull
                        ;
                        
                        // Set table width and height
                        $ztable.css({
                            width : width
                            ,height : height
                        });
                        
                        // Create table headers
                        tw.tr().in();
                        if ($ths.length === 0) {
                            for (var i = 0; i < dRowsLength; i++) {
                                var _dr = dataRows[i];
                                tw.th({ 
                                    value : _dr.text 
                                    ,style : _dr.style + "min-width:" + _dr.width + "px;width:" + _dr.width + "px;"
                                });
                            }
                            $thead.html(tw.html());   
                            $ths = $thead.find("th");
                        }
                        
                        // Add sorting functions
                        if (typeof o.sortIndexes !== ud && zsi.__getTableObject(__obj).isInitiated === false) {
                            var indexes     = o.sortIndexes
                                ,arrowUp    = "<span class='arrow-up'></span>"
                                ,arrowDown  = "<span class='arrow-down'></span>"
                                ,arrows     = arrowUp + arrowDown
                            ;
                            
                            for (var x = 0; x < indexes.length; x++) {
                                $($ths[indexes[x]]).append(
                                    tw.new().span({ class : "zSort" })
                                    .in().a({ href : "javascript:void(0);" })
                                    .in().span({ class : "sPane" , value : arrows }).html()
                                );
                            }
                            
                            var aObj    = __obj.find(".zSort a");
                            var url     = o.url; 
                            
                            aObj.click(function() {
                                var _$self  = $(this);
                                var i       = aObj.index(this);
                                zsi.table.sort.colNo = indexes[i];
                                
                                $(".sPane").html(arrows);
                                
                                var className = _$self.attr("class");
                                
                                if (typeof className === ud) { 
                                    aObj.removeAttr("class");
                                    _$self.addClass("asc").find(".sPane").html(arrowUp);
                                } else {
                                    if (className.indexOf("asc") > -1) {
                                        _$self.removeClass("asc").addClass("desc").find(".sPane").html(arrowDown);
                                        zsi.table.sort.orderNo = 1;
                                    } else {
                                        _$self.removeClass("desc").addClass("asc").find(".sPane").html(arrowUp);
                                        zsi.table.sort.orderNo = 0;
                                    }
                                }
                                
                                zsi.table.__sortParameters = "@col_no=" + zsi.table.sort.colNo + ",@order_no=" + zsi.table.sort.orderNo; 
                                
                                o.url = (url.indexOf("@") < 0 ? url + " " : url + "," ) + zsi.table.__sortParameters + (zsi.table.__pageParameters === "" ? "" : "," + zsi.table.__pageParameters);
                                __obj.loadTable(o);
                            });
                        }
                        
                        // Create table data
                        var createTr = function(data) {
                            tw.new().tr({ class : zsi.getOddEven() }).in()
                            .custom(function() {
                                for (var i = 0; i < dRowsLength; i++) {
                                    var _info = dataRows[i];
                                    var _td = {
                                        style : _info.style + "min-width:" + _info.width + "px;width:" + _info.width + "px;"
                                    };
                                  
                                    if ( ! isUD(_info.attr)) _td.attr = _info.attr;
                                    if ( ! isUD(_info.class)) _td.class = _info.class;
                                    if (_info.onRender) {
                                        _td.value = _info.onRender(data);
                                    } else {
                                        if (isUD(_info.type)) {
                                            _td.value = data[_info.name];
                                        } else {
                                            if ( ! isUD(_info.displayText)) {
                                                _td.value = bs({ name        : _info.name  
                                                                ,style       : _info.style 
                                                                ,type        : _info.type  
                                                                ,value       : svn(data , _info.name , _info.defaultValue) 
                                                                ,displayText : svn(data , _info.displayText) 
                                                            });
                                            } else {
                                                _td.value = bs({name : _info.name , style : _info.style , type : _info.type , value : svn(data , _info.name , _info.defaultValue )});
                                            }
                                        }
                                         
                                        if (i === 0 || i === o.selectorIndex) {
                                            if ( ! isUD(o.selectorType)) {
                                                _td.value += (data !== null ? bs({name: (o.selectorType==="checkbox" ? "cb" : (o.selectorType==="radio" ? "rad" : "ctrl" )),type:o.selectorType}) : "" );
                                            }
                                        }
                                    }
                                    this.td(_td);
                                }
                                return this;
                            });
                            
                            $tbody.append(tw.html());
                            var _tr = $tbody.find("tr:last-child");
                            if (isOnEC) {
                                o.onEachComplete(_tr,data);
                            }
                        };
                        
                        var addScrollbar = function() {
                            $tbody.css({
                                width : width
                                ,height : height - $thead.height()
                            }).on("scroll", function() {
                                $thead.scrollLeft($(this).scrollLeft());
                            });
                            
                            $ztable.css({
                                "background-color" : ($tbody[0].scrollHeight > $tbody.height() - 17) ? "#DA160A" : "#ffffff"
                            });
                            
                            $thead.css({
                                "width" : width - (($tbody[0].scrollHeight > $tbody.height() - 17) ? 17 : 0)
                            });
                        };
                        
                        var addColResize = function() {
                            var _cr = [];
                            var _posX = 0;
                            
                            // Create the cr
                            tw.new().div({ class : "crPanel" , style : "left:" + __obj[0].offsetLeft + "px; top:" + __obj[0].offsetTop + "px;"}).in();
                            $.each(dataRows, function(i,v) {
                                _posX += v.width;
                                _cr.push({ 
                                    x : _posX 
                                   ,width : v.width
                                });
                                
                                tw.div({ 
                                    class : (_posX >= width) ? "cr hidden" : "cr"
                                    ,style : "left:" + _posX + "px; height : " + (height - 17) + "px; top:0;"
                                });
                            });
                            $ztable.append(tw.html());
                            
                            // Dynamic positioning and display of crs
                            var _$crPanel = $ztable.find(".crPanel");
                            var _$cr = _$crPanel.find(".cr");
                            var _crL = _cr.length;
                            var _objOffL = __obj[0].offsetLeft;
                            var _offsetL;
                            $tbody.on("scroll", function() {
                                _offsetL = $tbody.find("tr:nth-child(1)").offset().left;
                                var _left = _objOffL - $tbody.scrollLeft();
                                
                                _$crPanel.css({ "left" : _left + "px" });
                                for (var i = 0; i < _crL; i++) {
                                    var __cr = _cr[i];
                                    var _x = __cr.x + _left;
                                    if ( _x >= width || _x <= _objOffL) {
                                        $(_$cr[i]).addClass("hidden");
                                    } else {
                                        $(_$cr[i]).removeClass("hidden");
                                    }
                                }
                            });
                            
                            // On click cr
                            var _$curCr;
                            var _crIndex;
                            var __cr;
                            var _limit;
                            var _pageX;
                            _$cr.off("mousedown").on("mousedown", function(e) {
                                _$curCr     = $(this);
                                _crIndex    = _$curCr.index();
                                __cr        = _cr[_crIndex];
                                _limit      = (_crIndex === 0) ? 25 : _cr[_crIndex - 1].x + 25;
                                _pageX      = e.pageX;
                                
                                _$curCr.addClass("active");
                                $ztable.addClass("noSelect");
                                //$tbody.css({ "overflow" : "hidden" });
                            });
                            
                            // On move an release
                            var _originX;
                            var _pageX2;
                            $ztable.off("mousemove").on("mousemove", function(e) {
                                if ( ! isUD(_$curCr) && e.target.classList[0] !== "cr") {
                                    var _x = (e.pageX - $(this).offset().left) + $tbody.scrollLeft();
                                    if (_x > _limit) {
                                        _$curCr.css({ "left" : _x });
                                        _originX = _x;
                                        _pageX2 = e.pageX;
                                    }
                                }
                            });
                            
                            $(window).on("mouseup", function(e) {
                                if ( ! isUD(_$curCr)) {
                                    _$curCr.removeClass("active");
                                    $ztable.removeClass("noSelect");
                                    //$tbody.css({ "overflow" : "auto" });
                                    
                                    var _nth = _crIndex + 1;
                                    var _newW = (_pageX2 >= _pageX) ? __cr.width + (_originX - __cr.x) : __cr.width - (__cr.x - _originX);
                                    
                                    __cr.width = _newW;
                                    $ztable.find("th:nth-child(" + _nth + ") , td:nth-child(" + _nth + ")").css({
                                        "width" : _newW
                                        ,"min-width" : _newW
                                    });
                                    
                                    // Adjust the cr position
                                    _posX = 0;
                                    for (var i = 0; i < _crL; i++) {
                                        var _info = _cr[i];
                                        
                                        _posX += _info.width;
                                        _info.x = _posX;
                                        
                                        if ( _info.x >= width || _info.x <= _objOffL) {
                                            $(_$cr[i]).addClass("hidden").css({ "left" : _info.x + "px" });
                                        } else {
                                            $(_$cr[i]).removeClass("hidden").css({ "left" : _info.x + "px" });
                                        }
                                    }
                                    
                                    // Reset
                                    _$curCr = undefined;
                                    
                                    // Resize tbody and change color if there is a scroll
                                    $tbody.css({
                                        width : width
                                        ,height : height - $thead.height()
                                    });
                                    $ztable.css({
                                        "background-color" : ($tbody[0].scrollWidth > $tbody.width() - 17) ? "#DA160A" : "#ffffff"
                                    });
                                }
                            });
                        };
                        
                        if (typeof o.isNew !== ud) { if (o.isNew == true) __obj.clearGrid(); } 
                        
                        if (o.url || o.data) {
                            if ($thead.length > 0) __obj.clearGrid(); 
                            var params = {
                                dataType : "json"
                                ,cache : false
                                ,success : function(data) {
                                    var _num_rows = data.rows.length;
                                    var _$recordsNum = __obj.find("#recordsNum");
                                    
                                    if (dRowsLength) {
                                        $.each(data.rows, function() {
                                            createTr(this);
                                        });
                                    }
                                    
                                    // Set pagination
                                    if (_$recordsNum.length) {
                                        __obj.find("#recordsNum").html(_num_rows);
                                        if (typeof zsi.page.__pageNo === ud || zsi.page.__pageNo === null) {
                                            zsi.page.__pageNo = 1;
                                            zsi.__setPageCtrl(o, o.url, data, __obj);
                                        }
                                    }
                                    
                                    // Set table initiated.
                                    zsi.__getTableObject(__obj).isInitiated = true;
                                    
                                    // Add tr click event.
                                    __obj.addClickHighlight();
                                    
                                    addScrollbar();
                                    addColResize();
                                    if (onComplete) onComplete(data);
                                }          
                            };
                            
                            if (typeof o.data !== ud) {
                                if(typeof zsi.config.getDataURL === ud) {
                                    alert("zsi.config.getDataURL is not defined in AppStart JS.");
                                    return;
                                }
                                params.url = zsi.config.getDataURL;
                                params.data = JSON.stringify(o.data);
                                params.type = "POST";
                            } else params.url = o.url;
                    
                            __obj.bind('refresh', function() {
                                if (zsi.tmr) clearTimeout(zsi.tmr);
                                zsi.tmr = setTimeout(function() {
                                    __obj.loadTable(o);
                                }, 1);   
                            });
                            
                            $.ajax(params);
                        } else if (o.rows.length && dRowsLength) {
                            $.each(o.rows, function() {
                                createTr(this);
                            });
                            
                            addScrollbar();
                            addColResize();
                            if (onComplete) onComplete(data);
                            __obj.addClickHighlight();        
                        } else {
                            if (typeof blankRowsLimit === ud) blankRowsLimit = 5;
                            for (var y = 0; y < blankRowsLimit; y++) {
                                createTr();
                            }
                            if (typeof o.onEachComplete === ud) {
                                
                                addScrollbar();
                                addColResize();
                                if (onComplete) onComplete();
                            }
                            // Add tr click event.
                            __obj.addClickHighlight();
                        }
                    }
                }
            };