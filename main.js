document.addEventListener("DOMContentLoaded", function() {
  // Get DOM elements
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const displayName = document.getElementById("display-name");
  const bio = document.getElementById("bio");
  const toast = document.getElementById("toast");
  const loading = document.getElementById("loading");
  const authContainer = document.getElementById("auth-container");
  const mainContent = document.getElementById("main-content");

  // Firebase Authentication helpers
  const auth = firebase.auth();

  // Function to show toast notifications
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // Function to show or hide the loading spinner
  function showLoading(show) {
    loading.style.display = show ? "flex" : "none";
  }

  // Sign up function
  signupBtn.onclick = async () => {
    const emailValue = email.value;
    const passwordValue = password.value;
    const displayNameValue = displayName.value;
    const bioValue = bio.value;

    try {
      showLoading(true);
      // Create a new user with email and password
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(emailValue, passwordValue);
      const user = userCredential.user;

      // Set display name and bio after successful signup
      await user.updateProfile({
        displayName: displayNameValue,
      });

      // Save user bio in Firebase Realtime Database
      const userRef = firebase.database().ref("users/" + user.uid);
      await userRef.set({
        bio: bioValue,
        displayName: displayNameValue,
      });

      showToast("Account created successfully!");
    } catch (e) {
      showToast(e.message);
    } finally {
      showLoading(false);
    }
  };

  // Log in function
  loginBtn.onclick = async () => {
    const emailValue = email.value;
    const passwordValue = password.value;

    try {
      showLoading(true);
      // Sign in the user with email and password
      await firebase.auth().signInWithEmailAndPassword(emailValue, passwordValue);

      showToast("Logged in successfully!");

      // Hide the login screen and show the main content
      authContainer.style.display = "none";
      mainContent.style.display = "block";
    } catch (e) {
      showToast(e.message);
    } finally {
      showLoading(false);
    }
  };

  // Handle user state changes (for logged-in users)
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, show the main content
      authContainer.style.display = "none";
      mainContent.style.display = "block";

      // Load user info from Firebase
      const userRef = firebase.database().ref("users/" + user.uid);
      userRef.once("value", function(snapshot) {
        const userData = snapshot.val();
        if (userData) {
          displayName.value = userData.displayName || "";
          bio.value = userData.bio || "";
        }
      });
    } else {
      // User is not signed in, show the login screen
      authContainer.style.display = "block";
      mainContent.style.display = "none";
    }
  });
});
