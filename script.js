const fs = require('fs');


// create directory if it doesn't exist
const dirPath = 'database';
if( !fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
}

// create a new JSON file in the directory
const filePath = `${dirPath}/login.json`;

if( !fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]' , 'utf8');
}


// read and parse json file
const renderData = () => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = JSON.parse(dataBuffer);
    return data;
}

const saveUserData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
}

// check duplicate email addresses
const duplicateEmail = (email) => {
    const datas = renderData();
    const isEmailDuplicate = datas.find( data => data.email === email);
    return isEmailDuplicate;  // return true if email exists, false otherwise  // for simplicity, we just check if the email is present in the array  // in a real-world application, you would need to implement more complex logic to handle duplicates (e.g. unique usernames, email addresses, etc.)  // this function is used in the login and registration routes to check for duplicates before adding new users to the database  // this function should be called after validating the user input
}

// find username and password
const addUser = (user) => {
    const data = renderData();
    data.push(user);
    saveUserData(data);
}


module.exports = {
    addUser,
    duplicateEmail
}