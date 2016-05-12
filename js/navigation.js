$(document).ready(function()
{
    var pages = ["Home", "Mass", "Swap", "Temp"];
    var location = ["index.html", "mass.html", "swap.html", "temp.html"];
    for (var i = 0; i < pages.length; i++)
    {
        var listItem = "<a class=\"mdl-navigation__link\" href=\"" + location[i] + "\">" + pages[i] + "</a>";
        $('#navigator').append(listItem);
    }
});