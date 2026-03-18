pretty old project of mine. it is embeddable and accepts search parameters, heres the relevant section of code:

```javascript
window.onload = function init() {
  var p = new URLSearchParams(window.location.search);

  var p_difficulty = 'beginner',
      p_width = 9,
      p_height = 9,
      p_mines = 10,
      p_embed = false;

  if (p.has('embed')) p_embed = p.get('embed') === 'true';
  if (p.has('difficulty')) p_difficulty = p.get('difficulty');

  if (p_difficulty === 'intermediate') {
    p_width = 16;
    p_height = 16;
    p_mines = 40;
  } else if (p_difficulty === 'expert') {
    p_width = 30;
    p_height = 16;
    p_mines = 99;
  }

  if (p.has('width')) p_width = p.get('width');
  if (p.has('height')) p_height = p.get('height');
  if (p.has('mines')) p_mines = p.get('mines');

  if (p_embed) {
    document.body.innerHTML = '';
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    canvas.style = `
      position: absolute;
      left: 0px;
      top: 0px;
    `;
    document.body.style.overflow = 'hidden';
  } else {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
  }
```
