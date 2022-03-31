const strokeSegmentC = "#ECECEC",
    strokeSegmentW = "4",
    ns = "http://www.w3.org/2000/svg",
    makeSvgNode = (e, t) => t.createElementNS(ns, e),
    dX = 365,
    dY = 365,
    segments = document.querySelector("#segments"),
    labels = document.querySelector("#labels"),
    ul = document.querySelector(".labels"),
    markerAngle = 30,
    wheel = document.querySelector(".wheel"),
    winners = document.querySelector(".winner");
let arr,
    colorPalette,
    currentColors = [];
const modify = !1;
function toRadians(e) {
    return e * (Math.PI / 180);
}
function toDegrees(e) {
    return (e / 100) * 360;
}
function getRandomColor() {
    const e = Math.floor(Math.random() * colorPalette.length),
        t = colorPalette[e];
    colorPalette.remove(t),
        (window.getColor = function (n) {
            return 0 == n ? t : colorPalette[Math.floor(e + 4 * n) % colorPalette.length];
        });
}
function drawWheel(e) {
    modify || (currentColors = []),
        (colorPalette = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00AEFF", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"]),
        getRandomColor(),
        (segments.innerHTML = ""),
        (labels.innerHTML = ""),
        (ul.innerHTML = ""),
        (arr = []),
        delete e.rewards.name,
        delete e.rewards.size,
        delete e.weights.name,
        delete e.weights.size;
    const t = Object.values(e.rewards),
        n = Object.values(e.weights);
    t.forEach((e, t) => {
        arr[t] = { text: e, weight: n[t] };
    }),
        arr.forEach((e, t) => {
            let n = toDegrees(e.weight);
            (arr[t].simpleAngle = n), 0 !== t && (n = arr[t - 1].angle + n), (arr[t].angle = n);
        }),
        (arr = arr.reverse()).forEach((e, t) => {
            const n = toRadians(e.angle),
                o = 326 * Math.cos(n),
                r = 326 * Math.sin(n),
                a = t < arr.length - 1 ? arr[t + 1].angle : arr[0].angle,
                l = toRadians(a),
                s = t < arr.length - 1 ? a : 0,
                i = 365 + 326 * Math.cos(l),
                d = 365 + 326 * Math.sin(l),
                c = e.weight > 50 ? 1 : 0,
                u = document.createElementNS("http://www.w3.org/2000/svg", "g");
            u.setAttribute("id", `reward_${t}`), createSegment(o, r, i, d, t, c, u), addSegmentText(e.angle, s, e.text, t, e.weight, u), createLabel(e.text, e.weight, t), segments.appendChild(u);
        });
}
function createSegment(e, t, n, o, r, a, l) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let i;
    modify ? (i = currentColors[r]) : ((i = getColor(r)), currentColors.push(i)),
        s.setAttribute("d", `M${dX},${dY},l${e},${t} A 326 326 0 ${a} 0 ${n} ${o} Z`),
        s.setAttribute("fill", i),
        s.setAttribute("stroke", strokeSegmentC),
        s.setAttribute("stroke-width", strokeSegmentW),
        s.setAttribute("transform", "translate(0)"),
        s.setAttribute("id", `segment_${r}`),
        l.appendChild(s);
}
function addSegmentText(e, t, n, o, r, a) {
    const l = (e + t) / 2,
        s = document.createElementNS("http://www.w3.org/2000/svg", "text"),
        i = new svgTextSize(n, { "font-size": 35, "font-family": "Raleway:800" }),
        d = (180 / i.width) * 35,
        c = ((3.6 * r * 1.6) / i.height) * 35,
        u = d > c ? c : d,
        m = 80 + (190 - new svgTextSize(n, { "font-size": u, "font-family": "Raleway:800" }).width) / 2;
    s.setAttribute("transform", `translate(365,365) rotate(${l})`),
        s.setAttribute("class", "text"),
        s.setAttribute("id", `text_${o}`),
        (s.innerHTML = `<tspan alignment-baseline="central" text-shadow="0.05em 0 black,0 0.05em black,-0.05em 0 black,0 -0.05em black, -0.05em -0.05em black, -0.05em 0.05em black, 0.05em -0.05em black, 0.05em 0.05em black" text-align="center" dx="${m}" dy="0" font-family="Raleway" font-weight="bold" fill="white" font-size="${u}" >${n}</tspan>`),
        a.appendChild(s);
}
function createLabel(e, t, n) {
    const o = `${Math.floor(t)}%`,
        r = document.createElement("li"),
        a = document.createElement("div"),
        l = document.createElement("div"),
        s = currentColors[n];
    r.setAttribute("style", `background: linear-gradient(to right, ${s} 12%, rgba(0, 0, 0, 0.7) 15%)`),
        r.setAttribute("class", "item"),
        l.setAttribute("class", "item-weight"),
        a.setAttribute("class", "item-title"),
        (l.innerHTML = o),
        (a.innerHTML = e),
        r.appendChild(a),
        r.appendChild(l),
        ul.appendChild(r);
}
function makeTextSpanNode(e, t) {
    const n = t.createTextNode(e),
        o = makeSvgNode("tspan", t);
    return o.setAttribute("x", 0), o.setAttribute("y", 0), o.appendChild(n), o;
}
function makeTextNode(e, t = {}, n) {
    const o = makeSvgNode("text", n);
    o.setAttribute("x", 0), o.setAttribute("y", 0);
    for (const e in t) o.setAttribute(e, t[e]);
    return o.appendChild(makeTextSpanNode(e, n)), o;
}
function svgTextSize(e, t) {
    const n = document,
        o = makeSvgNode("svg", n),
        r = makeTextNode(e, t, n);
    o.appendChild(r), n.body.appendChild(o);
    const { width: a, height: l } = r.getBBox();
    return n.body.removeChild(o), { width: a, height: l };
}
function getRandomInt(e, t) {
    return Math.floor(Math.random() * (t - e + 1)) + e;
}
let requestStop;
Array.prototype.remove = function (e) {
    return this.some((t, n, o) => t === e && (o.splice(n, 1), !0)), this;
};
let stopAtPrevious = 0,
    subAngle = 0,
    loopIteration = 0;
