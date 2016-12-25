$(document).ready(function() {

    // MAIN TABS
    var breakLineWidth = 840;
    var breakLineExpanded = !($(window).width()<breakLineWidth);
    var breakLineUpdate = function(){
        if (!breakLineExpanded && $(window).width()<breakLineWidth){
            $('.break-line div').animate({paddingBottom:"40px"}, 180);
            breakLineExpanded = true;
        }
        else if (breakLineExpanded && $(window).width()>=breakLineWidth){
            $(".break-line div").animate({paddingBottom:"0px"}, 180);
            breakLineExpanded = false;
        }
    };
    breakLineUpdate();

    setActiveTab();
    $(window).on("hashchange", setActiveTab);
    updateHashOnTabActivate();

    $(window).resize(function(){
        breakLineUpdate();
    });



    // HOBBIES accordion
    $( "#accordion-jquery" ).accordion( {
        heightStyle: "content",
        animate: {
          duration: 150
        }
    } );

    // EXPERIENCE accordion
    var headers = $('#accordion-expanded .accordion-header');
    var contentAreas = $('#accordion-expanded .ui-accordion-content ').hide().slideDown();
    var expandLink = $('.accordion-expand-all').data('isAllOpen', true);


    // add the accordion functionality
    headers.click(function() {
        var panel = $(this).next();
        var isOpen = panel.is(':visible');

        // open or close as necessary
        panel[isOpen? 'slideUp': 'slideDown'](function(){
            $(this).trigger(isOpen? 'hide': 'show');
        });

        // stop the link from causing a pagescroll
        return false;
    });

    // when panels open or close, check to see if they're all open
    contentAreas.on({
        // whenever we open a panel, check to see if they're all open
        // if all open, swap the button to collapse
        show: function(){
            var isAllOpen = !contentAreas.is(':hidden');
            if(isAllOpen){
                expandLink.html('<span class="ui-icon ui-icon-circlesmall-minus resume-icon"></span>' +
                         '<span id="label-expand">COLLAPSE ALL</span>')
                    .data('isAllOpen', true);
            }
        },
        // whenever we close a panel, check to see if they're all open
        // if not all open, swap the button to expander
        hide: function(){
            var isAllOpen = !contentAreas.is(':hidden');
            if(!isAllOpen){
                expandLink.html('<span class="ui-icon ui-icon-circlesmall-plus resume-icon"></span>' +
                     '<span id="label-expand">EXPAND ALL</span>')
                    .data('isAllOpen', false);
            }
        }
    });

    // hook up the expand/collapse all

    expandLink.click(function(){
        var isAllOpen = $(this).data('isAllOpen');

        contentAreas[isAllOpen? 'slideUp': 'slideDown'](function(){
            $(this).trigger(isAllOpen? 'hide': 'show');
        });
    });



//    $('#tabs').on('tabactivate', function(event, ui){
//        if ($('#tabs.ui-state-active').index()===1){
//            alert('test');
//        }
//    });

//    $('#tabs a[href="#tab-experience"]').click(function(){
//        alert('test');
//    });
    $("#tabs").on('tabsactivate', function (event, ui) {

        if (ui.newTab.index()==1){
            contentAreas.hide(0, function(){
                contentAreas.slideDown(120);
            });
        }
        else if (ui.newTab.index()==3){
            // HOBBY accordion init
            $("#tab-hobby h3:last").trigger("click");
            $("#tab-hobby h3:first").trigger("click");
        }

    });

    // EXPERIENCE button
    $("#button-to-caplet").click(function(){
        $( "#tabs" ).tabs( "option", "active", 2 );
    });

    // HOBBY photography
    $(".fancybox").fancybox({
        openEffect	: 'none',
        nextEffect  : 'elastic',
        prevEffect  : 'elastic',
        closeEffect	: 'elastic',
        openSpeed   : '80',
        nextSpeed   : '40',
        prevSpeed   : '40',
        closeSpeed  : '80',
        padding: ['7px', '7px', '7px', '7px'],
        helpers	: {
            title	: {
                type: 'outside'
            },
            thumbs	: {
                width	: 50,
                height	: 50
            }
        }
    });


    // HOBBY travel map

    function setMarker(map, location, type){
        var markerIconPark = "http://labs.google.com/ridefinder/images/mm_20_green.png";
        var markerIconAirport = "http://labs.google.com/ridefinder/images/mm_20_white.png";
        var markerIconCity = "http://labs.google.com/ridefinder/images/mm_20_blue.png";
        var markerIconResidence = "http://labs.google.com/ridefinder/images/mm_20_orange.png";
        var markerIconUnknown = "http://labs.google.com/ridefinder/images/mm_20_black.png";

        var myIcon;
        var myZIndex;
        var i;

        if (type==="park"){
            myIcon = markerIconPark;
            myZIndex = 2;
        }
        else if (type==="airport"){
            myIcon = markerIconAirport;
            myZIndex = 0;
        }
        else if (type==="city"){
            myIcon = markerIconCity;
            myZIndex = 1;
        }
        else if (type==="residence"){
            myIcon = markerIconResidence;
            myZIndex = 3;
        }
        else {
            myIcon = markerIconUnknown;
        }
        for (i=0; i<location.length; i++){

            var myLatLng = new google.maps.LatLng(location[i][1], location[i][2])
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: location[i][0],
                icon: myIcon,
                zIndex: myZIndex
            });
        }
    }

    function setGeoJsonMarker(map, json, type){
        var markerIconPark = "http://labs.google.com/ridefinder/images/mm_20_green.png";
        var markerIconAirport = "http://labs.google.com/ridefinder/images/mm_20_white.png";
        var markerIconCity = "http://labs.google.com/ridefinder/images/mm_20_blue.png";
        var markerIconResidence = "http://labs.google.com/ridefinder/images/mm_20_orange.png";
        var markerIconUnknown = "http://labs.google.com/ridefinder/images/mm_20_black.png";

        var myIcon;
        var myZIndex;
        var i;

        if (type==="park"){
            myIcon = markerIconPark;
            myZIndex = 2;
        }
        else if (type==="airport"){
            myIcon = markerIconAirport;
            myZIndex = 0;
        }
        else if (type==="city"){
            myIcon = markerIconCity;
            myZIndex = 1;
        }
        else if (type==="residence"){
            myIcon = markerIconResidence;
            myZIndex = 3;
        }
        else {
            myIcon = markerIconUnknown;
        }
        for (i=0; i<json.features.length; i++){
            var feature = json.features[i];
            var coord   = feature.geometry.coordinates;
            var name    = feature.properties.name;
            var date    = feature.properties.date;
            //var description = feature.properties.description;

            // break if encountering an empty feature
            if (name===undefined || name===""){
                break;
            }

            var title = name + (date===undefined || date==="" ? "" : ", "+date);

            var myLatLng = new google.maps.LatLng(coord[0], coord[1])
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: title,
                icon: myIcon,
                zIndex: myZIndex
            });
        }
    }

    // google map objects
    var gmapUS;
    var gmapEU;
    var gmapAS;

    // US marker file names
    var fileNameUSHome = "json/location-US-home.json";
    var fileNameUSCity = "json/location-US-city.json";
    var fileNameUSAirport = "json/location-US-airport.json";
    var fileNameUSPark = "json/location-US-park.json";

    // EU marker file names
    //var fileNameEUHome = "json/location-EU-home.json";
    var fileNameEUCity = "json/location-EU-city.json";
    var fileNameEUAirport = "json/location-EU-airport.json";
    var fileNameEUPark = "json/location-EU-park.json";

    // ASIA marker file names
    var fileNameASHome = "json/location-AS-home.json";
    var fileNameASCity = "json/location-AS-city.json";
    var fileNameASAirport = "json/location-AS-airport.json";
    var fileNameASPark = "json/location-AS-park.json";

    function initializeMap() {
        // mapUS
        var mapUS = document.getElementById('mapUS');
        var mapUSOption = {
            center: new google.maps.LatLng(40.8682259,-98.2199044),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };
        gmapUS = new google.maps.Map(mapUS, mapUSOption);
        $.getJSON(fileNameUSHome, function(json){
            setGeoJsonMarker(gmapUS, json, "residence");
        });
        $.getJSON(fileNameUSCity, function(json){
            setGeoJsonMarker(gmapUS, json, "city");
        });
        $.getJSON(fileNameUSAirport, function(json){
            setGeoJsonMarker(gmapUS, json, "airport");
        });
        $.getJSON(fileNameUSPark, function(json){
            setGeoJsonMarker(gmapUS, json, "park");
        });


        // mapEU
        var mapEU = document.getElementById('mapEU');
        var mapEUOption = {
            center: new google.maps.LatLng(48.7037633,13.0749126),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        }
        gmapEU = new google.maps.Map(mapEU, mapEUOption);
        $.getJSON(fileNameEUCity, function(json){
            setGeoJsonMarker(gmapEU, json, "city");
        });
        $.getJSON(fileNameEUAirport, function(json){
            setGeoJsonMarker(gmapEU, json, "airport");
        });
        $.getJSON(fileNameEUPark, function(json){
            setGeoJsonMarker(gmapEU, json, "park");
        });

        // mapAS
        var mapAS = document.getElementById('mapAS');
        var mapASOption = {
            center: new google.maps.LatLng(33.130624, 124.205862),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        }
        gmapAS = new google.maps.Map(mapAS, mapASOption);
        $.getJSON(fileNameASHome, function(json){
            setGeoJsonMarker(gmapAS, json, "residence");
        });
        $.getJSON(fileNameASCity, function(json){
            setGeoJsonMarker(gmapAS, json, "city");
        });
        $.getJSON(fileNameASAirport, function(json){
            setGeoJsonMarker(gmapAS, json, "airport");
        });
        $.getJSON(fileNameASPark, function(json){
            setGeoJsonMarker(gmapAS, json, "park");
        });

    }

    $("#accordion-jquery").on("accordionactivate", function(event, ui){
        if (ui.newHeader.index()==2 && !gmapUS){
            initializeMap();
        }
    });

    function mapScroll(id){
        var speed = 300;
        if ($(id).is(":visible")){
            $(id).slideUp(speed, function(){
                $(id+"-icon").removeClass("ui-icon-circlesmall-minus").addClass("ui-icon-circlesmall-plus");
            });
        }
        else {
            $(id).slideDown(speed, function(){
                $(id+"-icon").removeClass("ui-icon-circlesmall-plus").addClass("ui-icon-circlesmall-minus");
            });
        }
    }

    $("#mapUS-header").click(function(){
        mapScroll("#mapUS");
    });
    $("#mapEU-header").click(function(){
        mapScroll("#mapEU");
    });
    $("#mapAS-header").click(function(){
        mapScroll("#mapAS");
    });



//    $("#mapUS").slideUp(20000);

//    $("hobby-travel-header").click(function(){
//        console.log('test');
//    });

});

function setActiveTab() {
    switch (window.location.hash.toUpperCase()) {
        case "#BIO":
            $( "#tabs" ).tabs({ active: 0});
            break;
        case "#EXPERIENCE":
            $( "#tabs" ).tabs({ active: 1});
            break;
        case "#PROJECT":
            $( "#tabs" ).tabs({ active: 2});
            break;
        case "#HOBBY":
            $( "#tabs" ).tabs({ active: 3});
            break;
        default:
            $( "#tabs" ).tabs({ active: 0});
    }
}
function updateHashOnTabActivate() {
    $("#tabs").tabs({
        activate: function (event, ui) {
            var hashTag = ui.newPanel.attr('id').split("-")[1];
            window.location.hash = "#" + hashTag;
        }
    });
}


