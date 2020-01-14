const path = require('path');
const Git = require('../tools/git');
const { orgName, TEMP_PATH } = require('../../config');

module.exports = async function(repo, material, template) {
    this.git = new Git();
    return this.git.downloadProject({
        projectUrl: `https://github.com:${orgName}/${repo}`,
        repoPath: TEMP_PATH
    })
};