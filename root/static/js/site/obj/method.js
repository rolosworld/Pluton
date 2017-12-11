site.obj.method = Meta({
    process: function() {
        this.preDrawUI();
        this.drawUI();
        this.postDrawUI();
    },
    preDrawUI: function() {},
    drawUI: function() {},
    postDrawUI: function() {}
});
