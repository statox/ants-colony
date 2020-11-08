function initModal() {
    // Get the modal
    var modal = document.getElementById('settingsModal');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('close')[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = 'none';
        loop();
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            loop();
        }
    };
}

// When the user clicks on the button, open the modal
function openModal() {
    var modal = document.getElementById('settingsModal');
    modal.style.display = 'block';
    noLoop();
}

function isModalShown() {
    var modal = document.getElementById('settingsModal');
    return modal.style.display && modal.style.display !== 'none';
}
