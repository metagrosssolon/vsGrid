<link  href="/amcharts/amcharts/plugins/export/export.css" rel="stylesheet" type="text/css" />

<script src="/amcharts/amcharts/amcharts.js"></script>
<script src="/amcharts/amcharts/serial.js"></script>
<script src="/amcharts/amcharts/pie.js"></script>
<script src="/amcharts/amcharts/plugins/export/export.js" type="text/javascript"></script>

<style>
/* ----------- VINCENT -------------- */
#localTemplates {
    display: none;
}

.no-padding {
    padding : 0 !important;
}

.hidden {
    display : none;
}

#wiretype_section
,#wirecolor_section
,#ts_section
,#tp_section {
    display : none;
}

/* ----------- wire size & wire type -------------- */

#wsChartPanel, #wtChartPanel {
    overflow: hidden;
    height: 310px;
}

#wsPieChart, #wtPieChart {
    height : 100%;
}

#wsRefTablePanel, #wtRefTablePanel {
    overflow: hidden;
    width: 100%;
    height: 310px;
}

#wsRefTablePanel #totalRow div
,#wtRefTablePanel #totalRow div {
    text-align : center;
    float : left;
    width : 190px;
    font-weight : 600;
}

#wsTypeTable th
,#wsTypeTable td
,#wsHarnessTable th
,#wsHarnessTable td {
    min-width : 100px; 
    width : 100px; 
    text-align : center;
    word-break: break-all;
    word-wrap: break-word;
}

/* ----------- wire color -------------- */

#wcGraph {
    width: 80%;
    float: right;
}

#wcGraphXtraHeader {
    margin-top: 25px;
    float : left;
    position: absolute;
    top: 0;
}

#wcGraphXtraHeader
,#wcGraphXtraHeader td {
    border : none;
    border-bottom : 1pt solid #d6d8d8;
}

#wcGraphXtraHeader td:not(.wiresize) {
    min-width : 130px;
    width : 130px;
}

#wcTable th
,#wcTable td {
    min-width : 100px;
    width : 100px;
    text-align:center;
    border-bottom: 1pt solid #d6d8d8;
    word-break: break-all;
    word-wrap: break-word;
}

/* --------------------- Twisting and shielding ------------------------- */

#tsRefTablePanel ,#tsGraphPanel {
    overflow: hidden;
    width: 100%;
    height: 310px;
}

#tsRefTable th
,#tsRefTable td {
    min-width : 100px;
    width : 100px;
    text-align:center;
    border-bottom: 1pt solid #d6d8d8;
    word-break: break-all;
    word-wrap: break-word;
}

/* -------------- .subMenu DropDown Recursive styles ------------- */ 

.subMenu {
    padding: 5px;
    overflow: auto;
}

ul.zdd-panel div.zdd-head span.zdd-icon {
    float: right;
}

ul.zdd-panel li.zdd-item {
    border: 1pt solid #dedede;
    background: #f5f5f5;
    background: linear-gradient(to bottom,#f5f5f5 0,#e8e8e8 100%);
    color: #333333;
    padding: 5px 7px;
    cursor : pointer;
}

ul.zdd-panel li.zdd-item:hover {
    background: linear-gradient(to bottom,#f5f5f5 0,#a2a2a2 100%);
}

ul.zdd-panel div.zdd-body ul.zdd-panel div.zdd-body {
    padding: 5px;
    background: white;
    border-left: 1pt solid #dedede;
    border-right: 1pt solid #dedede;
    border-bottom: 1pt solid #dedede;
}

ul.zdd-panel div.zdd-body #cb {
    width: 25px;
    margin: 2px 0;
    float: left;
}

ul.zdd-panel li.zdd-item.active {
    background: linear-gradient(to bottom,#f5f5f5 0,#a2a2a2 100%);
    font-weight: 600;
}

/* -------------- END .subMenu DropDown Recursive styles ------------- */ 

/* -------------------- Circuit List Content Popup -------------------- */

#refTable2 {
    margin : 0 auto;
}

#btnPrintRefTable2 {
    float : right;
}

/* -------------------- end Circuit List Content Popup -------------------- */


table thead th {
    height: 100%;
    right: 0px;
    position: absolute;
    cursor: w-resize;
    top: 0px;
    width: 2px;
}

</style>

<div id="leftPane" class="col-xs-2 zPanel"></div>
 
