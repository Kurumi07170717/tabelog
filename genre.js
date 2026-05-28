// ページが開いた瞬間にお店リスト(shop_list.html)を自動で読み込む
fetch('shop_list.html')
    .then(response => response.text())
    .then(data => {
        // 隠し部屋（header-import）にお店データを流し込む
        document.getElementById('header-import').innerHTML = data;
        // 最初は「すべてのお店」を画面に表示する
        showCategoryShops();
    });

// ジャンルとエリアが選ばれたらお店を仕分けして表示する関数
function showCategoryShops() {
    const allShops = document.querySelectorAll('#shop-list li');
    const selectedGenre = document.getElementById('list-genre').value;
    const selectedArea = document.getElementById('list-area').value; 
    const container = document.getElementById('shop-cards-list');
    const countDisplay = document.getElementById('match-count');

    container.innerHTML = ''; // 一旦画面をきれいにお掃除
    let count = 0;

    allShops.forEach(shop => {
        const shopGenreAttr = shop.getAttribute('data-genre') || "";
        const shopArea = shop.getAttribute('data-area');
        const shopName = shop.textContent;

        // カンマ区切りの複数ジャンルを配列に分解
        const shopGenres = shopGenreAttr.split(',');

        // ジャンルとエリア、両方の条件をクリアしているかチェック
        const matchGenre = (selectedGenre === 'all' || shopGenres.includes(selectedGenre));
        const matchArea = (selectedArea === 'all' || selectedArea === shopArea);

        // 両方とも合格なら画面にカードを出す！
        if (matchGenre && matchArea) {
            count++;

            // お店のカード（HTML要素）を作成
            const card = document.createElement('div');
            card.className = 'shop-card';
            
            // 複数あるジャンルをそれぞれ個別のオレンジバッジに変換
            const genreBadges = shopGenres.map(g => `<span class="badge badge-genre">${g}</span>`).join(' ');

            // ★【ここが最新版！】カード全体をリンク(aタグ)にして、クリックしたらdetail.htmlに店名を送る
            // aタグの中に店名とバッジをきれいに左右に並べるために、CSSのスタイルを直接少し仕込んでいます
            card.innerHTML = `
                <a href="detail.html?shop=${encodeURIComponent(shopName)}" style="text-decoration: none; display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <div class="shop-name" style="color: #333;">${shopName}</div>
                    <div class="shop-badge-area">
                        ${genreBadges}
                        <span class="badge badge-area">${shopArea}</span>
                    </div>
                </a>
            `;
            
            // 画面のコンテナに追加
            container.appendChild(card);
        }
    });

    // 該当した合計件数を画面に書き換える
    countDisplay.textContent = `🔍 ヒットしたお店: ${count}件`;
}