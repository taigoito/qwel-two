/**
 * Preloader
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */

class Preloader {
  // 引数:isLoadManually true: 自動読み込みしない false: window.onloadで自動読み込み
  constructor(elem, isLoadManually) {
    // 要素を取得
    this._elem = elem || document.querySelector('.preloader');
    if (!this._elem) return;

    // 各オプション (data属性から取得)
    const backgroundColor = this._elem.dataset.backgroundColor || '';
    const imgSrc = this._elem.dataset.imgSrc || '';
    const terminateTime = this._elem.dataset.terminateTime || 3000;
    const spinnerOff = this._elem.dataset.spinnerOff || false;
    const spinnerBarsCount = this._elem.dataset.spinnerBarsCount || 12; // Sassも修正が必要
    const spinnerInterval = this._elem.dataset.spinnerInterval || 1000;

    // 背景を覆う
    this._preloader = document.createElement('div');
    this._preloader.classList.add('preloader__overlay', '--show');
    this._preloader.style.backgroundColor = backgroundColor;
    this._elem.appendChild(this._preloader);

    // 画像またはスピナーを表示
    if (imgSrc) {
      const img = new Image();
      img.classList.add('preloader__image');
      img.src = imgSrc;
      this._preloader.appendChild(img);
    } else if (!spinnerOff) {
      this._spinner = new Spinner({
        barsCount: spinnerBarsCount,
        interval: spinnerInterval
      });
      this._spinner.spin();
      this._preloader.appendChild(this._spinner.spinner);
    }

    // 3000ミリ秒でロード
    this._terminateTime = terminateTime;
    this._terminateTimmerId = setTimeout(() => {
      this.load()
    }, this._terminateTime);

    // ページ読み込みが完了したらロード
    if (!isLoadManually) window.onload = () => this.load();

  }


  load() {
    clearTimeout(this._terminateTimmerId);

    let callback;
    const promise = new Promise((resolve, reject) => {
      callback = () => resolve(this._preloader);
      this._preloader.addEventListener('transitionend', callback);
    });

    this._preloader.classList.remove('--show');
    promise.then(() => {
      this._preloader.removeEventListener('transitionend', callback);
      this._terminate();
    });

  }


  _terminate() {
    if (this._spinner) {
      this._spinner.stop();
    }
    this._preloader.remove();

    // エフェクト終了をbody要素に伝え、各要素をtransitionさせる
    document.body.classList.add('--loaded');

  }

}


// CSSでスピナーを作成
class Spinner {

  constructor(options = {}) {
    this._spinner = document.createElement('div');
    this._spinner.classList.add('preloader__spinner');
    this.barsCount = options.barsCount || 12;
    const bars = [];

    for (let i = 0; i < this.barsCount; i++) {
      bars[i] = document.createElement('span');
      this._spinner.appendChild(bars[i]);
    }

    this.interval = options.interval || 1000;
    this.interval /= this.barsCount;

  }


  spin() {
    this.isSpin = true;

    setTimeout(() => {
      this._loop(0);
    }, this.interval);

  }


  stop() {
    this.isSpin = false;

  }


  _loop(rotateCount = 0) {
    if (!this.isSpin) return;

    if (this.barsCount === rotateCount) {
      rotateCount = 0;
    } else {
      rotateCount++;
    }

    const deg = rotateCount * 360 / this.barsCount;
    this._spinner.style.transform = `rotate(${deg}deg)`;

    setTimeout(() => {
      this._loop(rotateCount);
    }, this.interval);

  }

}
