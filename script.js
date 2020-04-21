"use strict";

window.addEventListener("load", init);

const trelloboards = "https://databaseelite-b1b7.restdb.io/rest/trelloboards";
const endpoint = "https://databaseelite-b1b7.restdb.io/rest/trellotasks";
const apiKey = "5e9580ac436377171a0c234c";

let boards = [];

const carToAdd = {
  brand: "renault",
  model: "clio",
  color: "blue",
  luxury: false,
  release_date: "2006-04-10",
};

//form variables
const form = document.querySelector("form");
const formInputs = form.querySelectorAll("input");
const elements = form.elements;
let card_FormData;
let changeID;
//----------------------------
//move-----
const move_modal = document.querySelector(".move_modal");

function init() {
  configureButtons();
  getData();
  onSubmit();
}

function showAllCards(data) {
  data.forEach(showCard);
}

async function showCard(card) {
  const template = document.querySelector("template").content;
  let parent;
  const templateCopy = template.cloneNode(true);

  //attribute data to template

  //give temporary board parent value
  if (card.board_parent == "") {
    parent = document.querySelector("main #to_do");
  }

  // if (card.board_parent == "to_do") {
  //   parent = document.querySelector("main #to_do");
  // } else if (card.board_parent == "doing") {
  //   parent = document.querySelector("main #doing");
  // } else if (card.board_parent == "done") {
  //   parent = document.querySelector("main #done");
  // }

  //append to the element with the id og board_parent field attribute of object data
  parent = document.querySelector(`#${card.board_parent}`);

  //id of each car
  templateCopy.querySelector("article").dataset.id = card._id;

  templateCopy.querySelector(".color").style.backgroundColor = card.color;
  templateCopy.querySelector("h2 span").textContent = card.title;
  templateCopy.querySelector(".deadline").textContent = card.deadline.substring(0, 10);
  templateCopy.querySelector("button.deleteCar").addEventListener("click", () => deleteData(card._id));

  //press change button
  templateCopy.querySelector("button.changeCar").addEventListener("click", () => {
    fillPlaceholders(card);
    document.querySelector(".form-modal").classList.remove("hidden");
    form.dataset.purpose = "change";
    changeID = card._id;
    document.querySelector(".form-modal button").textContent = "Change Card";
    console.log(form.dataset.purpose);
  });
  //moveCard
  templateCopy.querySelector("button.moveCard").addEventListener("click", () => {
    //open move modal
    //add eventlisteners to each button to delete from current and post to the clicked one

    move_modal.classList.remove("hidden");
    move_modal.dataset.idToMove = card._id;
  });

  parent.appendChild(templateCopy);
  setTimeout(() => {
    loading(false);
  }, 3000);
}

async function postData(id_board_database, objectData) {
  //OPTIMISTIC INSERTS
  //show the car that was added
  //   showCar(carToAdd);

  const dataToPost = JSON.stringify(objectData);
  //post

  loading(true);

  fetch(`${trelloboards}/${id_board_database}/tasks`, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: dataToPost,
  })
    .then((res) => res.json())
    .then((data) => {
      showCard(data);
      loading(false);
    });
}

async function getData() {
  // //clear main window

  // document.querySelector("main").innerHTML = "";
  //get
  loading(true);

  fetch(trelloboards + "?max=100", {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((res) => res.json())
    .then((boards) => {
      console.log(boards);
      boards.forEach(getListOfTasks);
      console.log("done");
    });
}

async function getListOfTasks(board) {
  console.log("getlist");
  //execute this as long as there are more elements in array
  //do something with each board
  //get tasks for the specific board
  fetch(`${trelloboards}/${board._id}/tasks`, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((res) => res.json())
    .then((tasks) => {
      console.log("tasks");
      console.log(tasks);
      tasks.forEach(showCard);
    });
}

async function deleteData(id) {
  //OPTIMISTIC INSERTS
  document.querySelector(`article[data-id="${id}"]`).remove();
  console.log("id= " + id);

  //delete
  loading(true);
  fetch(endpoint + `/${id}`, {
    method: "delete",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      loading(false);
    });
}

async function putData(id, dataToUpdate) {
  //OPTIMISTIC INSERTS
  //show the car that was added
  //   showCar(carToAdd);
  let postData = JSON.stringify(dataToUpdate);
  //post
  loading(true);
  fetch(`${endpoint}/${id}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: postData,
  })
    .then((res) => res.json())
    .then((data) => {
      changeCar(id, data);
      console.log("id clicked: " + id);
      loading(false);
    });
}

function changeCar(id, data) {
  console.log("id changed: " + id);
  const cardArticle = document.querySelector(`article[data-id="${id}"]`);

  cardArticle.querySelector(".color").style.backgroundColor = data.color;
  cardArticle.querySelector("h2 span").textContent = data.title;
  cardArticle.querySelector(".deadline").textContent = data.deadline.substring(0, 10);
}

function configureButtons() {
  document.querySelectorAll("button.add-new").forEach((buttonAdd) => {
    buttonAdd.addEventListener("click", (button) => {
      document.querySelector(".form-modal").classList.remove("hidden");
      emptyPlaceholders();
      form.dataset.purpose = "add";
      const boardName = button.target.attributes[1].value;
      const boardID = button.target.attributes[2].value;
      form.dataset.boardName = boardName;
      form.dataset.boardID = boardID;
      console.log("form Board Name id: " + form.dataset.boardID);
      document.querySelector(".form-modal button").textContent = "Add Card";
    });
  });

  document.querySelector(".close_icon").addEventListener("click", () => {
    document.querySelector(".form-modal").classList.add("hidden");
  });
}

function onSubmit() {
  form.addEventListener("submit", (e) => {
    //remove invalid class from all
    formInputs.forEach((el) => {
      el.classList.remove("invalid");
    });
    if (form.checkValidity()) {
      console.log("submit ready");

      card_FormData = {
        title: form.elements.title.value,
        description: "some description",
        deadline: form.elements.deadline.value,
        color: form.elements.color.value,
        //was put in the functin moveButton inside click eventListener
        board_parent: form.dataset.boardName,
      };

      if (form.dataset.purpose == "change") {
        putData(changeID, card_FormData);
      } else if (form.dataset.purpose == "add") {
        // board_id_tag = form.dataset.boardName;
        const board_id_database = form.dataset.boardID;
        postData(board_id_database, card_FormData);
      }

      console.log(card_FormData);
    } else {
      //! awesome
      //add invalid class if it is invalid
      formInputs.forEach((el) => {
        //   console.log(formInputs);
        if (!el.checkValidity()) {
          //if it is a radio buttton I want to show the specific p tag because it has a different html structure
          if (el.type === "radio") {
            document.querySelector(".type-radio-buttons").classList.remove("hidden");
          }
          console.log(el.type);
          el.classList.add("invalid");
        }
      });
    }
  });
}
function fillPlaceholders(data) {
  document.getElementById("title").placeholder = data.title;
  console.log(data.deadline);
  document.getElementById("deadline").value = data.deadline.substring(0, 10);
  // , data.deadline);
  document.getElementById("color").placeholder = data.color;
}

function emptyPlaceholders() {
  formInputs.forEach((e) => {
    e.placeholder = "";
  });
}

function loading(boolean) {
  const loader = document.querySelector(".loader");
  if (boolean === true) {
    loader.classList.remove("hidden");
  } else {
    loader.classList.add("hidden");
  }
}
