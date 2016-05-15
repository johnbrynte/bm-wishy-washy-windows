window.addEventListener('dragover', function () {
    return false;
});
window.addEventListener('dragend', function () {
    return false;
});
window.addEventListener('drop', function (evt) {
    evt.preventDefault();

    var file = evt.dataTransfer.files[0],
        reader = new FileReader();
    reader.onload = function (event) {
        console.log(event.target);
        holder.style.background = 'url(' + event.target.result + ') no-repeat center';
    };
    reader.readAsDataURL(file);
    console.log(file);
    
    return false;
});