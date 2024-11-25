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
    const data = dataBuffer.parse();
    return data;
}

// find username and password
const findUserName = (username, password) => {
    const data = renderData();
    const findData = data.find((user) => {
        user.username === username && user.password === password
    });
    return findData;
}


module.exports = {
    findUserName
}