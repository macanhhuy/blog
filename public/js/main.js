$(function () {
    $('.checkall').click(function () {
        $(this).parents().find(':checkbox').attr('checked', this.checked);
    });
    $('td.delete i').click(function () {
       var file = $(this).parents().find(':checkbox').val();
       $(this).parent().parent().remove();
    });

     $('.newfolder').click(function () {

       var foldername = $('input[name=foldername]').val();
       jQuery.ajax({
        type: "POST",
        url: '/files/newfolder', 
        data:{foldername: foldername, parent: null}
      });

    });

//$('[rel="tooltip"]').tooltip('toggle');

     $('.deleteall').click(function () {
    
      var checkedCheckboxes = $("input[type=checkbox,name=file]:checked"),
      		obj = [];
       checkedCheckboxes.each(function(){
       			obj.push(this.value);
           $(this).parent().parent().remove();
       });
       $.postJSON('/files/delete', obj, function(data){
            
       });
    });
});
jQuery.urlParam = function(name){
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return results[1] || 0;
}
jQuery.extend({
    postJSON: function(url, data, callback) {
      return jQuery.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(data),
        success: callback,
        dataType: "json",
        contentType: "application/json",
        processData: false
      });
    }
  });