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
    return isEmailDuplicate;
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