// pages/index/index.js

// --- 数据改为外置 JSON 加载 ---
const mediumsData = require('../../data/mediums.js');
const stylesData = require('../../data/styles.js');
const compositionsData = require('../../data/compositions.js');
const lightsData = require('../../data/lights.js');
const qualitiesData = require('../../data/qualities.js');
const parametersData = require('../../data/parameters.js');
// ------------------------------------------

Page({
  data: {
    prompt_en: '',
    prompt_zh: '',
    subject: '',
    subject_en: '',
    translating: false,
    categories: [
      { key: 'mediums', title: '媒介' },
      { key: 'styles', title: '艺术风格' },
      { key: 'compositions', title: '视角构图' },
      { key: 'lights', title: '光影色调' },
      { key: 'qualities', title: '质量' },
      { key: 'parameters', title: 'AR 比例' },
    ],
    pickerData: {},
    selectedIndexes: {
      mediums: 0, styles: 0, compositions: 0, details: 0, lights: 0, qualities: 0, parameters: 0
    },
    // [逻辑重构] 存储完整的选中对象，而不仅仅是值
    selectedItems: {
      mediums: null, styles: null, compositions: null, lights: null, qualities: null, parameters: null
    },
  },

  onLoad: function (options) {
    const addPlaceholder = (arr, text) => [{ name_zh: text, name_en: null }, ...arr];
    this.setData({
      'pickerData.mediums': addPlaceholder(mediumsData, '请选择媒介'),
      'pickerData.styles': addPlaceholder(stylesData, '请选择艺术风格'),
      'pickerData.compositions': addPlaceholder(compositionsData, '请选择视角构图'),
      'pickerData.lights': addPlaceholder(lightsData, '请选择光影色调'),
      'pickerData.qualities': addPlaceholder(qualitiesData, '请选择质量'),
      'pickerData.parameters': addPlaceholder(parametersData, '请选择AR 比例'),
    });
  },
  
  // 分享给朋友
  onShareAppMessage() {
    return {
      title: 'AI绘画提示词配置',
      path: '/pages/index/index',
      imageUrl: '/pages/index/images/top_background.jpeg'
    };
  },

  handleSubjectInput: function (e) {
    const value = e.detail.value;
    this.setData({ subject: value });
    // 防抖调用翻译
    if (!this.debouncedTranslate) {
      this.debouncedTranslate = this.createDebounced(this.translateSubject, 400);
    }
    this.debouncedTranslate(value);
    this.updatePrompt();
  },

  handlePickerChange: function (e) {
    const { category } = e.currentTarget.dataset;
    const index = e.detail.value;
    const item = this.data.pickerData[category][index]; // 获取完整的选中对象

    this.setData({
      [`selectedIndexes.${category}`]: index,
      [`selectedItems.${category}`]: item.name_en ? item : null, // 如果是占位符，则存为null
    });
    this.updatePrompt();
  },

  updatePrompt: function () {
    const { subject, selectedItems } = this.data;
    const tagOrder = ['subject', 'mediums', 'styles', 'compositions', 'lights', 'qualities', 'parameters'];
    
    // [逻辑重构] 并行生成中英文两个数组
    let promptArray_en = [];
    let promptArray_zh = [];

    tagOrder.forEach(category => {
      if (category === 'subject') {
        if (subject) {
          promptArray_en.push((this.data.subject_en || subject).trim());
          promptArray_zh.push(subject.trim());
        }
      } else {
        const item = selectedItems[category];
        if (item) {
          if (category === 'parameters') {
            promptArray_en.push(item.name_en.trim());
            promptArray_zh.push(item.name_zh.trim());
          } else {
            promptArray_en.push(item.name_en);
            promptArray_zh.push(item.name_zh);
          }
        }
      }
    });
    
    const finalPrompt_en = promptArray_en.join(', ').replace(/, (--[a-zA-Z0-9\s:]+)/g, ' $1').trim();
    const finalPrompt_zh = promptArray_zh.join('，').trim();

    this.setData({ 
      prompt_en: finalPrompt_en,
      prompt_zh: finalPrompt_zh
    });
  },

  copyPrompt: function () {
    if (!this.data.prompt_en) {
      wx.showToast({ title: '没有内容可复制', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: this.data.prompt_en, // 复制英文版本
      success: () => wx.showToast({ title: '复制成功' }),
    });
  },

  copyPromptZh: function () {
    if (!this.data.prompt_zh) {
      wx.showToast({ title: '没有内容可复制', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: this.data.prompt_zh, // 复制中文版本
      success: () => wx.showToast({ title: '复制成功' }),
    });
  },

  createDebounced: function (fn, delay) {
    let timer = null;
    return (value) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.call(this, value), delay);
    };
  },

  translateSubject: function (text) {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      this.setData({ subject_en: '' });
      this.updatePrompt();
      return;
    }
    this.setData({ translating: true });
    const that = this;
    wx.request({
      url: 'https://www.qinghanju.cn/translate',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: { text: trimmed },
      success(res) {
        const translated = (res && res.data && res.data.translated) || '';
        that.setData({ subject_en: translated });
        that.updatePrompt();
      },
      fail(err) {
        console.error('translate fail', err);
        wx.showToast({ title: '翻译失败，请稍后重试', icon: 'none' });
        that.setData({ subject_en: '' });
        that.updatePrompt();
      },
      complete() {
        that.setData({ translating: false });
      }
    });
  },
});
