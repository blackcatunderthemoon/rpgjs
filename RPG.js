// DZMM Ready Promise（由 HTML 提供）
// 如果独立运行，创建兜底 Promise
if (!window.dzmmReady) {
  window.dzmmReady = new Promise((resolve) => {
    try {
      if (window.dzmm && typeof window.dzmm.completions === 'function') {
        resolve();
        return;
      }
    } catch (_) {}
    window.addEventListener('message', function handler(event) {
      if (event.data?.type === 'dzmm:ready') {
        window.removeEventListener('message', handler);
        resolve();
      }
    });
  });
}
const dzmmReady = window.dzmmReady;

const SAVE_KEY = 'rpg_adventure_save_v2';

  // 抽象名词黑名单（不允许作为道具）
  const ABSTRACT_ITEM_BLOCKLIST = ['情报','线索','传闻','消息','信息','知识','心情','灵感'];

  // 预置道具与素材属性定义（AI 自定义的会存到 itemDefs 中并共存）
  const BASE_ITEM_DEFS = {
    '小型生命药水': { name:'小型生命药水', category:'消耗品', desc:'回复少量HP', usable:true, consumable:true, useEffects:[{ type:'hp+', value:30 }], buyable:true, buyPrice:20, sellable:true, sellPrice:10 },
    '中型生命药水': { name:'中型生命药水', category:'消耗品', desc:'回复中量HP', usable:true, consumable:true, useEffects:[{ type:'hp+', value:60 }], buyable:true, buyPrice:50, sellable:true, sellPrice:25 },
    '小型魔力药水': { name:'小型魔力药水', category:'消耗品', desc:'回复少量MP', usable:true, consumable:true, useEffects:[{ type:'mp+', value:20 }], buyable:true, buyPrice:20, sellable:true, sellPrice:10 },
    '中型魔力药水': { name:'中型魔力药水', category:'消耗品', desc:'回复中量MP', usable:true, consumable:true, useEffects:[{ type:'mp+', value:40 }], buyable:true, buyPrice:50, sellable:true, sellPrice:25 },
    '解毒剂': { name:'解毒剂', category:'消耗品', desc:'解除轻微毒素', usable:true, consumable:true, useEffects:[], buyable:true, buyPrice:30, sellable:true, sellPrice:15 },
    '草药': { name:'草药', category:'素材', desc:'常见的药草原料，可用于调和或售出', usable:false, consumable:false, useEffects:[], buyable:false, buyPrice:0, sellable:true, sellPrice:6 },
    // 原始素材（怪物掉落）
    '史莱姆胶': { name:'史莱姆胶', category:'素材', desc:'黏乎乎的素材', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:10, sellable:true, sellPrice:6 },
    '蜘蛛丝': { name:'蜘蛛丝', category:'素材', desc:'结实的丝线', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:14, sellable:true, sellPrice:8 },
    '魔法石': { name:'魔法石', category:'素材', desc:'蕴含魔力的矿石', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:27, sellable:true, sellPrice:15 },
    '破旧匕首': { name:'破旧匕首', category:'素材', desc:'需要打磨的匕首', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:20, sellable:true, sellPrice:12 },
    '羽毛': { name:'羽毛', category:'素材', desc:'轻盈的羽毛', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:9, sellable:true, sellPrice:5 },
    '狼牙': { name:'狼牙', category:'素材', desc:'坚硬的狼牙', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:18, sellable:true, sellPrice:10 },
    '兽人战斧': { name:'兽人战斧', category:'素材', desc:'粗糙但沉重的斧头', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:35, sellable:true, sellPrice:20 },
    '魅惑宝石': { name:'魅惑宝石', category:'素材', desc:'散发微光的宝石', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:63, sellable:true, sellPrice:35 },
    '吸血鬼獠牙': { name:'吸血鬼獠牙', category:'素材', desc:'带寒意的獠牙', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:54, sellable:true, sellPrice:30 },
    '恶魔之角': { name:'恶魔之角', category:'素材', desc:'不祥的角', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:72, sellable:true, sellPrice:40 },
    // 植物型素材
    '植物叶': { name:'植物叶', category:'素材', desc:'普通的植物叶片', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:7, sellable:true, sellPrice:4 },
    '木质核心': { name:'木质核心', category:'素材', desc:'树木的核心部分', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:25, sellable:true, sellPrice:14 },
    '树液': { name:'树液', category:'素材', desc:'树木分泌的液体', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:14, sellable:true, sellPrice:8 },
    '花瓣': { name:'花瓣', category:'素材', desc:'食人花的花瓣', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:22, sellable:true, sellPrice:12 },
    // 史莱姆变种素材
    '胶体': { name:'胶体', category:'素材', desc:'粘性胶体物质', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:12, sellable:true, sellPrice:7 },
    '蓝色胶体': { name:'蓝色胶体', category:'素材', desc:'海生生物的胶体', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:16, sellable:true, sellPrice:9 },
    '污浊胶体': { name:'污浊胶体', category:'素材', desc:'沼泽中的胶体', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:20, sellable:true, sellPrice:11 },
    // 魔法物质素材
    '魔力碎片': { name:'魔力碎片', category:'素材', desc:'蕴含魔力的碎片', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:32, sellable:true, sellPrice:18 },
    '石心': { name:'石心', category:'素材', desc:'石像鬼的核心', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:40, sellable:true, sellPrice:22 },
    '铜粉': { name:'铜粉', category:'素材', desc:'活铜甲掉落的粉末', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:18, sellable:true, sellPrice:10 },
    // 昆虫型素材
    '虫壳': { name:'虫壳', category:'素材', desc:'昆虫的壳质外骨骼', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:11, sellable:true, sellPrice:6 },
    '蜂蜜': { name:'蜂蜜', category:'素材', desc:'甜美的蜂蜜', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:16, sellable:true, sellPrice:9 },
    '甲壳': { name:'甲壳', category:'素材', desc:'甲虫王的坚硬外壳', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:29, sellable:true, sellPrice:16 },
    '金色翅': { name:'金色翅', category:'素材', desc:'闪闪发光的翅膀', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:24, sellable:true, sellPrice:13 },
    // 爬虫类素材
    '蛇鳞': { name:'蛇鳞', category:'素材', desc:'蛇类的鳞片', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:14, sellable:true, sellPrice:8 },
    '双蛇鳞': { name:'双蛇鳞', category:'素材', desc:'双头蛇的稀有鳞片', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:31, sellable:true, sellPrice:17 },
    '雪白鳞': { name:'雪白鳞', category:'素材', desc:'白蛇的洁白鳞片', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:27, sellable:true, sellPrice:15 },
    '蛇胆': { name:'蛇胆', category:'素材', desc:'蛇体内的器官', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:25, sellable:true, sellPrice:14 },
    '龙鳞': { name:'龙鳞', category:'素材', desc:'亚龙的龙鳞', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:50, sellable:true, sellPrice:28 },
    '龙血': { name:'龙血', category:'素材', desc:'亚龙的血液', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:58, sellable:true, sellPrice:32 },
    // 鸟人型素材
    '金鹰羽': { name:'金鹰羽', category:'素材', desc:'鹰身女妖的黄金羽毛', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:25, sellable:true, sellPrice:14 },
    '黑羽毛': { name:'黑羽毛', category:'素材', desc:'乌鸦精的黑色羽毛', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:20, sellable:true, sellPrice:11 },
    // 妖精型素材
    '妖精粉': { name:'妖精粉', category:'素材', desc:'小妖精散落的魔法粉', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:18, sellable:true, sellPrice:10 },
    '仙露': { name:'仙露', category:'素材', desc:'小山仙女的甘露', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:22, sellable:true, sellPrice:12 },
    // 不死型素材
    '骨头': { name:'骨头', category:'素材', desc:'骷髅的骨骼', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:12, sellable:true, sellPrice:7 },
    '腐烂肉': { name:'腐烂肉', category:'素材', desc:'尸体怪的腐烂肉质', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:11, sellable:true, sellPrice:6 },
    '破布': { name:'破布', category:'素材', desc:'破损的布料', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:5, sellable:true, sellPrice:3 },
    '幽魂之心': { name:'幽魂之心', category:'素材', desc:'法术·丘比特的魂心', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:45, sellable:true, sellPrice:25 },
    // 兽人型素材
    '巨人骨': { name:'巨人骨', category:'素材', desc:'独眼巨人的骨骼', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:43, sellable:true, sellPrice:24 },
    // 恶魔型素材
    '恶魔之爪': { name:'恶魔之爪', category:'素材', desc:'恶魔的锋利爪子', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:50, sellable:true, sellPrice:28 },
    '艾薇之泪': { name:'艾薇之泪', category:'素材', desc:'艾薇音的泪珠', usable:false, consumable:false, useEffects:[], buyable:true, buyPrice:47, sellable:true, sellPrice:26 }
  };

  const ITEM_DEF_FLAG_USABLE = 1;
  const ITEM_DEF_FLAG_CONSUMABLE = 1 << 1;
  const ITEM_DEF_FLAG_BUYABLE = 1 << 2;
  const ITEM_DEF_FLAG_SELLABLE = 1 << 3;

  const ITEM_NAME_ALIAS_TABLE = {
    '药草': '草药',
    '草藥': '草药',
    'herb': '草药',
    'Herb': '草药'
  };

  const MAX_PROMPT_KNOWN_ITEMS = 25;

  const ITEM_PROMPT_EFFECT_SUMMARY_MAP = {
    'hp+': 'HP',
    'hpMax+': '最大HP',
    'mp+': 'MP',
    'mpMax+': '最大MP',
    'atk+': '攻击',
    'def+': '防御',
    'gold+': '金币'
  };

  const sanitizeItemKey = (name) => String(name || '').trim().replace(/[\s·•．。]/g, '').toLowerCase();

  const packUseEffect = (effect) => {
    if(!effect || typeof effect !== 'object') return null;
    const base = [effect.type || ''];
    if('value' in effect) base.push(effect.value);
    else base.push(null);
    const extras = {};
    if(effect.name !== undefined) extras.n = effect.name;
    if(effect.qty !== undefined) extras.q = effect.qty;
    if(effect.target !== undefined) extras.tg = effect.target;
    if(effect.to !== undefined) extras.to = effect.to;
    if(effect.toByName !== undefined) extras.tb = effect.toByName;
    if(effect.desc !== undefined) extras.d = effect.desc;
    if(Object.keys(extras).length > 0) base.push(extras);
    return base;
  };

  const unpackUseEffect = (entry) => {
    if(!Array.isArray(entry) || entry.length === 0) return null;
    const [type, value, extras] = entry;
    const effect = { type }; if(value !== undefined && value !== null) effect.value = value;
    if(extras && typeof extras === 'object'){
      if(extras.n !== undefined) effect.name = extras.n;
      if(extras.q !== undefined) effect.qty = extras.q;
      if(extras.tg !== undefined) effect.target = extras.tg;
      if(extras.to !== undefined) effect.to = extras.to;
      if(extras.tb !== undefined) effect.toByName = extras.tb;
      if(extras.d !== undefined) effect.desc = extras.d;
    }
    return effect;
  };

  const packItemDef = (def) => {
    if(!def || typeof def !== 'object') return null;
    const flags = (def.usable?ITEM_DEF_FLAG_USABLE:0)
      | (def.consumable?ITEM_DEF_FLAG_CONSUMABLE:0)
      | (def.buyable?ITEM_DEF_FLAG_BUYABLE:0)
      | (def.sellable?ITEM_DEF_FLAG_SELLABLE:0);
    const effects = Array.isArray(def.useEffects) ? def.useEffects.map(packUseEffect).filter(Boolean) : [];
    return [
      def.name,
      def.category || '素材',
      def.desc || '',
      flags,
      effects,
      Number(def.buyPrice) || 0,
      Number(def.sellPrice) || 0
    ];
  };

  const unpackItemDef = (entry) => {
    if(!Array.isArray(entry)) return null;
    const [name, category, desc, flags=0, effectsPacked=[], buyPrice=0, sellPrice=0] = entry;
    const useEffects = Array.isArray(effectsPacked) ? effectsPacked.map(unpackUseEffect).filter(Boolean) : [];
    return {
      name: name || '',
      category: category || '素材',
      desc: desc || '',
      usable: Boolean(flags & ITEM_DEF_FLAG_USABLE),
      consumable: Boolean(flags & ITEM_DEF_FLAG_CONSUMABLE),
      buyable: Boolean(flags & ITEM_DEF_FLAG_BUYABLE),
      sellable: Boolean(flags & ITEM_DEF_FLAG_SELLABLE),
      useEffects,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0
    };
  };

  // ==================== 解析辅助 ====================
  function extractBracketArrays(input){
    if(!input) return [];
    return Array.from(String(input).matchAll(/\[[\s\S]*?\]/g)).map(m=>m[0]);
  }
  function sanitizeJsonArrayString(s){
    let t = String(s);
    // 修复常见错误："text","xxx" => "text":"xxx"
    t = t.replace(/"text"\s*,\s*"/g, '"text":"');
    // 修复数组元素间多余引号：},"{ => },{
    t = t.replace(/},\s*"\s*\{/g, '},{');
    // 去除结尾多余逗号
    t = t.replace(/,\s*\]/g, ']');
    // 去掉围栏符
    t = t.replace(/```[\s\S]*?```/g, '');
    return t.trim();
  }
  function tryParseJsonArray(s){
    try{ return JSON.parse(s); }catch(_){ /* ignore */ }
    try{ return JSON.parse(sanitizeJsonArrayString(s)); }catch(_){ return null; }
  }

  // ==================== 怪物数据库 ====================
  const MONSTERS = {
    // 魔物型 (无智能)
    '史莱姆': { type: '魔物', hp: 30, attack: 8, defense: 2, exp: 10, gold: 5, drops: ['史莱姆胶'], regions: ['阿姆斯特王国','南方联盟','新手平原','平原东侧','温泉山道'] },
    '巨型蜘蛛': { type: '魔物', hp: 50, attack: 12, defense: 4, exp: 20, gold: 10, drops: ['蜘蛛丝'], regions: ['青葱森林','迷雾森林','东瀛大和国','暗影洞穴'] },
    '岩石傀儡': { type: '魔物', hp: 80, attack: 15, defense: 10, exp: 30, gold: 15, drops: ['魔法石'], regions: ['荒野废土','火山群','风蚀峡谷'] },

    // 植物型
    '阿喀德提': { type: '植物', hp: 35, attack: 9, defense: 5, exp: 12, gold: 6, drops: ['植物叶'], regions: ['新手平原','青葱森林','银杉丘陵'] },
    '巨树守卫': { type: '植物', hp: 75, attack: 13, defense: 8, exp: 32, gold: 18, drops: ['木质核心','树液'], regions: ['青葱森林','迷雾森林','阿姆斯特王国'], canTalk: false },
    '食人花': { type: '植物', hp: 55, attack: 16, defense: 3, exp: 25, gold: 14, drops: ['花瓣'], regions: ['南方联盟','黑雾沼泽','湖区水乡'] },

    // 半兽人生物型
    '红色史莱姆': { type: '半兽人生物', hp: 45, attack: 11, defense: 4, exp: 18, gold: 9, drops: ['胶体'], regions: ['新手平原','温泉山道','商会首都'], canTalk: false },
    '海生史莱姆': { type: '半兽人生物', hp: 50, attack: 13, defense: 5, exp: 22, gold: 11, drops: ['蓝色胶体'], regions: ['黄金港','河畔市集','镜湖岸'] },
    '污地史莱姆': { type: '半兽人生物', hp: 60, attack: 14, defense: 6, exp: 28, gold: 15, drops: ['污浊胶体'], regions: ['黑雾沼泽','腐泥滩'] },

    // 魔法物质型
    '魔像': { type: '魔法物质', hp: 65, attack: 15, defense: 9, exp: 30, gold: 16, drops: ['魔力碎片'], regions: ['环城六都','魔王城','火山群'], canTalk: false },
    '石像鬼': { type: '魔法物质', hp: 85, attack: 18, defense: 11, exp: 42, gold: 24, drops: ['石心'], regions: ['魔王城','火山群','荒野废土'] },
    '活铜甲': { type: '魔法物质', hp: 55, attack: 17, defense: 7, exp: 26, gold: 14, drops: ['铜粉'], regions: ['矿脉群','工匠工坊','深层矿坑'] },

    // 昆虫型
    '大蛾蛀': { type: '昆虫', hp: 38, attack: 10, defense: 3, exp: 14, gold: 7, drops: ['虫壳'], regions: ['青葱森林','新手平原','银杉丘陵'] },
    '蜜蜂': { type: '昆虫', hp: 28, attack: 9, defense: 2, exp: 11, gold: 5, drops: ['蜂蜜'], regions: ['新手平原','平原西侧','奥斯蒙王国'] },
    '甲虫王': { type: '昆虫', hp: 70, attack: 19, defense: 9, exp: 38, gold: 21, drops: ['甲壳'], regions: ['深层矿坑','沙海大漠','黑雾沼泽'] },
    '金翅蝴蝶': { type: '昆虫', hp: 42, attack: 14, defense: 4, exp: 20, gold: 12, drops: ['金色翅'], regions: ['商会首都','樱都','湖区水乡'], canTalk: false },

    // 爬虫类型
    '蛇': { type: '爬虫类', hp: 48, attack: 13, defense: 4, exp: 19, gold: 10, drops: ['蛇鳞'], regions: ['沙海大漠','黑雾沼泽','东瀛大和国'] },
    '双头蛇': { type: '爬虫类', hp: 72, attack: 17, defense: 7, exp: 36, gold: 20, drops: ['双蛇鳞'], regions: ['魔王领地','裂隙峡谷','黑雾沼泽'] },
    '白蛇': { type: '爬虫类', hp: 65, attack: 16, defense: 8, exp: 32, gold: 18, drops: ['雪白鳞', '蛇胆'], regions: ['温泉山道','银杉丘陵'] },
    '亚龙': { type: '爬虫类', hp: 95, attack: 24, defense: 11, exp: 52, gold: 32, drops: ['龙鳞','龙血'], regions: ['火山群','风蚀峡谷','魔王城'], canTalk: false },

    // 鸟人型
    '哈比': { type: '鸟人', hp: 35, attack: 14, defense: 2, exp: 18, gold: 12, drops: ['羽毛'], regions: ['奥斯蒙王国','风蚀峡谷','沙海大漠'], canTalk: false },
    '鹰身女妖': { type: '鸟人', hp: 58, attack: 16, defense: 5, exp: 28, gold: 16, drops: ['金鹰羽'], regions: ['风蚀峡谷','荒野废土','环城六都'], canTalk: true },
    '乌鸦精': { type: '鸟人', hp: 52, attack: 15, defense: 4, exp: 24, gold: 14, drops: ['黑羽毛'], regions: ['迷雾森林','黑雾沼泽','魔王城'] },

    // 妖精型
    '小妖精': { type: '妖精', hp: 32, attack: 11, defense: 3, exp: 13, gold: 8, drops: ['妖精粉'], regions: ['青葱森林','银杉丘陵','樱都'], canTalk: false },
    '小山仙女': { type: '妖精', hp: 48, attack: 13, defense: 5, exp: 22, gold: 13, drops: ['仙露'], regions: ['银杉丘陵','温泉山道','绿洲城'], canTalk: true },

    // 不死型
    '骷髅': { type: '不死', hp: 44, attack: 12, defense: 5, exp: 20, gold: 11, drops: ['骨头'], regions: ['城外墓地','荒野废土','黑雾沼泽'] },
    '尸体怪': { type: '不死', hp: 58, attack: 14, defense: 7, exp: 27, gold: 15, drops: ['腐烂肉', '破布'], regions: ['黑雾沼泽','魔王城','环城六都'] },
    '法术·丘比特': { type: '不死', hp: 68, attack: 18, defense: 8, exp: 35, gold: 19, drops: ['幽魂之心'], regions: ['魔王城','环城六都','迷雾森林'], canTalk: true },

    // 兽人型 (低智能,部分会说话)
    '哥布林': { type: '兽人', hp: 40, attack: 10, defense: 3, exp: 15, gold: 8, drops: ['破旧匕首'], regions: ['新手平原','青葱森林','南方联盟','东瀛大和国'], canTalk: false },
    '狼人': { type: '兽人', hp: 70, attack: 18, defense: 6, exp: 35, gold: 20, drops: ['狼牙'], regions: ['青葱森林','迷雾森林','裂隙峡谷'], canTalk: true },
    '兽人战士': { type: '兽人', hp: 90, attack: 22, defense: 8, exp: 45, gold: 30, drops: ['兽人战斧'], regions: ['奥斯蒙王国','风蚀峡谷','火山群'], canTalk: true },
    '独眼巨人': { type: '兽人', hp: 110, attack: 26, defense: 12, exp: 55, gold: 38, drops: ['巨人骨'], regions: ['风蚀峡谷','火山群','荒野废土'], canTalk: true },

    // 恶魔型 (高智能,都会说话)
    '魅魔': { type: '恶魔', hp: 60, attack: 16, defense: 5, exp: 40, gold: 35, drops: ['魅惑宝石'], regions: ['魔王领地','环城六都','迷雾森林'], canTalk: true },
    '吸血鬼': { type: '恶魔', hp: 100, attack: 25, defense: 10, exp: 60, gold: 50, drops: ['吸血鬼獠牙'], regions: ['魔王领地','裂隙峡谷','黑雾沼泽'], canTalk: true },
    '地狱恶魔': { type: '恶魔', hp: 120, attack: 30, defense: 12, exp: 80, gold: 70, drops: ['恶魔之角'], regions: ['魔王领地','火山群','荒野废土'], canTalk: true },
    '次级恶魔': { type: '恶魔', hp: 78, attack: 19, defense: 7, exp: 44, gold: 32, drops: ['恶魔之爪'], regions: ['环城六都','迷雾森林','黑雾沼泽'], canTalk: true },
    '艾薇音': { type: '恶魔', hp: 88, attack: 21, defense: 9, exp: 48, gold: 36, drops: ['艾薇之泪'], regions: ['魔王领地','迷雾森林','裂隙峡谷'], canTalk: true },
  };

  // ==================== 地图数据 ====================
  const WORLD_MAP = {
    // 北方：阿姆斯特王国（森林与丘陵，新手起点，有魔法学院）
    '阿姆斯特王国': {
      id: 'amus',
      desc: '北境森林与丘陵交错，学术与骑士并重，是多数旅者的起点。',
      areas: {
        '圣莉亚': {
          id: 'capital_yamato',
          desc: '阿姆斯特王国的首都，礼乐繁华，武艺与匠艺并盛。',
          locations: [
            { id:'ky_castle', name:'王城', type:'城堡', desc:'统治与典仪之地。', accessible:true, hasShop:false },
            { id:'ky_main_st_1', name:'第一大街', type:'城镇', desc:'人潮汹涌，店铺林立。', accessible:true, hasShop:true },
            { id:'ky_main_st_2', name:'第二大街', type:'城镇', desc:'艺伎与茶屋点缀其间。', accessible:true, hasShop:true },
            { id:'ky_blacksmith', name:'铁匠铺', type:'商店', desc:'可锻造与修理兵器。', accessible:true, hasShop:true },
            { id:'ky_shop', name:'万事屋', type:'商店', desc:'杂货与委托兼营。', accessible:true, hasShop:true },
            { id:'ky_church', name:'教会', type:'教会', desc:'祈祷与治疗。', accessible:true, hasShop:false },
            { id:'ky_guild', name:'佣兵公会', type:'建筑', desc:'领取悬赏与委托。', accessible:true, hasShop:false },
            { id:'ky_inn', name:'旅馆', type:'建筑', desc:'可休整恢复。', accessible:true, hasShop:false },
            { id:'ky_apothecary', name:'药铺', type:'商店', desc:'药剂与疗伤物资。', accessible:true, hasShop:true },
            { id:'ky_library', name:'图书馆', type:'建筑', desc:'典籍陈列，启迪心智。', accessible:true, hasShop:false },
            { id:'ky_warehouse', name:'仓库', type:'建筑', desc:'货物堆叠之处。', accessible:true, hasShop:false },
            { id:'ky_red_house', name:'醉红楼', type:'商店', desc:'歌舞雅宴，闲谈风月。', accessible:true, hasShop:true },
            { id:'ky_cemetery', name:'城外墓地', type:'建筑', desc:'静谧肃穆之地。', accessible:true, hasShop:false },
            { id:'ky_house_1', name:'居民房1', type:'民宅', desc:'普通住户的家。', accessible:true, hasShop:false },
            { id:'ky_house_2', name:'小别墅', type:'民宅', desc:'庭院雅致。', accessible:true, hasShop:false },
            { id:'ky_house_3', name:'居民房2', type:'民宅', desc:'柴门犬吠，炊烟袅袅。', accessible:true, hasShop:false }
          ]
        },
        '新手平原': {
          id: 'plain',
          desc: '开阔的草地，风险较低，适合练级与采集。',
          locations: [
            { id: 'town_start', name: '新手村', type: '城镇', desc:'宁静的小村庄，旅途起点，物资充足。', accessible: true, hasShop: true },
            { id: 'field1', name: '平原东侧', type: '野外', desc:'青草遍野，偶见史莱姆与哥布林。', accessible: true, hasShop: false },
            { id: 'field2', name: '平原西侧', type: '野外', desc:'地势平缓，适合新手练习。', accessible: true, hasShop: false },
            { id: 'academy', name: '王立魔法学院', type: '建筑', desc:'研习奥术之地，附属书店可采购基础卷轴。', accessible: true, hasShop: true },
            { id: 'north_post', name: '北方驿站', type: '驿站', desc:'通往他国的中转站。', accessible: true, hasShop: false },
          ]
        },
        '青葱森林': {
          id: 'forest',
          desc: '林木茂密，视野受限，常见哥布林与巨型蜘蛛。',
          locations: [
            { id: 'forest_entrance', name: '森林入口', type: '野外', desc:'进入森林的必经之地，偶有巡逻者。', accessible: true, hasShop: false },
            { id: 'forest_deep', name: '森林深处', type: '野外', desc:'阴暗潮湿，危险程度较高。', accessible: true, hasShop: false },
            { id: 'cabin', name: '猎人小屋', type: '建筑', desc:'经验丰富的猎人据点，能补给。', accessible: true, hasShop: true },
          ]
        },
        '银杉丘陵': {
          id: 'hills',
          desc: '连绵起伏的丘陵地，风涌草动易伏袭。',
          locations: [
            { id: 'hill_path', name: '丘陵山道', type: '野外', desc:'石径狭窄，需小心翼翼。', accessible: true, hasShop: false },
            { id: 'hunters_camp', name: '猎人营地', type: '建筑', desc:'可交易野外补给。', accessible: true, hasShop: true }
          ]
        }
      }
    },

    // 南方：南方联盟（贸易发达，矿区与大集市，湖河纵横）
    '南方联盟': {
      id: 'south',
      desc: '商队络绎不绝，港口与矿带支撑繁荣的贸易网络。',
      areas: {
        '商会首都': {
          id: 'capital_south',
          desc: '四方商会汇聚之都，法度森严，生意鼎盛。',
          locations: [
            { id:'sc_palace', name:'议政堡', type:'城堡', desc:'商会长老议事之所。', accessible:true, hasShop:false },
            { id:'sc_main_1', name:'第一大街', type:'城镇', desc:'货物堆叠如山。', accessible:true, hasShop:true },
            { id:'sc_main_2', name:'第二大街', type:'城镇', desc:'外邦商旅云集。', accessible:true, hasShop:true },
            { id:'sc_market', name:'大商场', type:'商店', desc:'集采与转运中心。', accessible:true, hasShop:true },
            { id:'sc_guild', name:'佣兵公会', type:'建筑', desc:'护送与讨伐任务。', accessible:true, hasShop:false },
            { id:'sc_forge', name:'铁匠铺', type:'商店', desc:'兵器护具交易。', accessible:true, hasShop:true },
            { id:'sc_church', name:'教会', type:'教会', desc:'救济与治疗。', accessible:true, hasShop:false },
            { id:'sc_inn', name:'旅馆', type:'建筑', desc:'远行者的落脚处。', accessible:true, hasShop:false },
            { id:'sc_apoth', name:'药铺', type:'商店', desc:'药材与药剂。', accessible:true, hasShop:true },
            { id:'sc_brothel', name:'醉红楼', type:'商店', desc:'歌舞升平的夜色。', accessible:true, hasShop:true },
            { id:'sc_house1', name:'居民房1', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false },
            { id:'sc_house2', name:'居民房2', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false }
          ]
        },
        '黄金港': {
          id: 'harbor',
          desc: '通商要塞，货物与情报在此交汇。',
          locations: [
            { id: 'grand_market', name: '中央大集市', type: '商店', desc:'琳琅满目的摊位，几乎可以买到一切。', accessible: true, hasShop: true },
            { id: 'riverside_bazaar', name: '河畔市集', type: '商店', desc:'水运商旅云集，价格公道。', accessible: true, hasShop: true },
            { id: 'dock', name:'码头区', type:'城镇', desc:'船只往来不绝。', accessible:true, hasShop:true },
            { id: 'tavern', name:'港口酒馆', type:'商店', desc:'情报与水手聚集地。', accessible:true, hasShop:true },
            { id: 'guild', name:'港务行会', type:'建筑', desc:'管理货单与税率。', accessible:true, hasShop:false },
            { id: 'warehouse', name:'仓储区', type:'建筑', desc:'货物堆叠如山。', accessible:true, hasShop:false },
            { id: 'temple', name:'航海神殿', type:'教会', desc:'祝祷风平浪静。', accessible:true, hasShop:false },
            { id: 'inn', name:'旅馆·海鸥', type:'建筑', desc:'水手常驻。', accessible:true, hasShop:false },
            { id: 'south_post', name: '南方驿站', type: '驿站', desc:'联通四国的枢纽。', accessible: true, hasShop: false }
          ]
        },
        '矿脉群': {
          id: 'mines',
          desc: '富饶矿脉延绵，偶有塌方与魔物滋生。',
          locations: [
            { id: 'open_pit', name: '露天矿场', type: '野外', desc:'工人忙碌采掘，防备盗匪。', accessible: true, hasShop: false },
            { id: 'deep_mine', name: '深层矿坑', type: '地下城', desc:'暗潮涌动，危机四伏。', accessible: true, hasShop: false },
            { id: 'forge', name: '工匠工坊', type: '建筑', desc:'加工矿石与装备的地方。', accessible: true, hasShop: true }
          ]
        },
        '湖区水乡': {
          id: 'lakes',
          desc: '湖河纵横，渔业与手工业发达。',
          locations: [
            { id: 'mirror_lake', name: '镜湖岸', type: '野外', desc:'湖面如镜，风光旖旎。', accessible: true, hasShop: false },
            { id: 'canal_town', name: '水巷', type: '建筑', desc:'水路密布的小镇。', accessible: true, hasShop: false },
            { id: 'fishing_port', name: '渔港', type: '商店', desc:'可以买到海产与补给。', accessible: true, hasShop: true }
          ]
        }
      }
    },

    // 西方：奥斯蒙王国（沙漠与峡谷，剑圣道场）
    '奥斯蒙王国': {
      id: 'west',
      desc: '风沙漫天的王国，尚武之风盛行。',
      areas: {
        '王都阿拉沙': {
          id: 'capital_west',
          desc: '剑与沙的王都，演武与商旅并存。',
          locations: [
            { id:'w_palace', name:'王城', type:'城堡', desc:'王权与军务中心。', accessible:true, hasShop:false },
            { id:'w_avenue1', name:'第一大街', type:'城镇', desc:'沙土铺地，商铺林立。', accessible:true, hasShop:true },
            { id:'w_avenue2', name:'第二大街', type:'城镇', desc:'武馆与餐馆相伴。', accessible:true, hasShop:true },
            { id:'w_blacksmith', name:'铁匠铺·热砂', type:'商店', desc:'重兵器名匠。', accessible:true, hasShop:true },
            { id:'w_shop', name:'商号·星月', type:'商店', desc:'从西域来的货物。', accessible:true, hasShop:true },
            { id:'w_guild', name:'佣兵公会', type:'建筑', desc:'沙盗悬赏与护镖。', accessible:true, hasShop:false },
            { id:'w_inn', name:'旅馆·流沙', type:'建筑', desc:'歇脚纳凉。', accessible:true, hasShop:false },
            { id:'w_temple', name:'风神教会', type:'教会', desc:'祝祷顺风与庇护。', accessible:true, hasShop:false },
            { id:'w_arena', name:'竞技场', type:'建筑', desc:'习武者比试之地。', accessible:true, hasShop:false },
            { id:'w_cemetery', name:'城外墓地', type:'建筑', desc:'风沙掩碑。', accessible:true, hasShop:false },
            { id:'w_house1', name:'居民房1', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false },
            { id:'w_house2', name:'居民房2', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false }
          ]
        },
        '绿洲城': {
          id: 'oasis_city',
          desc: '以绿洲为核心发展的贸易城镇。',
          locations: [
            { id:'oasis_center', name:'绿洲中心', type:'城镇', desc:'棕榈与水鸟成景。', accessible:true, hasShop:true },
            { id:'oasis_street1', name:'第一大街', type:'城镇', desc:'干果与香料飘香。', accessible:true, hasShop:true },
            { id:'oasis_street2', name:'第二大街', type:'城镇', desc:'丝绸与饰品集散。', accessible:true, hasShop:true },
            { id:'oasis_blacksmith', name:'铁匠铺', type:'商店', desc:'轻型兵器见长。', accessible:true, hasShop:true },
            { id:'oasis_shop', name:'杂货店', type:'商店', desc:'旅用补给齐全。', accessible:true, hasShop:true },
            { id:'oasis_guild', name:'佣兵公会', type:'建筑', desc:'接取绿洲护卫任务。', accessible:true, hasShop:false },
            { id:'oasis_inn', name:'旅馆·绿荫', type:'建筑', desc:'驼队歇脚处。', accessible:true, hasShop:false },
            { id:'oasis_house1', name:'居民房1', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false },
            { id:'oasis_house2', name:'居民房2', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false },
            { id:'oasis_post', name:'西部驿站', type:'驿站', desc:'通往他国的驿路节点。', accessible:true, hasShop:false }
          ]
        },
        '沙海大漠': {
          id: 'desert',
          desc: '日夜温差极大，绿洲稀少。',
          locations: [
            { id: 'dunes', name: '流沙之野', type: '野外', desc:'风蚀地貌，行动艰难。', accessible: true, hasShop: false },
            { id: 'oasis', name: '大漠绿洲', type: '野外', desc:'旅者歇脚之地。', accessible: true, hasShop: false },
            { id: 'caravan_post', name: '商旅驿站', type: '驿站', desc:'跨国通行与补给。', accessible: true, hasShop: false }
          ]
        },
        '剑圣道场': {
          id: 'dojo',
          desc: '剑道信仰之地，高手云集。',
          locations: [
            { id: 'dojo_court', name: '道场庭院', type: '建筑', desc:'剑士修行之所。', accessible: true, hasShop: false },
            { id: 'trial_tower', name: '试炼之塔', type: '地下城', desc:'通往更高剑境的试炼。', accessible: true, hasShop: false }
          ]
        },
        '风蚀峡谷': {
          id: 'canyon',
          desc: '常年狂风呼啸，怪鸟盘旋。',
          locations: [
            { id: 'canyon_gate', name: '峡谷入口', type: '野外', desc:'砂砾滚落，步步惊心。', accessible: true, hasShop: false },
            { id: 'wind_altar', name: '风祭台', type: '建筑', desc:'古老的祭祀遗迹。', accessible: true, hasShop: false }
          ]
        }
      }
    },

    // 东方：东瀛大和国（和风文化，温泉）
    '东瀛大和国': {
      id: 'yamato',
      desc: '和风礼乐之邦，匠人与忍者并存。',
      areas: {
        '温泉山道': {
          id: 'onsen',
          desc: '雾气缭绕，温泉遍地。',
          locations: [
            { id: 'mount_path', name: '山道', type: '野外', desc:'石阶蜿蜒，松竹幽幽。', accessible: true, hasShop: false },
            { id: 'bamboo_tea', name: '竹林小亭', type: '建筑', desc:'可稍作歇息。', accessible: true, hasShop: false },
            { id: 'onsen_town', name: '温泉乡', type: '城镇', desc:'旅馆林立，补给方便。', accessible: true, hasShop: true }
          ]
        },
        '彼岸神社': {
          id: 'shrine',
          desc: '香火鼎盛的古社，传说能镇压妖物。',
          locations: [
            { id: 'approach', name: '参道', type: '野外', desc:'两侧石灯立列。', accessible: true, hasShop: false },
            { id: 'main_shrine', name: '本殿', type: '建筑', desc:'肃穆庄严。', accessible: true, hasShop: false },
            { id: 'market', name: '社前市集', type: '商店', desc:'可购符札与补给。', accessible: true, hasShop: true }
          ]
        },
        '樱都': {
          id: 'sakura',
          desc: '盛放的樱海之城，手工艺繁盛。',
          locations: [
            { id: 'avenue', name: '樱花大道', type: '城镇', desc:'四季皆景。', accessible: true, hasShop: true },
            { id: 'artisan', name: '匠人街', type: '商店', desc:'兵具道具一应俱全。', accessible: true, hasShop: true },
            { id: 'east_post', name: '东部驿站', type: '驿站', desc:'往来客商的集散点。', accessible: true, hasShop: false },
            { id:'s_inn', name:'旅馆·花见亭', type:'建筑', desc:'远来客商聚集地。', accessible:true, hasShop:false },
            { id:'s_tavern', name:'清酒居', type:'商店', desc:'暖胃酒肴，消息集散。', accessible:true, hasShop:true },
            { id:'s_guild', name:'佣兵公会', type:'建筑', desc:'接受护送与讨伐任务。', accessible:true, hasShop:false },
            { id:'s_blacksmith', name:'铁匠铺·樱打', type:'商店', desc:'精工兵刃。', accessible:true, hasShop:true },
            { id:'s_street1', name:'第一大街', type:'城镇', desc:'热闹非凡。', accessible:true, hasShop:true },
            { id:'s_street2', name:'第二大街', type:'城镇', desc:'工艺店铺集中。', accessible:true, hasShop:true },
            { id:'s_house1', name:'居民房1', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false },
            { id:'s_house2', name:'居民房2', type:'民宅', desc:'普通住户。', accessible:true, hasShop:false }
          ]
        }
      }
    },

    // 中央：魔王领地（魔土）
    '魔王领地': {
      id: 'demon',
      desc: '十年前魔王降临，中央化为魔土；六座环城与诸多险地环绕魔王城。',
      areas: {
        '环城六都': {
          id: 'ring6',
          desc: '魔王城外环的六座城邦，秩序扭曲。',
          locations: [
            { id: 'north_city', name: '北城', type: '城镇', desc:'冰冷肃杀。', accessible: true, hasShop: true },
            { id: 'south_city', name: '南城', type: '城镇', desc:'诡异繁华。', accessible: true, hasShop: true },
            { id: 'east_city', name: '东城', type: '城镇', desc:'高墙林立。', accessible: true, hasShop: true },
            { id: 'west_city', name: '西城', type: '城镇', desc:'阴影横流。', accessible: true, hasShop: true },
            { id: 'front_city', name: '前城', type: '城镇', desc:'常年戒严。', accessible: true, hasShop: true },
            { id: 'rear_city', name: '后城', type: '城镇', desc:'流民聚集。', accessible: true, hasShop: true }
          ]
        },
        '迷雾森林': {
          id: 'mist',
          desc: '黑雾弥漫，方向感常失。',
          locations: [
            { id: 'mist_edge', name: '雾边', type: '野外', desc:'尚可辨路。', accessible: true, hasShop: false },
            { id: 'mist_core', name: '雾心', type: '野外', desc:'听见奇怪低语。', accessible: true, hasShop: false }
          ]
        },
        '裂隙峡谷': {
          id: 'rift',
          desc: '大地崩裂，回音不绝。',
          locations: [
            { id: 'rift_edge', name: '裂隙边缘', type: '野外', desc:'风声呜咽。', accessible: true, hasShop: false },
            { id: 'echo_cave', name: '回声洞', type: '地下城', desc:'脚步声容易迷失方向。', accessible: true, hasShop: false }
          ]
        },
        '火山群': {
          id: 'volcano',
          desc: '岩浆奔涌，热浪滚滚。',
          locations: [
            { id: 'lava_plain', name: '熔岩平原', type: '野外', desc:'灼热难耐。', accessible: true, hasShop: false },
            { id: 'magma_mouth', name: '熔火之口', type: '地下城', desc:'岩浆喷薄之地。', accessible: true, hasShop: false }
          ]
        },
        '黑雾沼泽': {
          id: 'swamp',
          desc: '腐殖弥漫，毒虫潜伏。',
          locations: [
            { id: 'mudflat', name: '腐泥滩', type: '野外', desc:'脚下一软一硬。', accessible: true, hasShop: false },
            { id: 'swamp_core', name: '黑雾深处', type: '野外', desc:'不祥之地。', accessible: true, hasShop: false }
          ]
        },
        '荒野废土': {
          id: 'wastes',
          desc: '寸草难生，但也藏着幸存者营地。',
          locations: [
            { id: 'barren', name: '枯焦之地', type: '野外', desc:'焦土荒芜。', accessible: true, hasShop: false },
            { id: 'camp', name: '遗忘营地', type: '建筑', desc:'流民商旅的交易点。', accessible: true, hasShop: true }
          ]
        },
        '魔王城': {
          id: 'castle',
          desc: '最终试炼之地，强敌环伺。',
          locations: [
            { id: 'castle_gate', name: '城门', type: '地下城', desc:'阴森的入口，戒备森严。', accessible: true, hasShop: false },
            { id: 'castle_hall', name: '大厅', type: '地下城', desc:'回响着诡异脚步声。', accessible: true, hasShop: false },
            { id: 'castle_throne', name: '王座室', type: 'BOSS', desc:'魔王的所在之处。', accessible: true, hasShop: false },
          ]
        }
      }
    }
  };

