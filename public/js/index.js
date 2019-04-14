/*!
 * VERSION: 0.2.2
 * DATE: 2014-12-31
 * UPDATES AND DOCS AT: https://www.greensock.com
 *
 * @license Copyright (c) 2008-2015, GreenSock. All rights reserved.
 * ScrambleTextPlugin is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit https://greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope = (typeof (module) !== "undefined" && module.exports && typeof (global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
    "use strict";
    var _getText = function (e) {
        var type = e.nodeType, result = "";
        if (type === 1 || type === 9 || type === 11) {
            if (typeof (e.textContent) === "string") {
                return e.textContent;
            }
            else {
                for (e = e.firstChild; e; e = e.nextSibling) {
                    result += _getText(e);
                }
            }
        }
        else if (type === 3 || type === 4) {
            return e.nodeValue;
        }
        return result;
    }, _scrambleText = function (length, chars) {
        var l = chars.length, s = "";
        while (--length > -1) {
            s += chars[((Math.random() * l) | 0)];
        }
        return s;
    }, CharSet = function (chars) {
        this.chars = chars.split("");
        this.sets = [];
        this.length = 50;
        var i;
        for (i = 0; i < 20; i++) {
            this.sets[i] = _scrambleText(80, this.chars); //we create 20 strings that are 80 characters long, randomly chosen and pack them into an array. We then randomly choose the scrambled text from this array in order to greatly improve efficiency compared to creating new randomized text from scratch each and every time it's needed. This is a simple lookup whereas the other technique requires looping through as many times as there are characters needed, and calling Math.random() each time through the loop, building the string, etc.
        }
        this.grow = function (newLength) {
            for (i = 0; i < 20; i++) {
                this.sets[i] += _scrambleText(newLength - this.length, this.chars);
            }
            this.length = newLength;
        };
    }, _upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", _lower = _upper.toLowerCase(), _charsLookup = {
        upperCase: new CharSet(_upper),
        lowerCase: new CharSet(_lower),
        upperAndLowerCase: new CharSet(_upper + _lower)
    }, ScrambleTextPlugin = _gsScope._gsDefine.plugin({
        propName: "scrambleText",
        version: "0.2.2",
        API: 2,
        overwriteProps: ["scrambleText", "text"],
        //called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
        init: function (target, value, tween) {
            this._prop = ("innerHTML" in target) ? "innerHTML" : ("textContent" in target) ? "textContent" : 0; // SVG text in IE doesn't have innerHTML, but it does have textContent.
            if (!this._prop) {
                return false;
            }
            this._target = target;
            if (typeof (value) !== "object") {
                value = { text: value };
            }
            var delim, i, maxLength, charset;
            this._delimiter = delim = value.delimiter || "";
            this._original = _getText(target).replace(/\s+/g, " ").split("&nbsp;").join("").split(delim);
            this._text = (value.text || value.value || "").replace(/\s+/g, " ").split(delim);
            this._hasClass = false;
            if (typeof (value.newClass) === "string") {
                this._newClass = value.newClass;
                this._hasClass = true;
            }
            if (typeof (value.oldClass) === "string") {
                this._oldClass = value.oldClass;
                this._hasClass = true;
            }
            i = this._text.length - this._original.length;
            this._length = this._original.join(delim).length;
            this._lengthDif = this._text.join(delim).length - this._length;
            this._fillChar = value.fillChar || (value.chars && value.chars.indexOf(" ") !== -1) ? "&nbsp;" : "";
            this._charSet = charset = _charsLookup[(value.chars || "upperCase")] || new CharSet(value.chars);
            this._speed = 0.016 / (value.speed || 1);
            this._prevScrambleTime = 0;
            this._setIndex = (Math.random() * 20) | 0;
            maxLength = this._length + Math.max(this._lengthDif, 0);
            if (maxLength > charset.length) {
                charset.grow(maxLength);
            }
            this._chars = charset.sets[this._setIndex];
            this._revealDelay = value.revealDelay || 0;
            this._tweenLength = (value.tweenLength !== false);
            this._tween = tween;
            return true;
        },
        //called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
        set: function (ratio) {
            var l = this._text.length, delim = this._delimiter, time = this._tween._time, timeDif = time - this._prevScrambleTime, i, newText, oldText, applyNew, applyOld, str;
            if (this._revealDelay) {
                if (this._tween.vars.runBackwards) {
                    time = this._tween._duration - time; //invert the time for from() tweens
                }
                ratio = (time === 0) ? 0 : (time < this._revealDelay) ? 0.000001 : (time === this._tween._duration) ? 1 : this._tween._ease.getRatio((time - this._revealDelay) / (this._tween._duration - this._revealDelay));
            }
            if (ratio < 0) {
                ratio = 0;
            }
            else if (ratio > 1) {
                ratio = 1;
            }
            i = (ratio * l + 0.5) | 0;
            newText = this._text.slice(0, i).join(delim);
            oldText = this._original.slice(i).join(delim);
            if (ratio) {
                if (timeDif > this._speed || timeDif < -this._speed) {
                    this._setIndex = (this._setIndex + ((Math.random() * 19) | 0)) % 20;
                    this._chars = this._charSet.sets[this._setIndex];
                    this._prevScrambleTime += timeDif;
                }
                oldText = this._chars.substr(newText.length, ((this._length + (this._tweenLength ? 1 - ((ratio = 1 - ratio) * ratio * ratio * ratio) : 1) * this._lengthDif) - newText.length + 0.5) | 0);
            }
            if (this._hasClass) {
                applyNew = (this._newClass && i !== 0);
                applyOld = (this._oldClass && i !== l);
                str = (applyNew ? "<span class='" + this._newClass + "'>" : "") + newText + (applyNew ? "</span>" : "") + (applyOld ? "<span class='" + this._oldClass + "'>" : "") + delim + oldText + (applyOld ? "</span>" : "");
            }
            else {
                str = newText + delim + oldText;
            }
            this._target[this._prop] = (this._fillChar === "&nbsp;" && str.indexOf("  ") !== -1) ? str.split("  ").join("&nbsp;&nbsp;") : str;
        }
    }), p = ScrambleTextPlugin.prototype;
    p._newClass = p._oldClass = "";
    for (p in _charsLookup) {
        _charsLookup[p.toLowerCase()] = _charsLookup[p];
        _charsLookup[p.toUpperCase()] = _charsLookup[p];
    }
});
if (_gsScope._gsDefine) {
    _gsScope._gsQueue.pop()();
}
var _colors = ['red', 'green', 'blue', 'white'];
function init() {
    var _this = this;
    var tagLine = document.body.querySelector('.tagline');
    var parent = tagLine.parentElement;
    var characterContainers = this.createRGBW(tagLine, this._colors);
    // line map, e.g. [ [char1, char2, char2], [char1, char2, char3], ... ]
    var rgbw = characterContainers
        .map(function (line) { return _this.splitCharacters(line); });
    // map of characters, e.g. [ [r,g,b,w], [r,g,b,w], ... ]
    var characterMap = rgbw[0]
        .map(function (line, charIndex) {
        return rgbw
            .map(function (line, lineIndex) { return rgbw[lineIndex][charIndex]; });
    });
    // all characters in a flat array
    var allCharacters = rgbw
        .reduce(function (arr, chr) { return arr.concat(chr); }, []);
    var timeline = new TimelineMax({ repeat: -1, repeatDelay: 1 });
    timeline.set(allCharacters, { opacity: 0 });
    timeline.add(this.randomCharacterFadeIn(characterMap), 0.5);
    timeline.to(parent, 1, { opacity: 0 }, '+=1');
    // timeline.from(parent, timeline.duration(), { scale: 0.85, ease: Linear.easeNone }, 0);
    characterContainers
        .slice(0, 3)
        .forEach(function (el, i) {
        var wobble = _this.wobbleAnimation(el.parentElement);
        var offset = 0.7 + (0.03 * i);
        timeline.add(wobble, offset);
        timeline.to(el.parentElement, 0.2, {
            opacity: 0
        }, offset + wobble.duration() - 0.2);
    });
}
function wobbleAnimation(el, offset, wobbleCount, duration) {
    if (offset === void 0) {
        offset = 7;
    }
    if (wobbleCount === void 0) {
        wobbleCount = 15;
    }
    if (duration === void 0) {
        duration = 1.4;
    }
    var tl = new TimelineMax();
    var stepDuration = duration / wobbleCount;
    tl.set(el, {
        x: 10,
        opacity: 1
    });
    for (var i = 0; i < wobbleCount; i++) {
        tl.to(el, stepDuration, { ease: Power2.easeInOut, x: Math.random() * (i % 2 == 0 ? offset : -offset) });
    }
    return tl;
}
function randomCharacterFadeIn(characterMap) {
    return new TimelineMax()
        .add(characterMap
        .map(function (characters) {
        var charTl = new TimelineMax();
        var delay = Math.random();
        var duration = 1;
        var character = characters[0].textContent;
        var charCode = character.charCodeAt(0);
        var chars;
        charTl.to(characters, duration, {
            opacity: 1,
            ease: Quart.easeIn
        }, delay);
        if (charCode != 160) {
            if (charCode >= 97 && charCode <= 122) {
                // a-z (lowercase)
                chars = 'abcdefghijklmnopqrstuvwxyz';
            }
            else if (charCode >= 65 && charCode <= 90) {
                // A-Z (uppercase)
                chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            }
            else {
                // something else!
                chars = '[]{}_.;\\?=:/';
            }
            charTl.to(characters[0], duration + 3 + (Math.random() * 1), {
                scrambleText: {
                    chars: chars,
                    text: characters[0].textContent,
                    speed: 0.3
                },
                onUpdate: function () {
                    return characters.slice(1)
                        .forEach(function (chrEl) { return chrEl.textContent = characters[0].textContent; });
                }
            }, delay);
        }
        return charTl;
    }), 0);
}
function createRGBW(el, colors) {
    var parent = el.parentElement;
    var colorEls = colors.map(function (c) {
        // used for translating
        var colorEl = el.cloneNode(true);
        colorEl.classList.add(c);
        var parentSpan = document.createElement('span');
        parentSpan.classList.add('tagline-container');
        parentSpan.appendChild(colorEl);
        return colorEl;
    });
    parent.removeChild(el);
    colorEls.forEach(function (colorEl) { return parent.appendChild(colorEl.parentElement); });
    return colorEls;
}
function splitCharacters(el) {
    var text = el.textContent;
    el.textContent = '';
    return text.split('')
        .map(function (char) {
        var charEl = document.createElement('span');
        charEl.classList.add('character');
        if (char == ' ') {
            charEl.innerHTML = '&nbsp;';
        }
        else {
            charEl.textContent = char;
        }
        el.appendChild(charEl);
        charEl.style.setProperty('width', charEl.clientWidth + 'px');
        charEl.style.setProperty('height', charEl.clientHeight + 'px');
        return charEl;
    });
}
init();