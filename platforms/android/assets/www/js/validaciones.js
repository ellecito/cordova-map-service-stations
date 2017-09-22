var blacklist = '!@#$%^&*()+=[]\\\';,/{}|":<>?~`.- _œ·¢∞¬÷“”≠´!¿Ç¨–…„‚';
$("#tel").numeric({
    allowThouSep: false,
    allowDecSep: false,
    allowMinus: false,
    allowPlus: true,
    maxDigits: 9
});

$("#nombre").alpha({
    disallow: blacklist,
    allowSpace: false
});

$("#apellidos").alpha({
    disallow: blacklist
});