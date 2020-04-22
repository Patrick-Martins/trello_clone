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

let taskToMove = undefined;

// function init() {
//   configureButtons();
//   getData();
//   onSubmit();
// }

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
  console.log("dataset id: " + templateCopy.querySelector("article").dataset.id);

  templateCopy.querySelector(".color").style.backgroundColor = card.color;
  templateCopy.querySelector("h2 span").textContent = card.title;
  if (card.deadline) {
    templateCopy.querySelector(".deadline").textContent = card.deadline.substring(0, 10);
  }
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
    document.querySelectorAll(".move_container button").forEach((button) => {
      button.addEventListener("click", () => {
        //make new data without id
        const newData = {
          title: card.title,
          description: "some description",
          deadline: card.deadline,
          color: card.color,
          //was put in the functin moveButton inside click eventListener
          board_parent: button.dataset.moveto,
        };

        //delete from current
        //post to another board
        //change parent
        // console.log(button.dataset.moveto);
        console.log("parent id is " + button.dataset.boardid);
        console.log(card);
        console.log("parent is now: " + newData.board_parent);
        console.log("id to delete: " + card._id);

        postData(button.dataset.boardid, newData);
        deleteData(card._id);
      });
    });

    console.log("move");
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
      console.log("posted");
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

  // document.querySelector(".close_icon").addEventListener("click", () => {
  //   document.querySelector(".form-modal").classList.add("hidden");
  // });

  document.querySelectorAll(".close_icon").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".form-modal").classList.add("hidden");
      document.querySelector(".move_modal").classList.add("hidden");
    });
  });
}

// function onSubmit() {
//   form.addEventListener("submit", (e) => {
//     //remove invalid class from all
//     formInputs.forEach((el) => {
//       el.classList.remove("invalid");
//     });
//     if (form.checkValidity()) {
//       console.log("submit ready");

//       card_FormData = {
//         title: form.elements.title.value,
//         description: "some description",
//         deadline: form.elements.deadline.value,
//         color: form.elements.color.value,
//         //was put in the functin moveButton inside click eventListener
//         board_parent: form.dataset.boardName,
//       };

//       if (form.dataset.purpose == "change") {
//         putData(changeID, card_FormData);
//       } else if (form.dataset.purpose == "add") {
//         // board_id_tag = form.dataset.boardName;
//         const board_id_database = form.dataset.boardID;
//         postData(board_id_database, card_FormData);
//       }

//       console.log(card_FormData);
//     } else {
//       //! awesome
//       //add invalid class if it is invalid
//       formInputs.forEach((el) => {
//         //   console.log(formInputs);
//         if (!el.checkValidity()) {
//           //if it is a radio buttton I want to show the specific p tag because it has a different html structure
//           if (el.type === "radio") {
//             document.querySelector(".type-radio-buttons").classList.remove("hidden");
//           }
//           console.log(el.type);
//           el.classList.add("invalid");
//         }
//       });
//     }
//   });
// }
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

//..................................NEW ALTERNATIVE
function init() {
  getBoards();
  //add functionality on submit button
  buttonToCloseForm();
  onSubmit();
  // buildBoards();
  // configureButtons();
  // onSubmit();
}

async function getBoards() {
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
      boards.forEach(showBoards);
      loading(false);
      //after showing boards get the tasks
      getTasks();
    });
}

function showBoards(board) {
  //create an option of each bord when movinga task
  createBoardOption(board);

  const template = document.querySelector(".board_template").content;
  const templateCopy = template.cloneNode(true);
  const parent = document.querySelector("main");

  //give an id to the section
  templateCopy.querySelector("section").setAttribute("id", board.container_id);

  //set data attributes to add new task button
  const addNew = templateCopy.querySelector(".add-new");
  addNew.dataset.boardName = board.container_id;
  addNew.dataset.boardID = board._id;
  templateCopy.querySelector("h2").textContent = board.board_name;
  //add task button click
  templateCopy.querySelector("button.add-new").addEventListener("click", (button) => {
    document.querySelector(".form-modal").classList.remove("hidden");
    emptyPlaceholders();
    form.dataset.purpose = "add";
    const boardName = board.container_id;
    const boardID = board._id;
    form.dataset.boardName = boardName;
    form.dataset.boardID = boardID;
    console.log("form Board Name id: " + form.dataset.boardID);
    document.querySelector(".form-modal button").textContent = "Add Card";
  });

  parent.appendChild(templateCopy);
}

