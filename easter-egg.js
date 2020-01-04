(function() {
  class Utils {
    static styleElement(el, styles) {
      for (let key in styles) {
        el.style[key] = styles[key];
      }
    }

    static applyProps(el, props) {
      for (let key in props) {
        el[key] = props[key];
      }
    }

    static getRandomColor() {
      const r = Utils.getRandomNumber(255);
      const g = Utils.getRandomNumber(255);
      const b = Utils.getRandomNumber(255);

      return { r, g, b };
    }

    static getCssColor({ r, g, b }, func = 'rgb') {
      return `${func}(${r}, ${g}, ${b})`;
    }

    static getRandomNumber(min, max = 0) {
      let random;
      if (max) {
        random = Math.random() * (max - min) + min;
      } else {
        random = Math.random() * min;
      }
      return Math.round(random);
    }

    static createComponent(tag, props, styles) {
      const el = document.createElement(tag);
      Utils.applyProps(el, props);
      Utils.styleElement(el, styles);
      return el;
    }

    static $(selector) {
      return document.querySelector(selector);
    }

    static $$(selector) {
      const elems = document.querySelectorAll(selector);
      return elems && Array.from(elems);
    }

    static getCSSNumericValue(el, styleProp) {
      const style = Utils.getCSS(el, styleProp);
      if (!style) {
        return null;
      }

      return Number.parseFloat(style.replace('px', ''));
    }

    static getCSS(el, styleProp) {
      const style = getComputedStyle(el)[styleProp];
      if (style == 'none') return null;
      return style;
    }

    static isElementVisibleInWindow(el) {
      const x = el.offsetLeft;
      const y = el.offsetTop;

      const width = el.offsetWidth;
      const height = el.offsetHeight;

      return y >= 0 && y <= window.innerHeight && x >= 0 && x <= window.innerWidth;
    }
  }

  class EasterEgg {
    static fontFamily = 'Comic Sans MS';

    constructor(controller) {
      this.controller = controller;

      this.intervalId = -1;

      this.images = [];
      this.circles = [];

      this.mouseHandler = new MouseHandler();

      this.clickedImages = 0;
      this.clickCount = 0;

      this.audio = {
        coin: new AudioController(
          Utils.createComponent('audio', {
            src: '../img/easteregg/smb3_coin.wav',
            type: 'audio/wav'
          })
        ),

        circleAudio: new AudioController(
          Utils.createComponent('audio', {
            src: '../img/easteregg/smb3_power-up.wav',
            type: 'audio/wav'
          })
        )
      };
    }

    initBodyHandler() {
      function removeElement(elements, element) {
        let idx;

        if ((idx = elements.indexOf(element)) >= 0) {
          document.body.removeChild(element);
          elements.splice(idx, 1);
          return true;
        }

        return false;
      }

      document.body.addEventListener('click', e => {
        if (removeElement(this.images, e.target)) {
          this.audio.coin.play();

          this.clickedImages += 1;
          this.clickCount += 1;

          return;
        }

        if (removeElement(this.circles, e.target)) {
          this.audio.circleAudio.play();
          for (let i = Math.floor(this.images.length / 2); i < this.images.length; i++) {
            if (this.images[i].parentNode == document.body) {
              this.clickCount += 1;
              document.body.removeChild(this.images[i]);
            }
          }
          this.images.splice(this.images.length / 2);
        }
      });
    }

    changeGlobalFont() {
      const elements = Utils.$$('*');
      if (elements) {
        elements.forEach(element => {
          const colors = ['red', 'yellow', 'green', 'blue', 'pink'];
          const rand = Utils.getRandomNumber(colors.length);
          const color = colors[rand];
          Utils.styleElement(element, {
            fontFamily: EasterEgg.fontFamily,
            color,
            textTransform: 'lowercase'
          });
        });
      }
    }

    imageRain() {
      function createImage() {
        const props = { src: '../img/easteregg/dog-dances.gif', className: 'doggo-image' };
        const width = Utils.getRandomNumber(25, 50);
        const height = width;
        const styles = {
          width: width + 'px',
          height: height + 'px',
          borderRadius: '100%',
          position: 'fixed',
          top: 0 - height + 'px',
          left: Utils.getRandomNumber(window.innerWidth) + 'px',
          transform: 'scale(1)',
          transition: '0.3s ease-in-out transform',
          zIndex: '100000',
          boxShadow: `4px 7px 5px 0px ${Utils.getCssColor(Utils.getRandomColor())};`
        };
        const image = Utils.createComponent('img', props, styles);
        this.images.push(image);
        document.body.appendChild(image);
      }

      function createCircle() {
        const width = Utils.getRandomNumber(50, 75);
        const height = width;
        const backgroundColor = Utils.getCssColor(Utils.getRandomColor());

        const styles = {
          position: 'fixed',
          top: 0 - height + 'px',
          left: Utils.getRandomNumber(window.innerWidth) + 'px',
          width: width + 'px',
          height: height + 'px',
          backgroundColor,
          borderRadius: '100%',
          zIndex: '10000'
        };
        const circle = Utils.createComponent('div', {}, styles);
        this.circles.push(circle);
        document.body.appendChild(circle);
      }

      function step(elements) {
        let prevXMouseMovingDirection = '';
        elements.forEach((element, index) => {
          let [xDir, yDir] = this.mouseHandler.getMovingDirection() || ['', 'down'];

          let incrementor = 3;

          let xModifier = xDir == 'left' ? -incrementor : incrementor;
          if (!xDir) {
            if (yDir == 'down' || yDir == 'up') {
              xModifier = 0;
            } else {
              xDir = prevXMouseMovingDirection;
            }
          }
          prevXMouseMovingDirection = xDir;

          const top = element.offsetTop + incrementor + 'px';
          const left = element.offsetLeft + xModifier + 'px';
          const rand = Utils.getRandomNumber(1);
          const style = {
            [rand == 0 ? 'top' : 'left']: rand == 0 ? top : left
          };
          if (element.tagName == 'DIV') {
            const color = Utils.getCssColor(Utils.getRandomColor());
            style.backgroundColor = color;
          }

          Utils.styleElement(element, style);

          if (Utils.isElementVisibleInWindow(element) && !element.hasShowedUp) {
            element.hasShowedUp = true;
          }

          if (!Utils.isElementVisibleInWindow(element) && element.hasShowedUp) {
            document.body.removeChild(element);
            elements.splice(index, 1);
          }
        });
      }

      let i = 0;
      const INTERVAL = 1;
      const ADD_IMAGE_INTERVAL = INTERVAL * 50;
      const ADD_CIRCLE_INTERVAL = 10;

      const h1 = Utils.$('h1');
      const title = Utils.$('.title');
      function stepWrapper() {
        h1.textContent = this.images.length;

        let willCreateCircle =
          this.clickedImages % ADD_CIRCLE_INTERVAL == 0 &&
          Utils.getRandomNumber(this.clickedImages) > this.clickedImages / 2;

        if (willCreateCircle) {
          createCircle.call(this);
          this.clickedImages = 0;
        }

        if (i++ % ADD_IMAGE_INTERVAL == 0) {
          createImage.call(this);
        }

        step.call(this, this.images);
        step.call(this, this.circles);

        title.textContent = this.clickCount;

        this.intervalId = window.requestAnimationFrame(stepWrapper.bind(this));

        if (this.images.length == 0) {
          this.controller.stop();
        }
      }

      this.intervalId = window.requestAnimationFrame(stepWrapper.bind(this));
    }

    playVideo() {
      const video = Utils.$('#video');
      video.hidden = false;
      video.play();
    }

    shake() {
      const elements = Utils.$$(
        'h1, h2,h3,h4,h5,h6,p,a,li,ol,time,html,img,input,button,textarea,footer *,address,iframe'
      );
      const classNames = [
        'jackInTheBox',
        'bounce',
        'pulse',
        'rubberBand',
        'shake',
        'swing',
        'tada',
        'wobble',
        'jello',
        'bounceIn',
        'flip'
      ];
      elements.forEach(element => {
        if (element.tagName == 'HTML') {
          element.classList.add('animated', 'shake', 'infinite');
          return;
        }
        const randomNumber = Math.min(
          Utils.getRandomNumber(classNames.length),
          classNames.length - 1
        );
        const className = classNames[randomNumber];
        element.classList.add('animated', className, 'infinite');
      });
    }

    static changeTitle() {
      const titleEl = Utils.$('.title');
      Utils.styleElement(titleEl, {
        fontFamily: EasterEgg.fontFamily
      });
      titleEl.classList.remove('text-white');

      Utils.applyProps(titleEl, {
        textContent: 'click me'
      });

      setInterval(() => {
        const color = Utils.getRandomColor();
        const cssValue = Utils.getCssColor(color);
        Utils.styleElement(titleEl, {
          color: cssValue
        });
      }, 100);
    }

    static checkVisit() {
      const VISIT_COUNT_THRESHOLD = 3;

      let visitCount = localStorage.getItem('visitCount');
      // let lastVisitTime = localStorage.gett('lastVisitTime');
      if (!visitCount) {
        localStorage.setItem('visitCount', 1);
      } else {
        visitCount = Number.parseInt(visitCount) + 1;
        if (visitCount >= VISIT_COUNT_THRESHOLD) {
          EasterEgg.changeTitle();
          visitCount = 0;
        }
        localStorage.setItem('visitCount', visitCount);
      }
    }
  }

  class MouseHandler {
    constructor(sensitivity = 25) {
      this.prevX = null;
      this.prevY = null;

      this.x = null;
      this.y = null;

      this.sensitivity = Math.abs(sensitivity);

      this.direction = null;

      this.initHandler();
    }

    getMovingDirection() {
      if (this.direction) {
        const [x, y] = this.direction.split(' ').map(dir => dir.trim());
        return [x, y];
      }

      return null;
    }

    _setMovingDirection() {
      let direction = '';

      let prevX = this.prevX;
      let prevY = this.prevY;

      let x = this.x;
      let y = this.y;

      let sensitivity = this.sensitivity;

      let dx = prevX - x;
      let dy = prevY - y;
      if (dx <= -sensitivity) {
        direction += 'right';
      } else if (dx >= sensitivity) {
        direction += 'left';
      }

      direction += ' ';

      if (dy <= 0 || dy <= -sensitivity) {
        direction += 'down';
      } else if (dy >= 0 || dy >= sensitivity) {
        direction += 'up';
      }
      this.direction = direction;
    }

    initHandler() {
      function handleMove(e) {
        e.stopImmediatePropagation();

        this.x = e.pageX;
        this.y = e.pageY;

        if (!this.prevX && !this.prevY) {
          this.prevX = this.x;
          this.prevY = this.y;
        } else {
          let sensitivity = this.sensitivity;
          if (
            Math.abs(this.prevX - this.x) >= sensitivity ||
            Math.abs(this.prevY - this.y) >= sensitivity
          ) {
            this._setMovingDirection();
            this.prevX = this.x;
            this.prevY = this.y;
          }
        }
      }

      window.addEventListener('mousemove', handleMove.bind(this));
      window.addEventListener('mouseover', handleMove.bind(this));
    }

    getCoord() {
      return { x: this.x, y: this.y };
    }
  }

  class EasterEggController {
    constructor() {
      EasterEgg.checkVisit();
      this.easterEgg = new EasterEgg(this);
      this.initTriggerHandler();

      this.initialHTML = new XMLSerializer().serializeToString(document);
    }

    start() {
      EasterEgg.changeTitle();

      this.easterEgg.initBodyHandler();
      this.easterEgg.changeGlobalFont();
      this.easterEgg.imageRain();
      this.easterEgg.playVideo();
      this.easterEgg.shake();
    }

    initTriggerHandler() {
      const elem = Utils.$('.title');
      let i = 0;
      elem.addEventListener('click', e => {
        if (++i == 3) {
          this.start();
        }
      });
    }

    reset() {
      document.open();
      document.write(this.initialHTML);
      document.close();
    }

    stop() {
      cancelAnimationFrame(this.easterEgg.intervalId);
      this.easterEgg.intervalId = undefined;
      this.reset();
    }
  }

  class AudioController {
    constructor(audioElement) {
      this.element = audioElement;
    }

    play() {
      if (this._isPlaying()) {
        this.element.pause();
        this.element.load();
      }

      this.element.play();
    }

    _isPlaying() {
      return !this.element.ended;
    }
  }

  document.addEventListener('DOMContentLoaded', e => {
    new EasterEggController();
  });
})();
