$(function() {
    $(document).scroll(() => {
        var nav = $("#mainNav");
        nav.toggleClass('scrolled', $(this).scrollTop() > nav.height());
    })
});