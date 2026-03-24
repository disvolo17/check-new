const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройки графики
const SCALE = 3;
const TILE_SIZE = 16 * SCALE;

// Загрузка твоих моделей
const playerImg = new Image();
playerImg.src = 'player.png'; // Твой файл

const world = {
    gravity: 0.8,
    groundY: 0,
    blocks: [
        { x: 100, y: 300, type: 'q', content: "Senior Frontend Developer", hit: false },
        { x: 250, y: 200, type: 'q', content: "React / Vue / JS", hit: false },
        { x: 150, y: 450, type: 'brick', hit: false }
    ]
};

const player = {
    x: 50, y: 0, w: 24 * SCALE, h: 32 * SCALE,
    vx: 0, vy: 0, speed: 6, jump: -16,
    grounded: false, flip: false
};

function init() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    world.groundY = canvas.height - 80;
    player.y = world.groundY - player.h;
    loop();
}

function update() {
    // Управление (включая сенсор)
    player.vy += world.gravity;
    player.x += player.vx;
    player.y += player.vy;

    // Столкновение с полом
    if (player.y + player.h > world.groundY) {
        player.y = world.groundY - player.h;
        player.vy = 0;
        player.grounded = true;
    }

    // Логика удара головой о кубики
    world.blocks.forEach(block => {
        if (player.vy < 0 && 
            player.x + player.w > block.x && player.x < block.x + TILE_SIZE &&
            player.y < block.y + TILE_SIZE && player.y > block.y) {
                player.vy = 4; // Отскок вниз
                if (!block.hit) {
                    block.hit = true;
                    console.log("ВЫБИТ ТЕКСТ:", block.content);
                    // Здесь можно вызвать всплывающий текст в небе
                }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем землю
    ctx.fillStyle = '#9b4b28';
    ctx.fillRect(0, world.groundY, canvas.width, 80);

    // Рисуем блоки
    world.blocks.forEach(b => {
        ctx.fillStyle = b.hit ? '#555' : '#f09030';
        ctx.fillRect(b.x, b.y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(b.x, b.y, TILE_SIZE, TILE_SIZE);
    });

    // Рисуем ТВОЮ МОДЕЛЬКУ
    if (playerImg.complete) {
        ctx.save();
        if (player.flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(playerImg, -player.x - player.w, player.y, player.w, player.h);
        } else {
            ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
        }
        ctx.restore();
    } else {
        // Если картинка еще не загрузилась — рисуем красный квадрат
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x, player.y, player.w, player.h);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Слушатели кнопок (Сенсор)
document.getElementById('btn-left').ontouchstart = () => { player.vx = -player.speed; player.flip = true; };
document.getElementById('btn-right').ontouchstart = () => { player.vx = player.speed; player.flip = false; };
document.getElementById('btn-left').ontouchend = document.getElementById('btn-right').ontouchend = () => player.vx = 0;
document.getElementById('btn-jump').ontouchstart = () => { if(player.grounded) player.vy = player.jump; player.grounded = false; };

window.onload = init;
