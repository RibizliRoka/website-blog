
//START
async function main()
{
  //VARIABLES
  const Room = getRooms();
  let Subject = {};
  let room = "LOBBY";
  let topic = 'diffyq';
  let chapter = "";
  let page = "";

  //GET ROOM TOPIC CHAPTER PAGE ?topic=diffyq&chapter=4&page=450
  [Subject, room, topic, chapter, page] = await refreshBasedOnURL(Room)

  //COMPONENTS 
  let readerDoc = document.getElementById("section");
  let equationBox = document.getElementsByClassName("eqBox"); 
  let eqBoxArray = Array.from(equationBox);

  //LOAD PAGE
  loadPage(readerDoc, room, topic, chapter, page); 
  loadEquationTyper(eqBoxArray, equationBox); 

  //AFTER INIT
  pageFlip(url, page);
  [Subject, room, topic, chapter, page] = await loadAll(readerDoc,eqBoxArray, equationBox, Room, Subject, room, topic, chapter, page); 
}
main();

//ON-LOAD
async function loadAll(readerDoc,eqBoxArray, equationBox,Room, Subject, room, topic, chapter, page)
{
  loadPage(readerDoc, room, topic, chapter, page);
  loadEquationTyper(eqBoxArray, equationBox);

  updateNavBar(chapter, page);
  updateChapterHeader(Subject, chapter, page);
  window.history.pushState({}, '', url.toString());
  [Subject, room, topic, chapter, page] = await refreshBasedOnURL(Room)
  return [Subject, room, topic, chapter, page];
}

// #region Init things
function getRooms() {
  const Room = Object.freeze({
    MATH: new Set(["arithmetic", "algebra", "geometry", "topology", "stats","calculus", "multivari", "diffyq", "linalg"]),
    OBSERVATORY: new Set(["electronics", "mechanics", "quantum mechanics"]),
    COMPUTER: new Set(["python", "cpp", "linux", "machineLearn"]),
    GREENHOUSE: new Set(["biology", "botany"]),
    LAB: new Set(["labSafety", "chemistry"]),
    LIBRARY: new Set(["history"]),
    LOBBY: null
  });
  return Room;
}
async function getRoomData(room, topic)
{
  try {
    const response = await fetch(`../../../parts/contents/${room.toLowerCase()}/${topic}/titles.md`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split('\n');
    
    let [subject, chCount] = lines[0].split(',');

    chapters = new Array(chCount).fill(0);
    chapterNums = new Array(chCount).fill(0);
    parts = new Array(chCount).fill(0);
    partNums = new Array(chCount).fill(0);

    currLine = 1;
    for(i=0; i<chCount; i++){
      let [type, chNumber, chapterName, pCount] = lines[currLine].split(',');
      currLine+=1;
      chapters[i] = chapterName;
      parts = new Array(pCount).fill(0);
      for(j=0; j<pCount; j++){
         let [partNum, partName] = lines[currLine].split(',');
         parts[j]= partName;
         partNums[j]= partNum;
         currLine+=1;
      }
    }

    const Subject = {};
    for (const key of chapters) {
      Subject[key] = parts;
    }
    return Subject;
  } catch (error) {
    console.error(error.message);
    return [null, null, null, null];
  }
}
//#endregion

// #region Load Page
async function loadPage(readerDoc, room, topic, chapter, page) {
  try {
    console.log("hehe 1", room, topic,  Number(chapter), Number(page))
    const response = await fetch(`../../../parts/contents/${room.toLowerCase()}/${topic}/markdown/ch${parseInt(chapter, 10)}pg${parseInt(page, 10)}.md`);
    console.log("hehe 2")
    if (!response.ok) {
      console.log("bad 1")
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
async function loadEquationTyper(eqBoxArray, equationBox) {
  try {
    const response = await fetch(`../../../parts/components/eqTyper.html`);
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
// #endregion

// #region Button Clicks
async function pageFlip(url, page){
  document.getElementById("BackPage").onclick = function () {
    if(page>1){
      page = page-1;
      url.searchParams.set('page', page);
      loadAll();
    }
  };
  document.getElementById("NextPage").onclick = function () {
    if(page<50){
      page = page+1;
      url.searchParams.set('page', page);
      loadAll();
    }
  };
}

async function refreshBasedOnURL(Room){
  url = new URL(window.location.href);
  if(window.location.search!=""){
    console.log('PARAMS')
    topic = parseInt(url.searchParams.get('topic')) || 'diffyq';
    chapter = parseInt(url.searchParams.get('chapter')) || 1;
    page = parseInt(url.searchParams.get('page')) || 1;
  }
  else{
    console.log('DEFAULT')
    chapter = 1;
    page = 1;
    url.searchParams.set('topic', topic);
    url.searchParams.set('chapter', 1);
    url.searchParams.set('page', 1);
  }
  const match = Object.entries(Room).find(([key, set]) => set?.has(topic));
  room = match ? match[0] : "LOBBY";

  console.log('room', room)
  console.log('topic', topic)
  console.log('chapter number', chapter)
  console.log('page number', page)

  let Subject = await getRoomData(room, topic);

  return [Subject, room, topic, chapter, page]
}
// #endregion

// #region Text Updates
async function updateNavBar(chapter, page) {
  const currChapter = document.getElementById("currChapter");
  if (currChapter) {
    currChapter.textContent = chapter;
  }
  const pagePart = document.getElementById("pagePart");
  if (pagePart) {
    pagePart.textContent = page;
  }
}
async function updateChapterHeader(Subject, chapter, page) {
  const chName = Object.keys(Subject)[chapter-1]
  const chapterNum = document.getElementById("chBigNum");
  if (chapterNum) {
    chapterNum.textContent = chapter;
  }
  const chNumAero = document.getElementById("chNumAero");
  if (chNumAero) {
    chNumAero.dataset.text = chapter;
  }
  const chapterName = document.getElementById("chapterName");
  if (chapterName) {
    chapterName.textContent = chName;
  }
  const partName = document.getElementById("partName");
  if (partName) {
    partName.textContent = Subject[chName][page-1];
  }
}
// #endregion
