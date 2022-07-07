const urlParams = new URLSearchParams(window.location.search),
    port = urlParams.get("port") || 4444,
    pw = urlParams.get("pw") || "",
    ns = "http://www.w3.org/2000/svg",
    makeSvgNode = (e, t) => t.createElementNS(ns, e),
    wheel = document.querySelector(".wheel"),
    segments = document.querySelector("#segments"),
    sticks = document.querySelector("#sticks"),
    labels = document.querySelector("#labels"),
    defs = document.querySelector("#defs"),
    circleImages = document.querySelector("#circleImages"),
    winners = document.querySelector(".winner"),
    ul = document.querySelector(".labels"),
    log = document.querySelector("#log"),
    strokeSegmentC = "#ECECEC",
    strokeSegmentW = "4",
    dX = 365,
    dY = 365,
    markerAngle = 30;
let colorPalette,
    obs,
    obswsTimeout,
    arr,
    colors,
    images,
    colorPaletteOrig = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00AEFF", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"],
    userImage = !1,
    userColor = !1,
    anim = "default",
    currentColors = [];
const currentImages = [],
    fullSpins = 7;
let requestStop,
    stopAtPrevious = 0,
    subAngle = 0,
    loopIteration = 0;
function StartListening() {
    (obs = new OBSWebSocket()).connect({ address: `localhost:${port}`, password: pw }).catch((e) => {
        ChangeStatus(`Error: ${e.error}. Edit SETUP button in your premade deck in LB and press it. `), obs.disconnect();
    }),
        obs.on("AuthenticationSuccess", () => {
            console.log("Lucky Wheel: Listening for traffic."), (log.innerHTML = "");
        }),
        obs.on("BroadcastCustomMessage", (e) => {
            (log.innerHTML = ""),
                "Lucky Wheel Populate" === e.realm
                    ? (drawWheel(e.data), window.startScrolling && (window.startScrolling.kill(), (window.startScrolling = void 0)), gsap.set(".labels", { y: 0 }), scrollLabels())
                    : "Lucky Wheel Modify" === e.realm
                    ? drawWheel(e.data, !0)
                    : "Lucky Wheel Check" === e.realm
                    ? obs.send("BroadcastCustomMessage", { realm: "Lucky Wheel Ready", data: {} })
                    : "Lucky Wheel Spin" === e.realm
                    ? wheelSpin()
                    : "Lucky Wheel Stop" === e.realm && (requestStop = !0);
        }),
        obs.on("ConnectionClosed", () => {
            console.log("Connection closed. Attempting to reconnect in 10s.");
            try {
                clearTimeout(obswsTimeout);
            } catch (e) {}
            obs.removeAllListeners(),
                (obswsTimeout = setTimeout(() => {
                    StartListening();
                }, 1e4));
        }),
        obs.on("error", (e) => {
            ChangeStatus(`Error: ${e}`), obs.disconnect();
        });
}
function drawWheel(e, t = !1) {
    if (
        (console.log(e),
        (arr = e.rewards),
        (anim = t ? anim : e.animation || "default"),
        (userColor = t ? userColor : !!e.rewards[0].color),
        (userImage = t ? userImage : !!e.rewards[0].image),
        t || ((currentColors = []), (colorPalette = JSON.parse(JSON.stringify(colorPaletteOrig)))),
        getRandomColor(colorPalette),
        (segments.innerHTML = ""),
        (labels.innerHTML = ""),
        (ul.innerHTML = ""),
        (document.querySelector("#images").innerHTML = ""),
        (circleImages.innerHTML = ""),
        (winners.innerHTML = ""),
        (sticks.innerHTML = ""),
        console.log(arr),
        arr.forEach((e, t) => {
            let n = toDegrees(e.weight);
            (arr[t].simpleAngle = n), 0 !== t && (n = arr[t - 1].angle + n), (arr[t].angle = n);
        }),
        (arr = arr.reverse()).forEach((e, n) => {
            const { angle: r } = e,
                o = toRadians(r),
                a = n < arr.length - 1 ? arr[n + 1].angle : arr[0].angle,
                s = toRadians(a),
                i = (r + (n < arr.length - 1 ? a : 0)) / 2,
                l = toRadians(i),
                c = document.createElementNS("http://www.w3.org/2000/svg", "g");
            c.setAttribute("id", `reward_${n}`),
                createSegment(e.weight, o, s, n, c, t),
                createStick(o, c, n),
                userImage ? createImage(l, o, e.weight, e.image, n) : addSegmentText(i, e.text, n, e.weight, c),
                createLabel(e.text, e.weight, n),
                segments.appendChild(c);
        }),
        userImage)
    ) {
        const e = defs.innerHTML;
        (defs.innerHTML = ""), (defs.innerHTML = e);
    }
}
function createImage(e, t, n, r, o) {
    const a = dX + 225 * Math.cos(e),
        s = dY + 225 * Math.sin(e),
        i = dX + 225 * Math.cos(t),
        l = dY + 225 * Math.sin(t),
        c = Math.sqrt((a - i) ** 2 + (s - l) ** 2),
        u = 0.7 * c > 80 ? 80 : 0.7 * c,
        d = document.createElementNS("http://www.w3.org/2000/svg", "pattern"),
        m = document.createElementNS("http://www.w3.org/2000/svg", "image"),
        g = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
        p = 90 + (180 * e) / Math.PI;
    (arr[o].rotation = p),
        d.setAttribute("id", `pattern_${o}`),
        d.setAttribute("height", "100%"),
        d.setAttribute("width", "100%"),
        d.setAttribute("patternContentUnits", "objectBoundingBox"),
        m.setAttribute("id", `img_${o}`),
        m.setAttribute("xlink:href", `img/${r}`),
        m.setAttribute("preserveAspectRatio", "none"),
        m.setAttribute("width", "1"),
        m.setAttribute("height", "1"),
        g.setAttribute("id", `circle_${o}`),
        g.setAttribute("cx", a),
        g.setAttribute("cy", s),
        g.setAttribute("r", u),
        g.setAttribute("style", `fill: url(#pattern_${o})`),
        d.appendChild(m),
        document.querySelector("#images").appendChild(d),
        circleImages.appendChild(g),
        gsap.set(m, { transformOrigin: "50% 50%", rotate: 90 + (180 * e) / Math.PI });
}
function createSegment(e, t, n, r, o, a = !1) {
    const s = 326 * Math.cos(t),
        i = 326 * Math.sin(t),
        l = 365 + 326 * Math.cos(n),
        c = 365 + 326 * Math.sin(n),
        u = e > 50 ? 1 : 0,
        d = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let m;
    a ? (m = currentColors[r]) : ((m = userColor ? arr[r].color : getColor(r)), currentColors.push(m)),
        d.setAttribute("d", `M${dX},${dY},l${s},${i} A 326 326 0 ${u} 0 ${l} ${c} Z`),
        d.setAttribute("fill", m),
        d.setAttribute("stroke", strokeSegmentC),
        d.setAttribute("stroke-width", strokeSegmentW),
        d.setAttribute("transform", "translate(0)"),
        d.setAttribute("id", `segment_${r}`),
        o.appendChild(d);
}
function createStick(e, t, n) {
    const r = 347 * Math.cos(e - 0.02),
        o = 347 * Math.sin(e - 0.02),
        a = 347 * Math.cos(e + 0.02),
        s = 347 * Math.sin(e + 0.02),
        i = 358 * Math.cos(e + 0.02),
        l = 358 * Math.sin(e + 0.02),
        c = 358 * Math.cos(e - 0.02),
        u = 358 * Math.sin(e - 0.02),
        d = document.createElementNS("http://www.w3.org/2000/svg", "path");
    d.setAttribute("d", `M${365 + r},${365 + o}, A 1 1 0 0 0 ${365 + a} ${365 + s} L ${365 + i} ${365 + l} A 1 1 0 0 0 ${365 + c} ${365 + u} Z`),
        d.setAttribute("fill", "#fff"),
        d.setAttribute("id", `spike_${n}`),
        d.setAttribute("transform", "translate(0)"),
        sticks.appendChild(d);
}
function addSegmentText(e, t, n, r, o) {
    const a = document.createElementNS("http://www.w3.org/2000/svg", "text"),
        s = new svgTextSize(t, { "font-size": 35, "font-family": "Raleway:800" }),
        i = (180 / s.width) * 35,
        l = ((3.6 * r * 1.6) / s.height) * 35,
        c = i > l ? l : i,
        u = 80 + (190 - new svgTextSize(t, { "font-size": c, "font-family": "Raleway:800" }).width) / 2;
    gsap.set(a, { x: 365, y: 365, rotate: e }),
        a.setAttribute("class", "text"),
        (a.innerHTML = `<tspan id="text_${n}" alignment-baseline="central" text-shadow="0.05em 0 black,0 0.05em black,-0.05em 0 black,0 -0.05em black, -0.05em -0.05em black, -0.05em 0.05em black, 0.05em -0.05em black, 0.05em 0.05em black" text-align="center" dx="${u}" dy="0" font-family="Raleway" font-weight="bold" fill="white" font-size="${c}" >${t}</tspan>`),
        o.appendChild(a);
}
function createLabel(e, t, n) {
    const r = `${Math.round(t)}%`,
        o = document.createElement("li"),
        a = document.createElement("div"),
        s = document.createElement("div"),
        i = currentColors[n],
        l = new svgTextSize(e, { "font-size": 26, "font-family": "Arial" }).width,
        c = l < 220 ? e : `${e.slice(0, parseInt(220 / (l / e.length)))}...`;
    o.setAttribute("style", `background: linear-gradient(to right, ${i} 12%, rgba(0, 0, 0, 0.7) 15%)`),
        o.setAttribute("class", "item"),
        s.setAttribute("class", "item-weight"),
        a.setAttribute("class", "item-title"),
        (s.innerHTML = r),
        (a.innerHTML = c),
        o.appendChild(a),
        o.appendChild(s),
        ul.appendChild(o);
}
function scrollLabels() {
//     const e = gsap.getProperty(".labels", "height");
//     e < 740 ||
//         (gsap.set(".labels", { y: 0 }),
//         (window.startScrolling = new gsap.timeline({
//             repeat: -1,
//             repeatDelay: 10,
//             repeatRefresh: !0,
//             ease: "power1.inOut",
//             onRepeat: () => {
//                 0 - gsap.getProperty(".labels", "y") >= e && (gsap.set(".labels", { y: 744 }), gsap.to(".labels", { y: 0, duration: 3, ease: "power1.inOut", delay: 1 }));
//             },
//         })),
//         window.startScrolling.to(".labels", { y: "-=744", duration: 3, ease: Power3.easeIn, delay: 10 }),
//         window.startScrolling.play());
}
function makeTextSpanNode(e, t) {
    const n = t.createTextNode(e),
        r = makeSvgNode("tspan", t);
    return r.setAttribute("x", 0), r.setAttribute("y", 0), r.appendChild(n), r;
}
function makeTextNode(e, t = {}, n) {
    const r = makeSvgNode("text", n);
    r.setAttribute("x", 0), r.setAttribute("y", 0);
    for (const e in t) r.setAttribute(e, t[e]);
    return r.appendChild(makeTextSpanNode(e, n)), r;
}
function svgTextSize(e, t) {
    const n = document,
        r = makeSvgNode("svg", n),
        o = makeTextNode(e, t, n);
    r.appendChild(o), n.body.appendChild(r);
    const { width: a, height: s } = o.getBBox();
    return n.body.removeChild(r), { width: a, height: s };
}
function getRandomColor() {
    const e = Math.floor(Math.random() * colorPalette.length),
        t = colorPalette[e];
    colorPalette.remove(t),
        (window.getColor = function (n) {
            return 0 == n ? t : colorPalette[Math.floor(e + 4 * n) % colorPalette.length];
        });
}
function toRadians(e) {
    return e * (Math.PI / 180);
}
function toDegrees(e) {
    return (e / 100) * 360;
}
function wheelSpin() {
    const e = getRandomInt(0, 360),
        t = 1440 + e + Math.abs(subAngle);
    let n, r;
    (stopAtPrevious = e), (requestStop = !1);
    let o = 0,
        a = 0,
        s = e + markerAngle;
    s > 360 && (s -= 360);
    do {
        (o += arr[a].simpleAngle), (n = arr[a].text), (r = a), (a += 1);
    } while (o < s);
    (subAngle = 360 - stopAtPrevious), console.log("winner", n);
    const i = gsap.to(wheel, { rotation: "+=360", duration: 1.5, transformOrigin: "50% 50%", ease: Power3.easeIn, onComplete: () => l.play(), paused: !0 }),
        l = gsap.to(wheel, {
            transformOrigin: "50% 50%",
            rotation: "+=360",
            ease: "none",
            duration: 3.0,
            onComplete: () => {
                loopIteration >= fullSpins && requestStop ? c.play() : (loopIteration++, l.play(0));
            },
            paused: !0,
        }),
        c = gsap.to(wheel, {
            rotation: `+=${t}`,
            ease: Power3.easeOut,
            duration: t / 360,
            paused: !0,
            onComplete: () =>
                (function () {
                    "blink" != anim || userImage ? ("mid" == anim && userImage ? winnerAnimImg(r, e) : winnerAnimDefault(n)) : winnerAnimText(r, e);
                    obs.send("BroadcastCustomMessage", { realm: "Lucky Wheel Win", data: { winner: n } }), i.kill(), l.kill(), c.kill();
                })(),
        }),
        u = [];
    arr.forEach((e) => u.push(e.angle)), i.play();
}
function getRandomInt(e, t) {
    return Math.floor(Math.random() * (t - e + 1)) + e;
}
function winnerAnimDefault(e) {
    const t = document.querySelector("#result");
    (t.innerHTML = e),
        (t.style.display = ""),
        t.classList.add("play"),
        setTimeout(() => {
            t.classList.remove("play"), (t.style.display = "none");
        }, 5e3);
}
function winnerAnimText(e) {
    const t = document.getElementById(`text_${e}`),
        n = gsap.timeline({ repeat: 2 });
    n.to(t, { duration: 0.35, opacity: 0 }), n.to(t, { duration: 0.35, opacity: 1 }), n.play();
}
function winnerAnimImg(e, t) {
    const n = document.getElementById(`circle_${e}`),
        r = (document.getElementById(`img_${e}`), t < 180 ? -t : 360 - t < 0 ? 720 - t : 360 - t),
        o = arr[e].rotation,
        a = -o + r < -360 ? 360 + (-o + r) : -o + r,
        s = (n.cx.baseVal.value, n.cy.baseVal.value, gsap.timeline({ repeat: 1, repeatDelay: 2, yoyo: !0 })),
        i = 200 / n.r.baseVal.value;
    s.to(n, { duration: 1, transformOrigin: "50% 50%", duration: 1, attr: { cx: 365, cy: 365 } }), s.to(n, { duration: 1, scale: i, transformOrigin: "50% 50%", rotate: a }), s.play(), winners.append(n);
}
function ChangeStatus(e) {
    console.log(e), (log.innerHTML = e);
}
document.addEventListener("DOMContentLoaded", () => StartListening()),
    (Array.prototype.remove = function (e) {
        return this.some((t, n, r) => t === e && (r.splice(n, 1), !0)), this;
    });
