/*
   - No fetch / no crypto.subtle / no external libraries
   - Only plain JS algorithms + DOM
*/

/* ---------- Helpers ---------- */
function $(id) { return document.getElementById(id); }

function mod(n, m) { return ((n % m) + m) % m; }

function normalizeAZ(text) {
  return (text || "").toUpperCase().replace(/[^A-Z]/g, "");
}

/* ---------- ✅ AUTH (Login / Logout) ---------- */
function ensureLoggedIn() {
  // If not logged in, go to login.html
  if (!localStorage.getItem("user")) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function initAuthUI() {
  // Show username/email if stored
  var user = localStorage.getItem("user") || "";
  if ($("welcomeUser")) {
    $("welcomeUser").textContent = user ? ("👋 " + user) : "";
  }

  // Logout
  if ($("btnLogout")) {
    $("btnLogout").onclick = function () {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    };
  }
}

//* ================= FIXED CAESAR CIPHER ================= */

/* ================= CAESAR 52 (BONUS) ================= */



function normalizeShift(shift) {

  shift = parseInt(shift, 10);

  if (isNaN(shift)) shift = 1;

  // bring into range
  shift = shift % MOD_52;

  // ⭐ éviter shift = 0 ou 26
  if (shift === 0 || shift === 26) shift = 1;

  // handle negative values
  if (shift < 0) shift += MOD_52;

  return shift;
}






function caesarEncrypt(text, shift) {

  shift = normalizeShift(shift);
  let result = "";

  for (let i = 0; i < text.length; i++) {

    let ch = text[i];
    let idx = ALPHABET_52.indexOf(ch);

    if (idx !== -1) {
      result += ALPHABET_52[(idx + shift) % MOD_52];
    } else {
      result += ch;
    }
  }

  return result;
}

function caesarDecrypt(text, shift) {

  shift = normalizeShift(shift);
  return caesarEncrypt(text, MOD_52 - shift);
}


function vigenereEncrypt(text, key) {
  if (!key) return text;

  key = key.toLowerCase();
  let result = "";
  let j = 0; // index pour la clé

  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);

    // MAJUSCULE
    if (code >= 65 && code <= 90) {
      let shift = key.charCodeAt(j % key.length) - 97;
      result += String.fromCharCode(
        ((code - 65 + shift) % 26) + 65
      );
      j++;
    }

    // MINUSCULE
    else if (code >= 97 && code <= 122) {
      let shift = key.charCodeAt(j % key.length) - 97;
      result += String.fromCharCode(
        ((code - 97 + shift) % 26) + 97
      );
      j++;
    }

    // AUTRES CARACTÈRES
    else {
      result += text[i];
    }
  }

  return result;
}






// Fonction de déchiffrement Vigenère
function vigenereDecrypt(text, key) {

  key = key.toLowerCase();
  let result = "";
  let j = 0;

  for (let i = 0; i < text.length; i++) {

    let code = text.charCodeAt(i);

    // Majuscule
    if (code >= 65 && code <= 90) {

      let shift = key.charCodeAt(j % key.length) - 97;

      // On soustrait le décalage
      result += String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);

      j++;
    }

    // Minuscule
    else if (code >= 97 && code <= 122) {

      let shift = key.charCodeAt(j % key.length) - 97;

      result += String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);

      j++;
    }

    // Autres caractères inchangés
    else {
      result += text[i];
    }
  }

  return result;
}

function playfairPairs(text) {
  text = normalizeAZ(text).replace(/J/g, "I");
  var pairs = [];
  var i = 0;

  while (i < text.length) {
    var a = text.charAt(i);
    var b = (i + 1 < text.length) ? text.charAt(i + 1) : "X";

    if (a === b) {
      b = "X";
      i += 1;
    } else {
      i += 2;
    }
    pairs.push([a, b]);
  }
  return pairs;
}

function playfairEncrypt(text, key) {
  var sq = buildSquare(key);
  var seq = sq.seq;
  var pos = sq.pos;
  var pairs = playfairPairs(text);
  var out = "";

  function at(r, c) { return seq.charAt(r * 5 + c); }

  for (var i = 0; i < pairs.length; i++) {
    var a = pairs[i][0], b = pairs[i][1];
    var pa = pos[a], pb = pos[b];

    if (pa.r === pb.r) {
      out += at(pa.r, mod(pa.c + 1, 5));
      out += at(pb.r, mod(pb.c + 1, 5));
    } else if (pa.c === pb.c) {
      out += at(mod(pa.r + 1, 5), pa.c);
      out += at(mod(pb.r + 1, 5), pb.c);
    } else {
      out += at(pa.r, pb.c);
      out += at(pb.r, pa.c);
    }
  }
  return out;
}

