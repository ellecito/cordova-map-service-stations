window.shortToast = function(str, callback) {
    window.plugins.toast.showShortBottom(str, function(a) {
        console.log('toast success: ' + a);
    }, function(b) {
        alert('toast error: ' + b);
    });
};

window.longToast = function(str, callback) {
    window.plugins.toast.showLongBottom(str, function(a) {
        console.log('toast success: ' + a);
    }, function(b) {
        alert('toast error: ' + b);
    });
};

window.showToast = function(message, duration, position) {
    window.plugins.toast.show(message, (duration == null ? 'short' : duration),
        (position == null ? 'top' : position),
        function(a) {
            console.log('toast success: ' + a);
        },
        function(b) {
            alert('toast error: ' + b);
        });
};