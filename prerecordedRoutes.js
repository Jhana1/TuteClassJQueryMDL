function fake_pos() {
    var pos;
    var watchPos;
    
    this.getPosF = function(succ) {
        return succ(pos) 
    }
    
    this.getPos = function(){
        return pos;
    }
    
    this.setPos = function(_pos) {
        pos = {coords: _pos};
        if (watchPos) {
            watchPos(pos); 
        }
    }
    
    this.setWatchPos = function(succ) {
        watchPos = succ;
    }
    
    this.changeAccurace = function(acc) {
        this.pos.coords.accuracy = acc;
    }
    
    this.movePos = function(x,y) {
        pos.coords.latitude += x;
        pos.coords.longitude += y;
    }
}

p = new fake_pos();
navigator.geolocation.getCurrentPosition = p.getPosF;
navigator.geolocation.watchPosition = p.setWatchPos;
pp = {latitude: -37.793365, longitude: 145.082381, accuracy: 10};
p.setPos(pp);
