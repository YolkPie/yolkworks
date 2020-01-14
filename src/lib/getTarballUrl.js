const {orgName} = require('../../config')
module.exports = function (repo) {
    return `https://github.com/${orgName}/${repo}/tarball/master`
}