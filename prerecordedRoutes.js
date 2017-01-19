function fake_pos() {
    var pos;
    var watchPos;
    
    function getPosF(succ) {
        return succ(c_pos) 
    }
    
    function getPos() {
        return pos;
    }
    
    function setPos(_pos) {
        pos = _pos;
        if (watchPos) {
            watchPos(pos); 
        }
    }
    
    function setWatchPos(succ) {
        watchPos = succ;
    }
}

p = new fake_pos();
navigator.geolocation.getCurrentLocation = p.getPosF;
navigator.geolocation.watchPosition = p.setWatchPos;
pp = {lat: -37.793365, lng: 145.082381, accuracy: 10};
p.setPos(pp);
