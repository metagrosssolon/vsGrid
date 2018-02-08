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

		// Merge defaults and options, without modifying defaults
		//var settings = $.extend( {} , defaults, options );
		
		// Merge object2 into object1, recursively
		var settings = $.extend( true , defaults, options );

		var $self = this[0];

		$.fn.vsGrid.createTable({
			elem : $self
			,settings : settings
		});

		// To make chainable
		return $self;
	}
};

$.fn.vsGrid.createTable = function(o) {
	var self 		= o.elem;
	var settings 	= o.settings;
	var data 		= settings.data;
	var rows 		= settings.rows;
	var size 		= settings.size;
	var pLimit 		= settings.pageLimit;

	var $self 		= $(self);
	var id 			= $self.attr('id');
    
    var rowsLength 	= rows.length;
	var dataLength 	= data.length;

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
	
	// Create #vsGrid-cus-style style tag
	$('head').append('<style id="vsGrid-cus-style"></style>');
    var $style = $("#vsGrid-cus-style");
   
	var $thead = $self.find("thead");
	var $tbody = $self.find("tbody");
	var $pageLimitBox = $self.find(".vs-pagelimit-box");
	var $pageLimit;
	var $pagination = $self.find("#vs-pagination");
	
	var thead_s = "";
	var tbody_s = "";
	var pLimit_s = "";
	var pagination_s = "";
	var style_s = "";
	
	// Create pagelimit
	pLimit_s = '<select name="vs-pagelimit" id="vs-pagelimit">';
	for (let i = 0; i < pLimit.length; i++) {
		var _pl = pLimit[i];
		pLimit_s += '<option value="' + _pl + '">' + _pl + '</option>';
	}
    pLimit_s += '</select>';
	$pageLimitBox.html(pLimit_s);
	$pageLimit = $pageLimitBox.find("#vs-pagelimit");
	
	// Create pagination
	var pages = dataLength / $pageLimit.val();
	pagination_s += '<li class="vs-page">Prev</li>';
	if (pages <= 5) {
		for (let i = 1; i <= pages; i++) {
			pagination_s += '<li class="vs-page">' + i + '</li>';
		}
	} else {
		pagination_s += '<li class="vs-page">1</li><li class="vs-page">2</li><li class="vs-page">3</li><li class="vs-page">...</li><li class="vs-page">' + pages + '</li>';
	}
	pagination_s += '<li class="vs-page">Next</li>';
	$pagination.html(pagination_s);

	// Create vsGrid thead
	thead_s 	+= 	'<tr>';
	for (let i = 0; i < rowsLength; i++) {
	    var _row = rows[i];
	    thead_s 	+= 	'<th>' + _row.column + '</th>';
	    
	    //Create per column styles
	    var _nth = i + 1;
		style_s += '#' + id + ' thead th:nth-child(' + _nth + ')'
		      +  ', #' + id + ' tbody td:nth-child(' + _nth + ')' 
		      +  '{' + _row.style + ' min-width : ' + _row.width + 'px; width : ' + _row.width + 'px; }';
	}
	thead_s 	+=	'</tr>';
	$thead.html(thead_s);
    
	// Create vsGrid tbody
	for (let i = 0; i < dataLength; i++) {
		var _data = data[i];

		tbody_s += '<tr>';
		for (let ii = 0; ii < rowsLength; ii++) {
			var _row = rows[ii];
			tbody_s += '<td>' + _data[_row.column] + '</td>';
		}
		tbody_s += '</tr>';
	}
	
	$tbody.html(tbody_s).on("scroll", function(){
	    // Add scroll event
    	$thead.scrollLeft($(this).scrollLeft());
    });
	
    // vsGrid size
    style_s += '#' + id + ' { width : ' + size.width + 'px; height : ' + size.height + 'px; }';

    // panel-t and panel-b width
    style_s += '#' + id + ' #vs-panel-t , #' + id + ' #vs-panel-b { height : 20px; }';

    // thead width
    style_s += '#' + id + ' thead { width : ' + (size.width - 17) + 'px; }';

    // tbody size
    style_s += '#' + id + ' tbody { width : ' + size.width + 'px; height : ' + ((size.height - $thead.height()) - 40) + 'px; }';
	
	// Append vsGrid custom styles
    $style.append(style_s);
};

$.fn.vsGrid.loadData = function(o) {
	var tbody_s = "";
}