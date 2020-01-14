const path = require('path');
const fse = require('fs-extra');
const ora = require('ora');
const getTarballUrl = require('../../lib/getTarballUrl')
const extractTarball = require('../../lib/extractTarball');

const { TEMP_PATH } = require('../../../config');

const addState = ora('开始下载模板...');
let addStateText = null;

module.exports = async (options) => {
    const destDir = process.cwd();
    const tempDir = TEMP_PATH;

    await fse.ensureDir(tempDir);
    try {
        const blockDirPath = await addBlock(options, destDir, tempDir);
        await fse.removeSync(tempDir);
        addStateText.succeed(`模板添加成功, 文件路径：${blockDirPath}`);
    } catch(err) {
        fse.removeSync(tempDir);
        addStateText.fail('模板添加失败');
        throw err;
    }
};

async function addBlock(options, destDir, tempDir) {
    let {repoType, materialType, tempName} = options;
    const blockDirPath = path.resolve(destDir, tempName);

    addStateText = addState.start();
    return fse.pathExists(blockDirPath)
        .then((exists) => {
            if (exists) {
                addState.stop();
                return Promise.reject(new Error(`${blockDirPath} 文件夹已存在`));
            }
            return Promise.resolve();
        })
        .then((res) => {
            const tarballURL = getTarballUrl(repoType);
            return extractTarball({
                tarballURL,
                destDir: tempDir,
            });
        })
        .then(() => {
            return fse.mkdirp(blockDirPath);
        })
        .then(() => {
            return fse.copy(path.join(tempDir, `${materialType}/${tempName}/src`), blockDirPath, {
                overwrite: false,
                errorOnExist: true,
            });
        })
        .then(() => {
            return blockDirPath;
        });
}