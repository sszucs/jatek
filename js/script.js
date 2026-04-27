const playfield = document.getElementById("playfield");
const scoreEl = document.getElementById("score");
const feedbackEl = document.getElementById("feedback");

let score = 0;
let entities = [];

function spawnEntity() {
  const el = document.createElement("div");
  el.className = "entity";
  el.style.left = `${Math.random() * 90}%`;
  el.style.top = "0px";

  playfield.appendChild(el);

  entities.push({ el, y: 0, speed: 1 + Math.random() });
}

function updateEntities() {
  entities.forEach((e) => {
    e.y += e.speed;
    e.el.style.top = `${e.y}px`;
  });

  entities = entities.filter((e) => {
    if (e.y > 360) {
      e.el.remove();
      return false;
    }
    return true;
  });
}

function attemptCapture() {
  const zoneY = 300;

  const hit = entities.find((e) => Math.abs(e.y - zoneY) < 16);

  if (hit) {
    hit.el.remove();
    entities = entities.filter((e) => e !== hit);
    score++;
    scoreEl.textContent = score;
    feedbackEl.textContent = "Sikeres befogás";
  } else {
    feedbackEl.textContent = "Időzítésen múlt";
  }
}

setInterval(spawnEntity, 1400);
setInterval(updateEntities, 16);

playfield.addEventListener("click", attemptCapture);