const wrap = document.createElement('div');
const title = document.createElement('h1');
const text = document.createElement('p');
const button = document.createElement('button');
button.onclick = wrap.hidden = true;

wrap.appendChild(title);
wrap.appendChild(text);
wrap.appendChild(button);
document.body.appendChild(wrap);

wrap.hidden = true;

function $alert(_title,_text,_button) {
    title.innerHTML = _title ? _title : "Alert!";
    text.innerHTML = _text;
    button.innerHTML = _button ? _button : "Okay!";

    wrap.hidden = false;
}
