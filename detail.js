// ページを開いた瞬間、URLの後ろに付いているお店の名前（?shop=◯◯）を解析する
const urlParams = new URLSearchParams(window.location.search);
const shopNameParam = urlParams.get('shop');

if (!shopNameParam) {
    document.getElementById('detail-name').textContent = "お店が選択されていません";
} else {
    // データ基地（shop_list.html）を読み込んで該当するお店を探す
    fetch('shop_list.html')
        .then(response => response.text())
        .then(data => {
            const tempDiv = document.getElementById('header-import');
            tempDiv.innerHTML = data;

            // shop_listのliタグから、中身のテキストが一致するものを一本釣りする
            const allShops = tempDiv.querySelectorAll('#shop-list li');
            let foundShop = null;

            allShops.forEach(shop => {
                if (shop.textContent.trim() === shopNameParam.trim()) {
                    foundShop = shop;
                }
            });

            if (foundShop) {
                // お店のデータを各部品から引っこ抜く
                const name = foundShop.textContent;
                const genreAttr = foundShop.getAttribute('data-genre') || "";
                const area = foundShop.getAttribute('data-area');
                const imagesAttr = foundShop.getAttribute('data-image') || "";
                const review = foundShop.getAttribute('data-review');
                const link = foundShop.getAttribute('data-link');

                // 画面の各要素にデータを流し込む
                document.getElementById('detail-name').textContent = name;
                document.getElementById('detail-area').textContent = area;
                document.getElementById('detail-review').textContent = review;
                
                const linkButton = document.getElementById('detail-link');
                linkButton.href = link;

                // ジャンルバッジを個別に分けて生成
                const genreContainer = document.getElementById('detail-genre-container');
                genreContainer.innerHTML = '';
                genreAttr.split(',').forEach(g => {
                    const span = document.createElement('span');
                    span.className = 'badge badge-genre';
                    span.textContent = g;
                    genreContainer.appendChild(span);
                });

                // ★途切れない無限スライダー用の画像生成ロジック
                const sliderTrack = document.getElementById('detail-slider');
                sliderTrack.innerHTML = '';
                const imageUrls = imagesAttr.split(',');

                // 1周目の画像セット
                imageUrls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url.trim();
                    sliderTrack.appendChild(img);
                });

                // 2周目の画像セット（これがあることで途切れずにループが無限に繋がります）
                imageUrls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url.trim();
                    sliderTrack.appendChild(img);
                });

            } else {
                document.getElementById('detail-name').textContent = "お店の情報が見つかりませんでした";
            }
        });
}
// 評価ページへのリンクを設定
document.getElementById('review-post-link').href = `review.html?shop=${encodeURIComponent(shopNameParam)}`;