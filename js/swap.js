function calcWavelength()
{
    var C = 300000000;
    var freq = $('#freqText');
    if (freq.val() == '')
    {
        $('#waveText').val('');
        $('#waveText').parent().removeClass("is-dirty");
    }
    else 
    {
        $('#waveText').val((C/freq.val()).toFixed(4) + "m");
        $('#waveText').parent().addClass("is-dirty");
    }
}


function calcFrequency()
{
    var C = 300000000;
    var wave = $('#waveText');
    if (wave.val() == '')
    {
        $('#freqText').val('');
        $('#freqText').parent().removeClass("is-dirty");
    }
    else
    {
        $('#freqText').val((C/wave.val()).toFixed(4) + "Hz");
        $('#freqText').parent().addClass("is-dirty");
    }
}