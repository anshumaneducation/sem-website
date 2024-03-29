import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getDatabase, ref, onValue, set } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyC2Hl06bYHKn5GJH5w4Z9rQUlreVn4cBfk",
    authDomain: "sem-gui-web.firebaseapp.com",
    databaseURL: "https://sem-gui-web-default-rtdb.firebaseio.com",
    projectId: "sem-gui-web",
    storageBucket: "sem-gui-web.appspot.com",
    messagingSenderId: "499640990084",
    appId: "1:499640990084:web:6a34ad31ba8de737c945d1",
    measurementId: "G-7Q5WVY3N6K"
  };

  const firebaseApp = initializeApp(firebaseConfig);
  const database = getDatabase(firebaseApp);


  function messageToast(message) {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message;

    toast.appendChild(messageParagraph);

    document.body.appendChild(toast);

    // Display the toast for a few seconds
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

  export function handleButtonClick(buttonText) {
    let message;
    // Your existing logic for button click
    switch (buttonText) {
        case 'm1':
            message = 'Meter 1 button pressed!';
            // Add additional logic if needed
            break;
        case 'm2':
            message = 'Meter 2 button pressed!';
            // Add additional logic if needed
            break;
        case 'm3':
            message = 'Meter 3 button pressed!';
            // Add additional logic if needed
            break;
        case 'm4':
            message = 'Meter 4 button pressed!';
            // Add additional logic if needed
            break;
        case 'w1':
            message = 'Toggle switch 1 pressed!';
            // Add additional logic if needed
            break;
        case 'w2':
            message = 'Toggle switch 2 pressed!';
            // Add additional logic if needed
            break;
        case 'w3':
            message = 'Toggle switch 3 pressed!';
            // Add additional logic if needed
            break;
        case 'w4':
            message = 'Toggle switch 4 pressed!';
            // Add additional logic if needed
            break;
        default:
            message = 'Unknown button pressed!';
            break;
    }


      const username = document.getElementById('username').value; // Get username from input field
      const path = `/${username}/writeCommand`; // Change this path accordingly
      const data = buttonText;
      writeToFirebase(path, data);
  
      setTimeout(() => {
          writeToFirebase(path, null);
      }, 2000);
  }
  
  function writeToFirebase(path, data) {
      const dataRef = ref(database, path);
      return set(dataRef, data);
  }
  
  // Fetch and display data
  const dataTable = document.getElementById('data-table');
  const dataMap = new Map();
  
  function fetchData(username) {
      const meters = ['meter1', 'meter2', 'meter3', 'meter4'];
  
      meters.forEach((meter) => {
          const dataRef = ref(database, `/${username}/${meter}_data`);
  
          onValue(dataRef, (snapshot) => {
              const data = snapshot.val();
              dataMap.set(meter, data);
              populateTable();
          });

          // Fetch meter_toggle array
        const toggleRef = ref(database, `/${username}/toggle_meter`);
        onValue(toggleRef, (snapshot) => {
            const toggleData = snapshot.val();
            handleToggleData(toggleData);
        });
      });
  }
  
  function handleToggleData(toggleData) {
    const switches = ['switch1', 'switch2', 'switch3', 'switch4'];

    toggleData.forEach((value, index) => {
        const switchId = switches[index];
        const switchElement = document.getElementById(switchId);
        // Set the switch state based on the value in toggleData
        switchElement.checked = (value === 1);
    });
}
  
  function populateTable() {
      const tbody = dataTable.querySelector('tbody');
      const headersRow = document.getElementById('table-headers');
  
      tbody.innerHTML = ''; // Clear existing rows
      headersRow.innerHTML = ''; // Reset headers
  
      const meters = ['Meter 1', 'Meter 2', 'Meter 3', 'Meter 4'];
  
      const parameters = Array.from(dataMap.values())
          .map(data => Object.keys(data))
          .flat()
          .filter((value, index, self) => self.indexOf(value) === index);
  
      const paras = ["volts 01", "volts 02", "volts 03", "current 01", "current 02", "current 03", "watt 01", "watt 02",
          "watt 03", "VAR 01", "VAR 02", "VAR 03", "freq", "wh Import", "wh Export", "VL 1-2", "VL 2-3", "VL 3-1"];
  
      // Add "Device" header as the first column
      const deviceHeader = document.createElement('th');
      deviceHeader.textContent = 'SEM';
      headersRow.appendChild(deviceHeader);
  
      // Add other headers
      for (const parameter of parameters) {
          const headerCell = document.createElement('th');
          headerCell.textContent = paras[parameter];
          headersRow.appendChild(headerCell);
      }
  
      // Add meter rows
      for (const meter of meters) {
          const row = document.createElement('tr');
          const meterCell = document.createElement('td');
          meterCell.textContent = meter;
          row.appendChild(meterCell);
  
          for (const parameter of parameters) {
              const valuesCell = document.createElement('td');
              const meterData = dataMap.get(meter.toLowerCase().replace(' ', ''));
              valuesCell.textContent = Array.isArray(meterData[parameter]) ? meterData[parameter].join(', ') : meterData[parameter];
              row.appendChild(valuesCell);
          }
  
          tbody.appendChild(row);
      }
  }
  
  
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginContainer = document.getElementById('login-container');
  const appContainer = document.getElementById('app-container');
  
  // Check if the user is already authenticated on window load
  window.onload = function () {
      const savedUsername = localStorage.getItem('username');
      const savedPassword = localStorage.getItem('password');
      if (savedUsername) {
          // Auto-authenticate with saved username
          usernameInput.value = savedUsername;
          passwordInput.value = savedPassword;
          authenticate();
      }
  };
  
  export function authenticate() {
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const enteredPassword = passwordInput.value;
      const enteredUsername = usernameInput.value;
  
      // Fetch the correct password from Firebase
      const passwordRef = ref(database, `/${enteredUsername}/sem_password`);
      onValue(passwordRef, (snapshot) => {
          const correctPassword = snapshot.val();
          console.log('Snapshot:', snapshot.val());
          console.log('Correct Password from Firebase:', correctPassword);
          console.log(`${enteredUsername}`)
  
          if (enteredPassword === correctPassword) {
              // Correct password, save username in local storage
              localStorage.setItem('username', enteredUsername);
              localStorage.setItem('password', enteredPassword);
  
              // Hide login container and show app container
              loginContainer.style.display = 'none';
              appContainer.style.display = 'block';
              fetchData(enteredUsername); // Fetch data when authenticated
          } else {
              // Incorrect password, show an error
              alert('Incorrect password. Please try again.');
          }
      });
  }
  
  // ... (Your existing code)
  
  export function handlePasswordKeyPress(event) {
      if (event.key === 'Enter') {
          authenticate();
      }
  }
  
  export function logout(){
       // Clear username and password from local storage
       localStorage.removeItem('username');
       localStorage.removeItem('password');
   
       // Redirect to the login page (index.html)
       window.location.href = 'index.html';
  }