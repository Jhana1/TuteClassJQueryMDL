function calcTempC()
{
    var temp = $('#tempTextC');
    if (temp.val() == '')
    {
        $('#tempTextF').val('');
        $('#tempTextF').parent().removeClass("is-dirty");
    }
    else 
    {
        $('#tempTextF').val(temp.val() * 1.8 + 32);
        //document.getElementById("tempTextF").parent().addClass("is-dirty");
        $('#tempTextF').parent().addClass("is-dirty");
    }
}