function playfairDecrypt(text, key) {
  var sq = buildSquare(key);
  var seq = sq.seq;
  var pos = sq.pos;

  var t = normalizeAZ(text).replace(/J/g, "I");
  var out = "";

  function at(r, c) { return seq.charAt(r * 5 + c); }

  for (var i = 0; i < t.length; i += 2) {
    var a = t.charAt(i);
    var b = (i + 1 < t.length) ? t.charAt(i + 1) : "X";
    var pa = pos[a], pb = pos[b];

    if (pa.r === pb.r) {
      out += at(pa.r, mod(pa.c - 1, 5));
      out += at(pb.r, mod(pb.c - 1, 5));
    } else if (pa.c === pb.c) {
      out += at(mod(pa.r - 1, 5), pa.c);
      out += at(mod(pb.r - 1, 5), pb.c);
    } else {
      out += at(pa.r, pb.c);
      out += at(pb.r, pa.c);
    }
  }
  return out;
}

/* ---------- Hill 2x2 (Encrypt + Decrypt) ---------- */
function hillTextToNums(text) {
  var t = normalizeAZ(text);
  if (t.length % 2 !== 0) t += "X";
  var arr = [];
  for (var i = 0; i < t.length; i++) arr.push(t.charCodeAt(i) - 65);
  return arr;
}

function hillNumsToText(arr) {
  var s = "";
  for (var i = 0; i < arr.length; i++) s += String.fromCharCode(65 + mod(arr[i], 26));
  return s;
}

function hillParseKey(key) {
  var parts = (key || "").trim().split(/\s+/);
  if (parts.length !== 4) throw "Hill key must have 4 numbers: 3 3 2 5";
  var a = parseInt(parts[0], 10), b = parseInt(parts[1], 10), c = parseInt(parts[2], 10), d = parseInt(parts[3], 10);
  if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) throw "Hill key must be numbers only.";
  return [[mod(a,26), mod(b,26)], [mod(c,26), mod(d,26)]];
}

function hillMulPair(p, K) {
  return [
    mod(K[0][0] * p[0] + K[0][1] * p[1], 26),
    mod(K[1][0] * p[0] + K[1][1] * p[1], 26)
  ];
}

function hillModInverse(a, m) {
  a = mod(a, m);
  for (var x = 1; x < m; x++) {
    if (mod(a * x, m) === 1) return x;
  }
  return null;
}

function hillInverse2x2(K) {
  var det = mod(K[0][0] * K[1][1] - K[0][1] * K[1][0], 26);
  var invDet = hillModInverse(det, 26);
  if (invDet === null) throw "Hill matrix not invertible (choose another key).";

  var a = K[0][0], b = K[0][1], c = K[1][0], d = K[1][1];
  return [
    [mod(d * invDet, 26), mod(-b * invDet, 26)],
    [mod(-c * invDet, 26), mod(a * invDet, 26)]
  ];
}

function hillEncrypt(text, key) {
  var nums = hillTextToNums(text);
  var K = hillParseKey(key);
  var out = [];

  for (var i = 0; i < nums.length; i += 2) {
    var pair = [nums[i], nums[i + 1]];
    var r = hillMulPair(pair, K);
    out.push(r[0], r[1]);
  }
  return hillNumsToText(out);
}

function hillDecrypt(text, key) {
  var nums = hillTextToNums(text);
  var K = hillParseKey(key);
  var invK = hillInverse2x2(K);
  var out = [];

  for (var i = 0; i < nums.length; i += 2) {
    var pair = [nums[i], nums[i + 1]];
    var r = hillMulPair(pair, invK);
    out.push(r[0], r[1]);
  }
  return hillNumsToText(out);
}

/* ---------- Password generator ---------- */
function genPassword(type) {
  if (type === "p3") {
    var chars = ["2", "3", "4"];
    return chars[Math.floor(Math.random() * 3)] +
           chars[Math.floor(Math.random() * 3)] +
           chars[Math.floor(Math.random() * 3)];
  }

  if (type === "p5") {
    var p = "";
    for (var i = 0; i < 5; i++) p += Math.floor(Math.random() * 10);
    return p;
  }

  var chars2 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+*";
  var p2 = "";
  for (var j = 0; j < 6; j++) p2 += chars2.charAt(Math.floor(Math.random() * chars2.length));
  return p2;
}

