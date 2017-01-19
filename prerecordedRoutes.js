function fake_pos() {
    var pos;
    var watchPos = [];
    
    this.getPosF = function(succ) {
        return succ(pos) 
    }
    
    this.getPos = function(){
        return pos;
    }
    
    this.setPos = function(_pos) {
        pos = {coords: _pos};
        for (var i in watchPos) {
            watchPos[i](pos);
        }
    }
    
    this.setWatchPos = function(succ) {
        watchPos.push(succ);
    }
     
    this.changeAccuracy = function(acc) {
       pos.coords.accuracy = acc;
       this.setPos(pos.coords);
    }
    
    this.movePos = function(x,y) {
        var npos = pos;
        npos.coords.latitude += x;
        npos.coords.longitude += y;
        this.setPos(npos.coords);
    }
}

p = new fake_pos();
navigator.geolocation.getCurrentPosition = p.getPosF;
navigator.geolocation.watchPosition = p.setWatchPos;
pp = {latitude: -37.793365, longitude: 145.082381, accuracy: 10};
p.setPos(pp);
 
