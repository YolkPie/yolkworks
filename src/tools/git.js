const download = require('download-git-repo');
const request = require('./request');
const { orgName } = require('../../config');

class Git {
  constructor() {
    this.orgName = orgName;
  }

  /**
   * 获取项目组中的项目模板列表
   */
  getProjectList() {
    return request(`/users/${this.orgName}/repos`);
  }

  /**
   * 获取指定代码库下文件列表
   * @param repo 代码库
   * @returns {string}
   */
  getMaterialList(repo) {
    return request(`/repos/${this.orgName}/${repo}/contents`);
  }

  /**
   * 获取模板列表
   * @param repo 代码库
   * @param material 素材类型
   * @returns {never}
   */
  getTemplateList(repo, material) {
    return request(`/repos/${this.orgName}/${repo}/contents/${material}`);
  }

  downLoadTemplate(repo, material, template) {
    return request(`/repos/${this.orgName}/${repo}/downloads`)
  }
  /**
   * 下载 github 项目
   * @param {Object} param 项目git地址 本地开发目录
   */
  downloadProject ({ projectUrl, repoPath }) {
    return new Promise((resolve, reject) => {
      download(projectUrl, repoPath, {
        clone: true
      }, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }
}

module.exports = Git;