document.addEventListener('alpine:init', () => {
    Alpine.store('game', {
      // ===== 基础状态 =====
  loading: true,
  started: false,
  disabled: false,
      currentPage: 'main', // main, shop, battle

      // ===== 玩家属性 =====
      playerName: '',
      playerClass: '战士',
      difficulty: '普通',
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 10,
      defense: 5,
      gold: 100,
      inventory: {},

      // ===== 地图系统 =====
      worldMap: [],
      currentRegion: 'amus',
      currentArea: 'plain',
      currentLocation: 'town_start',
      mapViewLevel: 3, // 1=世界, 2=地区, 3=地点
      // 地图浏览状态（仅用于浏览，不影响实际位置）
      mapViewRegion: 'amus',
      mapViewArea: 'plain',
      storyModel: 'nalang-max-7-32K',
      storyModelOptions: ['nalang-max-7-32K', 'nalang-max-6', 'nalang-turbo-0826', 'nalang-xl-0430', 'nalang-xl'],

      // ===== 游戏状态 =====
  narration: '',
  messages: [],
      inBattle: false,
      currentEnemy: null,
      battleLog: '',
      canMove: true,
      moveCount: 0,
      goddessTalked: false,
      // 开放式操作
      openOptions: [], // [{key:'A', text:'...'}]
      ui: { customInputOpen: false, storyModelMenuOpen: false, sellQuantities: {} },
      customInput: '',
      // 动态道具定义（AI 可通过 defineItem 注册）
      itemDefs: {}, // name -> { desc?, useEffects:[...] , price?, consumable? }
      itemAliasDefs: {}, // alias -> canonical name

      // ===== 商店 =====
      shopItems: [
        { name: '小型生命药水', price: 20, desc: '恢复30HP', effect: 'hp', value: 30 },
        { name: '小型魔力药水', price: 20, desc: '恢复20MP', effect: 'mp', value: 20 },
        { name: '中型生命药水', price: 50, desc: '恢复60HP', effect: 'hp', value: 60 },
        { name: '中型魔力药水', price: 50, desc: '恢复40MP', effect: 'mp', value: 40 },
        { name: '解毒剂', price: 30, desc: '解除毒素', effect: 'cure', value: 0 },
      ],
      selectedItemName: null,

      // ===== 初始化 =====
      async init() {
        console.log('🌟 [系统初始化] 等待 DZMM API 就绪...');
    await dzmmReady;
        console.log('✅ [系统初始化] DZMM API 已就绪');
        console.log('🗺️ [系统初始化] 初始化世界地图...');
        this.initWorldMap();
        console.log('💾 [系统初始化] 恢复存档...');
    await this.restore();
        console.log('✅ [系统初始化] 初始化完成！');
    this.loading = false;
  },

      initWorldMap() {
        this.worldMap = Object.keys(WORLD_MAP).map(name => ({
          id: WORLD_MAP[name].id,
          name: name,
          areas: WORLD_MAP[name].areas
        }));
      },

      getAllLocationRecords(){
        const records=[];
        Object.entries(WORLD_MAP).forEach(([regName, reg])=>{
          Object.entries(reg.areas).forEach(([areaName, area])=>{
            area.locations.forEach(loc=>{
              records.push({ regionId:reg.id, regionName:regName, areaId:area.id, areaName, locationId:loc.id, locationName:loc.name, locationType:loc.type, desc:loc.desc||'' });
            });
          });
        });
        return records;
      },

      getCurrentLocationRecord(){
        const recs = this.getAllLocationRecords();
        return recs.find(r=> r.regionId===this.currentRegion && r.areaId===this.currentArea && r.locationId===this.currentLocation) || null;
      },

      computeNearbyMonsters(areaName, locationName, regionName){
        const names = Object.keys(MONSTERS).filter(mn=>{
          const m=MONSTERS[mn];
          return m.regions?.some(r=> r===areaName || r===locationName || r===regionName);
        });
        return names.map(n=>({ name:n, type:MONSTERS[n].type }));
      },

      buildContextPrompt(){
        const cur = this.getCurrentLocationRecord();
        const region = WORLD_MAP[cur?.regionName];
        const areaObj = region?.areas?.[cur?.areaName];
        const nearby = this.computeNearbyMonsters(cur?.areaName, cur?.locationName, cur?.regionName);
        const inventory = Object.entries(this.inventory)
          .filter(([,qty])=>qty>0)
          .map(([name,qty])=>{
            const canonical = this.normalizeItemName(name);
            const def = this.getItemDef(canonical);
            return {
              name: canonical || name,
              qty,
              def: def ? {
                category: def.category,
                usable: def.usable,
                sellable: def.sellable,
                sellPrice: def.sellPrice,
                buyable: def.buyable,
                buyPrice: def.buyPrice
              } : null
            };
          })
          .slice(0,20);
        const ctx = {
          position: { region:cur?.regionName, area:cur?.areaName, location:cur?.locationName, type:cur?.locationType },
          regionDesc: region?.desc||'',
          areaDesc: areaObj?.desc||'',
          locationDesc: cur?.desc||'',
          nearbyMonsters: nearby,
          rules: { movementNoHpLoss:true, effectsOnlyChangeState:true },
          player: { name:this.playerName, cls:this.playerClass, level:this.level, hp:this.hp, maxHp:this.maxHp, mp:this.mp, maxMp:this.maxMp, atk:this.attack, def:this.defense, gold:this.gold },
          inventory
        };
        const worldview = `【世界观背景】
十年前，一位强大的魔王突然降临于大陆中央。他对人类四大国（阿姆斯特王国、南方联盟、奥斯蒙王国、东瀛大和国）同时发起了猛烈的进攻，并迅速侵吞了大量的土地。如今他占据着中央魔土，建立了庞大的势力范围。虽然这十年间他没有主动继续扩张，但其强大的实力仍然让四国民众感到深深的恐惧与不安。你作为被女神选中的勇者，肩负着讨伐魔王、拯救大陆的使命。

【当前地理位置特点】
区域：${cur?.regionName||'未知区域'}
小区：${cur?.areaName||'未知小区'}
地点：${cur?.locationName||'未知地点'}
地点类型：${cur?.locationType||'未知类型'}
货币：金币为通用货币，1金币约合1人民币。
`;
        return `${worldview}【位置上下文】\n${JSON.stringify(ctx)}`;
      },

      // ===== 游戏开始 =====
      async start() {
        // 根据职业初始化属性
        if (this.playerClass === '战士') {
          this.maxHp = 120; this.hp = 120;
          this.maxMp = 30; this.mp = 30;
          this.attack = 15; this.defense = 8;
        } else if (this.playerClass === '法师') {
          this.maxHp = 80; this.hp = 80;
          this.maxMp = 100; this.mp = 100;
          this.attack = 8; this.defense = 4;
        } else { // 游侠
          this.maxHp = 100; this.hp = 100;
          this.maxMp = 50; this.mp = 50;
          this.attack = 12; this.defense = 6;
        }

        this.gold = 100;
        this.inventory = { '小型生命药水': 3 };
        this.itemDefs = {};
        this.itemAliasDefs = {};
        Object.keys(BASE_ITEM_DEFS).forEach(name => this.ensureAliasMapping(name, name));
        this.currentRegion = 'amus';
        this.currentArea = 'plain';
        this.currentLocation = 'town_start';
        this.mapViewLevel = 3;
        // 初始化地图浏览状态与实际位置一致
        this.mapViewRegion = 'amus';
        this.mapViewArea = 'plain';
        this.storyModel = this.storyModel || 'nalang-max-7-32K';
        this.ui.storyModelMenuOpen = false;
        this.ui.sellQuantities = {};
    this.started = true;
        this.currentPage = 'main';
        this.goddessTalked = false;

        // 初始化AI对话上下文
        const systemPrompt = `你是一个文字冒险游戏的故事生成引擎。你的任务是为玩家创造沉浸式的RPG体验。

【游戏世界背景】
玩家处于一个日系异世界中，需要通过探索、战斗和与NPC互动来完成冒险目标。
世界被分为多个区域：新手平原、青葱森林、荒芜山脉、废墟之地、魔王城等。
危险的怪物分布在各地：魔物、兽人和恶魔。

【你的角色】
- 你负责生成沉浸式的场景描述，帮助玩家感受这个世界
- 使用第二人称"你"进行叙述
- 保持故事的一致性和世界观的完整性
- 遵循玩家的位置和游戏状态

【文本风格要求】
- 简洁明快的日系RPG风格
- 避免过长的段落，保持节奏感
- 可适当使用数字和符号表情来增强代入感
- 生成内容应该在100-400字之间

【效果协议（极其重要）】
当我请求叙事结果时，你可以在叙事后追加一个效果块，用于驱动数值与位移：
###EFFECTS
[ {"type":"hp+","value":10}, {"type":"hpMax+","value":5}, {"type":"mpMax+","value":3},
{"type":"atk+","value":1}, {"type":"def+","value":1},
{"type":"addItem","name":"药草","qty":2}, {"type":"removeItem","name":"药草","qty":1},
{"type":"move","toByName":{"region":"阿姆斯王国","area":"青葱森林","location":"森林入口"}}
]
###END
支持类型：hp+/mp+/hpMax+/mpMax+/atk+/def+/addItem/removeItem/move(to 或 toByName)。所有数值可正可负。

规则：抽象内容(情报/线索/传闻/信息/知识等)不得作为道具，禁止用 addItem/removeItem 添加。
若要引入新道具，需同时在 EFFECTS 中提供 defineItem：
{"type":"defineItem","def":{"name":"体力之书","useEffects":[{"type":"hpMax+","value":5}],"desc":"永久提升体力","consumable":false}}

【意图协议（可选，推荐）】
在 EFFECTS 前追加：
###INTENT {"moveTo":"阿姆斯王国/新手平原/平原东侧","notes":"先移动再描述"}
当前端未检测到 move EFFECT 时，会以 INTENT.moveTo 兜底补充移动。

【禁止事项】
- 不要引导玩家做选择
- 不要生成游戏系统消息（如HP变化、物品获得等）
- 不要改变玩家的位置、状态或背包，除非明确说明
- 不要生成重复的场景描述

现在开始为玩家生成故事内容。`;

        this.messages = [{ role: 'user', content: systemPrompt }];
        console.log('🎮 [游戏启动] 初始化 messages:', this.messages);
        console.log('🎮 [游戏启动] 系统提示长度:', systemPrompt.length, '字符');

    await this.persist();

        // 女神开场固定文本
        this.narration = `<div style="text-align:center; padding:20px; color:var(--accent);">
          <h3>✨ 女神的祝福 ✨</h3>
          <p style="line-height:1.8; margin-top:12px;">
            "欢迎来到异世界，勇敢的 <b>${this.playerName}</b>。<br/>
            你已被选中作为讨伐魔王的勇者。<br/>
            这个世界充满危险，但也蕴藏着无限可能。<br/>
            从新手村出发，探索这片大陆，击败魔王，你便能回到原本的世界。<br/>
            <br/>
            愿你旅途顺利，勇者。我的祝福永远与你同在。"
          </p>
        </div>
        <hr style="margin:20px 0; border:none; border-top:1px solid var(--border);"/>
        <p>你睁开眼，发现自己站在一个陌生的村庄中。周围是古朴的木屋和石板路，远处可以看到青翠的森林和连绵的山脉。你的冒险，从这里开始...</p>`;

        this.goddessTalked = true;

        // 获取首轮选项
        await this.requestOptions();
      },

      // ===== 页面切换 =====
      switchPage(page) {
        if (page === 'battle' && !this.inBattle) return;
        this.currentPage = page;
        this.ui.storyModelMenuOpen = false;
      },

      // ===== 地图导航 =====
      getCurrentRegionAreas() {
        const region = this.worldMap.find(r => r.id === this.mapViewRegion);
        if (!region) return [];
        return Object.keys(region.areas).map(name => ({
          id: region.areas[name].id,
          name: name,
        }));
      },

      getCurrentAreaLocations() {
        // 获取浏览状态的地点列表（用于地图显示）
        const region = this.worldMap.find(r => r.id === this.mapViewRegion);
        if (!region) return [];
        const areaObj = Object.values(region.areas).find(a => a.id === this.mapViewArea);
        if (!areaObj) return [];
        return areaObj.locations;
      },

      getActualCurrentAreaLocations() {
        // 获取实际当前位置的地点列表（用于游戏逻辑）
        const region = this.worldMap.find(r => r.id === this.currentRegion);
        if (!region) return [];
        const areaObj = Object.values(region.areas).find(a => a.id === this.currentArea);
        if (!areaObj) return [];
        return areaObj.locations;
      },

      navigateToRegion(regionId) {
        // 仅改变地图浏览状态，不改变实际位置
        this.mapViewRegion = regionId;
        this.mapViewLevel = 2;
      },

      navigateToArea(areaId) {
        // 仅改变地图浏览状态，不改变实际位置
        this.mapViewArea = areaId;
        this.mapViewLevel = 3;
      },

      canAccessShop() {
        const locations = this.getActualCurrentAreaLocations();
        const current = locations.find(l => l.id === this.currentLocation);
        return current && current.hasShop;
      },

      // ===== 开放式操作（选项 + 自定义） =====
      async requestOptions(){
        // 让 AI 仅输出 3 个选项的 JSON 数组
        const locations = this.getActualCurrentAreaLocations();
        const current = locations.find(l => l.id === this.currentLocation);
        const prompt = `【重要】你现在的任务是生成选项JSON，不是生成叙述！\n`+
          `当前地点：${current?.name||'未知地点'}\n`+
          `请提供3个可执行的行动选项。\n\n`+
          `!!!直接输出JSON数组，不要任何其他文字!!!\n`+
          `格式：[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."}]\n`+
          `要求：每项text≤16字，具体可执行，不要解释说明。\n`;
        this.messages.push({ role:'user', content: prompt });
        this.narration ||= '<span class="loading-pulse">思考可行的行动中...</span>';

        let doneText = '';
        try{
          await window.dzmm.completions(
            { model: 'nalang-turbo-0826', messages: this.messages, maxTokens: 300 },
            (text, done)=>{
              doneText = text;
              if(done){
                this.messages.push({ role:'assistant', content: text });
                try{
                  // 尝试提取多个 JSON 数组，优先挑选最后一个可解析的
                  const candidates = extractBracketArrays(text);
                  let parsed = null;
                  for(let i=candidates.length-1;i>=0;i--){
                    const arr = tryParseJsonArray(candidates[i]);
                    if(Array.isArray(arr)){ parsed = arr; break; }
                  }
                  if(!parsed){ throw new Error('no valid options array'); }
                  const keys=['A','B','C'];
                  this.openOptions = parsed.slice(0,3).map((x,i)=>({ key: x?.key||keys[i], text: String(x?.text||'探索周围') }));
                }catch(e){
                  console.warn('选项JSON解析失败，使用兜底', e, text);
                  this.openOptions = [
                    {key:'A', text:'观察周围'},
                    {key:'B', text:'与路人交谈'},
                    {key:'C', text:'尝试前进'}
                  ];
                }
              }
            }
          );
        }catch(err){
          console.warn('[选项] 模型失败，尝试降级', err);
          try{
            await window.dzmm.completions(
              { model: 'nalang-xl-0430', messages: this.messages, maxTokens: 1200 },
              (text, done)=>{
                doneText = text; 
                if(done){ 
                  this.messages.push({role:'assistant', content:text}); 
                  try{ 
                    const candidates = extractBracketArrays(text);
                    let parsed = null;
                    for(let i=candidates.length-1;i>=0;i--){
                      const arr = tryParseJsonArray(candidates[i]);
                      if(Array.isArray(arr)){ parsed = arr; break; }
                    }
                    if(!parsed) throw new Error('no valid options array');
                    this.openOptions = parsed.slice(0,3);
                  }catch(e){
                    this.openOptions = [
                      {key:'A', text:'观察周围'},
                      {key:'B', text:'与路人交谈'},
                      {key:'C', text:'尝试前进'}
                    ];
                  } 
                }
              }
            );
          }catch(e2){
            console.error('选项请求失败', e2);
            this.openOptions = [
              {key:'A', text:'观察周围'},
              {key:'B', text:'与路人交谈'},
              {key:'C', text:'尝试前进'}
            ];
          }
        }
        console.log('🧭 [选项] 当前选项：', this.openOptions);
      },

      toggleStoryModelMenu() {
        this.ui.storyModelMenuOpen = !this.ui.storyModelMenuOpen;
      },

      setStoryModel(model) {
        if(this.storyModelOptions.includes(model)){
          this.storyModel = model;
          this.ui.storyModelMenuOpen = false;
          this.persist();
        }
      },

      ensureSellQuantity(name, max) {
        if(!this.ui.sellQuantities || typeof this.ui.sellQuantities !== 'object'){
          this.ui.sellQuantities = {};
        }
        let value = Number(this.ui.sellQuantities[name]);
        if(!value || value < 1) value = 1;
        if(value > max) value = max;
        this.ui.sellQuantities[name] = value;
      },

      handleSellQuantityInput(name, max) {
        if(!this.ui.sellQuantities || typeof this.ui.sellQuantities !== 'object'){
          this.ui.sellQuantities = {};
        }
        let value = Number(this.ui.sellQuantities[name]);
        if(!value || value < 1) value = 1;
        if(value > max) value = max;
        this.ui.sellQuantities[name] = value;
      },

      async pickOption(key){
        const opt = this.openOptions.find(o=>o.key===key);
        if(!opt) return;
        const content = `玩家选择了(${key})：${opt.text}。`;
        await this.requestOpenAction(content);
      },

      async sendCustomAction(){
        const text = (this.customInput||'').trim();
        if(!text){ this.ui.customInputOpen=false; return; }
        if(/[{}()<>]/.test(text)){
          alert('输入中包含被禁止的字符：{}()<>');
          return;
        }
        this.ui.customInputOpen=false;
        this.customInput='';
        const content = `玩家执行自定义行动：${text}`;
        await this.requestOpenAction(content);
      },

      async requestOpenAction(content){
        // 规范：正文 + 可选 EFFECTS 块
        const inventorySnapshot = {};
        Object.entries(this.inventory || {}).forEach(([name, qty]) => {
          const amount = Number(qty) || 0;
          if(amount <= 0) return;
          const canonical = this.normalizeItemName(name, { createAlias:true }) || String(name).trim();
          if(!canonical) return;
          inventorySnapshot[canonical] = (inventorySnapshot[canonical] || 0) + amount;
        });

        const snapshot = {
          player: this.playerName,
          region: this.currentRegion,
          area: this.currentArea,
          location: this.currentLocation,
          stats: { hp:this.hp, mp:this.mp, atk:this.attack, def:this.defense, gold:this.gold },
          inventory: inventorySnapshot
        };
        const guide = `请输出：先叙事(≤220字)，随后可选效果块：\n###EFFECTS\n[效果JSON]\n###END\n支持类型：hp+/mp+/hpMax+/mpMax+/atk+/def+/gold+/addItem/removeItem/move(to 或 toByName)/defineItem。\n道具规范（务必遵守）：\n1. 新增道具时，先输出 defineItem，再用 addItem 获取该道具。示例：\n###EFFECTS\n[ {"type":"defineItem","def":{"name":"体力之书","category":"消耗品","desc":"永久强化体魄","usable":true,"consumable":true,"useEffects":[{"type":"hpMax+","value":5}],"sellable":true,"sellPrice":80,"buyable":false,"buyPrice":0}}, {"type":"addItem","name":"体力之书","qty":1} ]\n###END\n2. 若道具已存在（见下方清单），仅使用 addItem，沿用原有效果。示例：\n###EFFECTS\n[ {"type":"addItem","name":"小型生命药水","qty":1} ]\n###END\n3. 道具名称需和已有道具统一，若名称相近（如 药草/草药），请使用已定义的标准名称。\n4. 定义道具时需给出合理描述、分类与效果。sellPrice 必填且为正值；buyable 默认为 false，buyPrice 仅在 buyable=true 时填写。\n5. 素材类（category='素材'）通常 usable=false、consumable=false、sellable=true、buyable=false。\n6. 严禁将抽象内容(情报/线索/传闻/信息/知识/心情等)作为道具。`;
        const knownList = this.getKnownItemSummaries().join('\n') || '（暂无）';
        const bagNames = this.getPromptInventoryNames().join('、') || '（空）';
        const msg = `${content}\n\n${guide}\n【已定义道具】\n${knownList}\n【背包道具（名称）】\n${bagNames}\n【快照】${JSON.stringify(snapshot)}\n${this.buildContextPrompt()}`;
        this.messages.push({ role:'user', content: msg });
        this.disabled = true;
        this.narration = '<span class="loading-pulse">进行中...</span>';

        let full='';
        const primaryModel = this.storyModel || 'nalang-max-7-32K';
        const fallbackModel = primaryModel === 'nalang-turbo-0826' ? 'nalang-xl-0430' : 'nalang-turbo-0826';
        try{
          await window.dzmm.completions(
            { model: primaryModel, messages:this.messages, maxTokens: 2000 },
            (t, done)=>{
              full=t; this.narration=this.stripEffectsFromText(t);
              if(done){
                this.messages.push({ role:'assistant', content: t });
                const intent = this.parseIntent(t);
                const effects = this.parseEffects(t) || [];
                // 若没有 move 但 intent 指明 moveTo，则兜底补 move
                const hasMove = effects.some(e=>e && e.type==='move');
                if(intent && intent.moveTo && !hasMove){
                  effects.push({ type:'move', toByName: intent.moveTo });
                }
                if(effects.length>0){ this.applyEffects(effects); }
                // 获取下一轮选项
                this.requestOptions();
              }
            }
          );
        }catch(e){
          console.warn('[行动] 主模型失败，降级', e);
          try{
            await window.dzmm.completions(
              { model: fallbackModel, messages:this.messages, maxTokens: 1500 },
              (t,done)=>{ full=t; this.narration=this.stripEffectsFromText(t); if(done){ this.messages.push({role:'assistant', content:t}); const eff=this.parseEffects(t); if(eff) this.applyEffects(eff); this.requestOptions(); } }
            );
          }catch(e2){
            console.error('行动请求失败', e2);
            this.narration = '<p style="color:var(--danger);">AI 行动请求失败。</p>';
          }
        }
        this.disabled = false;
    await this.persist();
      },

      // ===== 移动系统 =====
      async requestMove() {
        if (this.disabled || this.inBattle) return;

        console.log('🚶 [移动开始] 按钮被点击');
    this.disabled = true;
        this.narration = '<span class="loading-pulse">正在移动中...</span>';

        // 检查是否可以移动（由AI判断）
        const canMove = await this.checkCanMove();
        console.log('🚶 [移动检查] 是否可以移动:', canMove);

        if (!canMove) {
          this.narration = '<p style="color:var(--danger);">当前情况无法移动！你需要先处理眼前的事务。</p>';
    this.disabled = false;
          return;
        }

        // 前端判断遇敌概率
        const locations = this.getActualCurrentAreaLocations();
        const current = locations.find(l => l.id === this.currentLocation);
        console.log('🚶 [移动] 当前地点:', current);

        if (current && current.type === '野外') {
          const encounterChance = Math.random();
          console.log('🎲 [遇敌判定] 随机数:', encounterChance, '(< 0.4 则遇敌)');
          if (encounterChance < 0.4) { // 40%遇敌率
            console.log('⚔️ [遇敌判定] 触发战斗！');
            await this.triggerBattle();
            this.disabled = false;
            return;
          }
          console.log('✅ [遇敌判定] 未遇敌，继续移动');
        }

        // 正常移动，请求AI生成场景描述
        console.log('🚶 [移动] 请求 AI 生成场景描述...');
        await this.requestAIMoveNarration();
        this.disabled = false;
        this.moveCount++;
        console.log('🚶 [移动完成] 总移动次数:', this.moveCount);
    await this.persist();
  },

      async checkCanMove() {
        // 简单模拟：如果HP太低，AI判断不能移动
        if (this.hp < 10) {
          return false;
        }
        return true;
      },

      async requestAIMoveNarration() {
        const locations = this.getActualCurrentAreaLocations();
        const current = locations.find(l => l.id === this.currentLocation);

        const prompt = `玩家 ${this.playerName} (${this.playerClass} Lv.${this.level}) 在 ${current?.name || '未知地点'} 移动。
当前状态: HP ${this.hp}/${this.maxHp}, MP ${this.mp}/${this.maxMp}, 金币 ${this.gold}G
请生成一段简短的场景描述(100-200字)，描述玩家在这个地方看到了什么，遇到了什么，感受到了什么。不要引导玩家做选择，只是描述场景。使用第二人称"你"。\n${this.buildContextPrompt()}`;

        this.messages.push({ role: 'user', content: prompt });
        
        console.log('🚶 [移动请求] 当前位置:', current?.name);
        console.log('🚶 [移动请求] messages 数量:', this.messages.length);
        console.log('🚶 [移动请求] 每条消息详情:');
        this.messages.forEach((msg, idx) => {
          console.log(`  消息 ${idx}: role="${msg.role}", 内容长度=${msg.content?.length || 0}`);
          console.log(`  消息 ${idx} 内容预览:`, msg.content?.substring(0, 100) + '...');
        });
        
        const requestPayload = {
          model: 'nalang-turbo-0826',
          messages: this.messages,
          maxTokens: 1200
        };
        console.log('🚶 [移动请求] 完整请求参数:', requestPayload);
        console.log('🚶 [移动请求] 请求参数 JSON:', JSON.stringify(requestPayload, null, 2));

        let content = '';
        try {
    await window.dzmm.completions(
            { model: 'nalang-turbo-0826', messages: this.messages, maxTokens: 1200 },
      (newContent, done) => {
              content = newContent;
              this.narration = this.stripEffectsFromText(content);
              if(done){
                const intent=this.parseIntent(content); const eff=this.parseEffects(content)||[]; const hasMove=eff.some(e=>e&&e.type==='move');
                if(intent && intent.moveTo && !hasMove){ eff.push({type:'move', toByName:intent.moveTo}); }
                if(eff.length>0){ this.applyEffects(eff); }
              }
              console.log('📝 [AI响应] 流式更新, done=' + done + ', 内容长度:', content.length);
              if (done) {
                console.log('✅ [AI响应完成] 完整内容:', content);
                this.messages.push({ role: 'assistant', content });
                console.log('✅ [AI响应完成] messages 总数:', this.messages.length);
              }
            }
          );
        } catch (e) {
          console.error('❌ [AI请求失败] 错误对象:', e);
          console.error('❌ [AI请求失败] 错误类型:', e.constructor.name);
          console.error('❌ [AI请求失败] 错误消息:', e.message);
          console.error('❌ [AI请求失败] 错误堆栈:', e.stack);
          console.error('❌ [AI请求失败] messages 数量:', this.messages.length);
          console.error('❌ [AI请求失败] messages 内容:');
          this.messages.forEach((msg, idx) => {
            console.error(`  ❌ 消息 ${idx}:`, {
              role: msg.role,
              contentLength: msg.content?.length,
              contentPreview: msg.content?.substring(0, 200)
            });
          });
          console.error('❌ [AI请求失败] messages JSON:', JSON.stringify(this.messages, null, 2));
          this.narration = '<p style="color:var(--danger);">无法生成移动描述，请稍后再试。查看控制台了解详情。</p>';
        }
      },

      // ===== 交互动作 =====
      async interact() {
        if (this.disabled) return;
    this.disabled = true;
        await this.requestAIAction('interact', '交互周围的人或物');
    this.disabled = false;
      },

      async investigate() {
        if (this.disabled) return;
        this.disabled = true;
        await this.requestAIAction('investigate', '仔细调查周围环境');
        this.disabled = false;
      },

      async rest() {
        if (this.disabled) return;
        // 休息直接恢复，不需要AI
        const hpRecover = Math.min(20, this.maxHp - this.hp);
        const mpRecover = Math.min(10, this.maxMp - this.mp);
        this.hp += hpRecover;
        this.mp += mpRecover;
        this.narration = `<p>你找了个安全的地方休息了一会儿。</p>
        <p style="color:var(--good);">恢复了 ${hpRecover} HP 和 ${mpRecover} MP。</p>`;
    await this.persist();
  },

      async useItem() {
        if (this.disabled) return;
        const keys = Object.keys(this.inventory || {});
        let pickedName = '';
        let pickedDef = null;
        for(const key of keys){
          const qty = this.inventory[key] || 0;
          if(qty <= 0) continue;
          const canonical = this.normalizeItemName(key, { createAlias:true });
          if(canonical && canonical !== key){
            this.inventory[canonical] = (this.inventory[canonical] || 0) + qty;
            delete this.inventory[key];
          }
          const def = this.getItemDef(canonical || key);
          if(def && def.usable && (def.useEffects||[]).length>0){
            pickedName = canonical || key;
            pickedDef = def;
            break;
          }
        }
        if (!pickedName || !pickedDef) {
          this.narration = `<p style="color:var(--muted);">你没有可使用的物品。</p>`;
          return;
        }
        this.applyEffects(pickedDef.useEffects || []);
        if(pickedDef.consumable !== false){
          this.inventory[pickedName] = Math.max(0, (this.inventory[pickedName] || 0) - 1);
        }
        this.narration = `<p>你使用了 <span style="color:var(--accent);">${pickedName}</span>。</p>`;
        await this.persist();
      },

      async requestAIAction(action, desc) {
        const locations = this.getActualCurrentAreaLocations();
        const current = locations.find(l => l.id === this.currentLocation);

        const prompt = `玩家 ${this.playerName} (${this.playerClass} Lv.${this.level}) 在 ${current?.name || '未知地点'} 选择了: ${desc}。
当前状态: HP ${this.hp}/${this.maxHp}, MP ${this.mp}/${this.maxMp}, 金币 ${this.gold}G
背包: ${JSON.stringify(this.inventory)}

请生成这个动作的结果和场景描述(200-400字)。可以让玩家发现物品、遇到NPC、触发事件等。如果有物品获得或状态变化，在描述中明确说明。使用第二人称"你"。`;

        this.messages.push({ role: 'user', content: prompt });
        this.narration = '<span class="loading-pulse">行动中...</span>';

        console.log('💬 [交互请求] 动作:', action, '描述:', desc);
        console.log('💬 [交互请求] messages 数量:', this.messages.length);
        console.log('💬 [交互请求] 最后一条消息:', this.messages[this.messages.length - 1]);

    let content = '';
        try {
    await window.dzmm.completions(
            { model: 'nalang-turbo-0826', messages: this.messages, maxTokens: 1500 },
      (newContent, done) => {
        content = newContent;
              this.narration = this.stripEffectsFromText(content);
        if(done){
                const intent=this.parseIntent(content); const eff=this.parseEffects(content)||[]; const hasMove=eff.some(e=>e&&e.type==='move');
                if(intent && intent.moveTo && !hasMove){ eff.push({type:'move', toByName:intent.moveTo}); }
                if(eff.length>0){ this.applyEffects(eff); }
              }
              console.log('📝 [AI响应] 交互流式更新, done=' + done + ', 长度:', content.length);
              if (done) {
                console.log('✅ [AI响应完成] 交互内容:', content);
                this.messages.push({ role: 'assistant', content });
                // 简单解析是否获得物品（可以用更复杂的协议）
                this.parseRewards(content);
              }
            }
          );
        } catch (e) {
          console.error('❌ [AI交互失败] 错误详情:', e);
          console.error('❌ [AI交互失败] 错误堆栈:', e.stack);
          console.error('❌ [AI交互失败] 当前 messages:', this.messages);
          this.narration = '<p style="color:var(--danger);">无法生成动作描述，请稍后再试。</p>';
        }
        await this.persist();
      },

      parseRewards(text) {
        // 简单的文本解析，看是否提到获得金币或物品
        const goldMatch = text.match(/获得了?\s*(\d+)\s*金币/);
        if (goldMatch) {
          this.gold += parseInt(goldMatch[1]);
        }
        // 可以扩展更多解析逻辑
      },

      // ===== EFFECTS 解析与应用 =====
      parseEffects(text){
        const S='###EFFECTS'; const E='###END';
        const si = text.indexOf(S); if(si===-1) return null;
        const ei = text.indexOf(E, si+S.length); if(ei===-1) return null;
        const raw = text.slice(si+S.length, ei).trim();
        // 直接尝试解析
        let arr = tryParseJsonArray(raw);
        if(Array.isArray(arr)) { console.log('🧪 [EFFECTS] 解析成功:', arr); return arr; }
        // 若失败，从片段里提取可能的数组，取最后一个可解析的
        const candidates = extractBracketArrays(raw);
        for(let i=candidates.length-1;i>=0;i--){
          const parsed = tryParseJsonArray(candidates[i]);
          if(Array.isArray(parsed)){ console.log('🧪 [EFFECTS] 解析(容错)成功'); return parsed; }
        }
        console.warn('EFFECTS 解析失败', raw);
        return null;
      },

      stripEffectsFromText(text){
        const S='###EFFECTS';
    const si = text.indexOf(S);
        return si===-1 ? text : text.slice(0, si).trim();
      },

      clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); },

      applyEffects(effects){
        if(!Array.isArray(effects)) return;
        console.groupCollapsed('⚙️ 应用 EFFECTS');
        const before = { hp:this.hp, mp:this.mp, maxHp:this.maxHp, maxMp:this.maxMp, atk:this.attack, def:this.defense, gold:this.gold, loc:[this.currentRegion,this.currentArea,this.currentLocation], inv:{...this.inventory} };
        let moved = false;
        let moveTarget = null;
        for(const ef of effects){
          if(!ef || !ef.type) continue;
          const t = String(ef.type);
          const v = Number(ef.value||0);
          console.log('→', t, ef);
          if(t==='hp+') {
            // 移动不扣HP：如果本批次存在move且是负值，则忽略
            if(moved && v<0) { console.log('跳过因移动导致的HP扣减'); }
            else this.hp = this.clamp(this.hp + v, 0, this.maxHp);
          }
          else if(t==='mp+') this.mp = this.clamp(this.mp + v, 0, this.maxMp);
          else if(t==='hpMax+') { this.maxHp = Math.max(1, this.maxHp + v); this.hp = this.clamp(this.hp, 0, this.maxHp); }
          else if(t==='mpMax+') { this.maxMp = Math.max(0, this.maxMp + v); this.mp = this.clamp(this.mp, 0, this.maxMp); }
          else if(t==='atk+') this.attack = Math.max(0, this.attack + v);
          else if(t==='def+') this.defense = Math.max(0, this.defense + v);
          else if(t==='defineItem') {
            const def = ef.def || ef.definition || null;
            const registered = this.registerItemDefinition(def);
            console.log('🧾 [DEFINE ITEM]', registered, def);
          }
          else if(t==='addItem') {
            const name = String(ef.name || '');
            const qtyRaw = Number(ef.qty || ef.quantity || ef.amount || 0);
            if(!qtyRaw) continue;
            if(ABSTRACT_ITEM_BLOCKLIST.some(w=>name.includes(w))){ console.warn('忽略抽象物品:', name); continue; }
            const canonical = this.normalizeItemName(name, { createAlias:true }) || name;
            this.ensureItemDef(canonical);
            this.inventory[canonical] = (this.inventory[canonical] || 0) + qtyRaw;
            if(this.inventory[canonical] < 0) this.inventory[canonical] = 0;
            this.addEvent({type:'addItem', name:canonical, qty:qtyRaw});
          }
          else if(t==='removeItem') {
            const name = String(ef.name || '');
            const qtyRaw = Number(ef.qty || ef.quantity || ef.amount || 0);
            if(!qtyRaw) continue;
            if(ABSTRACT_ITEM_BLOCKLIST.some(w=>name.includes(w))){ console.warn('忽略抽象物品:', name); continue; }
            const canonical = this.normalizeItemName(name, { createAlias:true }) || name;
            this.inventory[canonical] = (this.inventory[canonical] || 0) - qtyRaw;
            if(this.inventory[canonical] < 0) this.inventory[canonical] = 0;
            this.addEvent({type:'removeItem', name:canonical, qty:qtyRaw});
          }
          else if(t==='gold+') { const dv = Number(ef.value||0); this.gold = Math.max(0, this.gold + dv); this.addEvent({type:'gold', delta:dv}); }
          else if(t==='defineAlias'){ const def=ef.def||ef; if(def&&def.alias&&def.path){ this.aliasDefs[String(def.alias)]=String(def.path); console.log('🔗 [ALIAS] 定义',def.alias,'=>',def.path); } }
          else if(t==='move') { moveTarget = ef; moved=true; }
        }

        if(moved && moveTarget){
          const ok = this.applyMoveEffect(moveTarget);
          console.log('🚶 [EFFECT MOVE] 结果:', ok);
        }

        const after = { hp:this.hp, mp:this.mp, maxHp:this.maxHp, maxMp:this.maxMp, atk:this.attack, def:this.defense, gold:this.gold, loc:[this.currentRegion,this.currentArea,this.currentLocation], inv:{...this.inventory} };
        console.log('前', before, '后', after);
        console.groupEnd();
      },

      applyMoveEffect(ef){
        // 支持 to:{regionId,areaId,locationId} 或 toByName:{region,area,location}
        const saveOld = { r:this.currentRegion, a:this.currentArea, l:this.currentLocation };
        const byId = ef.to; const byName = ef.toByName;
        let regionId=null, areaId=null, locationId=null;
        if(byId){ regionId=byId.regionId||byId.region||null; areaId=byId.areaId||byId.area||null; locationId=byId.locationId||byId.location||null; }
        if(byName && (!regionId || !areaId || !locationId)){
          if(typeof byName==='string'){
            const hit=this.resolveLocationByName(byName);
            if(hit){ regionId=hit.regionId; areaId=hit.areaId; locationId=hit.locationId; }
          } else {
            const reg = Object.entries(WORLD_MAP).find(([nm,obj])=> nm===byName.region || obj.id===byName.region || nm.includes(byName.region||''));
            const regId = reg?.[1]?.id;
            if(regId){
              const areaEntry = Object.entries(WORLD_MAP[reg[0]].areas).find(([nm,obj])=> nm===byName.area || obj.id===byName.area || nm.includes(byName.area||''));
              const areaObj = areaEntry?.[1];
              if(areaObj){
                const loc = areaObj.locations.find(x=> x.name===byName.location || x.id===byName.location || x.name.includes(byName.location||''));
                if(loc){ regionId=regId; areaId=areaObj.id; locationId=loc.id; }
              }
            }
          }
        }
        if(regionId && areaId && locationId){
          this.currentRegion=regionId; this.currentArea=areaId; this.currentLocation=locationId;
          // 同步地图浏览状态到实际位置
          this.mapViewRegion=regionId; this.mapViewArea=areaId;
          this.maybeEncounterAfterMove();
          this.addEvent({type:'move', to:this.getCurrentLocationRecord()});
          return true;
        }
        this.addEvent({type:'moveFailed', reason:'unresolved'});
        return false;
      },

      maybeEncounterAfterMove(){
        const loc = this.getActualCurrentAreaLocations().find(l=>l.id===this.currentLocation);
        if(loc && loc.type==='野外'){
          const p = 0.4; const roll = Math.random();
          console.log('🎲 [移动后遇敌] p=',p,' roll=',roll);
          if(roll<p){ this.triggerBattle(); }
        }
      },

      // ===== 战斗系统 =====
      async triggerBattle() {
        // 根据当前地区随机选择怪物
        const regionName = this.worldMap.find(r => r.id === this.currentRegion)?.name || '';
        const areaName = Object.entries(WORLD_MAP[regionName]?.areas||{}).find(([_,a])=>a.id===this.currentArea)?.[0] || '';
        const locationName = this.getActualCurrentAreaLocations().find(l=>l.id===this.currentLocation)?.name || '';
        const possibleMonsters = Object.keys(MONSTERS).filter(name => {
          const monster = MONSTERS[name];
          return monster.regions?.some(r => r===areaName || r===locationName || r===regionName);
        });

        if (possibleMonsters.length === 0) return;

        const monsterName = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
        const monsterData = MONSTERS[monsterName];

        this.currentEnemy = {
          name: monsterName,
          type: monsterData.type,
          hp: monsterData.hp,
          maxHp: monsterData.hp,
          attack: monsterData.attack,
          defense: monsterData.defense,
          exp: monsterData.exp,
          gold: monsterData.gold,
          drops: monsterData.drops,
          canTalk: monsterData.canTalk
        };

        this.inBattle = true;
        this.currentPage = 'battle';
        this.battleLog = `<p>你遭遇了 <span style="color:var(--danger);">${monsterName}</span>！</p>`;

        // 如果怪物会说话，生成一句台词
        if (monsterData.canTalk) {
          const taunt = await this.generateMonsterTaunt();
          this.battleLog += `<p style="color:var(--accent-2);">${monsterName}: "${taunt}"</p>`;
        }
      },

      async generateMonsterTaunt() {
        // 简单随机台词，不需要调用AI
        const taunts = [
          "哼，又来了一个送死的！",
          "你的鲜血将成为我的晚餐！",
          "愚蠢的人类，准备受死吧！",
          "识相的话就赶紧滚开！",
          "看来今天的运气不错呢~"
        ];
        return taunts[Math.floor(Math.random() * taunts.length)];
      },

      async battleAttack() {
        if (this.disabled || !this.inBattle) return;
        this.disabled = true;

        // 计算伤害：(攻击力 - 防御力) × 随机系数(0.9-1.1)
        const baseDamage = Math.max(1, this.attack - this.currentEnemy.defense);
        const coefficient = 0.9 + Math.random() * 0.2;
        const damage = Math.floor(baseDamage * coefficient);

        this.currentEnemy.hp -= damage;
        this.battleLog += `<p>你对 ${this.currentEnemy.name} 造成了 <span style="color:var(--danger);">${damage}</span> 点伤害！</p>`;

        if (this.currentEnemy.hp <= 0) {
          await this.battleWin();
          this.disabled = false;
          return;
        }

        // 敌人反击
        await this.enemyTurn();
        this.disabled = false;
      },

      async battleSkill() {
        // 技能留空
        this.battleLog += `<p style="color:var(--muted);">技能系统尚未实现...</p>`;
      },

      async battleDefend() {
        if (this.disabled || !this.inBattle) return;
        this.disabled = true;

        this.battleLog += `<p>你摆出了防御姿态！</p>`;

        // 敌人攻击，但伤害减半
        const baseDamage = Math.max(1, this.currentEnemy.attack - this.defense);
        const coefficient = 0.9 + Math.random() * 0.2;
        const damage = Math.floor(baseDamage * coefficient * 0.5);

        this.hp -= damage;
        this.battleLog += `<p>${this.currentEnemy.name} 攻击了你，但你成功防御！只受到了 <span style="color:var(--warning);">${damage}</span> 点伤害。</p>`;

        if (this.hp <= 0) {
          await this.battleLose();
        }

        this.disabled = false;
      },

      async battleEscape() {
        if (this.disabled || !this.inBattle) return;
        this.disabled = true;

        const escapeChance = Math.random();
        if (escapeChance < 0.5) {
          this.battleLog += `<p style="color:var(--good);">你成功逃跑了！</p>`;
          this.inBattle = false;
          this.currentEnemy = null;
          this.currentPage = 'main';
          this.narration = `<p>你从战斗中逃脱，回到了安全的地方。</p>`;
        } else {
          this.battleLog += `<p style="color:var(--danger);">逃跑失败！</p>`;
          await this.enemyTurn();
        }

        this.disabled = false;
      },

      async enemyTurn() {
        const baseDamage = Math.max(1, this.currentEnemy.attack - this.defense);
        const coefficient = 0.9 + Math.random() * 0.2;
        const damage = Math.floor(baseDamage * coefficient);

        this.hp -= damage;
        this.battleLog += `<p>${this.currentEnemy.name} 攻击了你，造成了 <span style="color:var(--danger);">${damage}</span> 点伤害！</p>`;

        if (this.hp <= 0) {
          await this.battleLose();
        }
      },

      async battleWin() {
        this.battleLog += `<p style="color:var(--good); font-weight:700;">你击败了 ${this.currentEnemy.name}！</p>`;
        this.battleLog += `<p>获得了 ${this.currentEnemy.exp} 经验值和 ${this.currentEnemy.gold} 金币。</p>`;

        this.exp += this.currentEnemy.exp;
        this.gold += this.currentEnemy.gold;

        // 掉落物品
        if (this.currentEnemy.drops && this.currentEnemy.drops.length > 0) {
          const drop = this.currentEnemy.drops[Math.floor(Math.random() * this.currentEnemy.drops.length)];
          const canonicalDrop = this.normalizeItemName(drop, { createAlias:true }) || drop;
          this.ensureItemDef(canonicalDrop);
          this.inventory[canonicalDrop] = (this.inventory[canonicalDrop] || 0) + 1;
          this.addEvent({ type:'addItem', name:canonicalDrop, qty:1 });
          this.battleLog += `<p>获得了道具: <span style="color:var(--accent);">${canonicalDrop}</span></p>`;
        }

        // 检查升级
        if (this.exp >= this.expToNextLevel) {
          this.levelUp();
        }

        // 如果怪物类型是恶魔或兽人(部分)，战败后可能触发事件
        if (this.currentEnemy.type === '恶魔' || (this.currentEnemy.type === '兽人' && Math.random() < 0.3)) {
          this.battleLog += `<p style="color:var(--accent-2);"><i>(战败事件可触发，但你选择跳过...)</i></p>`;
        }

        setTimeout(() => {
          this.inBattle = false;
          this.currentEnemy = null;
          this.currentPage = 'main';
          this.narration = `<p>战斗结束，你继续你的旅程。</p>`;
        }, 3000);

    await this.persist();
  },

      async battleLose() {
        this.battleLog += `<p style="color:var(--danger); font-weight:700;">你被击败了...</p>`;
        this.hp = Math.floor(this.maxHp * 0.5);
        this.gold = Math.floor(this.gold * 0.8);

        // 恶魔型怪物战败触发特殊事件
        if (this.currentEnemy.type === '恶魔') {
          this.battleLog += `<p style="color:var(--accent-2);"><i>(${this.currentEnemy.name} 似乎对你做了什么... 但你选择跳过这段记忆)</i></p>`;
        }

        setTimeout(() => {
          this.inBattle = false;
          this.currentEnemy = null;
          this.currentPage = 'main';
          this.narration = `<p>你恢复了意识，发现自己躺在安全的地方。损失了一些金币，HP恢复到了50%。</p>`;
        }, 3000);

    await this.persist();
  },

      levelUp() {
        this.level++;
        this.exp = 0;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
        this.maxHp += 10;
        this.maxMp += 5;
        this.hp = this.maxHp;
        this.mp = this.maxMp;
        this.attack += 2;
        this.defense += 1;

        this.battleLog += `<p style="color:var(--warning); font-weight:700;">🎉 等级提升！现在是 Lv.${this.level}！</p>`;
        this.battleLog += `<p>全属性上升！HP和MP已完全恢复！</p>`;
      },

      // ===== 商店系统 =====
      buyItem(item) {
        if (this.gold < item.price) {
          alert('金币不足！');
          return;
        }

        const canonical = this.normalizeItemName(item.name, { createAlias:true }) || String(item.name || '').trim();
        if(canonical && canonical !== item.name){
          this.ensureAliasMapping(item.name, canonical);
        }

        this.gold -= item.price;
        if(canonical){
          this.ensureAliasMapping(canonical, canonical);
          this.inventory[canonical] = (this.inventory[canonical] || 0) + 1;
        }

        const mutableDef = this.ensureItemDef(canonical, { makeMutable:true, fallbackCategory:'消耗品' });
        if(mutableDef){
          if(item.desc){ mutableDef.desc = item.desc; }
          let effects = Array.isArray(item.useEffects) ? item.useEffects.map(e=>this.normalizeUseEffect(e)).filter(Boolean) : [];
          if(effects.length === 0 && item.effect){
            const type = item.effect === 'hp' ? 'hp+' : item.effect === 'mp' ? 'mp+' : item.effect;
            effects = [this.normalizeUseEffect({ type, value:item.value })].filter(Boolean);
          }
          if(effects.length){ mutableDef.useEffects = effects; }
          mutableDef.buyable = true;
          mutableDef.buyPrice = Math.max(1, Math.round(item.price));
          mutableDef.sellable = mutableDef.sellable !== false;
          if(!mutableDef.sellPrice || mutableDef.sellPrice <=0){
            mutableDef.sellPrice = Math.max(1, Math.floor(item.price/2));
          }
        }

        // 简单提示
        this.narration = `<p>你购买了 <span style="color:var(--accent);">${canonical||item.name}</span>。</p><p>花费了 ${item.price} 金币。</p>`;
        this.persist();
      },

      getSellableItems(){
        const out=[]; const inv=this.inventory||{};
        for(const rawName of Object.keys(inv)){
          const canonical=this.normalizeItemName(rawName,{createAlias:true});
          const qty=inv[rawName]||0; if(qty<=0) continue;
          const def=this.getItemDef(canonical)||{};
          if(def.sellable && def.sellPrice>0){ out.push({ name:canonical, qty, price:def.sellPrice }); }
          if(canonical !== rawName){
            delete this.inventory[rawName];
            this.inventory[canonical]=(this.inventory[canonical]||0)+qty;
          }
        }
        return out.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
      },
      async sellItemInShop(name){
        const canonical=this.normalizeItemName(name,{createAlias:true});
        const def=this.getItemDef(canonical)||{};
        const qty=this.inventory[canonical]||0;
        if(!def.sellable || def.sellPrice<=0 || qty<=0) return;
        if(!this.ui.sellQuantities || typeof this.ui.sellQuantities !== 'object'){
          this.ui.sellQuantities = {};
        }
        let sellQty = Number(this.ui.sellQuantities[canonical]);
        if(!sellQty || sellQty < 1) sellQty = 1;
        if(sellQty > qty) sellQty = qty;
        this.inventory[canonical]=qty-sellQty;
        const goldGain = def.sellPrice * sellQty;
        this.gold += goldGain;
        this.addEvent({type:'removeItem', name:canonical, qty:sellQty});
        this.addEvent({type:'gold', delta:goldGain});
        this.narration = `<p>你在商店出售了 <span style="color:var(--accent);">${canonical}</span> x${sellQty}，获得 ${goldGain} 金币。</p>`;
        this.ensureSellQuantity(canonical, this.inventory[canonical]||0);
        await this.persist();
      },

      // ===== 背包与道具逻辑 =====
      selectItem(name){
        this.selectedItemName = this.normalizeItemName(name, { createAlias:true });
      },
      normalizeItemName(name, options = {}){
        const { createAlias = false } = options;
        if(!name && name !== 0) return '';
        const raw = String(name).trim();
        if(!raw) return '';
        const sanitized = sanitizeItemKey(raw);
        const runtimeAlias = this.itemAliasDefs?.[sanitized];
        if(runtimeAlias){ return runtimeAlias; }
        const lower = raw.toLowerCase();
        const aliasHit = ITEM_NAME_ALIAS_TABLE[raw] ?? ITEM_NAME_ALIAS_TABLE[sanitized] ?? ITEM_NAME_ALIAS_TABLE[lower];
        if(aliasHit){
          if(createAlias) this.ensureAliasMapping(raw, aliasHit);
          return aliasHit;
        }
        const directBase = BASE_ITEM_DEFS[raw];
        if(directBase){ if(createAlias) this.ensureAliasMapping(raw, raw); return raw; }
        const directDynamic = this.itemDefs?.[raw];
        if(directDynamic){ if(createAlias) this.ensureAliasMapping(raw, raw); return raw; }
        const baseMatch = Object.keys(BASE_ITEM_DEFS).find(key => sanitizeItemKey(key) === sanitized);
        if(baseMatch){ if(createAlias) this.ensureAliasMapping(raw, baseMatch); return baseMatch; }
        const dynamicMatch = Object.keys(this.itemDefs||{}).find(key => sanitizeItemKey(key) === sanitized);
        if(dynamicMatch){ if(createAlias) this.ensureAliasMapping(raw, dynamicMatch); return dynamicMatch; }
        if(raw === '药草'){ if(createAlias) this.ensureAliasMapping(raw, '草药'); return '草药'; }
        if(createAlias) this.ensureAliasMapping(raw, raw);
        return raw;
      },
      ensureAliasMapping(alias, canonical){
        if(!alias && alias !== 0) return;
        const key = sanitizeItemKey(alias);
        if(!key) return;
        this.itemAliasDefs[key] = canonical;
      },
      getItemDef(name){
        const canonical = this.normalizeItemName(name);
        return (this.itemDefs && this.itemDefs[canonical]) || BASE_ITEM_DEFS[canonical] || null;
      },
      hasItemDef(name){
        return !!this.getItemDef(name);
      },
      ensureItemDef(name, options = {}){
        const { makeMutable = false, fallbackCategory = '素材' } = options;
        const canonical = this.normalizeItemName(name, { createAlias:true });
        if(!canonical) return null;
        if(this.itemDefs[canonical]) return this.itemDefs[canonical];
        const base = BASE_ITEM_DEFS[canonical];
        if(base){
          if(makeMutable){
            this.itemDefs[canonical] = JSON.parse(JSON.stringify(base));
            return this.itemDefs[canonical];
          }
          return base;
        }
        if(ABSTRACT_ITEM_BLOCKLIST.some(w=>canonical.includes(w))) return null;
        const placeholder = this.createPlaceholderItemDef(canonical, fallbackCategory);
        this.itemDefs[canonical] = placeholder;
        return placeholder;
      },
      createPlaceholderItemDef(name, category = '素材'){
        return {
          name,
          category,
          desc: `${name}：尚未写入详细描述`,
          usable:false,
          consumable:false,
          useEffects:[],
          buyable:false,
          buyPrice:0,
          sellable:true,
          sellPrice:8
        };
      },
      normalizeUseEffect(effect){
        if(!effect || typeof effect !== 'object') return null;
        const type = String(effect.type || '').trim();
        if(!type) return null;
        const normalized = { type };
        if(effect.value !== undefined && effect.value !== null) normalized.value = Number(effect.value);
        if(effect.name !== undefined) normalized.name = String(effect.name);
        if(effect.qty !== undefined) normalized.qty = Number(effect.qty);
        if(effect.target !== undefined) normalized.target = effect.target;
        if(effect.to !== undefined) normalized.to = effect.to;
        if(effect.toByName !== undefined) normalized.toByName = effect.toByName;
        if(effect.desc !== undefined) normalized.desc = String(effect.desc);
        return normalized;
      },
      sanitizeItemDefinition(def){
        if(!def || typeof def !== 'object') return null;
        const rawName = def.name ?? def.title;
        const canonical = this.normalizeItemName(rawName, { createAlias:true });
        if(!canonical || ABSTRACT_ITEM_BLOCKLIST.some(w=>canonical.includes(w))) return null;
        const category = ['消耗品','素材','装备'].includes(def.category) ? def.category : (def.category ? String(def.category) : '素材');
        const desc = String(def.desc || '').trim() || `${canonical}：来自未知事件，描述待补充`;
        const usable = Boolean(def.usable);
        const consumable = usable ? (def.consumable !== undefined ? Boolean(def.consumable) : true) : Boolean(def.consumable);
        let useEffects = Array.isArray(def.useEffects) ? def.useEffects.map(e=>this.normalizeUseEffect(e)).filter(Boolean) : [];
        if(usable && useEffects.length === 0){
          useEffects = [{ type:'hp+', value:10 }];
        }
        const sellable = def.sellable === undefined ? true : Boolean(def.sellable);
        let sellPrice = Number(def.sellPrice ?? def.price ?? 0);
        if(sellable){ sellPrice = Math.max(1, Math.round(isFinite(sellPrice)?sellPrice:10)); } else { sellPrice = 0; }
        const buyable = Boolean(def.buyable);
        let buyPrice = Number(def.buyPrice ?? (sellPrice>0 ? sellPrice*2 : 0));
        if(!buyable) buyPrice = 0;
        const aliases = Array.isArray(def.aliases) ? def.aliases : [];
        return {
          name: canonical,
          category,
          desc,
          usable,
          consumable,
          useEffects,
          buyable,
          buyPrice: buyable ? Math.max(0, Math.round(buyPrice)) : 0,
          sellable,
          sellPrice,
          aliases
        };
      },
      registerItemDefinition(def){
        const sanitized = this.sanitizeItemDefinition(def);
        if(!sanitized) return null;
        const { aliases = [], ...core } = sanitized;
        const canonical = core.name;
        const existingBase = BASE_ITEM_DEFS[canonical];
        if(existingBase){
          this.itemDefs[canonical] = { ...JSON.parse(JSON.stringify(existingBase)), ...core, name: canonical };
        } else {
          this.itemDefs[canonical] = { ...core };
        }
        this.ensureAliasMapping(canonical, canonical);
        if(Array.isArray(aliases)){
          aliases.forEach(alias=>this.ensureAliasMapping(alias, canonical));
        }
        return canonical;
      },
      summarizeUseEffects(effects){
        if(!effects || effects.length===0) return '无使用效果';
        return effects.map(e=>{
          if(!e || !e.type) return '';
          if(e.type==='move') return '位移';
          const label = ITEM_PROMPT_EFFECT_SUMMARY_MAP[e.type];
          if(label){
            const val = e.value || 0;
            const sign = val>0?'+':'';
            return `${label}${val?` ${sign}${val}`:''}`.trim();
          }
          return e.type;
        }).filter(Boolean).join(' / ');
      },
      getUseEffectsText(effects){
        return this.summarizeUseEffects(effects);
      },
      canUseSelectedItem(){
        const canonical=this.normalizeItemName(this.selectedItemName);
        if(!canonical) return false;
        const def=this.getItemDef(canonical);
        return !!(def && def.usable && (this.inventory[canonical]||0)>0 && (def.useEffects||[]).length>0);
      },
      async useSelectedItem(){
        const canonical=this.normalizeItemName(this.selectedItemName);
        if(!canonical) return;
        if(!this.canUseSelectedItem()) return;
        const def=this.getItemDef(canonical);
        this.applyEffects(def.useEffects||[]);
        if(def.consumable!==false){
          this.inventory[canonical] = Math.max(0, (this.inventory[canonical]||0)-1);
        }
        this.narration = `<p>你使用了 <span style="color:var(--accent);">${canonical}</span>。</p>`;
        await this.persist();
      },
      getKnownItemSummaries(limit = MAX_PROMPT_KNOWN_ITEMS){
        const entries = [];
        const merged = { ...BASE_ITEM_DEFS, ...(this.itemDefs||{}) };
        for(const name of Object.keys(merged)){
          const def = merged[name];
          entries.push({
            name,
            summary: this.summarizeUseEffects(def.useEffects||[]),
            sellPrice: def.sellable ? def.sellPrice : 0
          });
        }
        return entries
          .sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
          .slice(0, limit)
          .map(e=>`${e.name}｜${e.summary}${e.sellPrice?`｜售 ${e.sellPrice}G`:''}`);
      },
      getPromptInventoryNames(){
        const names = new Set();
        Object.keys(this.inventory||{}).forEach(n=>{
          const canonical=this.normalizeItemName(n,{createAlias:true});
          if(canonical) names.add(canonical);
        });
        return Array.from(names).sort((a,b)=>a.localeCompare(b,'zh-CN'));
      },
      encodeItemDefsForSave(){
        const defs = this.itemDefs || {};
        return Object.keys(defs).map(name => {
          const payload = { ...defs[name], name };
          return packItemDef(payload);
        });
      },
      decodeItemDefsFromSave(packed){
        const out = {};
        if(Array.isArray(packed)){
          packed.forEach(entry => {
            const def = unpackItemDef(entry);
            if(def && def.name){
              out[def.name] = def;
            }
          });
        }
        return out;
      },
      upgradeLegacyItemDefs(legacy){
        const out = {};
        if(legacy && typeof legacy === 'object'){
          Object.keys(legacy).forEach(name => {
            const candidate = { ...legacy[name], name };
            const sanitized = this.sanitizeItemDefinition(candidate);
            if(sanitized){
              const { aliases = [], ...core } = sanitized;
              out[core.name] = core;
              this.ensureAliasMapping(core.name, core.name);
              if(Array.isArray(aliases)) aliases.forEach(alias => this.ensureAliasMapping(alias, core.name));
            }
          });
        }
        return out;
      },
      encodeItemAliasesForSave(){
        const entries = [];
        Object.entries(this.itemAliasDefs || {}).forEach(([alias, canonical])=>{
          if(alias && canonical){
            entries.push([alias, canonical]);
          }
        });
        return entries;
      },
      decodeItemAliasesFromSave(packed){
        const map = {};
        (Array.isArray(packed)?packed:[]).forEach(entry => {
          if(!Array.isArray(entry)) return;
          const [alias, canonical] = entry;
          if(alias && canonical){
            map[sanitizeItemKey(alias)] = canonical;
          }
        });
        return map;
      },
      compactInventory(){
        const normalized = {};
        Object.entries(this.inventory || {}).forEach(([name, qty]) => {
          const amount = Number(qty) || 0;
          if(amount <= 0) return;
          const canonical = this.normalizeItemName(name, { createAlias:true }) || String(name).trim();
          if(!canonical) return;
          normalized[canonical] = (normalized[canonical] || 0) + amount;
        });
        this.inventory = normalized;
      },
      describeEvent(ev){
        if(!ev||!ev.type) return '';
        if(ev.type==='move') return `移动到 ${ev.to?.areaName||''} · ${ev.to?.locationName||''}`.trim();
        if(ev.type==='moveFailed') return '移动失败：未识别的地点';
        if(ev.type==='addItem') return `获得 ${ev.name} x${ev.qty}`;
        if(ev.type==='removeItem') return `失去 ${ev.name} x${ev.qty}`;
        if(ev.type==='gold') return `金币 ${ev.delta>0?'+':''}${ev.delta}`;
        if(ev.type==='hp') return `HP ${ev.delta>0?'+':''}${ev.delta}`;
        return ev.type;
      },

      // ===== 存档系统 =====
      async persist() {
        try {
      const kv = window.dzmm?.kv;
          const excludeKeys = ['loading', 'disabled', 'worldMap', 'shopItems', 'messages', 'itemDefs', 'itemAliasDefs'];
      const data = {};
          this.compactInventory();
          Object.keys(this).forEach(k => {
            if (typeof this[k] === 'function') return;
            if (excludeKeys.includes(k)) return;
        data[k] = this[k];
      });
          data.itemDefsPacked = this.encodeItemDefsForSave();
          data.itemAliasPacked = this.encodeItemAliasesForSave();
          data.itemStateVersion = 2;
          await kv?.put(SAVE_KEY, data);
        } catch (e) {
          console.warn('保存失败', e);
        }
      },

      async restore() {
        try {
      const kv = window.dzmm?.kv;
          const res = await kv?.get(SAVE_KEY);
      const data = res?.value || res;
          console.log('💾 [存档恢复] 读取结果:', data ? '有存档' : '无存档');
          if (data) {
            const {
              itemDefsPacked,
              itemAliasPacked,
              itemDefs: legacyDefs,
              itemAliasDefs: legacyAlias,
              itemStateVersion,
              ...rest
            } = data;

            Object.keys(rest).forEach(key => {
              if (['itemDefsPacked','itemAliasPacked','itemDefs','itemAliasDefs','itemStateVersion'].includes(key)) return;
              this[key] = rest[key];
            });

            const aliasEntries = Array.isArray(itemAliasPacked)
              ? itemAliasPacked
              : legacyAlias && typeof legacyAlias === 'object'
                ? Object.entries(legacyAlias)
                : [];
            this.itemAliasDefs = this.decodeItemAliasesFromSave(aliasEntries);
            if(!this.itemAliasDefs || typeof this.itemAliasDefs !== 'object') this.itemAliasDefs = {};

            if(Array.isArray(itemDefsPacked)){
              this.itemDefs = this.decodeItemDefsFromSave(itemDefsPacked);
            } else if(legacyDefs && typeof legacyDefs === 'object'){
              this.itemDefs = this.upgradeLegacyItemDefs(legacyDefs);
            } else {
              this.itemDefs = {};
            }
            if(!this.itemDefs || typeof this.itemDefs !== 'object') this.itemDefs = {};

            Object.keys({ ...BASE_ITEM_DEFS, ...this.itemDefs }).forEach(name => this.ensureAliasMapping(name, name));
            this.compactInventory();

            this.storyModel = this.storyModel || 'nalang-max-7-32K';
            if(!this.ui || typeof this.ui !== 'object') this.ui = {};
            this.ui.customInputOpen = false;
            this.ui.storyModelMenuOpen = false;
            this.ui.sellQuantities = this.ui.sellQuantities || {};
            console.log('💾 [存档恢复] 恢复的数据:', {
              started: this.started,
              playerName: this.playerName,
              level: this.level,
              currentLocation: this.currentLocation
            });
            // 恢复后重新初始化系统提示
            if (!this.messages || this.messages.length === 0) {
              console.log('⚠️ [存档恢复] messages 为空，重新初始化');
              const systemPrompt = `你是一个文字冒险游戏的故事生成引擎。你的任务是为玩家创造沉浸式的RPG体验。

【游戏世界背景】
玩家处于一个日系异世界中，需要通过探索、战斗和与NPC互动来完成冒险目标。
世界被分为多个区域：新手平原、青葱森林、荒芜山脉、废墟之地、魔王城等。
危险的怪物分布在各地：魔物、兽人和恶魔。

【你的角色】
- 你负责生成沉浸式的场景描述，帮助玩家感受这个世界
- 使用第二人称"你"进行叙述
- 保持故事的一致性和世界观的完整性
- 遵循玩家的位置和游戏状态

【文本风格要求】
- 简洁明快的日系RPG风格
- 避免过长的段落，保持节奏感
- 可适当使用数字和符号表情来增强代入感
- 生成内容应该在100-400字之间

【效果协议（极其重要）】
当我请求叙事结果时，你可以在叙事后追加一个效果块，用于驱动数值与位移：
###EFFECTS
[ {"type":"hp+","value":10}, {"type":"hpMax+","value":5}, {"type":"mpMax+","value":3},
{"type":"atk+","value":1}, {"type":"def+","value":1},
{"type":"addItem","name":"药草","qty":2}, {"type":"removeItem","name":"药草","qty":1},
{"type":"move","toByName":{"region":"阿姆斯王国","area":"青葱森林","location":"森林入口"}}
]
###END
支持类型：hp+/mp+/hpMax+/mpMax+/atk+/def+/addItem/removeItem/move(to 或 toByName)/defineItem。所有数值可正可负。

规则：抽象内容(情报/线索/传闻/信息/知识等)不得作为道具，禁止用 addItem/removeItem 添加。
若要引入新道具，需同时在 EFFECTS 中提供 defineItem：
{"type":"defineItem","def":{"name":"体力之书","useEffects":[{"type":"hpMax+","value":5}],"desc":"永久提升体力","consumable":false}}

【禁止事项】
- 不要引导玩家做选择
- 不要生成游戏系统消息（如HP变化、物品获得等）
- 不要改变玩家的位置、状态或背包，除非明确说明
- 不要生成重复的场景描述

现在开始为玩家生成故事内容。`;
              this.messages = [{ role: 'user', content: systemPrompt }];
              console.log('✅ [存档恢复] messages 已重新初始化');
            } else {
              console.log('✅ [存档恢复] messages 已存在，数量:', this.messages.length);
            }
          }
        } catch (e) {
          console.error('❌ [存档恢复失败]:', e);
        }
      },

      async restart() {
        if (!confirm('确定要重新开始吗？当前进度将会丢失。')) return;
        try {
          const kv = window.dzmm?.kv;
          if (kv) {
            await kv.delete(SAVE_KEY);
          }
        } catch (e) {
          console.warn('删除存档失败', e);
        }
        // 强制刷新页面，清除所有状态
        window.location.href = window.location.href;
  },

      aliasDefs: {},
      events: [], // state event feed
      eventIdCounter: 0, // 用于生成唯一的事件ID

      getAllLocationRecords(){
        const records=[];
        Object.entries(WORLD_MAP).forEach(([regName, reg])=>{
          Object.entries(reg.areas).forEach(([areaName, area])=>{
            area.locations.forEach(loc=>{
              records.push({ regionId:reg.id, regionName:regName, areaId:area.id, areaName, locationId:loc.id, locationName:loc.name, locationType:loc.type, desc:loc.desc||'' });
            });
          });
        });
        return records;
      },

      resolveLocationByPath(regionName, areaName, locationName){
        const reg = Object.entries(WORLD_MAP).find(([n,_])=>n===regionName)?.[1];
        if(!reg) return null;
        const areaEntry = Object.entries(reg.areas).find(([n,_])=>n===areaName);
        if(!areaEntry) return null;
        const area = areaEntry[1];
        const loc = area.locations.find(l=>l.name===locationName);
        if(!loc) return null;
        return { regionId:reg.id, areaId:area.id, locationId:loc.id, names:{region:regionName, area:areaName, location:locationName} };
      },

      resolveLocationByName(input){
        if(!input) return null;
        const s=String(input).trim();
        if(this.aliasDefs[s]){
          const [rn,an,ln]=String(this.aliasDefs[s]).split('/');
          return this.resolveLocationByPath(rn,an,ln);
        }
        if(s.includes('/')){
          const [rn,an,ln]=s.split('/');
          const hit=this.resolveLocationByPath(rn,an,ln); if(hit) return hit;
        }
        const recs=this.getAllLocationRecords();
        let hit = recs.find(r=>r.locationName===s)||recs.find(r=>r.areaName===s)||recs.find(r=>r.regionName===s);
        if(hit) return {regionId:hit.regionId,areaId:hit.areaId,locationId:hit.locationId,names:{region:hit.regionName,area:hit.areaName,location:hit.locationName}};
        hit = recs.find(r=>r.locationName.includes(s))||recs.find(r=>r.areaName.includes(s))||recs.find(r=>r.regionName.includes(s));
        if(hit) return {regionId:hit.regionId,areaId:hit.areaId,locationId:hit.locationId,names:{region:hit.regionName,area:hit.areaName,location:hit.locationName}};
        return null;
      },

      parseIntent(text){
        const S='###INTENT'; const si=text.indexOf(S); if(si===-1) return null;
        const until = ['###EFFECTS','###END'];
        let ei=-1; for(const m of until){ const idx=text.indexOf(m, si+S.length); if(idx!==-1) ei=ei===-1?idx:Math.min(ei,idx); }
        const raw=text.slice(si+S.length, ei===-1?text.length:ei).trim();
        try{ const obj=JSON.parse(raw); console.log('🧭 [INTENT]',obj); return obj; }catch(e){ console.warn('INTENT 解析失败',e,raw); return null; }
      },

      addEvent(ev){ try{ this.eventIdCounter++; this.events.push({id:this.eventIdCounter, time:Date.now(),...ev}); if(this.events.length>50) this.events.shift(); }catch(_){}}
});

    queueMicrotask(() => Alpine.store('game').init?.());
});
