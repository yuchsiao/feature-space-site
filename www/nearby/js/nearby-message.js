

nearby.Message = function(option) {
    this.style = option.style;
    this.messages = [];
    this.body_ = d3.select("body").node();
    this.nextTop = option.top;
    this.spacing = option.spacing;
    this.className = option.className;
    this.maxMessagesOnDisplay = option.maxMessagesOnDisplay;
    this.activeIndex = 0;
    this.minDisplayTime = option.minDisplayTime;
    this.animationSpeed = option.animationSpeed;
    this.messageID = 0;
};
nearby.Message.prototype.constructor = nearby.Message;

nearby.Message.prototype.push = function(msg) {
    if (msg.constructor!==String && msg.constructor===Object) {
        var msgOriginal = msg;
        msg = msg.content;
    }

    var time = new Date();
    var currentMsg = {content: msg, time: time.getTime(), id: this.messageID++};
    this.messages.push(currentMsg);

    var newMessageD3 = d3.select(this.body_)
        .append("div")
        .attr("class", this.className)
        .style("position", "absolute")
        .style("top", this.nextTop +"px")

    newMessageD3.html(msg);

    for (var key in this.style) {
        newMessageD3
            .style(key, this.style[key]);
    }

    var displacement = newMessageD3.node().offsetHeight + this.spacing;

    this.messages[this.messages.length-1].node = newMessageD3.node();
    this.messages[this.messages.length-1].displacement = displacement;

    this.nextTop += displacement;

    // Remove old messages
    if (this.messages.length-this.activeIndex > this.maxMessagesOnDisplay) {

        var self = this;
        var msg = this.messages[this.activeIndex];
        var timeOnDisplay = currentMsg.time-msg.time;
        var shiftDelay = (this.minDisplayTime>timeOnDisplay ?
            this.minDisplayTime-timeOnDisplay : 0);
        setTimeout(function() {
            if (msg.id!==undefined && msg.id==self.messages[0].id){
                self.shift();
            }
        }, shiftDelay)
        this.activeIndex++;
    }

//    if (msgOriginal.flag==false) {
//        pr("here!!!")
//        pr(newMessageD3.node())
//        $(newMessageD3.node()).trigger("click");
//    }
    msgOriginal.flag = false;

    return newMessageD3.node();
};

nearby.Message.prototype.shift = function() {
    this.activeIndex--;
    this.activeIndex = (this.activeIndex>0 ? this.activeIndex : 0);

    var msg = this.messages[0];

    if (msg===undefined) {
        return undefined;
    }

    this.nextTop -= msg.displacement;

    d3.select(msg.node)
        .transition()
        .duration(this.animationSpeed)
        .style("opacity", 0);
    setTimeout(function() {
        msg.node.parentNode.removeChild(msg.node);
    }, this.animationSpeed);

    for (var i=1; i<this.messages.length; i++) {
        var msgTop = this.messages[i].node.offsetTop - msg.displacement;
        d3.select(this.messages[i].node)
            .transition()
            .duration(this.animationSpeed)
            .style("top", msgTop+"px");
    }
    return this.messages.shift();
};

nearby.Message.prototype.clear = function() {
    while (this.messages.length!=0) {
        this.shift();
    }
};
//var messenger;
//
//$(document).ready(function() {
//    messenger = new nearby.Message(option);
//
//    messenger.push("test");
//    messenger.shift();
//
//});