<div id="rightPane" class="col-xs-10">
    <div id="wiresize_section" class="section">
        <div class="col-xs-7">
            <div id="wsChartPanel" class="zPanel">
                <div id="wsPieChart"></div>
            </div>
        </div>
        <div class="col-xs-5">
            <div id="wsRefTablePanel" class="zPanel">
                <div id="wsRefTable" class="zGrid"></div>
            </div>
        </div>
        <div class="col-xs-12">
            <div id="wsElecTablePanel" class="zPanel">
                <div id="wsElecTable" class="zGrid"></div>
            </div>
        </div>
    </div>
    <div id="wiretype_section" class="section">
        <div class="col-xs-7">
            <div id="wtChartPanel" class="zPanel">
                <div id="wtPieChart"></div>
            </div>
        </div>
        <div class="col-xs-5">
            <div id="wtRefTablePanel" class="zPanel">
                <div id="wtRefTable" class="zGrid"></div>
            </div>
        </div>
        <div class="col-xs-12">
            <div id="wtElecTablePanel" class="zPanel">
                <div id="wtElecTable" class="zGrid"></div>
            </div>
        </div>
    </div>
    <div id="wirecolor_section" class="section">
        <div class="col-xs-6">
            <div id="wcGrapPanel" class="zPanel">
                <table id="wcGraphXtraHeader"> 
                    <tbody></tbody>
                </table>
                <div id="wcGraph"></div>
            </div>
        </div>
        <div class="col-xs-6">
            <div id="wcTablePanel" class="zPanel">
                <table id="wcTable" class="zGrid">
                    <thead>
                        <tr>
                            <th>Wire Size<div class="cr"></div></th>
                            <th>Wire Type<div class="cr"></div></th>
                            <th>Wire Color<div class="cr"></div></th>
                            <th>Twisting and Shielding<div class="cr"></div></th>
                            <th>Terminal Plating<div class="cr"></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        
                    </tbody>
                </table>
            </div>
        </div>
        <div class="col-xs-12">
            <div id="wcElecTable" class="zGrid"></div>
        </div>
    </div>
    <div id="ts_section" class="section">
        <div class="col-xs-7">
            <div id="tsGraphPanel" class="zPanel">
                <div id="tsGraph"></div>
            </div>
        </div>
        <div class="col-xs-5">
            <div id="tsRefTablePanel" class="zPanel">
                <table id="tsRefTable" class="zGrid">
                    <thead>
                        <tr>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="col-xs-12">
            <div class="col-xs-3">
                <div id="tsElecTablePanel1" class="zPanel">
                    <div id="tsElecTable1" class="zGrid"></div>
                </div>
            </div>
            <div class="col-xs-9">
                <div id="tsElecTablePanel2" class="zPanel">
                    <div id="tsElecTable2" class="zGrid"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="tp_section" class="section">Terminal Plating</div>
</div>

<ul id="localTemplates">
    <li name="createSubMenu">
        <ul class="zdd-panel">
            <div class="zdd-body">
                <ul class="zdd-panel">
                    <div class="zdd-head"><li class="zdd-item active">Wire Size<span class="glyphicon glyphicon-triangle-bottom zdd-icon"></span></li></div>
                    <div class="zdd-body" style="display: none;"></div>
                </ul>
                <ul class="zdd-panel">
                    <div class="zdd-head"><li class="zdd-item">Wire Type<span class="glyphicon glyphicon-triangle-bottom zdd-icon"></span></li></div>
                    <div class="zdd-body" style="display: none;"></div>
                </ul>
                <ul class="zdd-panel">
                    <div class="zdd-head"><li class="zdd-item">Wire Color<span class="glyphicon glyphicon-triangle-bottom zdd-icon hidden"></span></li></div>
                </ul>
                <ul class="zdd-panel">
                    <div class="zdd-head"><li class="zdd-item">Twisting and Shielding<span class="glyphicon glyphicon-triangle-bottom zdd-icon"></span></li></div>
                    <div class="zdd-body" style="display: none;"></div>
                </ul>
                <ul class="zdd-panel">
                    <div class="zdd-head"><li class="zdd-item">Terminal Plating<span class="glyphicon glyphicon-triangle-bottom zdd-icon"></span></li></div>
                    <div class="zdd-body" style="display: none;"></div>
                </ul>
            </div>
        </ul>
    </li>
    <li name="circuitListContent">
        <div id="refTable2" class="zGrid"></div>
        <div id="wsTypePanel" class="col-xs-6">
            <table id="wsTypeTable" class="zGrid">
                <thead>
                    <tr>
                        <th>Wire Size</th>
                        <th>Wire Type</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <div id="wsHarnessPanel" class="col-xs-6">
            <table id="wsHarnessTable" class="zGrid">
                <thead>
                    <tr>
                        <th>Wire Size</th>
                        <th>Harness</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="col-xs-12" style="padding:5px;">
            <button id="btnPrintRefTable2" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-print"></span></button>
        </div>
    </li>
</ul>