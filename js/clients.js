
//load API 
//const API

//references
const references =() => ({
    addbtn: document.getElementById('addClientBtn'),
    clientTableBody: document.getElementById('clientTableBody'),
    clientFormBox: document.getElementById('clientForm'),
    tbody : document.querySelector('#clientTableBody'),     

});

// initialize clients page
export function initClientsPage() {
    const { addbtn, clientTableBody, clientFormBox, tbody } = references();

    addbtn.addEventListener('click', openClientForm());
    clientFormBox.addEventListener('submit', submitClientForm());
    tbody.addEventListener('click', deleteClient());
    
    // load clients data
    loadClients();

}

// load clients data already in memory
function loadClients() {
}

// generate HTML for a client row
function rowHTML(client) {
}

// open client form to add or edit a client??
function openClientForm(){

}

// submit client form
function submitClientForm(){

}

// delete a client
function deleteClient(){

}