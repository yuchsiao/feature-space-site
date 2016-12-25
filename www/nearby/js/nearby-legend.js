/**
 * Created by eggplant on 7/1/14.
 */

function initLegend() {
    // Remove all legend
    var legendD3 = d3.select("#legend");
    var legendNode = legendD3.node();
    while (legendNode.firstChild) {
        legendNode.removeChild(legendNode.firstChild);
    }

    // Remove closeness legend
    removeLegendCloseness();

    // Append popularity legend
    plotLegendPopularity();


}
function plotLegendPopularity() {

    var legendPopularityD3 = d3.select("#legend")
        .append("span")
        .attr("id", "legend-popularity");

    legendPopularityD3.append("span")
        .attr("class", "text")
        .html("More popular");
    legendPopularityD3.selectAll("span.color").data([]).exit().remove();
    var markerColorScale = d3.scale.quantize()
        .domain([nearby.parameters.data.number, 1])
        .range(nearby.style.colorScale.popularity);
    var data = [];
    for (var i=0; i<nearby.parameters.data.number; i++) {
        data.push(i+1);
    }
    legendPopularityD3.selectAll("span.color").data(data)
        .enter()
        .append("span")
        .attr("class", "color")
        .style("background", function(d) {return markerColorScale(d)});
    legendPopularityD3.append("span")
        .attr("class", "text")
        .html("Less popular");

}
function plotLegendCloseness () {

    var legendClosenessD3 = d3.select("#legend2")
        .append("span")
        .attr("id", "legend-closeness");

    var ticks = nearby.parameters.timeTicks
        .slice(-nearby.parameters.timeTicksInDistance.length).reverse();
    var ticksText = new Array(ticks.length);
    for (var i=0; i<ticks.length; ++i) {
        ticks[i] /= 60;
        ticksText[i] = getStringFromMinute(ticks[i]);
    }

    legendClosenessD3
        .append("span")
        .attr("class", "text")
        .style("text-align", "right")
        .html("Closer");

    var unitWidth = 40;
    var radius = nearby.style.durationCircle.radius;
    var radiusScale = nearby.style.durationCircle.radiusScale;
    var strokeWidth = nearby.style.durationCircle.strokeWidth;
    var tickRank = [0];
    for (var i= 0; i<ticks.length; ++i) {
        tickRank.push(0);
        for (var j=0; j<nearby.parameters.data.number; j++) {
            if (!nearbyDurations[j] && !nearbyDurations[j].duration // in case any query issues
                && ticks[i]>=nearbyDurations[j].duration.value/60) {
                tickRank[i+1]++;
            }
        }
    }


    var container = legendClosenessD3
        .append("span")
        .attr("class", "container")
        .style("min-width", (unitWidth*(ticks.length+1.5))+"px");

    // Left most tick 0
    container
        .append("span")
        .attr("class", "tick")
        .style("left", unitWidth*(0.25+0.1)+2-10 +"px")
        .text("0");
    // Center ticks
    for (var i=0; i<ticks.length; ++i) {
        container
            .append("span")
            .attr("class", "color")
            .style("min-width", (unitWidth * (i+1))+"px")
            .style("left", (unitWidth*(0.25+0.1))-10+3 +"px");
        container
            .append("span")
            .attr("class", "tick")
            .style("left", unitWidth*(i+1.25+0.1)-7-10-1 +"px")
            .text(ticksText[i]);

//        var scale = 0;
//        if (tickRank[i+1]-tickRank[i]!=0) {  // there exist circles in this range
//            scale = radiusScale(
//                    nearby.parameters.data.number - tickRank[i+1]);
//        }
//        var radiusScaled = radius * scale;
//
//        legendClosenessD3
//            .append("svg:svg")
//            .attr("height", (radiusScaled*2 + strokeWidth*2) +"px")
//            .attr("width",  (radiusScaled*2 + strokeWidth*2) +"px")
//            .style("left", (unitWidth*(i+1.65) - radiusScaled - strokeWidth) +"px")
//            .style("top", (6-2*radiusScaled)+"px")
//            .append("svg:circle")
//            .attr("cx", radiusScaled + strokeWidth)
//            .attr("cy", radiusScaled + strokeWidth)
//            .attr("r",  radiusScaled);
    }
    // Last tick: "beyond"
    container
        .append("span")
        .attr("class", "color")
        .style("min-width", (unitWidth * (i+1))+"px")
        .style("left", (unitWidth*(0.25+0.1))-10+3 +"px")
        .style("background", "none")
        .style("border-right-color", "lightgray");
    container
        .append("span")
        .attr("class", "tick")
        .style("left", unitWidth*(i+1.25+0.1)-7-10-1 +"px")
        .text("above");

    legendClosenessD3
        .append("span")
        .attr("class", "text")
        .html("Farther");


//    // Circles
//    var circleScale = d3.scale.linear()
////        .domain([1, nearby.style.legendCircle.number-1])
//        .domain([0, ticks.length+2])
//        .range([nearby.parameters.data.number, 1]);
//    var radiusAccumulated = 0;
//    var circleSpacing = 8;
////    for (var i=0; i<nearby.style.legendCircle.number; ++i) {
//    for (var i=0; i<ticks.length+3; ++i) {
//
//        var radiusScaled = radius * radiusScale(circleScale(i));
//        radiusAccumulated += radiusScaled + circleSpacing;
//
//        legendClosenessD3
//            .append("svg:svg")
//            .attr("height", (radiusScaled*2 + strokeWidth*2) +"px")
//            .attr("width",  (radiusScaled*2 + strokeWidth*2) +"px")
////            .style("left", (unitWidth*(ticks.length+1)/nearby.style.legendCircle.number
////                *(i+1.65+0.5) - radiusScaled - strokeWidth) +"px")
//            .style("left", radiusAccumulated*2 + 6 + "px")
//            .style("top", (6-2*radiusScaled+10)+"px")
//            .append("svg:circle")
//            .attr("cx", radiusScaled + strokeWidth)
//            .attr("cy", radiusScaled + strokeWidth)
//            .attr("r",  radiusScaled);
//    }



}
//function plotLegendCloseness () {
//
//    var legendClosenessD3 = d3.select("#legend")
//        .insert("span", ":first-child")
//        .attr("id", "legend-closeness");
//
//    var ticks = nearby.parameters.timeTicks
//        .slice(-nearby.parameters.timeTicksInDistance.length).reverse();
////            .slice(-3).reverse();
//    var ticksText = new Array(ticks.length);
//    for (var i=0; i<ticks.length; ++i) {
//        ticks[i] /= 60;
//        ticksText[i] = getStringFromMinute(ticks[i]);
//    }
//
//    legendClosenessD3
//        .append("span")
//        .attr("class", "text")
//        .style("text-align", "right")
//        .html("Closer");
//
//    var unitWidth = 40;
//    var radius = nearby.style.durationCircle.radius;
//    var radiusScale = nearby.style.durationCircle.radiusScale;
//    var strokeWidth = nearby.style.durationCircle.strokeWidth;
//    var tickRank = [0];
//    for (var i= 0; i<ticks.length; ++i) {
//        tickRank.push(0);
//        for (var j=0; j<nearby.parameters.data.number; j++) {
//            if (ticks[i]>=nearbyDurations[j].duration.value/60) {
//                tickRank[i+1]++;
//            }
//        }
//    }
//
//
//    var container = legendClosenessD3
//        .append("span")
//        .attr("class", "container")
//        .style("min-width", (unitWidth*(ticks.length+1.5))+"px");
//
//    // Left most tick 0
//    container
//        .append("span")
//        .attr("class", "tick")
//        .style("left", unitWidth*(0.25+0.1)+2-10 +"px")
//        .text("0");
//    // Center ticks
//    for (var i=0; i<ticks.length; ++i) {
//        container
//            .append("span")
//            .attr("class", "color")
//            .style("min-width", (unitWidth * (i+1))+"px")
//            .style("left", (unitWidth*(0.25+0.1))-10+3 +"px");
//        container
//            .append("span")
//            .attr("class", "tick")
//            .style("left", unitWidth*(i+1.25+0.1)-7-10-1 +"px")
//            .text(ticksText[i]);
//
////        var scale = 0;
////        if (tickRank[i+1]-tickRank[i]!=0) {  // there exist circles in this range
////            scale = radiusScale(
////                    nearby.parameters.data.number - tickRank[i+1]);
////        }
////        var radiusScaled = radius * scale;
////
////        legendClosenessD3
////            .append("svg:svg")
////            .attr("height", (radiusScaled*2 + strokeWidth*2) +"px")
////            .attr("width",  (radiusScaled*2 + strokeWidth*2) +"px")
////            .style("left", (unitWidth*(i+1.65) - radiusScaled - strokeWidth) +"px")
////            .style("top", (6-2*radiusScaled)+"px")
////            .append("svg:circle")
////            .attr("cx", radiusScaled + strokeWidth)
////            .attr("cy", radiusScaled + strokeWidth)
////            .attr("r",  radiusScaled);
//    }
//    container
//        .append("span")
//        .attr("class", "color")
//        .style("min-width", (unitWidth * (i+1))+"px")
//        .style("left", (unitWidth*(0.25+0.1))-10+3 +"px")
//        .style("background", "none")
//        .style("border-right-color", "lightgray");
//    container
//        .append("span")
//        .attr("class", "tick")
//        .style("left", unitWidth*(i+1.25+0.1)-7-10-1 +"px")
//        .text("above");
//
//    legendClosenessD3
//        .append("span")
//        .attr("class", "text")
//        .html("Farther");
//
//
//    // Center ticks
//    var circleScale = d3.scale.linear()
////        .domain([1, nearby.style.legendCircle.number-1])
//        .domain([0, ticks.length+2])
//        .range([nearby.parameters.data.number, 1]);
//    var radiusAccumulated = 0;
//    var circleSpacing = 8;
////    for (var i=0; i<nearby.style.legendCircle.number; ++i) {
//    for (var i=0; i<ticks.length+3; ++i) {
//
//        var radiusScaled = radius * radiusScale(circleScale(i));
//        radiusAccumulated += radiusScaled + circleSpacing;
//
//        legendClosenessD3
//            .append("svg:svg")
//            .attr("height", (radiusScaled*2 + strokeWidth*2) +"px")
//            .attr("width",  (radiusScaled*2 + strokeWidth*2) +"px")
////            .style("left", (unitWidth*(ticks.length+1)/nearby.style.legendCircle.number
////                *(i+1.65+0.5) - radiusScaled - strokeWidth) +"px")
//            .style("left", radiusAccumulated*2 + 6 + "px")
//            .style("top", (6-2*radiusScaled+10)+"px")
//            .append("svg:circle")
//            .attr("cx", radiusScaled + strokeWidth)
//            .attr("cy", radiusScaled + strokeWidth)
//            .attr("r",  radiusScaled);
//    }
//
//
//
//}
function getStringFromMinute(minute) {
//    console.log(minute);
    if (minute<60) {
        return minute+"min";
    }
    else if (minute<1440) {
        return (minute/60) +"hr";
    }
    else {
        return (minute/1440) + "day";
    }
}

function removeLegendCloseness () {

    // Remove legend
    var legendNode = d3.select("#legend2").node();
    while (legendNode.firstChild) {
        legendNode.removeChild(legendNode.firstChild);
    }
}

