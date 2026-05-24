// js/sort.js — Sorting algorithms visualizer

let sortArr = [64, 34, 25, 12, 22, 11, 90, 45, 3, 78, 56, 30];
let currentAlgo = 'bubble';
let sortStopped = false;
let sortRunning = false;

const BAR_COLORS = [
  '#6339ff','#8b5fff','#b490ff','#7a56f5','#5228ee',
  '#9966ff','#4d1fd6','#a87dff','#c4a0ff','#7040e0','#6a3df0','#9575f0'
];

function renderBars(arr, comparing = [], sorted = []) {
  const container = document.getElementById('sort-bars');
  if (!container) return;
  container.innerHTML = '';
  const max = Math.max(...arr);
  arr.forEach((val, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar' +
      (comparing.includes(i) ? ' comparing' : '') +
      (sorted.includes(i) ? ' sorted' : '');
    bar.style.height = (val / max * 140 + 8) + 'px';
    if (!comparing.includes(i) && !sorted.includes(i)) {
      bar.style.background = BAR_COLORS[i % BAR_COLORS.length];
    }
    const label = document.createElement('span');
    label.textContent = val;
    bar.appendChild(label);
    container.appendChild(bar);
  });
}

function randomize() {
  sortArr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 88) + 5);
  renderBars(sortArr);
  setStatus('Array randomized. Press Run to sort.');
}

function selectAlgo(algo, el) {
  currentAlgo = algo;
  document.querySelectorAll('.algo-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  setStatus(`Selected: ${el.querySelector('h3').textContent}. Press Run to start.`);
}

function setStatus(msg) {
  const el = document.getElementById('sort-status');
  if (el) el.textContent = msg;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function getDelay() {
  const s = document.getElementById('speed-slider');
  return s ? Math.max(25, 420 - s.value * 38) : 200;
}

async function runSort() {
  if (sortRunning) return;
  sortRunning = true;
  sortStopped = false;
  const runBtn = document.getElementById('run-btn');
  const stopBtn = document.getElementById('stop-btn');
  if (runBtn) runBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = false;

  const arr = [...sortArr];

  if (currentAlgo === 'bubble') {
    setStatus('Bubble Sort — comparing adjacent pairs...');
    for (let i = 0; i < arr.length && !sortStopped; i++) {
      for (let j = 0; j < arr.length - i - 1 && !sortStopped; j++) {
        const sortedIdx = Array.from({ length: i }, (_, k) => arr.length - 1 - k);
        renderBars(arr, [j, j + 1], sortedIdx);
        setStatus(`Pass ${i + 1}: comparing [${arr[j]}, ${arr[j + 1]}]`);
        await delay(getDelay());
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }

  } else if (currentAlgo === 'selection') {
    setStatus('Selection Sort — finding minimum each pass...');
    const sortedIdx = [];
    for (let i = 0; i < arr.length && !sortStopped; i++) {
      let min = i;
      for (let j = i + 1; j < arr.length && !sortStopped; j++) {
        renderBars(arr, [min, j], [...sortedIdx]);
        setStatus(`Pass ${i + 1}: current min = ${arr[min]}, checking index ${j}`);
        await delay(getDelay());
        if (arr[j] < arr[min]) min = j;
      }
      if (min !== i) [arr[i], arr[min]] = [arr[min], arr[i]];
      sortedIdx.push(i);
    }

  } else if (currentAlgo === 'insertion') {
    setStatus('Insertion Sort — inserting into sorted portion...');
    for (let i = 1; i < arr.length && !sortStopped; i++) {
      const key = arr[i];
      let j = i - 1;
      setStatus(`Inserting ${key} into sorted portion [0..${i - 1}]`);
      while (j >= 0 && arr[j] > key && !sortStopped) {
        arr[j + 1] = arr[j];
        j--;
        renderBars(arr, [j + 1, i]);
        await delay(getDelay());
      }
      arr[j + 1] = key;
    }

  } else if (currentAlgo === 'quick') {
    setStatus('Quick Sort — partitioning around pivot...');
    async function qs(a, lo, hi) {
      if (lo >= hi || sortStopped) return;
      const pivot = a[hi];
      let i = lo - 1;
      renderBars(a, [hi]);
      setStatus(`Pivot = ${pivot}, partitioning [${lo}..${hi}]`);
      await delay(getDelay());
      for (let j = lo; j < hi && !sortStopped; j++) {
        renderBars(a, [j, hi]);
        await delay(getDelay());
        if (a[j] <= pivot) { i++; [a[i], a[j]] = [a[j], a[i]]; }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      await qs(a, lo, i);
      await qs(a, i + 2, hi);
    }
    await qs(arr, 0, arr.length - 1);
  }

  if (!sortStopped) {
    renderBars(arr, [], arr.map((_, i) => i));
    setStatus('Sorted! All elements are in ascending order.');
  } else {
    setStatus('Stopped. Click Randomize or Run again.');
  }

  sortRunning = false;
  if (runBtn) runBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;
}

function stopSort() { sortStopped = true; }

// Init on load
if (document.getElementById('sort-bars')) {
  renderBars(sortArr);
}