// ==UserScript==
// @name         草群友plus修复版
// @author       克舟（qq：250342361）
// @version      2.4.1
// @description  使用 .草群友帮助查看功能 支持昵称、精华、排行、查询、重置、反草、关系、状态、攻受榜、群P、商城、触手宠物
// @license      MIT
// ==/UserScript==

let ext = seal.ext.find('草群友plus修复版');

if (!ext) {
  ext = seal.ext.new('草群友plus修复版', '克舟', '2.4.1');
  seal.ext.register(ext);

  seal.ext.registerStringConfig(ext, '最小精华', '100');
  seal.ext.registerStringConfig(ext, '最大精华', '1000');
  seal.ext.registerStringConfig(ext, '每日最大次数', '10000');
  seal.ext.registerStringConfig(ext, '冷却秒数', '60');
}

// =====================
// 数据库
// =====================

function loadData() {
  try {
    return JSON.parse(ext.storageGet('grassData') || '{}');
  } catch (e) {
    return {};
  }
}

function saveData(data) {
  ext.storageSet('grassData', JSON.stringify(data));
}

function getGroupId(msg) {
  return msg.groupId || 'private';
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCfgInt(name, defVal) {
  const v = parseInt(seal.ext.getStringConfig(ext, name) || defVal);
  return isNaN(v) ? defVal : v;
}

function extractAtQQ(text) {
  const m = text.match(/\[CQ:at,qq=(\d+)\]/);
  return m ? m[1] : '';
}

function extractPureId(userId) {
  const m = String(userId || '').match(/(\d+)/);
  return m ? m[1] : String(userId || '');
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

// =====================
// 文案池（大幅丰富）
// =====================

const firstTexts = [
  '恭喜拿下${user.nickname}今日一血！他的身体还没准备好就被你贯穿，娇嫩的穴口渗出点点血丝。',
  '${user.nickname}的第一次被你夺走，他娇喘着在你身下颤抖，眼神中交织着痛苦与渴求。',
  '你撕开了${user.nickname}的防线，成为今天第一个占有他的人，紧致的内壁死死咬住你的肉棒。',
  '${user.nickname}连反抗的念头都没来得及生出，就被你彻底占领了初次的领域，泪水与爱液混作一团。'
];

const normalTexts = [
  '你狠狠地操了${user.nickname}，在他大腿内侧留下了一个正字，精液顺着股缝缓缓流下。',
  '你温柔地操了${user.nickname}，他迷迷糊糊地喊着你的名字，腰肢轻轻扭动着迎合。',
  '你不断操弄着${user.nickname}，在他的身体上留下了你的痕迹，小腹上满是黏腻的指痕。',
  '你抬起${user.nickname}的双腿，深深进入，他发出呜咽，双手无力地抓着床单。',
  '你将${user.nickname}按在墙上，从背后进入，他只能无力地承受，臀肉被撞得通红。',
  '${user.nickname}的腰肢被你握住，每一次撞击都让他眼神迷离，嘴角淌出口水。',
  '${user.nickname}的每一寸肌肤都被汗水浸透，黏腻的液体在股间拉出银丝，发出淫靡的水声。',
  '${user.nickname}浑身潮红，喘着粗气，眼神涣散得对不上焦，像是坏掉的玩偶。',
  '${user.nickname}被按着头，被迫咽下了一整轮的精液，呛得眼泪直流，喉头滚动着吞咽。',
  '你抓住${user.nickname}的脚踝，将他的双腿压到胸前，看着他的后穴一缩一张，贪婪地吞吐着你的肉棒。'
];

const highTexts = [
  '${user.nickname}今天已经被草晕了过去，但你已经兽性大发，抱着此人的娇躯一次又一次地注入${amount}ml的精华，顺着大腿流了一地，空气中满是精液的淫靡气息。',
  '${user.nickname}在你持之以恒的操弄下已经失去了意识，可你仍然对那不断抽搐的娇躯发泄着欲望，白浊的泡沫从穴口溢出。',
  '${user.nickname}在你毫无克制的纵欲下露出了被玩坏的表情，却也无法阻止你一次又一次注入${amount}ml的精华到体内，小腹肉眼可见地鼓起。',
  '你疯狂地抽送，${user.nickname}的呻吟已经沙哑，身体却诚实地迎合你，最后一股热流灌满了他的小腹，整个人瘫软如泥。',
  '${user.nickname}的身体已不受控制地颤抖，防线全面崩溃，液体顺着大腿肆意流淌。群聊见证了一具肉体从抗拒到沉沦的全过程。',
  '${user.nickname}连反抗的力气都没有了，只能任由一波又一波的快感将他淹没，穴口一张一合地吐着精液。',
  '${user.nickname}的体内已被灌得满满当当，甚至有些顺着缝隙渗了出来，他捂着肚子蜷缩在地上，白浊从指缝间流出，眼神空洞。',
  '你持续冲击着${user.nickname}的最深处，每一次都让他发出呜咽，他的腰肢已经不由自主地迎合你的节奏，像个熟练的娼妓。'
];

const legendTexts = [
  '${user.nickname}已成为今日群聊必吃榜人物，他的身体已被精华填满，痕迹遍布，愈发可人，群友们排着队想要品尝。',
  '${user.nickname}被操到失神，却还主动扭动腰肢，贪婪地索取你的一切，嘴里呢喃着还要还要。',
  '${user.nickname}浑身都是你的印记，他瘫软在地，嘴里还含着你的味道，痴痴地笑着。',
  '${user.nickname}彻底沦陷，每一次抽送都带出黏腻的水声，他的哭喊早已变成娇媚的呻吟。',
  '${user.nickname}的屁股被撞得通红，却仍紧紧夹住你不放，像是要把你榨干一般，精液沿着大腿根不断滑落。',
  '你射了又射，${user.nickname}的小腹微微隆起，他无力地躺在一片狼藉中，眼神空洞却带着满足，手指无意识地抠弄着穴口。'
];

const mythTexts = [
  '${user.nickname}已经彻底被玩坏了，他户门大开向每个群友讨要精华，嘴里塞满了肉棒。',
  '${user.nickname}已经成为群里的公共惹不起，无论谁来都能随意使用，后穴再也合不拢，永远流淌着白浊。',
  '${user.nickname}的每一寸肌肤都被精液覆盖，他笑着流泪，早已不知羞耻为何物，只会爬向下一根硬物。',
  '${user.nickname}被操成了只会索取精液的怪物，嘴里喃喃着“还要”，身体无休止地痉挛，仿佛只为性欲而活。',
  '整个群聊都为${user.nickname}的淫乱表演沸腾，他跪在地上，摇着屁股迎接每一轮冲击，穴肉翻出艳红。',
  '${user.nickname}的肉体已经不属于自己，每一条神经都在为快感跳动，群友们的精华就是他的生命之源，他如饥似渴地吞咽。'
];

const cooldownTexts = [
  '现在还在贤者时间哦，不要老想着草人哦，下面还疼着呢。',
  '系统友情提醒：适度节制，有益身心，再不停下就要磨破皮了。',
  '你刚刚才释放过，下面还肿着呢，歇歇吧，别逞强了。'
];

const maxTexts = [
  '再这样下去就要精尽人亡了，今天先休息吧，明天再战。',
  '你已经榨干了今天的精力，一滴都不剩了，明天再补充吧。',
  '你的身体发出了警告，再继续下去怕是要进医院了。'
];

const counterTexts = [
  '你反手将${user.nickname}压在身下，以其人之道还治其人之身，狠狠操了回去！对方惊叫着被你贯穿。',
  '${user.nickname}没想到你会反击，猝不及防被你就地正法，叫得比谁都欢，后穴贪婪地吸住你。',
  '你猛烈地反击，${user.nickname}的求饶声反而让你更兴奋，你掐住他的腰疯狂冲刺。',
  '你抓住${user.nickname}的脚踝，将他的反抗碾碎，用更猛烈的冲击回敬他，淫水溅了一地。',
  '你暴起反草，${user.nickname}的尖叫中带着惊喜，身体立刻诚实地迎合你，主动翘起屁股。',
  '${user.nickname}想逃跑，却被你一把拉回，用更凶狠的插入让他明白谁才是主人，他颤抖着被灌满。',
  '你反客为主，将${user.nickname}按在沙发上，狠狠地灌满了他，他只能颤抖着接受，眼神逐渐涣散。',
  '${user.nickname}的反抗激起了你的征服欲，你把他干到失禁，尿水混合着精液流了一地，他羞耻地哭了。'
];

// =====================
// 事件等级
// =====================

function getEventInfo(todayCount, isCounter) {
  const texts = isCounter ? counterTexts : (() => {
    if (todayCount >= 100) return mythTexts;
    if (todayCount >= 10) return legendTexts;
    if (todayCount >= 5) return highTexts;
    if (todayCount === 1) return firstTexts;
    return normalTexts;
  })();

  let name, star;
  if (todayCount >= 100) { name = '群史事件'; star = '★★★★★'; }
  else if (todayCount >= 10) { name = '传奇事件'; star = '★★★★☆'; }
  else if (todayCount >= 5) { name = '异常事件'; star = '★★★☆☆'; }
  else if (todayCount === 1) { name = '首次记录'; star = '★★☆☆☆'; }
  else { name = '普通事件'; star = '★☆☆☆☆'; }

  return { name, star, text: pick(texts) };
}

// =====================
// 辅助：格式化文案
// =====================

function formatEventText(text, user, amount) {
  return text
    .replace(/\$\{user\.nickname\}/g, user.nickname)
    .replace(/\$\{amount\}/g, amount);
}

// =====================
// 确保群数据存在
// =====================

function ensureGroup(data, groupId) {
  if (!data[groupId]) {
    data[groupId] = {
      users: {},
      senderDaily: {},
      relations: {},
      groupP: null,
      lastGrassedTarget: null,
      lastGrassedTime: 0
    };
  }
  if (!data[groupId].users) data[groupId].users = {};
  if (!data[groupId].senderDaily) data[groupId].senderDaily = {};
  if (!data[groupId].relations) data[groupId].relations = {};
  if (!data[groupId].hasOwnProperty('groupP')) data[groupId].groupP = null;
  if (!data[groupId].hasOwnProperty('lastGrassedTarget')) data[groupId].lastGrassedTarget = null;
  if (!data[groupId].hasOwnProperty('lastGrassedTime')) data[groupId].lastGrassedTime = 0;
  return data[groupId];
}

// =====================
// 确保用户数据存在
// =====================

function ensureUser(group, qq, nickname) {
  if (!group.users[qq]) {
    group.users[qq] = {
      qq: qq,
      nickname: nickname || qq,
      totalEssence: 0,
      todayEssence: 0,
      totalCount: 0,
      todayCount: 0,
      todayActive: 0,
      todayPassive: 0,
      activeCount: 0,
      passiveCount: 0,
      status: 'normal',
      statusExpire: 0,
      lastDate: '',
      firstTime: '',
      lastTime: '',
      items: {},
      pet: null
    };
  }
  if (nickname && nickname !== qq) {
    group.users[qq].nickname = nickname;
  }
  const u = group.users[qq];
  if (u.todayActive === undefined) u.todayActive = 0;
  if (u.todayPassive === undefined) u.todayPassive = 0;
  if (u.activeCount === undefined) u.activeCount = 0;
  if (u.passiveCount === undefined) u.passiveCount = 0;
  if (u.status === undefined) u.status = 'normal';
  if (typeof u.statusExpire !== 'number') u.statusExpire = 0;
  if (!u.items) u.items = {};
  if (!u.hasOwnProperty('pet')) u.pet = null;
  return u;
}

// =====================
// 每日刷新（不再重置状态，改为时间判断）
// =====================

function resetDailyIfNeeded(user) {
  const t = todayKey();
  if (user.lastDate !== t) {
    user.lastDate = t;
    user.todayEssence = 0;
    user.todayCount = 0;
    user.todayActive = 0;
    user.todayPassive = 0;
  }
  if (user.status !== 'normal' && Date.now() > user.statusExpire) {
    user.status = 'normal';
    user.statusExpire = 0;
  }
}

// =====================
// 状态触发（概率10%，持续3小时）
// =====================

function applyStatus(user) {
  if (user.status !== 'normal') return user.status;
  const r = Math.random();
  if (r < 0.1) {
    user.status = 'horny';
    user.statusExpire = Date.now() + 3 * 3600 * 1000;
    return 'horny';
  } else if (r < 0.2) {
    user.status = 'weak';
    user.statusExpire = Date.now() + 3 * 3600 * 1000;
    return 'weak';
  }
  return 'normal';
}

// =====================
// 读取发送者每日次数与冷却
// =====================

function getSenderDaily(group, senderQQ) {
  const t = todayKey();
  if (!group.senderDaily[senderQQ]) {
    group.senderDaily[senderQQ] = { date: t, count: 0, cooldownUntil: 0 };
  }
  if (group.senderDaily[senderQQ].date !== t) {
    group.senderDaily[senderQQ] = { date: t, count: 0, cooldownUntil: 0 };
  }
  return group.senderDaily[senderQQ];
}

// =====================
// 更新关系
// =====================

function updateRelation(group, qq1, qq2, isCounter) {
  const key = qq1 < qq2 ? `${qq1}_${qq2}` : `${qq2}_${qq1}`;
  if (!group.relations[key]) {
    group.relations[key] = { count1: 0, count2: 0 };
  }
  const rel = group.relations[key];
  if (qq1 < qq2) {
    rel.count1 += 1;
  } else {
    rel.count2 += 1;
  }
}

// =====================
// 随机事件处理（返回事件描述）
// =====================

function handleRandomEvent(ctx, msg, eventType, dataRef) {
  if (Math.random() >= 0.03) return false;
  const targetQQ = dataRef.targetQQ;
  const user = dataRef.user;
  const sender = dataRef.sender;
  const amount = dataRef.amount;
  let eventText = '';

  switch (eventType) {
    case 'grass':
      if (Math.random() < 0.5) {
        eventText = `【随机事件】${user.nickname} 一个翻身躲开了你的冲击！你摔了个狗吃屎，本次操作无效。`;
        dataRef.amount = 0;
        dataRef.cancelAction = true;
        dataRef.skipCooldown = true;
      } else {
        eventText = `【随机事件】你正要插入，却被 ${user.nickname} 一把推翻，他骑到你身上疯狂输出！你被反草了。`;
        dataRef.reversed = true;
        dataRef.skipCooldown = false;
      }
      break;
    case 'buy':
      eventText = `【随机事件】你在合欢楼挑选时，一个黑影将你按在柜台上狠狠草了一顿，你被迫接受了 ${rand(50,200)} 点精华。`;
      dataRef.extraPassive = rand(50,200);
      break;
    case 'useitem':
      eventText = `【随机事件】你手中的道具突然化作一滩黏液，什么也没发生。`;
      dataRef.itemInvalid = true;
      break;
    case 'petfeed':
      eventText = `【随机事件】触手突然狂暴，反向吸食你的精力，精华只榨出了一半。`;
      dataRef.halfFeed = true;
      break;
    default: return false;
  }
  seal.replyToSender(ctx, msg, eventText);
  return true;
}

// =====================
// 核心：草群友（修复精华累加bug）
// =====================

const cmdGrass = seal.ext.newCmdItemInfo();
cmdGrass.name = '草群友';
cmdGrass.help =
`草群友插件

用法：
.草群友@某人
.群p @某人
.精华量排行
.攻受排行
.精华查询@某人
.反草@某人
.关系@某人
.状态
.重置精华@某人
.清空精华排行
.合欢楼
.购买 商品名 [数量]
.背包
.使用 道具名 [@目标]
.领养触手
.喂养触手
.触手排行
.草群友帮助`;

cmdGrass.solve = (ctx, msg, cmdArgs) => {
  const raw = msg.message || '';
  const targetQQ = extractAtQQ(raw);

  if (!targetQQ) {
    seal.replyToSender(ctx, msg, '请艾特一个群友，例如：.草群友@某人');
    return seal.ext.newCmdExecuteResult(true);
  }

  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);

  const senderQQ = extractPureId(msg.sender.userId);
  const senderDaily = getSenderDaily(group, senderQQ);

  const maxDaily = getCfgInt('每日最大次数', 10000);
  const cooldownSec = getCfgInt('冷却秒数', 60);
  const minEssence = getCfgInt('最小精华', 100);
  const maxEssence = getCfgInt('最大精华', 1000);

  const now = Date.now();

  if (senderDaily.cooldownUntil && now < senderDaily.cooldownUntil) {
    seal.replyToSender(ctx, msg, pick(cooldownTexts));
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  if (senderDaily.count >= maxDaily) {
    seal.replyToSender(ctx, msg, pick(maxTexts));
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  let nickname = targetQQ;
  if (group.users[targetQQ] && group.users[targetQQ].nickname) {
    nickname = group.users[targetQQ].nickname;
  }
  const user = ensureUser(group, targetQQ, nickname);
  resetDailyIfNeeded(user);

  const sender = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  resetDailyIfNeeded(sender);

  if (sender._boundedUntil && now < sender._boundedUntil) {
    seal.replyToSender(ctx, msg, `你被捆绳束缚着，无法主动草人，直到 ${new Date(sender._boundedUntil).toLocaleTimeString()}`);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  const statusTriggered = applyStatus(sender);

  let amount = rand(minEssence, maxEssence);
  if (sender._aphrodisiacUses && sender._aphrodisiacUses > 0) {
    amount = Math.floor(amount * 1.5);
    sender._aphrodisiacUses -= 1;
    if (sender._aphrodisiacUses === 0) delete sender._aphrodisiacUses;
  }
  if (sender.status === 'horny') {
    amount = Math.floor(amount * 1.5);
  } else if (sender.status === 'weak') {
    amount = Math.floor(amount * 0.5);
  }
  if (amount < 1) amount = 1;

  const eventData = {
    targetQQ, user, sender, amount,
    cancelAction: false,
    reversed: false,
    skipCooldown: false,
    extraPassive: 0,
    itemInvalid: false,
    halfFeed: false
  };
  const randomTriggered = handleRandomEvent(ctx, msg, 'grass', eventData);

  if (eventData.cancelAction) {
    if (!eventData.skipCooldown) {
      senderDaily.cooldownUntil = now + cooldownSec * 1000;
    }
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  if (eventData.reversed) {
    const temp = eventData.amount;
    const originalTarget = user;
    const originalSender = sender;
    senderDaily.count += 1;
    originalTarget.activeCount += 1;
    originalTarget.todayActive += 1;
    originalSender.passiveCount += 1;
    originalSender.todayPassive += 1;
    originalSender.totalEssence += temp;
    originalSender.todayEssence += temp;
    originalSender.totalCount += 1;
    originalSender.todayCount += 1;
    originalTarget.totalCount += 1;
    originalTarget.todayCount += 1;
    updateRelation(group, targetQQ, senderQQ, true);
    senderDaily.cooldownUntil = now + cooldownSec * 1000;
    group.lastGrassedTarget = senderQQ;
    group.lastGrassedTime = now;
    const eventInfo = getEventInfo(originalSender.todayPassive, true);
    const durationStr = generateRandomDuration();
    const eventText = formatEventText(eventInfo.text, originalSender, temp);
    const reply = buildReply(targetQQ, originalSender.nickname, eventInfo, eventText, durationStr, temp, senderDaily.count, originalSender.todayPassive, originalSender.todayEssence, statusTriggered);
    seal.replyToSender(ctx, msg, reply);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  senderDaily.count += 1;
  sender.activeCount += 1;
  sender.todayActive += 1;
  user.passiveCount += 1;
  user.todayPassive += 1;

  sender.totalCount += 1;
  sender.todayCount += 1;
  sender.lastTime = new Date().toLocaleString();
  if (!sender.firstTime) sender.firstTime = sender.lastTime;

  user.totalEssence += amount;
  user.todayEssence += amount;
  user.totalCount += 1;
  user.todayCount += 1;
  user.lastTime = new Date().toLocaleString();
  if (!user.firstTime) user.firstTime = user.lastTime;

  updateRelation(group, senderQQ, targetQQ, false);
  senderDaily.cooldownUntil = now + cooldownSec * 1000;

  group.lastGrassedTarget = targetQQ;
  group.lastGrassedTime = now;

  if (user._chastityUses && user._chastityUses > 0) {
    user._chastityUses -= 1;
    if (user._chastityUses === 0) delete user._chastityUses;
    user.passiveCount -= 1;
    user.todayPassive -= 1;
    user.totalEssence -= amount;
    user.todayEssence -= amount;
    user.totalCount -= 1;
    user.todayCount -= 1;
    seal.replyToSender(ctx, msg, `贞操锁生效！你这次没有被注入精华。`);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  if (eventData.extraPassive > 0) {
    user.totalEssence += eventData.extraPassive;
    user.todayEssence += eventData.extraPassive;
  }

  const eventInfo = getEventInfo(user.todayPassive, false);
  const durationStr = generateRandomDuration();
  const eventText = formatEventText(eventInfo.text, user, amount);
  const reply = buildReply(targetQQ, user.nickname, eventInfo, eventText, durationStr, amount, senderDaily.count, user.todayPassive, user.todayEssence, statusTriggered);

  saveData(data);
  seal.replyToSender(ctx, msg, reply);
  return seal.ext.newCmdExecuteResult(true);
};

function generateRandomDuration() {
  const minSeconds = 3;
  const maxSeconds = 3 * 3600;
  const totalSeconds = rand(minSeconds, maxSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let dur = '';
  if (hours > 0) dur += `${hours}小时`;
  if (minutes > 0) dur += `${minutes}分钟`;
  if (seconds > 0 || dur === '') dur += `${seconds}秒`;
  return dur;
}

function buildReply(targetQQ, nickname, eventInfo, eventText, durationStr, amount, count, targetTodayPassive, targetTodayEssence, statusTriggered) {
  let statusLine = '';
  if (statusTriggered === 'horny') statusLine = '\n💕 你处于发情状态，精华量 ×1.5！';
  else if (statusTriggered === 'weak') statusLine = '\n😵 你处于虚弱状态，精华量 ×0.5……';

  return `━━━━━━━━━━━━
你草了[CQ:at,qq=${targetQQ}] ${nickname} ！
事件等级：${eventInfo.name}${eventInfo.star}
${eventText}
你一共草了${durationStr}，注入了${amount} 点生命精华。这是你今天的第${count} 次！
他本日一共被草了${targetTodayPassive} 次，被注入了${targetTodayEssence} 点生命精华，小腹被满满的液体撑得微微隆起。
${statusLine}
━━━━━━━━━━━━`;
}

ext.cmdMap['草群友'] = cmdGrass;

// =====================
// 反草命令
// =====================

const cmdCounter = seal.ext.newCmdItemInfo();
cmdCounter.name = '反草';
cmdCounter.help = '反草@某人 – 反制对方，消耗冷却，精华减半';

cmdCounter.solve = (ctx, msg, cmdArgs) => {
  const raw = msg.message || '';
  const targetQQ = extractAtQQ(raw);
  if (!targetQQ) {
    seal.replyToSender(ctx, msg, '请艾特要反草的人，例如：.反草@某人');
    return seal.ext.newCmdExecuteResult(true);
  }

  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);

  const senderQQ = extractPureId(msg.sender.userId);
  const senderDaily = getSenderDaily(group, senderQQ);
  const maxDaily = getCfgInt('每日最大次数', 10000);
  const cooldownSec = getCfgInt('冷却秒数', 60);
  const minEssence = getCfgInt('最小精华', 100);
  const maxEssence = getCfgInt('最大精华', 1000);
  const now = Date.now();

  if (senderDaily.cooldownUntil && now < senderDaily.cooldownUntil) {
    seal.replyToSender(ctx, msg, pick(cooldownTexts));
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }
  if (senderDaily.count >= maxDaily) {
    seal.replyToSender(ctx, msg, pick(maxTexts));
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  let nickname = targetQQ;
  if (group.users[targetQQ] && group.users[targetQQ].nickname) {
    nickname = group.users[targetQQ].nickname;
  }
  const user = ensureUser(group, targetQQ, nickname);
  resetDailyIfNeeded(user);

  const sender = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  resetDailyIfNeeded(sender);

  let amount = rand(minEssence, maxEssence);
  amount = Math.floor(amount * 0.5);
  if (amount < 1) amount = 1;

  senderDaily.count += 1;
  sender.activeCount += 1;
  sender.todayActive += 1;
  user.passiveCount += 1;
  user.todayPassive += 1;

  sender.totalCount += 1;
  sender.todayCount += 1;
  sender.lastTime = new Date().toLocaleString();
  if (!sender.firstTime) sender.firstTime = sender.lastTime;

  user.totalEssence += amount;
  user.todayEssence += amount;
  user.totalCount += 1;
  user.todayCount += 1;
  user.lastTime = new Date().toLocaleString();
  if (!user.firstTime) user.firstTime = user.lastTime;

  updateRelation(group, senderQQ, targetQQ, true);
  senderDaily.cooldownUntil = now + cooldownSec * 1000;

  group.lastGrassedTarget = targetQQ;
  group.lastGrassedTime = now;

  const eventInfo = getEventInfo(user.todayPassive, true);
  const durationStr = generateRandomDuration();
  const eventText = formatEventText(eventInfo.text, user, amount);

  const reply =
`━━━━━━━━━━━━
你反草了[CQ:at,qq=${targetQQ}] ${user.nickname} ！
事件等级：${eventInfo.name}${eventInfo.star}
${eventText}
你反草了${durationStr}，注入了${amount} 点生命精华（反草减半）。这是你今天的第${senderDaily.count} 次！
他本日一共被草了${user.todayPassive} 次，被注入了${user.todayEssence} 点生命精华。
━━━━━━━━━━━━`;

  saveData(data);
  seal.replyToSender(ctx, msg, reply);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['反草'] = cmdCounter;

// =====================
// 群P接龙命令（间隔改为半小时）
// =====================

const cmdGroupP = seal.ext.newCmdItemInfo();
cmdGroupP.name = '群p';
cmdGroupP.help = '.群p @目标 参与接龙群P';

cmdGroupP.solve = (ctx, msg, cmdArgs) => {
  const raw = msg.message || '';
  const targetQQ = extractAtQQ(raw);
  if (!targetQQ) {
    seal.replyToSender(ctx, msg, '请艾特要群P的目标，例如：.群p @某人');
    return seal.ext.newCmdExecuteResult(true);
  }

  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const now = Date.now();

  // 接龙超时改为30分钟
  if (group.lastGrassedTarget !== targetQQ || (now - group.lastGrassedTime) > 30 * 60 * 1000) {
    group.groupP = null;
    group.lastGrassedTarget = null;
    seal.replyToSender(ctx, msg, '接龙中断，请从第一个开始（上一个被草目标不是TA或已超时30分钟）。');
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  if (!group.groupP || group.groupP.targetQQ !== targetQQ) {
    group.groupP = {
      targetQQ: targetQQ,
      participants: [],
      totalEssence: 0,
      order: 0,
      startTime: now
    };
  }

  const gp = group.groupP;

  if (!gp.participants.includes(senderQQ)) {
    gp.participants.push(senderQQ);
  }
  gp.order += 1;

  const senderDaily = getSenderDaily(group, senderQQ);
  const maxDaily = getCfgInt('每日最大次数', 10000);
  const cooldownSec = getCfgInt('冷却秒数', 60);
  const minEssence = getCfgInt('最小精华', 100);
  const maxEssence = getCfgInt('最大精华', 1000);

  if (senderDaily.cooldownUntil && now < senderDaily.cooldownUntil) {
    seal.replyToSender(ctx, msg, pick(cooldownTexts));
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }
  if (senderDaily.count >= maxDaily) {
    seal.replyToSender(ctx, msg, pick(maxTexts));
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  let nickname = targetQQ;
  if (group.users[targetQQ] && group.users[targetQQ].nickname) {
    nickname = group.users[targetQQ].nickname;
  }
  const user = ensureUser(group, targetQQ, nickname);
  resetDailyIfNeeded(user);
  const sender = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  resetDailyIfNeeded(sender);

  let amount = rand(minEssence, maxEssence);
  if (sender._aphrodisiacUses && sender._aphrodisiacUses > 0) {
    amount = Math.floor(amount * 1.5);
    sender._aphrodisiacUses -= 1;
    if (sender._aphrodisiacUses === 0) delete sender._aphrodisiacUses;
  }

  senderDaily.count += 1;
  sender.activeCount += 1;
  sender.todayActive += 1;
  user.passiveCount += 1;
  user.todayPassive += 1;
  sender.totalCount += 1;
  sender.todayCount += 1;
  sender.lastTime = new Date().toLocaleString();
  if (!sender.firstTime) sender.firstTime = sender.lastTime;
  user.totalEssence += amount;
  user.todayEssence += amount;
  user.totalCount += 1;
  user.todayCount += 1;
  user.lastTime = new Date().toLocaleString();
  if (!user.firstTime) user.firstTime = user.lastTime;

  gp.totalEssence += amount;
  senderDaily.cooldownUntil = now + cooldownSec * 1000;
  group.lastGrassedTarget = targetQQ;
  group.lastGrassedTime = now;

  // 随机事件（仅显示文本，不影响数据）
  const eventData = { targetQQ, user, sender, amount, cancelAction: false, reversed: false, skipCooldown: false };
  handleRandomEvent(ctx, msg, 'grass', eventData);

  const groupPTexts = [
    `你随着众人的节奏，狠狠贯入 ${user.nickname} 的体内，他已经分不清是谁的抽送了。`,
    `第 ${gp.order} 位勇士挺身而上，${user.nickname} 的淫水已经溅湿了整个地板。`,
    `车轮滚滚，${user.nickname} 的哭喊声渐渐变成媚叫，肉体的撞击声回荡在群聊中。`,
    `你插入时，${user.nickname} 的肠壁还在抽搐，那是前一个人留下的余韵。`,
    `${user.nickname} 的后穴早已合不拢，你毫不费力地滑入，感受着黏腻的包裹。`,
    `${user.nickname} 的穴口早已泥泞不堪，你毫不费力地滑入，感受着前一位留下的温热。`,
    `车轮战越演越烈，${user.nickname} 的呻吟渐渐沙哑，身体却诚实地迎接每一次冲击。`,
    `你是第 ${gp.order} 个占领他的人，他的子宫口已被撞开，白浊的液体从缝隙间溢出。`
  ];
  const randomText = pick(groupPTexts).replace(/\$\{user\.nickname\}/g, user.nickname).replace(/\$\{order\}/g, gp.order);

  const reply =
`━━━━━━━━━━━━
${randomText}
当前共 ${gp.participants.length} 人参与了群 P！
你是第 ${gp.order} 个加入的！
你注入了 ${amount} 点生命精华！
目标本次群 P 已被注入累计 ${gp.totalEssence} 点生命精华！
目标今天共被注入 ${user.todayEssence} 点生命精华！
━━━━━━━━━━━━`;

  saveData(data);
  seal.replyToSender(ctx, msg, reply);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['群p'] = cmdGroupP;
ext.cmdMap['群P'] = cmdGroupP;

// =====================
// 商城系统（修复购买命令参数解析）
// =====================

const shopItems = [
  { name: '处子丹', price: 2000, desc: '清零自己的 todayPassive 次数（不影响精华）', effect: 'virgin' },
  { name: '壮阳丹', price: 1000, desc: '接下来5次主动草人，精华×1.5', effect: 'aphrodisiac' },
  { name: '萎靡香水', price: 1500, desc: '强制目标状态变为“虚弱”持续1小时', effect: 'weakness' },
  { name: '捆绳', price: 600, desc: '目标10分钟内无法主动草人', effect: 'bind', dailyLimit: 3 },
  { name: '贞操锁', price: 600, desc: '自己接下来2次被草不生效', effect: 'chastity', dailyLimit: 3 },
  { name: '沙漏', price: 200, desc: '立刻清除自身冷却', effect: 'cooldownReset' },
  { name: '媚药', price: 2000, desc: '随机抽取3个群友草目标（需在线）', effect: 'charm' }
];

const cmdShop = seal.ext.newCmdItemInfo();
cmdShop.name = '合欢楼';
cmdShop.help = '查看合欢楼商品';
cmdShop.solve = (ctx, msg, cmdArgs) => {
  let text = '🏮 合欢楼 淫靡商品一览 🏮\n\n';
  shopItems.forEach(item => {
    text += `【${item.name}】 ${item.price}精华\n${item.desc}\n————————\n`;
  });
  text += '\n使用今日被注入的精华购买，指令：.购买 商品名 [数量]';
  seal.replyToSender(ctx, msg, text);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['合欢楼'] = cmdShop;

const cmdBuy = seal.ext.newCmdItemInfo();
cmdBuy.name = '购买';
cmdBuy.help = '.购买 商品名 [数量]';
cmdBuy.solve = (ctx, msg, cmdArgs) => {
  // 修复：使用 cmdArgs.args 获取参数数组（不包含命令名）
  const args = cmdArgs.args || [];
  if (args.length < 1) {
    seal.replyToSender(ctx, msg, '格式：.购买 商品名 数量（数量可选，默认1）');
    return seal.ext.newCmdExecuteResult(true);
  }
  const itemName = args[0];
  const quantity = parseInt(args[1]) || 1;
  const item = shopItems.find(i => i.name === itemName);
  if (!item) {
    seal.replyToSender(ctx, msg, '没有这个商品，请使用 .合欢楼 查看列表');
    return seal.ext.newCmdExecuteResult(true);
  }

  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const user = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  resetDailyIfNeeded(user);

  const totalCost = item.price * quantity;
  if (user.todayEssence < totalCost) {
    seal.replyToSender(ctx, msg, `你的今日被动精华不足，需要${totalCost}点，当前只有${user.todayEssence}点。`);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  const eventData = { extraPassive: 0 };
  handleRandomEvent(ctx, msg, 'buy', eventData);

  user.todayEssence -= totalCost;
  if (!user.items[itemName]) user.items[itemName] = 0;
  user.items[itemName] += quantity;
  let buyText = `你掏出今日被注入的精华，在合欢楼换取了 ${itemName} × ${quantity}，淫靡的交易达成。`;
  if (eventData.extraPassive > 0) {
    user.todayEssence += eventData.extraPassive;
    buyText += ` 同时，你被路人狠狠草了一顿，额外获得了 ${eventData.extraPassive} 点精华。`;
  }
  seal.replyToSender(ctx, msg, buyText);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['购买'] = cmdBuy;

const cmdBackpack = seal.ext.newCmdItemInfo();
cmdBackpack.name = '背包';
cmdBackpack.help = '查看自己的道具';
cmdBackpack.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const user = group.users[senderQQ];
  if (!user || Object.keys(user.items).length === 0) {
    seal.replyToSender(ctx, msg, '你的背包空空如也。');
    return seal.ext.newCmdExecuteResult(true);
  }
  let text = '🎒 你的背包：\n';
  for (const [name, count] of Object.entries(user.items)) {
    text += `${name} × ${count}\n`;
  }
  seal.replyToSender(ctx, msg, text);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['背包'] = cmdBackpack;

const cmdUseItem = seal.ext.newCmdItemInfo();
cmdUseItem.name = '使用';
cmdUseItem.help = '.使用 道具名 [@目标]';
cmdUseItem.solve = (ctx, msg, cmdArgs) => {
  const args = cmdArgs.args || [];
  if (args.length < 1) {
    seal.replyToSender(ctx, msg, '格式：.使用 道具名 [@目标]');
    return seal.ext.newCmdExecuteResult(true);
  }
  const itemName = args[0];
  const raw = msg.message || '';
  const targetQQ = extractAtQQ(raw) || '';
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const user = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  resetDailyIfNeeded(user);

  if (!user.items[itemName] || user.items[itemName] <= 0) {
    seal.replyToSender(ctx, msg, `你没有 ${itemName}。`);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  const item = shopItems.find(i => i.name === itemName);
  if (!item) { seal.replyToSender(ctx, msg, '未知道具'); return seal.ext.newCmdExecuteResult(true); }

  const eventData = { itemInvalid: false };
  handleRandomEvent(ctx, msg, 'useitem', eventData);
  if (eventData.itemInvalid) {
    user.items[itemName] -= 1;
    if (user.items[itemName] <= 0) delete user.items[itemName];
    seal.replyToSender(ctx, msg, `道具化作黏液失效了。`);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  switch (item.effect) {
    case 'virgin':
      user.todayPassive = 0;
      seal.replyToSender(ctx, msg, `你服下处子丹，今日被动记录被清零，你又变得纯洁了。`);
      break;
    case 'aphrodisiac':
      if (!user._aphrodisiacUses) user._aphrodisiacUses = 0;
      user._aphrodisiacUses += 5;
      seal.replyToSender(ctx, msg, `你吞下壮阳丹，阴茎瞬间勃发，接下来${user._aphrodisiacUses}次主动草人精华×1.5！`);
      break;
    case 'weakness':
      if (targetQQ) {
        const target = ensureUser(group, targetQQ, '');
        resetDailyIfNeeded(target);
        target.status = 'weak';
        target.statusExpire = Date.now() + 3600 * 1000;
        seal.replyToSender(ctx, msg, `你向 ${target.nickname} 泼洒萎靡香水，他瞬间腿软，精华产量减半（持续1小时）。`);
      } else seal.replyToSender(ctx, msg, '请艾特目标。');
      break;
    case 'bind':
      if (targetQQ) {
        const target = ensureUser(group, targetQQ, '');
        if (!target._boundedUntil) target._boundedUntil = 0;
        target._boundedUntil = Date.now() + 10 * 60 * 1000;
        seal.replyToSender(ctx, msg, `你用捆绳束缚了 ${target.nickname}，他10分钟内无法主动草人。`);
      } else seal.replyToSender(ctx, msg, '请艾特目标。');
      break;
    case 'chastity':
      if (!user._chastityUses) user._chastityUses = 0;
      user._chastityUses += 2;
      seal.replyToSender(ctx, msg, `你戴上贞操锁，接下来2次被草将不会生效。`);
      break;
    case 'cooldownReset':
      const senderDaily = getSenderDaily(group, senderQQ);
      senderDaily.cooldownUntil = 0;
      seal.replyToSender(ctx, msg, `沙漏翻转，你的冷却时间瞬间清空，又可以战斗了！`);
      break;
    case 'charm': {
      if (!targetQQ) { seal.replyToSender(ctx, msg, '请艾特目标'); return seal.ext.newCmdExecuteResult(true); }
      const allMembers = Object.keys(group.users).filter(qq => qq !== senderQQ && qq !== targetQQ);
      const shuffled = allMembers.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      if (selected.length === 0) { seal.replyToSender(ctx, msg, '没有其他群友可草。'); return seal.ext.newCmdExecuteResult(true); }
      let resultText = `${group.users[targetQQ]?.nickname || targetQQ} 吸入媚药，眼神迷离，`;
      selected.forEach(qq => {
        const actor = group.users[qq];
        if (actor) {
          const amount = rand(getCfgInt('最小精华', 100), getCfgInt('最大精华', 1000));
          const targetUser = ensureUser(group, targetQQ, '');
          targetUser.totalEssence += amount;
          targetUser.todayEssence += amount;
          targetUser.passiveCount += 1;
          targetUser.todayPassive += 1;
          targetUser.totalCount += 1;
          targetUser.todayCount += 1;
          resultText += `\n${actor.nickname} 冲上去猛干了一发，注入 ${amount} 精华。`;
        }
      });
      seal.replyToSender(ctx, msg, resultText);
      break;
    }
    default: break;
  }

  user.items[itemName] -= 1;
  if (user.items[itemName] <= 0) delete user.items[itemName];
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['使用'] = cmdUseItem;

// =====================
// 触手宠物系统（冷却10分钟，显示剩余时间）
// =====================

const petEvolution = [
  { level: 10, name: '淫触', desc: '触手变得更加粗壮' },
  { level: 20, name: '吸精魔', desc: '贪婪吸收精华' },
  { level: 30, name: '欲界触王', desc: '掌控欲望' },
  { level: 40, name: '深渊吞噬者', desc: '吞噬一切精华' },
  { level: 50, name: '混沌淫神', desc: '终极形态' }
];

function petFeedAmount(level) {
  if (level <= 5) return rand(5, 15);
  if (level <= 10) return rand(15, 30);
  if (level <= 20) return rand(30, 60);
  return rand(60, 100);
}

const cmdPetAdopt = seal.ext.newCmdItemInfo();
cmdPetAdopt.name = '领养触手';
cmdPetAdopt.help = '领养一只触手宠物';
cmdPetAdopt.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const user = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  if (user.pet) {
    seal.replyToSender(ctx, msg, '你已经有了一只触手。');
    return seal.ext.newCmdExecuteResult(true);
  }
  user.pet = { level: 1, exp: 0, lastFeed: 0, name: '小触手', evolutionStage: 0 };
  seal.replyToSender(ctx, msg, '你成功领养了一只触手，它正亲昵地蹭着你的腿。');
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['领养触手'] = cmdPetAdopt;

const cmdPetFeed = seal.ext.newCmdItemInfo();
cmdPetFeed.name = '喂养触手';
cmdPetFeed.help = '喂养你的触手（消耗被动精华）';
cmdPetFeed.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const user = ensureUser(group, senderQQ, msg.sender.nickname || senderQQ);
  resetDailyIfNeeded(user);
  if (!user.pet) {
    seal.replyToSender(ctx, msg, '你还没有触手，先领养一只吧。');
    return seal.ext.newCmdExecuteResult(true);
  }
  const now = Date.now();
  // 修改冷却为10分钟
  const cooldownMs = 10 * 60 * 1000;
  if (user.pet.lastFeed && (now - user.pet.lastFeed) < cooldownMs) {
    const remaining = cooldownMs - (now - user.pet.lastFeed);
    const minutes = Math.ceil(remaining / 60000);
    seal.replyToSender(ctx, msg, `触手还在消化，请等待约 ${minutes} 分钟后再喂。`);
    saveData(data);
    return seal.ext.newCmdExecuteResult(true);
  }

  const eventData = { halfFeed: false };
  handleRandomEvent(ctx, msg, 'petfeed', eventData);
  let amount = petFeedAmount(user.pet.level);
  if (eventData.halfFeed) amount = Math.floor(amount / 2);
  if (user.todayEssence < amount) {
    seal.replyToSender(ctx, msg, `你的被动精华不足，需要${amount}点。`);
    return seal.ext.newCmdExecuteResult(true);
  }
  user.todayEssence -= amount;
  user.pet.exp += amount;
  user.pet.lastFeed = now;

  // 升级检查
  const expNeeded = user.pet.level * 10;
  let upgraded = false;
  while (user.pet.exp >= expNeeded) {
    user.pet.exp -= expNeeded;
    user.pet.level += 1;
    upgraded = true;
  }

  let feedText = `触手钻进你的体内，搅动着残存的精液，吸走了 ${amount} 点精华，你感到一阵酥麻。`;
  if (upgraded) {
    feedText += `\n触手升到了 ${user.pet.level} 级！`;
    for (const evo of petEvolution) {
      if (user.pet.level >= evo.level && user.pet.evolutionStage < petEvolution.indexOf(evo)+1) {
        user.pet.name = evo.name;
        user.pet.evolutionStage = petEvolution.indexOf(evo)+1;
        feedText += `\n你的触手剧烈蠕动，体型暴涨，进化成了【${evo.name}】！喂养收益提升！`;
        break;
      }
    }
  }

  seal.replyToSender(ctx, msg, feedText);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['喂养触手'] = cmdPetFeed;

const cmdPetRank = seal.ext.newCmdItemInfo();
cmdPetRank.name = '触手排行';
cmdPetRank.help = '触手等级排行';
cmdPetRank.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const users = Object.values(group.users).filter(u => u.pet);
  users.sort((a, b) => b.pet.level - a.pet.level);
  let text = '🐙 触手战力排行榜 🐙\n\n';
  users.slice(0, 10).forEach((u, i) => {
    text += `${i+1}. ${u.nickname} 的 ${u.pet.name} Lv.${u.pet.level} (经验:${u.pet.exp})\n`;
  });
  if (users.length === 0) text += '暂无触手数据。';
  seal.replyToSender(ctx, msg, text);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['触手排行'] = cmdPetRank;

// =====================
// 排行榜与查询等命令（不变）
// =====================

function getSortedUsers(group) {
  const users = Object.values(group.users || {});
  users.sort((a, b) => b.totalEssence - a.totalEssence);
  return users;
}

const cmdRank = seal.ext.newCmdItemInfo();
cmdRank.name = '精华量排行';
cmdRank.help = '精华量排行 [页码]';
cmdRank.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);

  let page = parseInt(cmdArgs.getArgN(1));
  if (isNaN(page) || page < 1) page = 1;

  const users = getSortedUsers(group);
  const pageSize = 10;
  const maxPage = Math.max(1, Math.ceil(users.length / pageSize));
  const start = (page - 1) * pageSize;
  const list = users.slice(start, start + pageSize);

  let text = `🏆生命精华排行榜🏆\n\n`;
  if (list.length === 0) {
    text += '暂无排行数据。';
  } else {
    list.forEach((u, index) => {
      const rank = start + index + 1;
      let medal = `${rank}.`;
      if (rank === 1) medal = '🥇';
      else if (rank === 2) medal = '🥈';
      else if (rank === 3) medal = '🥉';

      const ratio = u.passiveCount === 0 ? (u.activeCount > 0 ? '∞' : '0') : (u.activeCount / u.passiveCount).toFixed(2);
      text +=
`${medal} ${u.nickname}
生命精华：${u.totalEssence} 点
今日精华：${u.todayEssence} 点
累计互动：${u.totalCount} 次
攻受比（主动/被动）：${u.activeCount}/${u.passiveCount}（${ratio}）
————————————
`;
    });
  }
  text += `第 ${page}/${maxPage} 页`;

  seal.replyToSender(ctx, msg, text);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['精华量排行'] = cmdRank;
ext.cmdMap['草排行'] = cmdRank;
ext.cmdMap['精华排行'] = cmdRank;

const cmdActiveRank = seal.ext.newCmdItemInfo();
cmdActiveRank.name = '攻受排行';
cmdActiveRank.help = '攻受排行 – 按主动次数/被动次数排序';
cmdActiveRank.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const users = Object.values(group.users || {});

  const sorted = [...users].sort((a, b) => b.activeCount - a.activeCount);
  let text = '👊 攻（主动）排行榜\n\n';
  sorted.slice(0, 10).forEach((u, i) => {
    text += `${i+1}. ${u.nickname} – 主动 ${u.activeCount} 次\n`;
  });

  text += '\n💫 受（被动）排行榜\n\n';
  const sortedPassive = [...users].sort((a, b) => b.passiveCount - a.passiveCount);
  sortedPassive.slice(0, 10).forEach((u, i) => {
    text += `${i+1}. ${u.nickname} – 被动 ${u.passiveCount} 次\n`;
  });

  seal.replyToSender(ctx, msg, text);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['攻受排行'] = cmdActiveRank;

const cmdQuery = seal.ext.newCmdItemInfo();
cmdQuery.name = '精华查询';
cmdQuery.help = '精华查询@某人';
cmdQuery.solve = (ctx, msg, cmdArgs) => {
  const raw = msg.message || '';
  const targetQQ = extractAtQQ(raw);
  if (!targetQQ) {
    seal.replyToSender(ctx, msg, '请艾特需要查询的人，例如：.精华查询@某人');
    return seal.ext.newCmdExecuteResult(true);
  }

  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const user = group.users[targetQQ];
  if (!user) {
    seal.replyToSender(ctx, msg, '这个群友暂时还没有记录。');
    return seal.ext.newCmdExecuteResult(true);
  }

  resetDailyIfNeeded(user);

  const users = getSortedUsers(group);
  const rank = users.findIndex(x => x.qq === targetQQ) + 1;

  const statusMap = { normal: '正常', horny: '💕 发情（主动×1.5）', weak: '😵 虚弱（主动×0.5）' };
  let statusText = '正常';
  if (user.status !== 'normal' && Date.now() < user.statusExpire) {
    statusText = statusMap[user.status] || '正常';
  }

  const ratio = user.passiveCount === 0 ? (user.activeCount > 0 ? '∞' : '0') : (user.activeCount / user.passiveCount).toFixed(2);

  const reply =
`📜群友档案
目标：[CQ:at,qq=${targetQQ}] ${user.nickname}
当前排名：第 ${rank || '未上榜'} 名
生命精华：${user.totalEssence} 点
今日精华：${user.todayEssence} 点
今日主动：${user.todayActive} 次
今日被动：${user.todayPassive} 次
累计互动：${user.totalCount} 次
攻受比（主动/被动）：${user.activeCount}/${user.passiveCount}（${ratio}）
当前状态：${statusText}
首次记录：${user.firstTime || '暂无'}
最后记录：${user.lastTime || '暂无'}
`;
  saveData(data);
  seal.replyToSender(ctx, msg, reply);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['精华查询'] = cmdQuery;
ext.cmdMap['查询精华'] = cmdQuery;
ext.cmdMap['草群友查询'] = cmdQuery;

const cmdRelation = seal.ext.newCmdItemInfo();
cmdRelation.name = '关系';
cmdRelation.help = '关系@某人 – 查看你与对方的关系';
cmdRelation.solve = (ctx, msg, cmdArgs) => {
  const raw = msg.message || '';
  const targetQQ = extractAtQQ(raw);
  if (!targetQQ) {
    seal.replyToSender(ctx, msg, '请艾特某人，例如：.关系@某人');
    return seal.ext.newCmdExecuteResult(true);
  }

  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);

  const key = senderQQ < targetQQ ? `${senderQQ}_${targetQQ}` : `${targetQQ}_${senderQQ}`;
  const rel = group.relations && group.relations[key];

  let text = `你和 [CQ:at,qq=${targetQQ}] 的关系：\n`;
  if (!rel) {
    text += '你们之间还没有任何互动记录。';
  } else {
    const count1 = senderQQ < targetQQ ? rel.count1 : rel.count2;
    const count2 = senderQQ < targetQQ ? rel.count2 : rel.count1;
    text += `你主动草对方 ${count1} 次，对方主动草你 ${count2} 次。\n`;
    if (count1 > count2) text += '你明显更主动，你是攻！';
    else if (count2 > count1) text += '对方更主动，你是受！';
    else text += '你们旗鼓相当，是互攻互受的好搭档。';
    if (count1 + count2 >= 10) text += '\n💕 你们是群里的模范CP！';
    else if (count1 + count2 >= 5) text += '\n⚔️ 你们是欢喜冤家！';
  }

  seal.replyToSender(ctx, msg, text);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['关系'] = cmdRelation;

const cmdStatus = seal.ext.newCmdItemInfo();
cmdStatus.name = '状态';
cmdStatus.help = '状态 – 查看自己的当前状态';
cmdStatus.solve = (ctx, msg, cmdArgs) => {
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  const senderQQ = extractPureId(msg.sender.userId);
  const sender = group.users[senderQQ];
  if (!sender) {
    seal.replyToSender(ctx, msg, '你还没有记录，快去草个人吧。');
    return seal.ext.newCmdExecuteResult(true);
  }
  resetDailyIfNeeded(sender);

  const statusMap = { normal: '正常', horny: '💕 发情（主动精华×1.5）', weak: '😵 虚弱（主动精华×0.5）' };
  let statusText = (sender.status !== 'normal' && Date.now() < sender.statusExpire) ? statusMap[sender.status] : '正常';

  const reply =
`你当前状态：${statusText}
今日主动草人次数：${sender.todayActive || 0}
今日被草次数：${sender.todayPassive || 0}
`;
  seal.replyToSender(ctx, msg, reply);
  saveData(data);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['状态'] = cmdStatus;

const cmdReset = seal.ext.newCmdItemInfo();
cmdReset.name = '重置精华';
cmdReset.help = '重置精华@某人';
cmdReset.solve = (ctx, msg, cmdArgs) => {
  if (ctx.privilegeLevel <= 50) {
    seal.replyToSender(ctx, msg, seal.formatTmpl(ctx, '核心:提示_无权限'));
    return seal.ext.newCmdExecuteResult(true);
  }
  const targetQQ = extractAtQQ(msg.message || '');
  if (!targetQQ) {
    seal.replyToSender(ctx, msg, '请艾特需要重置的人，例如：.重置精华@某人');
    return seal.ext.newCmdExecuteResult(true);
  }
  const data = loadData();
  const groupId = getGroupId(msg);
  const group = ensureGroup(data, groupId);
  if (group.users[targetQQ]) {
    const oldName = group.users[targetQQ].nickname || targetQQ;
    group.users[targetQQ] = {
      qq: targetQQ,
      nickname: oldName,
      totalEssence: 0,
      todayEssence: 0,
      totalCount: 0,
      todayCount: 0,
      todayActive: 0,
      todayPassive: 0,
      activeCount: 0,
      passiveCount: 0,
      status: 'normal',
      statusExpire: 0,
      lastDate: todayKey(),
      firstTime: '',
      lastTime: '',
      items: {},
      pet: null
    };
  }
  saveData(data);
  seal.replyToSender(ctx, msg, `已重置 [CQ:at,qq=${targetQQ}] 的数据。`);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['重置精华'] = cmdReset;

const cmdClear = seal.ext.newCmdItemInfo();
cmdClear.name = '清空精华排行';
cmdClear.help = '清空本群所有草群友数据';
cmdClear.solve = (ctx, msg, cmdArgs) => {
  if (ctx.privilegeLevel <= 50) {
    seal.replyToSender(ctx, msg, seal.formatTmpl(ctx, '核心:提示_无权限'));
    return seal.ext.newCmdExecuteResult(true);
  }
  const data = loadData();
  const groupId = getGroupId(msg);
  data[groupId] = { users: {}, senderDaily: {}, relations: {}, groupP: null, lastGrassedTarget: null, lastGrassedTime: 0 };
  saveData(data);
  seal.replyToSender(ctx, msg, '已清空本群草群友排行榜数据。');
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['清空精华排行'] = cmdClear;

const cmdHelp = seal.ext.newCmdItemInfo();
cmdHelp.name = '草群友帮助';
cmdHelp.help = '查看草群友插件帮助';
cmdHelp.solve = (ctx, msg, cmdArgs) => {
  const text =
`草群友 v2.4.0 使用说明

核心指令：
.草群友@某人@骰娘     – 主动草对方
.反草@某人@骰娘       – 反击对方（精华减半，消耗冷却）
.群p @某人@骰娘       – 参与群P接龙
.精华量排行 [页] – 查看精华排行榜
.攻受排行        – 查看主动/被动排行榜
.精华查询@某人@骰娘   – 查询个人档案
.关系@某人@骰娘       – 查看你与对方的关系
.状态            – 查看自己的状态
.合欢楼          – 查看商城
.购买 商品名 [数量] – 购买道具
.背包            – 查看道具
.使用 道具名 [@目标] @骰娘– 使用道具
.领养触手        – 获得触手宠物
.喂养触手        – 喂食触手（消耗被动精华）
.触手排行        – 触手等级排行
.重置精华@某人@骰娘   – 管理员重置个人数据
.清空精华排行    – 管理员清空全群数据

状态说明：
- 发情（主动×1.5）：每日首次主动时10%概率触发，持续3小时
- 虚弱（主动×0.5）：同样概率触发，持续3小时

随机事件：操作时有3%概率触发特殊事件。
`;
  seal.replyToSender(ctx, msg, text);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['草群友帮助'] = cmdHelp;

// =====================
// 记录发言者昵称
// =====================

ext.onNotCommandReceived = (ctx, msg) => {
  try {
    if (msg.messageType !== 'group') return;
    const data = loadData();
    const groupId = getGroupId(msg);
    const group = ensureGroup(data, groupId);
    const qq = extractPureId(msg.sender.userId);
    const nickname = msg.sender.nickname || qq;
    if (!group.users[qq]) {
      group.users[qq] = {
        qq: qq,
        nickname: nickname,
        totalEssence: 0,
        todayEssence: 0,
        totalCount: 0,
        todayCount: 0,
        todayActive: 0,
        todayPassive: 0,
        activeCount: 0,
        passiveCount: 0,
        status: 'normal',
        statusExpire: 0,
        lastDate: todayKey(),
        firstTime: '',
        lastTime: '',
        items: {},
        pet: null
      };
    } else {
      group.users[qq].nickname = nickname;
    }
    saveData(data);
  } catch (e) {
    console.log('[草群友] 记录昵称失败：', e);
  }
};

console.log('[草群友plus修复版] v2.4.1 加载完成，包含群P、商城、触手、随机事件，文案更涩情');