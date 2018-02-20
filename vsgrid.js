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