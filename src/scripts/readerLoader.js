
//START
const State = {
  RoomLayout: null,
  //Cache
  components: {
    readerDoc: null,
    eqBoxArray: [],
    equationBox: null
  }
};
window.localStorage.setItem("newLoad", "true");
window.localStorage.setItem("URL", "");
window.localStorage.setItem("Subject", "");
window.localStorage.setItem("Room", "MATH");
window.localStorage.setItem("Topic", "diffyq");
window.localStorage.setItem("Chapter", "1");
window.localStorage.setItem("Page", "1");

async function main()
{
  //Constants no matter Room
  State.RoomLayout = getRoomLayout();
  State.components.readerDoc = document.getElementById("section");
  //State.components.equationBox = document.getElementsByClassName("eqBox"); 
  //State.components.eqBoxArray = Array.from(State.components.equationBox);

  //SYNC WITH URL ?topic=diffyq&chapter=4&page=450
  loadNew = window.localStorage.getItem("newLoad");
  if(loadNew=="true"){
    console.log("load new", loadNew)
    await refreshBasedOnURL();
  }

  //RETRIEVE DATA FROM ROOM
  await getRoomData();

  //LOAD PAGE
  loadPage()

  //EVENTS
  pageFlip(); 

  //UPDATES
  updateNavBar();
  updateChapterHeader();
  window.history.pushState({}, '', window.localStorage.getItem("URL").toString());
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
    const response = await fetch(`../../../parts/contents/${window.localStorage.getItem("Room").toLowerCase()}/${window.localStorage.getItem("Topic")}/titles.md`);
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

    window.localStorage.setItem("Subject", Subject);
  } catch (error) {
    console.error(error.message);
  }
}
//#endregion

async function refreshBasedOnURL(){
  url = new URL(window.location.href);
  window.localStorage.setItem("URL", url);
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

  window.localStorage.setItem("Subject", Subject);
  window.localStorage.setItem("Room", room);
  window.localStorage.setItem("Topic", topic);
  window.localStorage.setItem("Chapter", chapter);
  window.localStorage.setItem("Page", page);

}

// #region Load Page
async function loadPage(){
    await Promise.all([
    loadPageContent(),
    //loadEquationTyper()
  ]);
}
async function loadPageContent() {
  try {
    console.log("LOADING IN", window.localStorage.getItem("Room"), window.localStorage.getItem("Topic"),  Number(window.localStorage.getItem("Chapter")), Number(window.localStorage.getItem("Page")))
    const response = await fetch(`../../../parts/contents/${window.localStorage.getItem("Room").toLowerCase()}/${window.localStorage.getItem("Topic")}/markdown/ch${parseInt(window.localStorage.getItem("Chapter"), 10)}pg${parseInt(window.localStorage.getItem("Page"), 10)}.md`);
    if (!response.ok) {
      console.log("LOST CONTENT")
      throw new Error(`Response status: ${response.status}`);
    }
    console.log("FOUND CONTENT")

    const htmlChunk = await response.text();
    State.components.readerDoc.innerHTML = htmlChunk;
    console.log("FOUND CONTENT")

  } catch (error) {
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
    State.components.equationBox[0].innerHTML = "<div class='notice'>something is definitely not right</div>"
  }
}
// #endregion

// #region Button Clicks
async function pageFlip(){
  document.getElementById("BackPage").onclick = function () {
    page = Number(window.localStorage.getItem("Page"));
    if(page>1){
      page = page-1;
      window.localStorage.setItem("Page", page);
      loadPage();
      const url = new URL(window.location.href);
      url.searchParams.set('page', page); 
      location.assign(url)
      window.localStorage.setItem("newLoad", "false");
      console.log("BACK FLIP page:", page);
    }
  };
  document.getElementById("NextPage").onclick = function () {
    page = Number(window.localStorage.getItem("Page"));
    if(page<50){
      page = page+1;
      window.localStorage.setItem("Page", page)
      //loadPage();
      const url = new URL(window.location.href);
      //console.log("url: ", url)
      url.searchParams.set('page', page);
      location.assign(url)
      //window.localStorage.setItem("newLoad", "false");
      //console.log("url2: ", url) 
      //console.log("FRONT FLIP page:", page)
    }
  };
}
// #endregion

// #region Text Updates
async function updateNavBar() {
  const currChapter = document.getElementById("currChapter");
  if (currChapter) {
    currChapter.textContent = window.localStorage.getItem("Chapter");
  }
  const pagePart = document.getElementById("pagePart");
  if (pagePart) {
    pagePart.textContent = window.localStorage.getItem("Page");
  }
}
async function updateChapterHeader() {
  const chName = Object.keys(window.localStorage.getItem("Subject"))[window.localStorage.getItem("Chapter")-1]
  const chapterNum = document.getElementById("chBigNum");
  if (chapterNum) {
    chapterNum.textContent = window.localStorage.getItem("Chapter");
  }
  const chNumAero = document.getElementById("chNumAero");
  if (chNumAero) {
    chNumAero.dataset.text = window.localStorage.getItem("Chapter");
  }
  const chapterName = document.getElementById("chapterName");
  if (chapterName) {
    chapterName.textContent = chName;
  }
  const partName = document.getElementById("partName");
  if (partName) {
    partName.textContent = window.localStorage.getItem("Subject")[chName][window.localStorage.getItem("Page")-1];
  }
}
// #endregion
