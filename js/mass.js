function calcMassKG()
{
    var mass = $('#massTextKG');
    if (mass.val() == '')
    {
        $('#massTextLB').val('');
        $('#massTextLB').parent().removeClass("is-dirty");
    }
    else 
    {
        $('#massTextLB').val(mass.val() * 2.2);
        //document.getElementById("tempTextF").parent().addClass("is-dirty");
        $('#massTextLB').parent().addClass("is-dirty");
    }
}