styleMapMarker = {
    firstTime: {
        flag: true,
        transitionDuration: 250,
        dropInterval: 5,
        dropDistance: 25,
        dropEffect: "circle"
    },
    strokeWidth: "25px",
    eyeColor: "#ffffff",// "#fafafa",
    padding: 1,
    svgHeight: 0,  // updated below in main
    svgWidth: 0,  // updated below in main
    svgCx: 0,  // updated below in main
    svgCy: 0,  // updated below in main
    height: 32,
    ratio: 0,  // updated below in main
    width: 0,  // updated below in main
//    opacity: 0.35,
    opacity: 0.2,
    blink: {
        duration: 150,
        interval: Infinity, //15000,
        ratio: 0.1
    },
    calibrationDuration: 800,
    currentLocation: {
        flag: true,
        lat: 0,  // to be updated
        lng: 0,  // to be updated
        accuracy: 0, // to be updated
        auraRadius: 1,
        maximumAge: 60000,
        flagReady: false,
        svgHeight: 0,  // updated below in main
        svgWidth: 0,  // updated below in main
        iconHeight: 48,
        iconHeightWithText: 56,
        ratio: 0,  // updated below in main
        iconWidth: 0,  // updated below in main
        baseR: 4,
        gap: 1,
        color: "#225ea8",
        auraColor: "#7fcdbb",
        auraStrokeColor: "#1d91c0",
        auraPadding: 5,
        interval: Infinity, //2500,
        intervalID: 0,  // updated later
        animationInterval: Infinity, //2500,
        totalHeight: function () {
            return this.iconHeight + this.gap + this.baseR * 2;
        },
        totalWidth: function () {
            return this.iconWidth;
        }
    },
    flagUpdate: true // true
};

nearby = {
    infoWindow: {
        durationCircles: []
    },
    parameters: {
        directions: {
            interval: 600,
            transitFactor: 6
        },
        data: {
            number: 15
        },
        travelMode: "bicycling",
        maxTimeDistanceRatio: -Infinity,  // init value
        maxDuration: -Infinity,
        timeTicks: [5 * 60, 15 * 60, 30 * 60, 60*60, 120 * 60, 240 * 60].reverse(),
        timeTicksInDistance: [],
        epsilon: 1e-6
    },
    style: {
        line: {
            width: 1.5, //3
            dash: "0.5, 1.5", //1,1 //"10,1,2,1"
            opacity: 0.7
        },
        durationCircle: {
            radius: 5,
            strokeWidth: 4,
            color: "#ffffff",
            radiusScale: d3.scale.pow(3).domain([1, 15]).range([0.5, 2])
        },
        tickRing: {
            strokeWidth: 3,
            strokeColor: "white", //"#253494",
//            color: "#33CCFF", //"#1d91c0",
//            color: "#1d91c0",  // darker blue
//            color: "#30aee0",  // great lighter blue
//            color: "#a7ddf2", // light blue (too light)
//            color: "#009DDC", // more saturated blue
            color: "#00A5DC", // more cyan saturated blue
//            opacity: 0.25,
//            opacity: 0.4,
            colorScale: 0  // to be initialized
        },
        colorScale: {
            popularity: colorbrewer.YlOrRd[9].slice(2, -2)
        },
        legendCircle: {
            number: 5
        },
        map: {
            id: "nearby-map",
            control: {
                panControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: true,
                overviewMapControl: true
            }
        },
        messenger: {
//            minDisplayTime: 12000,
            minDisplayTime: 120000000,
            maxMessagesOnDisplay: 1,
            style: {
            },
            spacing: 12,
            className: "message",
            top: 110,
            maxWidth: 200,
            animationSpeed: 600
        }
    },
    messages: {
        timer: [],
//        delay: 9000,
        delay: 90000000,
        introduction: [
            {content: "Welcome to <span class='nearby-font'><span>n</span>earby</span>! <br> " +
                "<span class='nearby-font'><span>n</span>earby</span> is a map-based travel app that helps you find out what's nearby you, displayed in <span class='time-font'>time</span>." +
                "<span class='click-font'>CLICK &#8675; </span>"
                , flag: true},
            {content: "<span class='nearby-font'><span>n</span>earby</span> fetches tourist attraction data from <span class='other-font'>TripAdvisor</span>, pins the popular sites, " +
                " and calibrate the locations through <span class='other-font'>Google Maps</span>. <span class='click-font'>CLICK &#8675; </span>", flag: true},
            {content: "Choose a city, a category of your interests, and the way you travel. " +
                "Click on the <span class='hand-font'>Hand</span><img src='icons/hand105.png' height='18px' style='vertical-align:-1px'> to start! <span class='click-font'>CLICK to Dismiss &#8675; </span>", flag: true}
        ],
        timeMap: [
            {content: "In <span class='time-font'>Time Map</span>, " +
                "the distance to each circle <img src='icons/red-circle.png' height='14px' style='vertical-align:-2px'> " +
                "represents the <span class='time-font'>travel time</span> to its attraction <img src='icons/red-pin.png' height='20px' style='vertical-align:-2px'> on <span class='hand-font'>Map</span>." +
                " <span class='click-font'>CLICK &#8675; </span>", flag: true},
            {content: "The circle sizes are ranked by <span class='time-font'>travel times</span>. " +
                "<span class='hand-font'>Blue areas</span> specify time segments. " +
                "<span class='click-font'>CLICK &#8675; </span>", flag: true},
            {content: "Click on a circle <img src='icons/red-circle.png' height='14px' style='vertical-align:-2px'> or an attraction marker " +
                "<img src='icons/red-pin.png' height='20px' style='vertical-align:-2px'> to show the directions. <span class='click-font'>CLICK to Dismiss &#8675; </span>", flag: true}
        ],
        switchControl: [
            {content: "Click on the attraction marker <img src='icons/red-pin.png' height='20px' style='vertical-align:-2px'> " +
                "of the route to toggle back to <span class='time-font'>Time Map</span>. <span class='click-font'>CLICK &#8675; </span>", flag: true},
            {content: "Click on other attraction markers <img src='icons/red-pin.png' height='20px' style='vertical-align:-2px'> " +
                "to plot the corresponding directions. <span class='click-font'>CLICK &#8675; </span>", flag: true},
            {content: "You can also use the switch <img src='icons/switch.png' height='16px' width='34px' style='vertical-align: -2px'> above to toggle between " +
                "<br><span class='time-font'>Time Map</span> and <span class='hand-font'>Map</span>. <span class='click-font'>CLICK to Dismiss &#8675; </span>", flag: true}
        ]
    },
    signals: {
        durationCircleAnimationCount: 0,
        durationCircleReady: false,
        durationOnQuery: false,
        setCenterAlready: false,
        directionIndex: -1,
        switchControlShown: false
    }
};

