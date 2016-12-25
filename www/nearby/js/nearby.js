function generateDirectionRequest(origin, destination, mode) {
    switch(mode.toUpperCase()) {
        case "DRIVING":
            mode = google.maps.TravelMode.DRIVING;
            break;
        case "BICYCLING":
            mode = google.maps.TravelMode.BICYCLING;
            break;
        case "TRANSIT":
            mode = google.maps.TravelMode.TRANSIT;
            break;
        case "WALKING":
            mode = google.maps.TravelMode.WALKING;
            break;
        default:
            mode = google.maps.TravelMode.DRIVING;
    }

    return {
        origin: origin,
        destination: destination,
        travelMode: mode,
        durationInTraffic: true // only effective for business customers
        //avoidHighways: Boolean,
        //avoidTolls: Boolean,
        //region: String
    }
}

function initQueryDurationToAttraction() {
    // Init
    nearbyDurations = [];  // clean up
    nearbyDurationsResponseOrder = [];  // clean up
    drawDuration();        // clean up duration lines
    clearInterval(nearbyDirectionIntervalId);  // stop old request
    nearby.signals.durationCircleReady = false;
    nearby.signals.durationCircleAnimationCount = 0;
    nearby.parameters.maxTimeDistanceRatio = -Infinity;
    nearby.parameters.maxDuration = -Infinity;
    nearby.parameters.timeTicksInDistance = [];
    nearby.infoWindow.durationCircles = [];
    removeLegendCloseness();
    initSwitch();

    nearby.signals.switchControlShown = false;
    nearby.signals.directionIndex = -1;
}

