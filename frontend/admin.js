function ShowContent(id) {
    document.querySelectorAll('.content').forEach(div =>

        {div.style.display = "none";}
    );


    document.getElementById(id).style.display = "block";
}