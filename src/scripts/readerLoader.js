
//START
const State = {
  URL: "",
  RoomLayout: null, 
  Subject: {},
  room: "MATH",
  topic: "diffyq",
  chapter: 1,
  page: 1,

  //Cache
  components: {
    readerDoc: null,
    eqBoxArray: [],
    equationBox: null
  }
};
async function main()
{
  //Constants no matter Room
  State.RoomLayout = getRoomLayout();
  State.components.readerDoc = document.getElementById("section");
  State.components.equationBox = document.getElementsByClassName("eqBox"); 
  State.components.eqBoxArray = Array.from(State.components.equationBox);

  //SYNC WITH URL ?topic=diffyq&chapter=4&page=450
  await refreshBasedOnURL();

  //RETRIEVE DATA FROM ROOM
  await getRoomData();

  //LOAD PAGE
  await Promise.all([
    loadPageContent(),
    loadEquationTyper()
  ]);

  //EVENTS
  pageFlip(); 

  //UPDATES
  updateNavBar();
  updateChapterHeader();
  window.history.pushState({}, '', State.URL.toString());
}
main();


// #region Init things
function getRoomLayout() {
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
async function getRoomData()
{
  try {
    const response = await fetch(`../../../parts/contents/${State.room.toLowerCase()}/${State.topic}/titles.md`);
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

    State.Subject = Subject;
  } catch (error) {
    console.error(error.message);
  }
}
//#endregion

async function refreshBasedOnURL(){
  url = new URL(window.location.href);
  State.URL = url;
  if(window.location.search!=""){
    console.log('REFRESH based on URL')
    topic = parseInt(url.searchParams.get('topic')) || 'diffyq';
    chapter = parseInt(url.searchParams.get('chapter')) || 1;
    page = parseInt(url.searchParams.get('page')) || 1;
  }
  else{
    console.log('REFRESH based on DEFAULT')
    chapter = 1;
    page = 1;
    url.searchParams.set('topic', topic);
    url.searchParams.set('chapter', 1);
    url.searchParams.set('page', 1);
  }
  const match = Object.entries(State.RoomLayout).find(([key, set]) => set?.has(topic));
  room = match ? match[0] : "LOBBY";

  console.log('REFRESH STATE')
  console.log('room', room)
  console.log('topic', topic)
  console.log('chapter number', chapter)
  console.log('page number', page)

  let Subject = await getRoomData(room, topic);

  State.Subject = Subject;
  State.room = room;
  State.topic = topic;
  State.chapter = chapter;
  State.page = page;
}

// #region Load Page
async function loadPageContent() {
  try {
    console.log("LOADING IN", State.room, State.topic,  Number(State.chapter), Number(State.page))
    const response = await fetch(`../../../parts/contents/${State.room.toLowerCase()}/${State.topic}/markdown/ch${parseInt(State.chapter, 10)}pg${parseInt(State.page, 10)}.md`);
    if (!response.ok) {
      console.log("LOST CONTENT")
      throw new Error(`Response status: ${response.status}`);
    }
    console.log("FOUND CONTENT")

    const htmlChunk = await response.text();
    State.components.readerDoc.innerHTML = htmlChunk;

  } catch (error) {
    console.error(error.message);
    State.components.readerDoc.innerHTML = "<div class='notice'>something is definitely not right</div>"
  }
}
async function loadEquationTyper() {
  try {
    const response = await fetch(`../../../parts/components/eqTyper.html`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const htmlChunk = await response.text();
    State.components.eqBoxArray.forEach(element => {
        element.innerHTML = htmlChunk;
    });

  } catch (error) {
    console.error(error.message);
    State.components.equationBox[0].innerHTML = "<div class='notice'>something is definitely not right</div>"
  }
}
// #endregion

// #region Button Clicks
async function pageFlip(){
  document.getElementById("BackPage").onclick = function () {
    if(page>1){
      page = State.page-1;
      State.URL.searchParams.set('page', page);
    }
  };
  document.getElementById("NextPage").onclick = function () {
    if(page<50){
      page = State.page+1;
      State.URL.searchParams.set('page', page); 
    }
  };
}
// #endregion

// #region Text Updates
async function updateNavBar() {
  const currChapter = document.getElementById("currChapter");
  if (currChapter) {
    currChapter.textContent = State.chapter;
  }
  const pagePart = document.getElementById("pagePart");
  if (pagePart) {
    pagePart.textContent = State.page;
  }
}
async function updateChapterHeader() {
  const chName = Object.keys(State.Subject)[State.chapter-1]
  const chapterNum = document.getElementById("chBigNum");
  if (chapterNum) {
    chapterNum.textContent = State.chapter;
  }
  const chNumAero = document.getElementById("chNumAero");
  if (chNumAero) {
    chNumAero.dataset.text = State.chapter;
  }
  const chapterName = document.getElementById("chapterName");
  if (chapterName) {
    chapterName.textContent = chName;
  }
  const partName = document.getElementById("partName");
  if (partName) {
    partName.textContent = State.Subject[chName][State.page-1];
  }
}
// #endregion
