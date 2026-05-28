// ルーレット用の設定
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');
const rouletteMain = document.querySelector('.roulette-main');
const displayElement = document.getElementById('roulette-display');
const buttonElement = document.getElementById('start-button');

let filteredShops = []; // 条件に合うお店リスト
let currentRotation = 0; // 現在の回転角度（ラジアン）
const colors = ["#ff9f43", "#ffffff", "#ffe0cc", "#fff"]; // ルーレットの色（交互に使う）

// 高解像度（Retina）対応のための設定
const displaySize = 280; // random.cssのスマホサイズ（280px）に完全に合わせる
const dpr = window.devicePixelRatio || 1;

// キャンバスの「内部解像度」を倍率分だけ巨大化させる
canvas.width = displaySize * dpr;
canvas.height = displaySize * dpr;

// 描画の基準を倍率分だけ拡大しておく
ctx.scale(dpr, dpr);

// 描画用の中心点
const centerX = displaySize / 2;
const centerY = displaySize / 2;
const radius = centerX - 8; // 枠線に被らないように微調整


// ★ フィルターが変更された時に呼び出される関数
function updateShopsByFilter() {
    // 友達のshop_list.htmlから、すべてのお店（liタグ）を捕まえる
    const allShops = document.querySelectorAll('#shop-list li');
    
    const selectedGenre = document.getElementById('filter-genre').value;
    const selectedArea = document.getElementById('filter-area').value;

    filteredShops = []; // リストをリセット

    // お店を1つずつチェック
    allShops.forEach(shop => {
        const shopGenreAttr = shop.getAttribute('data-genre') || "";
        const shopArea = shop.getAttribute('data-area');

        const shopGenres = shopGenreAttr.split(',');
        const matchGenre = (selectedGenre === 'all' || shopGenres.includes(selectedGenre));
        const matchArea = (selectedArea === 'all' || selectedArea === shopArea);

        if (matchGenre && matchArea) {
            filteredShops.push(shop.textContent);
        }
    });

    // 結果表示をリセット
    displayElement.textContent = "ルーレットを回してね";
    displayElement.style.color = "#333";

    // お店がない場合は描画しない
    if (filteredShops.length === 0) {
        drawEmptyRoulette();
        return;
    }

    // 新しいリストでルーレットを描画
    currentRotation = 0;
    rouletteMain.style.transition = 'none'; // 描画時はアニメーションさせない
    rouletteMain.style.transform = `rotate(${currentRotation}rad)`;
    drawRoulette(filteredShops);
}

// ルーレットを描画する関数
function drawRoulette(shops) {
    const numShops = shops.length;
    const arc = Math.PI * 2 / numShops; // 1店舗あたりの角度

    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア

    for (let i = 0; i < numShops; i++) {
        const angle = i * arc;
        
        // 1. 扇形を描画
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length]; // 色を交互に設定
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. お店の名前を描画（扇形の中央に配置）
        ctx.save();
        ctx.fillStyle = "#333";
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2); // 扇形の中央の角度に回転
        
        // ★【はみ出し絶対ガード①】店舗数に応じたベストな文字サイズを厳密に指定
        let fontSize = 12; // 2〜5店舗くらいのときは大きすぎない12pxでキープ！
        if (numShops > 15) {
            fontSize = 9;  // 15店舗以上なら極小にする
        } else if (numShops > 8) {
            fontSize = 11; // 8店舗以上なら少し小さく
        }
        
        ctx.font = `bold ${fontSize}px 'Helvetica Neue', Arial, sans-serif`;
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        
        const text = shops[i];
        // 文字が長すぎる場合、指定文字数（10文字）で切り落とす
        const displayText = text.length > 10 ? text.substring(0, 10) : text;
        
        // ★【はみ出し絶対ガード②】文字の長さ（ドット数）をJavaScriptに自動計算させる！
        const textWidth = ctx.measureText(displayText).width;
        
        // ★【はみ出し絶対ガード③】
        // 「文字の端っこ」が絶対に外側の円（radius）を超えないように、中心からの最適な距離を自動で逆算する魔法の数式
        // これにより、店舗数が少なくて文字が大きく・長くなっても、自動で内側へ引き下がってくれます
        let textPositionX = radius - (textWidth / 2) - 10;
        
        // ただし、中心（0）に寄りすぎると文字が中央でぶつかるので、最低限の隙間（中心から35%以上離す）を保証する
        if (textPositionX < radius * 0.35) {
            textPositionX = radius * 0.5;
        }
        
        ctx.fillText(displayText, textPositionX, 0);
        
        ctx.restore();
    }
}

// お店がない時のグレーのルーレットを描画
function drawEmptyRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = "#ccc";
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#999";
    ctx.stroke();
}

// ★ ルーレットを開始する関数（ボタンを押したら動く）
function startSpin() {
    if (filteredShops.length < 1) return;

    // ボタンを押せなくする
    buttonElement.disabled = true;
    displayElement.textContent = "ドキドキ...";
    displayElement.style.color = "#666";

    // 1. ランダムな当選インデックスを決定
    const numShops = filteredShops.length;
    const winnerIndex = Math.floor(Math.random() * numShops);
    
    // 2. 止まる角度の計算
    const arc = Math.PI * 2 / numShops;
    const extraSpins = 8;
    
    const targetAngle = (Math.PI * 2 * extraSpins) 
                      - (winnerIndex * arc) 
                      - (arc / 2) 
                      - (Math.PI / 2);

    const currentRotMod = currentRotation % (Math.PI * 2);
    currentRotation += targetAngle - currentRotMod;
    if (targetAngle < currentRotMod) {
        currentRotation += Math.PI * 2;
    }

    // 3. アニメーションを開始
    rouletteMain.style.transition = 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)'; 
    rouletteMain.style.transform = `rotate(${currentRotation}rad)`;

    // 4s後にぴったり結果を表示
    setTimeout(() => {
        buttonElement.disabled = false; // ボタンを戻す
        displayElement.innerHTML = `🎉『${filteredShops[winnerIndex]}』に決定！`;
        displayElement.style.color = "#d35400";
        
        rouletteMain.style.transition = 'none';
        rouletteMain.style.transform = `rotate(${currentRotation}rad)`;
    }, 4000);
}