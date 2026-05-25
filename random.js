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
const displaySize = 300; // CSSでの表示サイズ（px）
const dpr = window.devicePixelRatio || 1;

// キャンバスの「内部解像度」を倍率分だけ巨大化させる
canvas.width = displaySize * dpr;
canvas.height = displaySize * dpr;

// 描画の基準を倍率分だけ拡大しておく
ctx.scale(dpr, dpr);

// 描画用の中心点
const centerX = displaySize / 2;
const centerY = displaySize / 2;
const radius = centerX - 10;


// ★ フィルターが変更された時に呼び出される関数
function updateShopsByFilter() {
    // 友達のshop_list.htmlから、すべてのお店（liタグ）を捕まえる
    const allShops = document.querySelectorAll('#shop-list li');
    
    const selectedGenre = document.getElementById('filter-genre').value;
    const selectedArea = document.getElementById('filter-area').value;

    filteredShops = []; // リストをリセット

    // お店を1つずつチェック
    allShops.forEach(shop => {
        const shopGenre = shop.getAttribute('data-genre');
        const shopArea = shop.getAttribute('data-area');

        const matchGenre = (selectedGenre === 'all' || selectedGenre === shopGenre);
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
        
        // 文字のスタイル設定（店舗数が多い場合は文字を小さくする）
        const fontSize = numShops > 10 ? 11 : 14;
        ctx.font = `bold ${fontSize}px 'Helvetica Neue', Arial, sans-serif`;
        ctx.textAlign = "right"; // 文字を円の外側から内側に向けて書く
        
        // 文字を描画（円の外側から内側へ）
        const text = shops[i];
        
        // 文字が長すぎる場合、...をつけずに指定文字数でスパッと切り落とす
        const displayText = text.length > 10 ? text.substring(0, 10) : text;
        ctx.fillText(displayText, radius - 15, 5);
        
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
    
    // 2. 止まる角度の計算（物理的に針の位置に来るように）
    const arc = Math.PI * 2 / numShops;
    
    // 以前の回転角度を引き継ぐ
    const baseRotation = Math.PI * 2 * 10; // 10回転させる
    
    currentRotation += baseRotation // 前回の角度に10回転分足す
                     - winnerIndex * arc // 当選した扇形の角度分戻す
                     - arc / 2 // 扇形の中央に合わせる
                     - Math.PI / 2; // 針の位置（真上）に合わせる
    
    // 3. アニメーションを開始
    rouletteMain.style.transition = 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)'; 
    rouletteMain.style.transform = `rotate(${currentRotation}rad)`;

    // 4s後に結果を表示
    setTimeout(() => {
        buttonElement.disabled = false; // ボタンを戻す
        displayElement.innerHTML = `🎉『${filteredShops[winnerIndex]}』に決定！`;
        displayElement.style.color = "#d35400";
    }, 4000);
}