async function getTasks() {
  loading(true);

  fetch(endpoint + "?max=100", {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((res) => res.json())
    .then((tasks) => {
      console.log(tasks);
      tasks.forEach(showTask);
      loading(false);
    });
}

async function showTask(task) {
  const template = document.querySelector(".task_template").content;
  const parent = document.getElementById(`${task.board_parent}`);
  const templateCopy = template.cloneNode(true);

  console.log("task.board_parent :" + task.board_parent);
  //id of each task
  templateCopy.querySelector("article").dataset.id = task._id;

  //set values for each element
  templateCopy.querySelector(".color").style.backgroundColor = task.color;
  templateCopy.querySelector("h2 span").textContent = task.title;
  if (task.deadline) {
    templateCopy.querySelector(".deadline").textContent = task.deadline.substring(0, 10);
  }
  //press delete button
  templateCopy.querySelector("button.deleteCar").addEventListener("click", () => deleteTask(task._id));

  //press change button
  templateCopy.querySelector("button.changeCar").addEventListener("click", () => {
    fillPlaceholders(task);
    document.querySelector(".form-modal").classList.remove("hidden");
    form.dataset.purpose = "change";
    changeID = task._id;
    document.querySelector(".form-modal button").textContent = "Change Card";
    console.log(form.dataset.purpose);
  });

  // press moveCard button
  const moveBTN = templateCopy.querySelector("button.moveCard");

  moveBTN.addEventListener("click", (event) => {
    move_modal.dataset.task = moveBTN.dataset.task_object;

    //add eventlisteners to each button to delete from current and post to the clicked one
    document.querySelectorAll(".move_container button").forEach((button) => {
      button.addEventListener("click", (e) => {
        // event.stopImmediatePropagation();
        //change board_parent with put method function
        task.board_parent = button.dataset.moveTo;
        //save the task object data in move
        moveBTN.dataset.task_object = task;
        //append section to id of board_parent
        const articleMove = document.querySelector(`article[data-id="${move_modal.dataset.task._id}"]`);
        const boardToGet = document.getElementById(`${move_modal.dataset.task.board_parent}`);
        boardToGet.appendChild(articleMove);
        putTask(move_modal.dataset.task._id, move_modal.dataset.task);
        // getSpecificTask(task._id);
        // event.stopImmediatePropagation();

        //removeEventListener

        document.querySelectorAll(".move_container button").forEach((button) => {
          button.removeEventListener("click", (e) => {
            // event.stopImmediatePropagation();
            //change board_parent with put method function
            task.board_parent = button.dataset.moveTo;
            //append section to id of board_parent
            const articleMove = document.querySelector(`article[data-id="${task._id}"]`);
            const boardToGet = document.getElementById(`${task.board_parent}`);
            boardToGet.appendChild(articleMove);
            putTask(task._id, task);
            // getSpecificTask(task._id);
            // event.stopImmediatePropagation();
          });

          console.log("move");
          //open move modal
          move_modal.classList.remove("hidden");
          move_modal.dataset.idToMove = task._id;

          // onBoardClickMove(button, task);
          // event.stopPropagation();
        });
      });

      console.log("move");
      //open move modal
      move_modal.classList.remove("hidden");
      move_modal.dataset.idToMove = task._id;

      // onBoardClickMove(button, task);
      // event.stopPropagation();
    });
  });

  parent.appendChild(templateCopy);
  setTimeout(() => {
    loading(false);
  }, 3000);
}

async function deleteTask(id) {
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

async function putTask(id, dataToUpdate) {
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
      console.log("id clicked: " + id);
      loading(false);
    });
}

function onSubmit() {
  //event listener on submit
  form.addEventListener("submit", (e) => {
    //close modal event listener
    closeModal();

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
        putTask(changeID, card_FormData);
        changeCard(changeID, card_FormData);
      } else if (form.dataset.purpose == "add") {
        // board_id_tag = form.dataset.boardName;
        const board_id_database = form.dataset.boardID;
        postTask(board_id_database, card_FormData);
        console.log("ADD PURPOSE");
      }

      console.log(card_FormData);
    } else {
      //! awesome
      //add invalid class if it is invalid
      formInputs.forEach((el) => {
        //   console.log(formInputs);
        if (!el.checkValidity()) {
          //if it is a radio buttton I want to show the specific p tag because it has a different html structure
          console.log(el.type);
          el.classList.add("invalid");
        }
      });
    }
  });
}

function postTask(board_id_database, card_FormData) {
  const dataToPost = JSON.stringify(card_FormData);
  //post

  loading(true);

  fetch(`${endpoint}?max=100"`, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: dataToPost,
  })
    .then((res) => res.json())
    .then((task) => {
      showTask(task);
      console.log("posted");
      loading(false);
    });
}

