function sendNote() {
  const recipient = document.getElementById("recipient").value;
  const message = document.getElementById("message").value;
  const anonymous = document.getElementById("anonymous").checked;
  const color = document.getElementById("note-color").value;

  if (!message.trim()) {
    alert("Please write a message.");
    return;
  }

  const note = document.createElement("div");
  note.className = "note";
  note.style.backgroundColor = color;
  note.innerText = `${anonymous ? "Anonymous" : recipient} says:\n${message}`;

  document.getElementById("inbox").prepend(note);

  // Clear inputs
  document.getElementById("message").value = "";
  document.getElementById("recipient").value = "";
  document.getElementById("anonymous").checked = false;
}