function queryDurationToAttraction(attractions, currentLocation, mode, overlay) {

    var directionsService = new google.maps.DirectionsService();
    var directionsStatus  = google.maps.DirectionsStatus;  // shorthand

    initQueryDurationToAttraction();
    nearbyDurations = new Array(taMapObject.length);

    nearby.signals.durationOnQuery = true;

    var pipe = [];
    for (var i=0; i<attractions.length; ++i) {
        pipe.push({index:i, factor:1});
    }

    // Send out request every interval
    var interval = (mode.toUpperCase()=="TRANSIT" ?
        nearby.parameters.directions.interval*nearby.parameters.directions.transitFactor
        : nearby.parameters.directions.interval);

    nearbyDirectionIntervalId = setInterval(function(){
        var task = pipe.shift();
        if (task===undefined) {  // stop recurring events
            clearInterval(nearbyDirectionIntervalId);

            //* Final callback

            // Update signals
            nearby.signals.durationOnQuery = false;
            nearby.signals.durationCircleReady = true;

            // Find max timeDistanceRatio
            var maxRatio = -Infinity;
            var maxDuration = -Infinity;
            for (var i=0; i<nearbyDurations.length; ++i) {
                maxRatio = (maxRatio<nearbyDurations[i].timeDistanceRatio ?
                    nearbyDurations[i].timeDistanceRatio : maxRatio);
                maxDuration = (maxDuration<nearbyDurations[i].duration.value ?
                    nearbyDurations[i].duration.value : maxDuration);
            }
            nearby.parameters.maxTimeDistanceRatio = maxRatio;
            nearby.parameters.maxDuration = maxDuration;

            // Normalize time to distance
            for (var i=0; i<nearbyDurations.length; ++i) {
                nearbyDurations[i].duration.normalized = nearbyDurations[i].duration.value/maxRatio;
                nearbyDurations[i].timeDistanceRatio /= maxRatio;  // ti/di / (t/d)_max
            }

            // Rank distance in time
            var tmpArray = nearbyDurations.slice(0);
            tmpArray.sort(function(a,b) {return Math.abs(b.duration.value) - Math.abs(a.duration.value)});
            tmpArray.forEach(function(v,i) {v.distanceRank=i+1});

            // Compute tick ring radius
            nearby.parameters.timeTicks.forEach(function(v) {
                if (v<maxDuration) {
                    nearby.parameters.timeTicksInDistance.push(v / maxRatio);
                }
            });

            // Set up color
            nearby.style.tickRing.colorScale =
                d3.scale.log().domain([
                    nearby.parameters.timeTicksInDistance.slice(-1),
                    nearby.parameters.timeTicksInDistance[0]]
                ).range(nearby.style.colorScale.popularity);

            // Plot closeness legend
            plotLegendCloseness();

            // Dim markers
            dimMarkers();

            // Redraw
            drawDuration();
            reappendMarkers();

            // Enable and trigger switch
            enableSwitch();
            switchMap();

            // Show instruction message
            var showNextMessage = (function() {
                var index = 0;
                return function f() {
                    if (index>=nearby.messages.timeMap.length) {  // no more messages
                        return;
                    }
                    var node = messenger.push(nearby.messages.timeMap[index++]);
                    node.addEventListener("click", function() {
                        f();
                        messenger.shift();
                    });  // click to show the next
                };
            })();
            // Clear previous timeout
            nearby.messages.timer.forEach(function(v){
                clearTimeout(v);
            })
            nearby.messages.timer = [];
            messenger.clear();
            // Push new ones
            for (var i= 0, delayIndex=0; i<nearby.messages.timeMap.length; ++i, ++delayIndex) {
                nearby.messages.timer.push(setTimeout(showNextMessage, nearby.messages.delay*delayIndex));
            }


            return;
        }

        var origin = new google.maps.LatLng(currentLocation.lat, currentLocation.lng);
        var destination = new google.maps.LatLng(attractions[task.index].lat, attractions[task.index].lng);
        var distance = getDistanceFromLatLngInKm(origin.lat(), origin.lng(), destination.lat(), destination.lng());
        var request = generateDirectionRequest(origin, destination, mode);

        directionsService.route(request, function(response, status) {
            switch(status) {
                case directionsStatus.OK:
                    request.title = attractions[task.index].title;
                    request.duration = response.routes[0].legs[0].duration;
                    request.distance = distance;
                    request.timeDistanceRatio = request.duration.value/request.distance;
                    request.route = response;
                    request.index = task.index;

                    nearbyDurations[task.index] = request;
                    nearbyDurationsResponseOrder.push(request);
                    overlay.draw();
                    break;
                // cases for retry
                case directionsStatus.UNKNOWN_ERROR:
                case directionsStatus.OVER_QUERY_LIMIT:
                    pipe.push({index: task.index, factor:1});  // request again
                    console.log("REQUEST AGAIN");
                    break;
                // cases for inserting infinity duration
                case directionsStatus.ZERO_RESULTS:
                    request.title = attractions[task.index].title;
                    request.duration = {value: -Infinity, text: "No access"};
                    request.distance = distance;
                    request.timeDistanceRatio = -Infinity;
                    request.index = task.index;

                    nearbyDurations[task.index] = request;
                    nearbyDurationsResponseOrder.push(request);
                    overlay.draw();
                    break;
                // cases to be ignored
                case directionsStatus.NOT_FOUND:
                case directionsStatus.MAX_WAYPOINTS_EXCEEDED:
                case directionsStatus.INVALID_REQUEST:
                case directionsStatus.REQUEST_DENIED:
                default:
                    console.warn("Direction queries encounter problems with the request: ");
                    console.warn(request);
            }
        });

    }, interval);

}

function latlngToPixel(d) {
    return overlay.getProjection().fromLatLngToDivPixel(d);
}