/* ---------- Attacks ---------- */
function bruteForceP3(target) {
  var chars = ["2", "3", "4"];
  var tries = 0;

  for (var a = 0; a < 3; a++)
    for (var b = 0; b < 3; b++)
      for (var c = 0; c < 3; c++) {
        tries++;
        var guess = chars[a] + chars[b] + chars[c];
        if (guess === target) return "FOUND: " + guess + "\ntries=" + tries;
      }

  return "NOT FOUND\ntries=" + tries + "\n(note: brute force demo for p3 only)";
}

function dictionaryAttack(target) {
  var dict = ["password","admin","12345","qwerty","letmein","azerty","00000","11111","234","333","444"];
  for (var i = 0; i < dict.length; i++) {
    if (dict[i] === target) return "FOUND: " + dict[i] + "\ntries=" + (i+1);
  }
  return "NOT FOUND in dictionary\ntries=" + dict.length;
}

function mitmDemo(msg) {
  var original = msg || "";
  var modified = original.replace(/A/g, "X");
  return "MiTM Simulation\nA sends: " + original + "\nAttacker modifies -> " + modified + "\nB receives: " + modified;
}

/* ---------- Steganography (hide + extract) ---------- */
var ZW0 = "\u200B"; // 0
var ZW1 = "\u200C"; // 1

function hideSecret(visible, secret) {
  visible = visible || "";
  secret = secret || "";

  var bits = "";
  for (var i = 0; i < secret.length; i++) {
    var bin = secret.charCodeAt(i).toString(2);
    while (bin.length < 16) bin = "0" + bin;
    bits += bin;
  }

  var payload = "";
  for (var j = 0; j < bits.length; j++) payload += (bits.charAt(j) === "0" ? ZW0 : ZW1);
  return visible + payload;
}

function extractSecret(stegoText) {
  stegoText = stegoText || "";

  var payload = "";
  for (var i = 0; i < stegoText.length; i++) {
    var ch = stegoText.charAt(i);
    if (ch === ZW0 || ch === ZW1) payload += ch;
  }
  if (payload.length === 0) return "";

  var bits = "";
  for (var j = 0; j < payload.length; j++) {
    bits += (payload.charAt(j) === ZW0 ? "0" : "1");
  }

  var out = "";
  for (var k = 0; k + 15 < bits.length; k += 16) {
    var chunk = bits.substr(k, 16);
    var code = parseInt(chunk, 2);
    if (!isNaN(code) && code !== 0) out += String.fromCharCode(code);
  }
  return out;
}

/* ---------- UI Wiring ---------- */
function runCrypto(mode) {
  var algo = $("algoSelect").value;
  var msg = $("cryptoMessage").value;
  var key = $("cryptoKey").value;

  try {
    var res = "";
    if (algo === "caesar") res = (mode === "enc") ? caesarEncrypt(msg, key) : caesarDecrypt(msg, key);
    else if (algo === "playfair") {
      if (!key || key.trim() === "") throw "Playfair key required.";
      res = (mode === "enc") ? playfairEncrypt(msg, key) : playfairDecrypt(msg, key);
    }
    else if (algo === "hill") {
      if (!key || key.trim() === "") throw "Hill key required (ex: 3 3 2 5).";
      res = (mode === "enc") ? hillEncrypt(msg, key) : hillDecrypt(msg, key);
    }
    else res = "Unknown algorithm.";

    $("cryptoResult").value = res;
  } catch (e) {
    $("cryptoResult").value = "Error: " + e;
  }
}

window.onload = function () {
  // ✅ Stop here if not logged in
  if (!ensureLoggedIn()) return;

  // ✅ Init welcome + logout
  initAuthUI();

  // Encrypt/Decrypt
  $("btnEncrypt").onclick = function(){ runCrypto("enc"); };
  $("btnDecrypt").onclick = function(){ runCrypto("dec"); };

  // Passwords
  $("btnGenPwd").onclick = function(){
    $("pwdResult").value = genPassword($("pwdType").value);
  };

  // Attacks
  $("btnAttack").onclick = function(){
    var type = $("attackType").value;
    var target = $("attackTarget").value || "";
    var out = "";

    if (type === "bruteforce") out = bruteForceP3(target.trim());
    else if (type === "dictionary") out = dictionaryAttack(target.trim());
    else if (type === "mitm") out = mitmDemo(target);
    else out = "Unknown attack type.";

    $("attackOutput").value = out;
  };

  // Steganography
  $("btnHide").onclick = function(){
    $("stegOutput").value = hideSecret($("stegVisible").value, $("stegSecret").value);
  };

  $("btnExtract").onclick = function(){
    var secret = extractSecret($("stegVisible").value);
    $("stegOutput").value = secret ? ("Extracted: " + secret) : "No hidden message found.";
  };
};