//_______________________________________________
//
// Map Style
//_______________________________________________


nearby.style.map.time2 = [
    {
        stylers: [
            { hue: '#890000' },
            { gamma: 1 },
            { weight: 0.2 },
            { inverted_lightness: false},
            { saturation: 0},
            { lightness: 0},
            { visibility: 'simplified' }
        ]
    },
    {
        featureType: 'road',
        stylers: [
            { gamma: 3}
        ]
    },
    {
        featureType: 'poi',
        stylers: [
            { gamma: 2}
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            { visibility: 'off' }
        ]
    },
    {
        featureType: 'water',
        stylers: [
            { lightness: -60},
            { saturation: -30}
        ]
    }
];



nearby.style.map.timeBright = [
    {
        stylers: [
            { hue: '#890000' },
            { gamma: 1 },
            { weight: 0.2 },
            { inverted_lightness: false},
            { saturation: 20},
            { lightness: 70},
            { visibility: 'simplified' }
        ]
    },
    {
        featureType: 'road',
        stylers: [
            { gamma: 3}
        ]
    },
    {
        featureType: 'poi',
        stylers: [
            { gamma: 2}
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            { visibility: 'off' }
        ]
    },
    {
        featureType: 'water',
        stylers: [
            { lightness: 60},
//            { saturation: -30}
            { saturation: -100}
        ]
    }
];

nearby.style.map.timeDark = [
    {
        stylers: [
            { hue: '#890000' },
            { gamma: 1 },
            { weight: 0.2 },
            { inverted_lightness: false},
            { saturation: 0},
            { lightness: -90},
            { visibility: 'simplified' }
        ]
    },
    {
        featureType: 'road',
        stylers: [
            { gamma: 1/2}
        ]
    },
    {
        featureType: 'poi',
        stylers: [
            { gamma: 1}
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            { visibility: 'off' }
        ]
    },
    {
        featureType: 'water',
        stylers: [
            { lightness: -60},
//            { saturation: -30}
            { saturation: -100}
        ]
    }
];

nearby.style.map.space= [
    {
        stylers: [
            { gamma: 1 },
            { weight: 0.8 },
            { visibility: 'on' }
        ]
    },
    {
        featureType: 'road',
        stylers: [
            { gamma: 1.2},
            { saturation: 10}
        ]
    },
    {
        featureType: 'poi',
        stylers: [
            { gamma: 1.2},
            { saturation: 10}
        ]
    },
    {
        featureType: 'water',
        stylers: [
            { lightness: -15},
            { saturation: -5},
            { gamma: 1.5}
        ]
    },
    {
        elementType: 'labels.text',
        stylers: [
            { lightness: 40},
            { gamma: 0.5}
        ]
    },
    {
        elementType: 'labels.icon',
        stylers: [
            { gamma: 1.2}
        ]
    }
];

nearby.style.map.time = [
    {
        stylers: [
            { gamma: 1.2 },
            { weight: 0.5 },
            { visibility: 'on' },
            { saturation: 0},
            { lightness:  0}
        ]
    },
    {
        featureType: 'road',
        stylers: [
            { saturation: -10},
            { lightness: 50}
        ]
    },
    {
        featureType: 'water',
        stylers: [
            { lightness: -15},
            { saturation: -5},
            { gamma: 1.5}
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            { visibility: 'off' }
        ]
    }
];

nearby.style.map.lightMonochrome = [
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#e9ebed"
            },
            {
                "saturation": -78
            },
            {
                "lightness": 67
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#bbc0c4"
            },
            {
                "saturation": -93
            },
            {
                "lightness": 71
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 100
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#e9ebed"
            },
            {
                "saturation": -90
            },
            {
                "lightness": -8
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#e9ebed"
            },
            {
                "saturation": 10
            },
            {
                "lightness": 69
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#2c2e33"
            },
            {
                "saturation": 7
            },
            {
                "lightness": 19
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#bbc0c4"
            },
            {
                "saturation": -93
            },
            {
                "lightness": 31
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#bbc0c4"
            },
            {
                "saturation": -93
            },
            {
                "lightness": -2
            },
            {
                "visibility": "off"
            }
        ]
    }
//    {
//        "elementType": "labels",
//        "stylers": [
//            { "visibility": "off"}
//        ]
//    }
]
nearby.style.map.spaceStyle = new google.maps.StyledMapType(
    nearby.style.map.space, []);
nearby.style.map.timeStyle = new google.maps.StyledMapType(
//    nearby.style.map.timeBright, []);
    nearby.style.map.lightMonochrome, []);
