import plugin from '../plugin.json';

class WakaTimePlugin {
  constructor() {
    this.baseURL = 'https://wakatime.com/api/v1';
    this.apiKey = '';
    this.lastHeartbeat = Date.now();
    this.heartbeatThreshold = 120000; // 2 minutes in milliseconds
  }

  async init() {
    // 創建設置項
    editorManager.editor.commands.addCommand({
      name: 'wakatime-settings',
      description: 'WakaTime Settings',
      exec: () => this.showSettings()
    });

    // 從本地存儲加載API密鑰
    this.apiKey = localStorage.getItem('wakatime_api_key') || '';
    
    if (!this.apiKey) {
      this.showSettings();
    }

    // 監聽編輯器事件
    editorManager.editor.on('change', () => {
      this.handleActivity();
    });
  }

  async handleActivity() {
    const now = Date.now();
    if (now - this.lastHeartbeat < this.heartbeatThreshold) {
      return;
    }

    const currentFile = editorManager.activeFile;
    if (!currentFile) return;

    try {
      await this.sendHeartbeat({
        entity: currentFile.filename,
        type: 'file',
        time: now / 1000,
        project: this.getProjectName(),
        language: this.getFileLanguage(currentFile.filename)
      });
      
      this.lastHeartbeat = now;
    } catch (error) {
      console.error('WakaTime heartbeat error:', error);
    }
  }

  async sendHeartbeat(data) {
    if (!this.apiKey) return;

    try {
      const response = await axios.post(`${this.baseURL}/users/current/heartbeats`, data, {
        headers: {
          'Authorization': `Basic ${btoa(this.apiKey)}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  getProjectName() {
    // 獲取項目名稱的邏輯
    return 'acode-project';
  }

  getFileLanguage(filename) {
    // 根據文件擴展名判斷語言
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'JavaScript',
      'py': 'Python',
      'html': 'HTML',
      'css': 'CSS',
      // 添加更多擴展名映射
    };
    return languageMap[ext] || 'Unknown';
  }

  async showSettings() {
    const dialog = acode.require('dialogBox');
    
    const $input = document.createElement('input');
    $input.type = 'text';
    $input.value = this.apiKey;
    $input.placeholder = 'Enter WakaTime API Key';
    
    const save = async () => {
      this.apiKey = $input.value.trim();
      localStorage.setItem('wakatime_api_key', this.apiKey);
      dialog.hide();
    };

    dialog.show('WakaTime Settings', $input, save);
  }

  async destroy() {
    // 清理事件監聽器
    editorManager.editor.off('change', this.handleActivity);
  }
}

// 導出插件
if (window.acode) {
  const acodePlugin = new WakaTimePlugin();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    await acodePlugin.init();
  });
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}