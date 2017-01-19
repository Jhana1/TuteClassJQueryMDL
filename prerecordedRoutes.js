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