function drawDuration() {
    // Duration line
    var layerDuration = d3.select("#animation-effect").selectAll("svg.duration-line").data(nearbyDurationsResponseOrder);
    layerDuration.exit().remove();
    layerDuration.each(function(data, index){ transform(this, data, index) });
    layerDuration.enter()
        .append("svg:svg")
        .attr("class", "duration-line")
        .each(function(data, index) {transform(this, data, index) });

    // Duration circle
    var layerDurationCircle = d3.select("#attraction").selectAll("svg.duration-circle").data(nearbyDurationsResponseOrder);
    layerDurationCircle.exit().remove();
    layerDurationCircle.each(function(data, index){ transformCircle(this, data, index) });
    layerDurationCircle.enter()
        .append("svg:svg")
        .attr("class", "duration-circle")
        .each(function(data, index) { transformCircle(this, data, index) });

    // Tick ring
    var layerTickRing = d3.select("#animation-effect").selectAll("svg.tick-ring")
        .data(nearby.parameters.timeTicksInDistance);
    layerTickRing.exit().remove();
    layerTickRing.each(function(data, index){ transformTick(this, data, index) });
    layerTickRing.enter()
        .append("svg:svg")
        .attr("class", "tick-ring")
        .each(function(data, index) { transformTick(this, data, index) });

    function transform(dom, data, index) {
        index = data.index;
        var pointFrom = latlngToPixel(data.origin);
        var pointTo = latlngToPixel(data.destination);
        var lineWidth = nearby.style.line.width;
        var left = Math.min(pointFrom.x, pointTo.x)-lineWidth;
        var top = Math.min(pointFrom.y, pointTo.y)-lineWidth;
        var height = Math.abs(pointFrom.y - pointTo.y)+lineWidth*2;
        var width = Math.abs(pointFrom.x - pointTo.x)+lineWidth*2;


        d3.select(dom)
//            .transition()
//            .duration(1000)
            .style("left", left + "px")
            .style("top", top + "px")
            .attr("height", height + "px")
            .attr("width", width + "px");
        var d3line = d3.select(dom).select("line");
        if (!d3line.empty()) {  // exists
            d3line
                .attr("x1", pointFrom.x - left)
                .attr("y1", pointFrom.y - top)
                .attr("x2", pointTo.x - left)
                .attr("y2", pointTo.y - top);
        }
        else {   // create new
            d3.select(dom)
                .append("svg:line")
                .style("opacity", 0)
                .attr("x1", pointFrom.x - left)
                .attr("y1", pointFrom.y - top)
                .attr("x2", pointTo.x - left)
                .attr("y2", pointTo.y - top)
                .attr("stroke", d3.rgb(taMapObject.attractionMapMarkers[index].color).darker(0.6))
                .attr("stroke-width", nearby.style.line.width)
                .transition()
                .duration(1000)
                .style("opacity", nearby.style.line.opacity)
                .transition()
                .style("opacity", 1)
                .attr("stroke-dasharray", nearby.style.line.dash);

            var currentLocationDOM = d3.select("#current-location").node();
            currentLocationDOM.parentNode.appendChild(currentLocationDOM);
        }
    }

    function transformCircle(dom, data, index) {
        index = data.index;

        var flagNoAccess = (data.duration.value<0);

        var ratio = (nearby.signals.durationCircleReady ?
            (flagNoAccess ? 1:data.timeDistanceRatio) : 0);

        var latLngCenter = interpolateLatLng(data.origin, data.destination, ratio);
        var pointCenter = latlngToPixel(latLngCenter);

        // style shorthand
        var radius = nearby.style.durationCircle.radius;
        var radiusScale = nearby.style.durationCircle.radiusScale;
        var strokeWidth = nearby.style.durationCircle.strokeWidth;

        radius *= (nearby.signals.durationCircleReady?
            radiusScale(data.distanceRank) : 1);

        var flagAnimation = false;
        if (nearby.signals.durationCircleReady &&
            nearby.signals.durationCircleAnimationCount!=nearbyDurations.length) {

            flagAnimation = true;
            nearby.signals.durationCircleAnimationCount++;
        }

        (flagAnimation ?
            d3.select(dom).transition().duration(1000) :
            d3.select(dom))
            .attr("height", radius * 2 + strokeWidth * 2 + "px")
            .attr("width", radius * 2 + strokeWidth * 2 + "px")
            .style("left", (pointCenter.x - radius - strokeWidth) + "px")
            .style("top", (pointCenter.y - radius - strokeWidth) + "px")
            .select("circle")
            .attr("r", radius)
            .attr("cx", radius + strokeWidth)
            .attr("cy", radius + strokeWidth)
            .style("opacity", (nearby.signals.durationCircleReady ? 1 : 0));

        // Create circle if not yet
        var d3dom = d3.select(dom);
        if (d3dom.select("g").empty()) {  // create
            var color = d3.rgb(taMapObject.attractionMapMarkers[index].color).darker(0.6);
            d3dom.append("svg:g")
                .attr("class", "duration-circle-g")
                .append("svg:circle")
                .attr("r", radius)//Scale(data.distanceRank)*radius)//radius)
                .attr("cx", radius+strokeWidth)
                .attr("cy", radius+strokeWidth)
                .attr("stroke", color)
                .attr("stroke-width", strokeWidth)
                .style("fill", nearby.style.durationCircle.color)
                .style("opacity", (nearby.signals.durationCircleReady?1:0));

            var currentLocationDOM = d3.select("#current-location").node();
            currentLocationDOM.parentNode.appendChild(currentLocationDOM);

        }

        // Create and attach infoWindow if not yet and all circles are ready
        if (nearby.signals.durationCircleReady && !nearby.infoWindow.durationCircles[index]) {
            var infowindow = new google.maps.InfoWindow({
                content: "<div class='infowindow' style='white-space: nowrap;'><strong>"+
                    data.duration.text + "</strong> to <strong>" + data.title + "</strong></div>",
                position: latLngCenter,
                pixelOffset: new google.maps.Size(0, -radius-strokeWidth)
            });

            nearby.infoWindow.durationCircles.push(infowindow);

            google.maps.event.addDomListener(d3.select(dom).node(),
                "mouseover", function(e) {
                    infowindow.open(map);
                    d3.select(d3.selectAll(".marker")[0][index]).style("opacity", 1);
                });
            google.maps.event.addDomListener(d3.select(dom).node(),
                "mouseout", function(e) {
                    infowindow.close();
                    d3.select(d3.selectAll(".marker")[0][index]).style("opacity",
                        ($("#map-switch").prop("checked") ? 1 : styleMapMarker.opacity) );
                });
            google.maps.event.addDomListener(d3.select(dom).node(),
                "click", function(e) {
//                    d3.selectAll(".marker")[0][index].dispatchEvent(new Event("click"));

                    if (nearbyDurations[index]!==undefined &&
                        nearbyDurations[index].route!==undefined) {
                        // google maps query response for this attraction is ready
                        // and there exists a route

                        if (index==nearby.signals.directionIndex) {
                            if ($("#map-switch").prop("checked")) {
                                $("#map-switch").prop("checked", false).change();
                            }
                            else {
                                $("#map-switch").prop("checked", true).change();
                            }
                        }
                        else {
                            $("#map-switch").prop("checked", true).change();
                            directionsDisplay.setDirections(nearbyDurations[index].route);
                            nearby.signals.directionIndex = index;
                        }
                    }

                });

        }

        function interpolateLatLng(origin, destination, ratio) {
            var oLat = origin.lat();
            var oLng = origin.lng();
            var dLat = destination.lat();
            var dLng = destination.lng();

            return new google.maps.LatLng( (oLat*(1-ratio)+dLat*ratio), (oLng*(1-ratio)+dLng*ratio) );
        }

    }

    function transformTick(svgDOM, travelTimeDistance) {
        var origin = styleMapMarker.currentLocation;
        var deg = getDegreeFromKm(travelTimeDistance);
        var destination = {
            lat: origin.lat + deg,
            lng: origin.lng
        };
        var center = latlngToPixel(new google.maps.LatLng(origin.lat, origin.lng));
        var outer  = latlngToPixel(new google.maps.LatLng(destination.lat, destination.lng));

        var radius = Math.abs(outer.y-center.y);
        var strokeWidth = nearby.style.tickRing.strokeWidth;
        var strokeColor = nearby.style.tickRing.strokeColor;
//        var color = nearby.style.tickRing.color;
        var height = radius*2 + strokeWidth*2;
        var width  = radius*2 + strokeWidth*2;
//        var opacity = nearby.style.tickRing.opacity;
//        var colorScale = nearby.style.tickRing.colorScale;

        var d3svg = d3.select(svgDOM);
        d3svg
            .style("left", (center.x -radius-strokeWidth) +"px")
            .style("top",  (center.y -radius-strokeWidth) +"px")
            .attr("height", (height) +"px")
            .attr("width" , (width) +"px");

        if (d3svg.select("circle").empty()) {  // create
            d3svg.append("svg:circle")
                .attr("stroke", strokeColor)
                .attr("stroke-width", strokeWidth)
//                .style("fill", color)//colorScale(travelTimeDistance*nearby.parameters.maxTimeDistanceRatio))
//                .style("opacity", opacity);
        }
        d3svg.select("circle")
            .attr("cx", radius+strokeWidth)
            .attr("cy", radius+strokeWidth)
            .attr("r",  radius);

    }
}

