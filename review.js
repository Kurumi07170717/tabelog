// URLから店名を取得
const urlParams = new URLSearchParams(window.location.search);
const shopName = urlParams.get('shop');

// ジャンルに合わせた特別項目リスト
const genreSpecificFields = {
    "ラーメン": ["味の濃さ", "こってり度", "麺の硬さ"],
    "デザート": ["甘さ", "映え度", "くつろぎ度"],
    "抹茶": ["苦味", "香りの強さ", "和の雰囲気"],
    "焼肉": ["肉の質", "ジューシーさ", "タレの旨み"],
    "洋食": ["ボリューム", "ソースの味", "家庭感"],
    "イタリアン": ["盛り付け", "生地の食感", "ワインに合うか"],
    "ハンバーガー": ["肉汁", "バンズの美味しさ", "食べ応え"],
    "カレー": ["スパイス感", "辛さ", "ルーの濃厚さ"],
    "カフェ": ["静かさ", "ドリンクの味", "写真映え"]
};

// 共通項目
const commonFields = ["味", "値段(コスパ)"];

// 初期化処理
if (shopName) {
    document.getElementById('shop-name-display').textContent = shopName;
    
    // データ基地(shop_list.html)からジャンルを特定する
    fetch('shop_list.html')
        .then(response => response.text())
        .then(data => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            const shopLi = Array.from(tempDiv.querySelectorAll('li')).find(li => li.textContent.trim() === shopName);
            
            const genre = shopLi ? shopLi.getAttribute('data-genre').split(',')[0] : "その他";
            buildRatingFields(genre);
        });
}

// 評価項目を組み立てる関数
function buildRatingFields(genre) {
    const container = document.getElementById('dynamic-rating-fields');
    container.innerHTML = '';

    // 共通項目 + そのジャンルの項目を合体
    const fields = [...commonFields, ...(genreSpecificFields[genre] || ["満足度"])];

    fields.forEach(fieldName => {
        const group = document.createElement('div');
        group.className = 'rating-group';
        group.innerHTML = `
            <p class="rating-label">${fieldName}</p>
            <div class="star-rating" data-field="${fieldName}">
                <i class="fa-regular fa-star" data-value="1"></i>
                <i class="fa-regular fa-star" data-value="2"></i>
                <i class="fa-regular fa-star" data-value="3"></i>
                <i class="fa-regular fa-star" data-value="4"></i>
                <i class="fa-regular fa-star" data-value="5"></i>
            </div>
        `;
        container.appendChild(group);
    });

    // 星をクリックした時のイベントを設定
    setupStarEvents();
}

// 星のクリックイベント
function setupStarEvents() {
    const allStars = document.querySelectorAll('.star-rating i');
    allStars.forEach(star => {
        star.onclick = function() {
            const value = parseInt(this.dataset.value);
            const parent = this.parentElement;
            const stars = parent.querySelectorAll('i');

            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.replace('fa-regular', 'fa-solid');
                } else {
                    s.classList.replace('fa-solid', 'fa-regular');
                }
            });
        };
    });
}

// --- 写真アップロードの処理 ---
const uploadTrigger = document.getElementById('upload-trigger');
const imageInput = document.getElementById('image-input');
const previewContainer = document.getElementById('preview-container');
const placeholder = document.getElementById('placeholder');

uploadTrigger.onclick = () => imageInput.click();

imageInput.onchange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        placeholder.style.display = 'none'; // カメラアイコンを隠す
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
};

// 投稿ボタン（デモ用）
document.getElementById('submit-review').onclick = () => {
    alert('評価を投稿しました！(※デモ版のため実際には保存されません)');
    window.location.href = `detail.html?shop=${encodeURIComponent(shopName)}`;
};