function closeModal() {
  document.querySelector(".form-modal").classList.add("hidden");
  document.querySelector(".move_modal").classList.add("hidden");
}

function buttonToCloseForm() {
  //add event listener to close button
  document.querySelectorAll(".close_icon").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".form-modal").classList.add("hidden");
      document.querySelector(".move_modal").classList.add("hidden");
    });
  });
}

function createBoardOption(board) {
  const newButton = document.createElement("button");
  const parent = document.querySelector(".move_container");

  newButton.textContent = board.board_name;
  newButton.dataset.moveTo = board.container_id;

  parent.appendChild(newButton);
}

function updateTask(task) {
  const template = document.querySelector(".task_template").content;
  const parent = document.getElementById(`${task.board_parent}`);
  const templateCopy = template.cloneNode(true);

  console.log("task.board_parent :" + task.board_parent);
  //id of each task
  templateCopy.querySelector("article").dataset.id = task._id;

  //set values for each element
  templateCopy.querySelector(".color").style.backgroundColor = task.color;
  templateCopy.querySelector("h2 span").textContent = task.title;
  if (task.deadline) {
    templateCopy.querySelector(".deadline").textContent = task.deadline.substring(0, 10);
  }
  //press delete button
  templateCopy.querySelector("button.deleteCar").addEventListener("click", () => deleteTask(task._id));

  //press change button
  templateCopy.querySelector("button.changeCar").addEventListener("click", () => {
    fillPlaceholders(task);
    document.querySelector(".form-modal").classList.remove("hidden");
    form.dataset.purpose = "change";
    changeID = task._id;
    document.querySelector(".form-modal button").textContent = "Change Card";
    console.log(form.dataset.purpose);
  });

  // press moveCard button

  templateCopy.querySelector("button.moveCard").addEventListener("click", () => {
    //add eventlisteners to each button to delete from current and post to the clicked one
    document.querySelectorAll(".move_container button").forEach((button) => {
      button.addEventListener("click", () => {
        //delete element with data-id of that task
        document.querySelector(`article[data-id="${task._id}"]`).remove();
        //paste element with showTask function
        //change board_parent with put method function
        task.board_parent = button.dataset.moveTo;
        putTask(task._id, task);
        updateTask(task, task.board_parent);
      });

      console.log("move");
      //open move modal
      move_modal.classList.remove("hidden");
      move_modal.dataset.idToMove = task._id;
    });
  });

  parent.appendChild(templateCopy);
  setTimeout(() => {
    loading(false);
  }, 3000);
}

function changeCard(id, data) {
  console.log("id changed: " + id);
  const cardArticle = document.querySelector(`article[data-id="${id}"]`);

  cardArticle.querySelector(".color").style.backgroundColor = data.color;
  cardArticle.querySelector("h2 span").textContent = data.title;
  cardArticle.querySelector(".deadline").textContent = data.deadline.substring(0, 10);
}

async function getSpecificTask(id) {
  loading(true);

  fetch(endpoint + "/" + id, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((res) => res.json())
    .then((task) => {
      showTask(task);
      loading(false);
    });
}

// function onBoardClickMove(button, task) {
//   button.addEventListener("click", (event) => {
//     // event.stopImmediatePropagation();
//     //change board_parent with put method function
//     task.board_parent = button.dataset.moveTo;
//     //append section to id of board_parent
//     const articleMove = document.querySelector(`article[data-id="${task._id}"]`);
//     const boardToGet = document.getElementById(`${task.board_parent}`);
//     boardToGet.appendChild(articleMove);
//     putTask(task._id, task);
//     // getSpecificTask(task._id);
//     // event.stopImmediatePropagation();

//     button.removeEventListener("click", (event) => {
//       // event.stopImmediatePropagation();
//       event.stopPropagation();
//       //change board_parent with put method function
//       task.board_parent = button.dataset.moveTo;
//       //append section to id of board_parent
//       const articleMove = document.querySelector(`article[data-id="${task._id}"]`);
//       const boardToGet = document.getElementById(`${task.board_parent}`);
//       boardToGet.appendChild(articleMove);
//       putTask(task._id, task);
//       // getSpecificTask(task._id);
//       // event.stopImmediatePropagation();
//     });
//   });

//   console.log("move");
//   //open move modal
//   move_modal.classList.remove("hidden");
//   move_modal.dataset.idToMove = task._id;
// }