function reappendMarkers() {
    d3.selectAll("svg.marker").each(function() {
        d3.select(this).node().parentNode.appendChild(d3.select(this).node());
    })
}

function getDistanceFromLatLngInKm(lat1,lon1,lat2,lon2) {
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function getDegreeFromKm(km, lat) {
    lat = (lat!==undefined? lat : 35);

    var distancePerDegree = d3.scale.linear()
        .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
        .range([110.57, 110.61, 110.70, 110.85, 111.04, 111.23, 111.41, 111.56, 111.66, 111.69]);

    return km/distancePerDegree(lat);
}

function enableSwitch() {
    d3.select("#map-switch")
        .property("disabled", false);
}
function isSwitchEnabled() {
    return $("#map-switch").is(":enabled");
}
function registerSwitchChange() {
    $("#map-switch").change(function() {
        if ($("#map-switch").is(":checked")) {
            map.mapTypes.set(nearby.style.map.id, nearby.style.map.spaceStyle);
            hideDurations();
            directionsDisplay.setMap(map);

            // Show instruction message
            if ($("#map-switch").is(":enabled") && !nearby.signals.switchControlShown) {
                var showNextMessage = (function() {
                    var index = 0;
                    return function f() {
                        if (index>=nearby.messages.switchControl.length) {  // no more messages
                            return;
                        }
                        var node = messenger.push(nearby.messages.switchControl[index++]);
                        node.addEventListener("click", function() {
                            f();
                            messenger.shift();
                        });  // click to show the next
                    };
                })();
                // Clear previous timeout
                nearby.messages.timer.forEach(function(v){
                    clearTimeout(v);
                })
                nearby.messages.timer = [];
                messenger.clear();
                // Push new ones
                for (var i= 0, delayIndex=0; i<nearby.messages.switchControl.length; ++i, ++delayIndex) {
                    nearby.messages.timer.push(setTimeout(showNextMessage, nearby.messages.delay*delayIndex));
                }

                nearby.signals.switchControlShown = true;
            }

        }
        else {
            map.mapTypes.set(nearby.style.map.id, nearby.style.map.timeStyle);
            showDurations();
            directionsDisplay.setMap(null);
        }
    });
}
function switchMap() {
    $("#map-switch").prop("checked", function(i,val) {
        return !val;
    }).change();
}

function dimMarkers() {
    d3.selectAll(".marker")
        .style("opacity", styleMapMarker.opacity);
}
function showMarkers() {
    d3.selectAll(".marker")
        .style("opacity", 1);
}

function hideDurations() {

    d3.selectAll(".duration-line")
        .attr("visibility", "hidden");
    d3.selectAll(".duration-circle")
        .attr("visibility", "hidden");
    d3.selectAll(".tick-ring")
        .attr("visibility", "hidden");
    d3.selectAll(".marker")
        .style("opacity", 1);
}

function showDurations() {
    d3.selectAll(".duration-line")
        .attr("visibility", "visible");
    d3.selectAll(".duration-circle")
        .attr("visibility", "visible");
    d3.selectAll(".tick-ring")
        .attr("visibility", "visible");
    d3.selectAll(".marker")
        .style("opacity", styleMapMarker.opacity);
}

function initSwitch() {
    $("#map-switch").prop("checked", true).change();
    $("#map-switch").prop("disabled", true);
}