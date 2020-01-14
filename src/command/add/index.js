// 命令管理
const commander = require('commander');
// 文件系统模块
const fse = require('fs-extra');
// 命令行交互工具
const inquirer = require('inquirer');
// 命令行中显示加载中
const ora = require('ora');
// 驼峰命名
const camelCase = require('camelcase');
const Git = require('../../tools/git');
const { TEMP_PATH, orgName } = require('../../../config')

class Download {
  constructor() {
    this.git = new Git();
    this.commander = commander;
    this.inquirer = inquirer;
    this.getProList = ora('获取项目列表...');
    this.getMatList = ora('获取素材类型...');
    this.getTmpList = ora('获取模板列表');
  }

  run() {
    this.commander
      .command('add [name]')
      .description('从远程下载代码到本地...')
      .action(async (name) => {
        // add 命令带参数
        const exampleStr = 'example：@yolkpie/vue-entry-card-block'
        if (name && name.toString().length) {
          // name规则 example：@yolkpie/vue-entry-card-block
          // 1. 以@yolkpie开头，与模板名称以/分隔
          // 2. 以react或者vue开头
          // 3. 以block或component结束
          // 4. 模板名称为小写，以-分隔
          name = name.toString()
          if (name.startsWith('@yolkpie/')) {
            name = name.split('/').length > 1 ? name.split('/')[1] : ''
            const tempArr = name.split('-')
            if (tempArr.length >= 3) {
              const repoType = tempArr[0]
              const materialType = tempArr[tempArr.length - 1]
              let tempName = name.substring(name.indexOf('-') + 1, name.lastIndexOf('-'));
              // 将entry-card 转换为EntryCard
              tempName = camelCase(tempName, {pascalCase: true});
              this.downloadTemplate(`${repoType}-materials`, `${materialType}s`, tempName);
            } else {
              console.log(`模板名称格式不正确，${exampleStr}`)
            }
          } else {
            console.log(`模板名称必须以@yolkpie开头，${exampleStr}`)
          }
        } else {
          // 不带参数，按照指引下载
          this.guideDownload();
        }
      })
      .on('--help', () => {
        console.log('');
        console.log('Examples:');
        console.log('  $ yolkworks add');
        console.log('  $ yolkworks add @yolkpie/vue-entry-card-block');
      });

    this.commander.parse(process.argv);
  }

  // 按照指引下载
  async guideDownload() {
    let getProListLoad;
    let getMatListLoad;
    let getTmpListLoad;
    let repos;
    let materials;
    let templates;

    // 获取所在项目组的所有素材项目（素材项目以materials结尾）
    try {
      getProListLoad = this.getProList.start();
      repos = await this.git.getProjectList();
      repos = repos.filter(({name}) => name.endsWith('materials'))
      getProListLoad.succeed('获取项目列表成功');
    } catch (error) {
      console.log(error);
      getProListLoad.fail('获取项目列表失败...');
      process.exit(-1);
    }

    // 向用户咨询想要使用的模板类型
    if (repos.length === 0) {
      console.log('\n可以使用的项目模板数为 0, 肯定是配置错啦~~\n'.red);
      process.exit(-1);
    }
    const proChoices = repos.map(({name}) => name.split('-')[0] + '项目');
    const proQuestions = [
      {
        type: 'list',
        name: 'repo',
        message: '请选择你想要使用的项目模板',
        choices: proChoices,
      },
    ];
    let {repo} = await this.inquirer.prompt(proQuestions);
    repo = repo.replace('项目', '') + '-materials';


    //向用户咨询想要使用的素材类型
    try {
      getMatListLoad = this.getMatList.start();
      materials = await this.git.getMaterialList(repo);
      materials = materials.filter(({type}) => type === 'dir')
      getMatListLoad.succeed('获取素材类型成功');
    } catch (error) {
      console.log(error);
      getMatListLoad.fail('获取素材类型失败...');
      process.exit(-1);
    }
    const matChoices = materials.slice();
    const matQuestions = [
      {
        type: 'list',
        name: 'material',
        message: '请选择你想要使用的素材类型',
        choices: matChoices,
      },
    ];
    const {material} = await this.inquirer.prompt(matQuestions);


    //向用户咨询想要下载的模板
    try {
      getTmpListLoad = this.getTmpList.start();
      templates = await this.git.getTemplateList(repo, material);
      templates = templates.filter(({type}) => type === 'dir')
      getTmpListLoad.succeed('获取模板列表成功');
    } catch (error) {
      console.log(error);
      getTmpListLoad.fail('获取模板列表失败...');
      process.exit(-1);
    }
    const tmpChoices = templates.slice();
    const tmpQuestions = [
      {
        type: 'list',
        name: 'template',
        message: '请选择你想要使用的模板',
        choices: tmpChoices,
      },
    ];
    const {template} = await this.inquirer.prompt(tmpQuestions);

    // 下载模板
    this.downloadTemplate(repo, material, template);
  }

  async downloadTemplate(repoType, materialType, tempName){
    const options = {
      repoType,
      materialType,
      tempName
    }
    try {
      await require('./addBlockToProject')(options);
    } catch (err) {
      await fse.remove(TEMP_PATH);
      console.log('添加模板失败', err.message);
      console.error(err.stack);
      process.exit(1);
    }
  }
}
const D = new Download();
D.run();