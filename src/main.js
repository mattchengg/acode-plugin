import plugin from '../plugin.json';

const loader = acode.require("loader");
const toast = acode.require('toast');

class AcodeWakatime {

  async init() {
  	this.showWelcomeMessage();
  	}
  	
  showWelcomeMessage() {
        // 例如：顯示一個歡迎提示
        toast("", 5000);
        }
        
  downloadLatestWakatime() {
  	try {
          const response = await fetch("https://api.github.com/repos/wakatime/wakatime-cli/releases/latest");
          
          if(!response.ok){
          	toast("error download wakatime", 3000)
          }
          
  async destroy() {
      
  }
}

if (window.acode) {
  const acodePlugin = new AcodeWakatime();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    acodePlugin.baseUrl = baseUrl;
    await acodePlugin.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}
