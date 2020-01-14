const path = require('path');

module.exports = {
    baseURL: 'https://api.github.com',
    orgName: 'YolkPie',
    token: Buffer.from('NWVhNTJmZDM2MDdjNTQ2Y2RjZGEwNWE4N2UwNzUyZTRhMGI1NzA1Mw==', 'base64').toString(),
    TEMP_PATH: path.join(process.cwd(), '.yolkworks-tmp'),
};