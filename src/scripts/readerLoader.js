
//ROOMS
const Room = Object.freeze({
  MATH: new Set(["arithmetic", "algebra", "geometry", "topology", "stats","calculus", "multivari", "diffyq", "linalg"]),
  OBSERVATORY: new Set(["electronics", "mechanics", "quantum mechanics"]),
  COMPUTER: new Set(["python", "cpp", "linux", "machineLearn"]),
  GREENHOUSE: new Set(["biology", "botany"]),
  LAB: new Set(["labSafety", "chemistry"]),
  LIBRARY: new Set(["history"]),
  LOBBY: null
});
room = "LOBBY";

//URL DATA      ?topic=diffyq&chapter=4&page=450
siteDat = new URLSearchParams(window.location.search);
pgNum = parseInt(siteDat.get('page')) || 1;
chNum = parseInt(siteDat.get('chapter')) || 1;
topic = siteDat.get('topic') || 'diffyq';
const match = Object.entries(Room).find(([key, set]) => set?.has(topic));
room = match ? match[0] : "LOBBY";
console.log('pgN', pgNum)
console.log('topic', topic)
console.log('chapter', chNum)

//PAGE ELEMENTS
const readerDoc = document.getElementById("section");
const nextBtn = document.getElementById("nextButton");
const prevBtn = document.getElementById("prevButton");

//COMPONENTS
const equationBox = document.getElementsByClassName("eqBox"); 
const eqBoxArray = Array.from(equationBox);

//PAGE LOADER
async function loadPage(pageNumber) {
  try {
    const response = await fetch(`../parts/markdown/${room.toLowerCase()}/${topic}/content/pg${pageNumber}.md`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const htmlChunk = await response.text();
    readerDoc.innerHTML = htmlChunk;

  } catch (error) {
    console.error(error.message);
    readerDoc.innerHTML = "<div class='notice'>something is definitely not right</div>"
  }
}

//EQ TYPE LOADER
async function loadEquationTyper() {
  try {
    const response = await fetch(`../parts/components/eqTyper.html`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const htmlChunk = await response.text();
    eqBoxArray.forEach(element => {
        element.innerHTML = htmlChunk;
    });

  } catch (error) {
    console.error(error.message);
    equationBox[0].innerHTML = "<div class='notice'>something is definitely not right</div>"
  }
}

//RELOAD EVENTS
/*nextBtn.addEventListener("click", () => {
  pgNum++;
  loadPage(pgNum);
});
prevBtn.addEventListener("click", () => {
  if(pgNum>1) {
    pgNum--;
    loadPage(pgNum);
  }
});*/

//ON-LOAD
loadPage(pgNum);
loadEquationTyper();