// Вставь это в свой (async function() { ... })

// 1. Загружаем новые спрайты
const sprites = {
    idle: await load("idle.png"),
    jump: await load("jump.png"),
    fall: await load("fall.png"),
    run: [await load("run.png"), await load("run1.png"), await load("run2.png"), await load("run3.png")],
    // Ассеты врага
    eIdle: await load("tank_nut_IDLE.png"),
    eHit: await load("tank_nut_HIT.png"),
    eDeath: await load("tank_nut_DEATH.png")
};

// ... (код игрока и платформ)

// 2. Настраиваем врагов с учетом состояний
let enemies = [
    { 
        x: 1200, y: ground.y - 48, w: 48, h: 48, vx: -2, 
        state: 'IDLE', // Возможные: IDLE, HIT, DEAD
        timer: 0, 
        alive: true 
    },
    { 
        x: 2800, y: ground.y - 48, w: 48, h: 48, vx: -2, 
        state: 'IDLE', 
        timer: 0, 
        alive: true 
    }
];

function update() {
    // ... (логика игрока)

    enemies.forEach(en => {
        if (!en.alive && en.state !== 'DEAD') return;

        // Если жив или в процессе анимации смерти — двигаем/обновляем
        if (en.state === 'IDLE') {
            en.x += en.vx;
            if (en.x < 100 || en.x > finishLine) en.vx *= -1;
        }

        // Таймеры для временных состояний
        if (en.timer > 0) en.timer--;

        // Если таймер HIT закончился, возвращаем в IDLE (если еще жив)
        if (en.state === 'HIT' && en.timer === 0) en.state = 'IDLE';

        // Если таймер DEAD закончился, окончательно убираем
        if (en.state === 'DEAD' && en.timer === 0) en.alive = false;

        // Столкновение
        if (en.alive && en.state === 'IDLE' && 
            player.x + player.w > en.x && player.x < en.x + en.w && 
            player.y + player.h > en.y && player.y < en.y + en.h) {
            
            if (player.vy > 0) { // Прыжок сверху
                player.vy = -10;
                en.state = 'HIT';
                en.timer = 10; // Короткая вспышка удара
                
                // Через мгновение переходим в смерть
                setTimeout(() => {
                    en.state = 'DEAD';
                    en.timer = 30; // Длительность анимации смерти перед исчезновением
                }, 150);
            } else {
                // Игрок коснулся сбоку — респаун
                player.x = 100;
                player.y = 100;
            }
        }
    });
}

function draw() {
    // ... (отрисовка фона и игрока)

    enemies.forEach(en => {
        if (!en.alive && en.state !== 'DEAD') return;

        let currentImg = sprites.eIdle;
        if (en.state === 'HIT') currentImg = sprites.eHit;
        if (en.state === 'DEAD') currentImg = sprites.eDeath;

        if (currentImg) {
            ctx.save();
            // Разворачиваем врага в сторону движения
            if (en.vx > 0) {
                ctx.translate(en.x - lerpCameraX + en.w, en.y);
                ctx.scale(-1, 1);
                ctx.drawImage(currentImg, 0, 0, en.w, en.h);
            } else {
                ctx.drawImage(currentImg, en.x - lerpCameraX, en.y, en.w, en.h);
            }
            ctx.restore();
        }
    });
}