const fullSpins = 7;
function spin() {
    const e = 1490 + Math.abs(subAngle);
    let t, n;
    (stopAtPrevious = 50), (requestStop = !1);
    let o = 0,
        r = 0,
        a = 50 + markerAngle;
    a > 360 && (a -= 360);
    do {
        (o += arr[r].simpleAngle), (t = arr[r].text), (n = r), (r += 1);
    } while (o < a);
    (subAngle = 360 - stopAtPrevious), console.log("winner", t);
    const l = gsap.to(wheel, { rotation: "+=360", duration: 1.5, transformOrigin: "50% 50%", ease: Power3.easeIn, onComplete: () => s.play(), paused: !0 }),
        s = gsap.to(wheel, {
            rotation: "+=360",
            ease: "none",
            duration: 5.0,
            onComplete: () => {
                loopIteration >= fullSpins && requestStop ? i.play() : (loopIteration++, s.play(0));
            },
            paused: !0,
        }),
        i = gsap.to(wheel, {
            rotation: `+=${e}`,
            ease: Power3.easeOut,
            duration: e / 360,
            paused: !0,
            onComplete: () => (winnerAnim(t), obs.send("BroadcastCustomMessage", { realm: "fortune_wheel", data: { type: "result", message: t } }), l.kill(), s.kill(), void i.kill()),
        });
    l.play();
}
function winnerAnim(e) {
    const t = document.querySelector("#result");
    let n;
    (t.innerHTML = e),
        (t.style.display = ""),
        t.classList.add("play"),
        (n = setTimeout(() => {
            t.classList.remove("play"), (t.style.display = "none");
        }, 4e3));
}
function winnerAnimold(e, t) {
    const n = document.getElementById(`reward_${e}`),
        o = 365 - n.getBBox().x,
        r = n.getBBox().y < 180 ? n.getBBox().height : 365 - n.getBBox().y;
    let { x: a } = n.getBBox(),
        { y: l } = n.getBBox();
    (a = a > 180 ? 163 - a : 163 + a), (l = 163 - l), console.log("x,y", a, l);
    let s = document.getElementById(`text_${e}`).transform.baseVal[1].angle + t;
    (s = s < 180 ? -s : 360 - s < 0 ? 720 - s : 360 - s), console.log(n.getBBox()), gsap.to(n, { x: 163, y: 100, scale: 1, rotation: s, duration: 2, transformOrigin: `${o} ${r}` }), winners.append(n);
}
