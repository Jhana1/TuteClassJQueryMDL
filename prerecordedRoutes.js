function fake_pos() {
    var pos;
    var watchPos;
    
    this.getPosF = function(succ) {
        return succ(c_pos) 
    }
    
    this.getPos = function(){
        return pos;
    }
    
    this.setPos = function(_pos) {
        pos = _pos;
        if (watchPos) {
            watchPos(pos); 
        }
    }
    
    this.setWatchPos = function(succ) {
        watchPos = succ;
    }
}

p = new fake_pos();
navigator.geolocation.getCurrentLocation = p.getPosF;
navigator.geolocation.watchPosition = p.setWatchPos;
pp = {lat: -37.793365, lng: 145.082381, accuracy: 10};
p.setPos(pp);
