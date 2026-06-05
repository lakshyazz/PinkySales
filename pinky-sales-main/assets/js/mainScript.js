function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = (name) + "=" + String(value) + expires + ";path=/ ";

}

function readCookie(name) {
    var nameEQ = (name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return (c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

coloredToast = (color, msg) => {
    const toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
            popup: `color-${color}`
        },
    });
    toast.fire({
        title: msg,
    });
};

function checkCookies(){
    const result = readCookie("msg");
    if(result == "data_del") {
        coloredToast("success", 'Record Deleted Successfully.');
        eraseCookie("msg")
        return;
    }
    if(result == "data"){
        coloredToast("success", 'Record Added Successfully.');
        eraseCookie("msg")
        return;
    }
    if(result == "update"){
        coloredToast("success", 'Record Updated Successfully.');
        eraseCookie("msg")
        return;
    }
    if(result == "fail"){
        coloredToast("danger", 'Some Error Occured.');
        eraseCookie("msg")
        return;
    }
    if(result == "cant_delete"){
        coloredToast("danger", "Record is in use can't delete it.");
        eraseCookie("msg")
        return;
    }
    if(result == "login"){
        coloredToast("success", 'Admin Logged-In Successfully');
        eraseCookie("msg")
        return;
    }
    if(result == "logout"){
        coloredToast("success", 'Logged-Out Successfully');
        eraseCookie("msg")
        return;
    }
    if(result == "sc_login"){
        coloredToast("success", 'Logged-in successfully');
        eraseCookie("msg")
        return;
    }
    if(result == "wrong_cred"){
        coloredToast("danger", 'Wrong Username or Password !');
        eraseCookie("msg")
        return;
    }
    if(result == "passChange"){
        coloredToast("success", 'Password Changed Successfully !');
        eraseCookie("msg")
        return;
    }
    if(result == "warranty"){
        coloredToast("danger", 'Entry For This Barcode Exists');
        eraseCookie("msg")
        return;
    }
    if(result == "barcode"){
        coloredToast("danger", 'Please add barcode to Avail warranty !');
        eraseCookie("msg")
        return;
    }
    if(result == "other-product"){
        coloredToast("danger", 'Barcode is used in other Product');
        eraseCookie("msg")
        return;
    }
}

function validateAndDisable() {
    let form = document.getElementById('mainForm');
    let submitButton = document.getElementById('save');
    if (form.checkValidity()) {
        setTimeout(() => {
            submitButton.disabled = true;
        }, 0);
        return true;
    }
}

function updateRecord(id, url) {
    document.cookie = "editId=" + id;
    window.location = url;
}

function viewRecord(id, url) {
    document.cookie = "viewId=" + id;
    window.location = url;
}

function viewNotificationRecord(caid, nid, url){
    console.log(caid, nid, url);
    const http = new XMLHttpRequest();
    http.onload = () => {
        console.log(http.responseText);
    };
    http.open("GET", `./ajax/notifications.php?action=remove_notification&id=${nid}`);
    http.send("");
    document.cookie = "viewId=" + caid;
    window.location = url;
}