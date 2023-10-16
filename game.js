const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

const moves = {
    [KEY.LEFT]:  p => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]:  p => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p) => field.rotate(p)
};
const time = { start: 0, elapsed: 0, level: 1000 };

ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;
ctxNext.canvas.width = 4 * BLOCK_SIZE;
ctxNext.canvas.height = 4 * BLOCK_SIZE;
ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let field = new Field(ctx, ctxNext);
let requestId;
let accountValues = {
    score: 0,
    level: 0
}

function compare(a, b){
    return b.score - a.score;
}

function resetGame() {
    account.score = 0;
    account.level = 0;
    field.reset();
    field.piece = new Tetromino(ctx);
    field.piece.setStartPosition();
}

function showTable(records_data, new_elem){
    let recordstable = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
    recordstable.innerHTML = '';
    records_data.forEach((record, i) => {
        let new_row = recordstable.insertRow();
        let rank = new_row.insertCell();
        let name = new_row.insertCell();
        let score = new_row.insertCell();
        let level = new_row.insertCell();

        rank.innerText = i + 1;
        name.innerText = record.name;
        score.innerText = record.score;
        level.innerText = record.level;

        if (new_elem.name === record.name && new_elem.score === record.score){
            rank.style.color = "red";
            name.style.color = "red";
            score.style.color = "red";
            level.style.color = "red";
        }
    })
}

function showRecords(){
    document.getElementById("records-table").style.display = "block";
    let records_data = JSON.parse(localStorage.getItem('records5')) || [];
    let username = localStorage["username"];
    let new_record = {name: username, score: account.score, level: account.level};

    const same = records_data.filter(element => element.name === account.username)[0];
    if (!same || same.score < new_record.score){
        let index = records_data.indexOf(same);
        if (index !== -1){
            records_data.splice(index, 1);
        }

        records_data.push(new_record);
        records_data.sort(compare);
        if (records_data.length > 10){
            records_data.pop();
        }
        localStorage['records5'] = JSON.stringify(records_data);
    }

    showTable(records_data, new_record);
}

function getUsername() {
    localStorage["username"] = document.getElementById("input-name").value;
}

function updateAccount(key, value) {
    let element = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}

let account = new Proxy(accountValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateAccount(key, value);
        return true;
    }
});

function animate(now = 0) {
    time.elapsed = now - time.start;
    if (time.elapsed > time.level) {
        time.start = now;

        if (!field.drop()) {
            gameOver();
            return;
        }
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    field.draw();
    requestId = requestAnimationFrame(animate);
}

function gameOver() {
    cancelAnimationFrame(requestId);
    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 1.8, 4);
    showRecords();
}

function play() {
    resetGame();
    animate();

    document.addEventListener('keydown', event => {
        if (moves[event.keyCode]) {
            event.preventDefault();

            let p = moves[event.keyCode](field.piece);

            if (event.keyCode === KEY.SPACE) {
                while (field.valid(p)) {
                    account.score += POINTS.HARD_DROP;
                    field.piece.move(p);

                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    field.piece.draw();

                    p = moves[KEY.DOWN](field.piece);
                }
            } else if (field.valid(p)) {
                field.piece.move(p);

                if (event.keyCode === KEY.DOWN) {
                    account.score += POINTS.SOFT_DROP;
                }
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                field.piece.draw();
            }
        }
    });
}