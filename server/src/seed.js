require('dotenv').config()
const mongoose = require('mongoose')
const config = require('./config')
const Category = require('./models/Category')
const User = require('./models/User')
const Recipe = require('./models/Recipe')

const categories = [
  { name: '家常菜', icon: '🥘', sort: 1 },
  { name: '汤羹', icon: '🍲', sort: 2 },
  { name: '凉菜', icon: '🥗', sort: 3 },
  { name: '烘焙', icon: '🍰', sort: 4 },
  { name: '主食', icon: '🍚', sort: 5 },
  { name: '快手菜', icon: '⚡', sort: 6 },
  { name: '甜品', icon: '🍮', sort: 7 },
  { name: '饮品', icon: '🧋', sort: 8 }
]

const recipes = [
  {
    title: '番茄炒蛋',
    description: '最经典的家常菜，酸甜可口，下饭神器',
    difficulty: 1,
    cookTime: 15,
    servings: 2,
    categoryName: '家常菜',
    ingredients: [
      { name: '鸡蛋', amount: '3个' },
      { name: '番茄', amount: '2个' },
      { name: '葱花', amount: '适量' },
      { name: '盐', amount: '适量' },
      { name: '糖', amount: '1小勺' },
      { name: '食用油', amount: '适量' }
    ],
    steps: [
      { order: 1, content: '鸡蛋打散，加少许盐搅匀。番茄洗净切块。', image: '' },
      { order: 2, content: '热锅凉油，倒入蛋液，用筷子快速划散，蛋液凝固后盛出备用。', image: '' },
      { order: 3, content: '锅中少许油，放入番茄块翻炒，加少许糖提鲜，炒至番茄出汁变软。', image: '' },
      { order: 4, content: '倒回炒好的鸡蛋，翻炒均匀，加盐调味，撒葱花出锅。', image: '' }
    ],
    tips: '番茄要炒出汁才好吃，加一点点糖可以提鲜去酸。鸡蛋不要炒太老。',
    tags: ['快手菜', '下饭'],
    isShared: true
  },
  {
    title: '红烧肉',
    description: '色泽红亮，肥而不腻，入口即化的经典硬菜',
    difficulty: 2,
    cookTime: 90,
    servings: 4,
    categoryName: '家常菜',
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '生姜', amount: '3片' },
      { name: '大葱', amount: '1段' },
      { name: '八角', amount: '2个' },
      { name: '桂皮', amount: '1小块' },
      { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '2勺' },
      { name: '老抽', amount: '1勺' },
      { name: '料酒', amount: '2勺' }
    ],
    steps: [
      { order: 1, content: '五花肉切2cm见方的块，冷水下锅焯水，撇去浮沫，捞出洗净。', image: '' },
      { order: 2, content: '锅中少许油，放入冰糖小火炒至枣红色（糖色）。', image: '' },
      { order: 3, content: '放入五花肉翻炒上色，加入姜片、葱段、八角、桂皮炒香。', image: '' },
      { order: 4, content: '加入料酒、生抽、老抽翻炒均匀，加入没过肉的热水。', image: '' },
      { order: 5, content: '大火烧开后转小火慢炖1小时，最后大火收汁至浓稠即可。', image: '' }
    ],
    tips: '炒糖色要小火慢炒，颜色变深就放肉，不要炒焦。加热水不要加冷水，肉不会发紧。',
    tags: ['硬菜', '待客'],
    isShared: true
  },
  {
    title: '紫菜蛋花汤',
    description: '5分钟搞定的快手汤，鲜美暖胃',
    difficulty: 1,
    cookTime: 5,
    servings: 2,
    categoryName: '汤羹',
    ingredients: [
      { name: '紫菜', amount: '一小把' },
      { name: '鸡蛋', amount: '1个' },
      { name: '盐', amount: '适量' },
      { name: '香油', amount: '几滴' },
      { name: '葱花', amount: '少许' }
    ],
    steps: [
      { order: 1, content: '紫菜撕碎放入碗中，鸡蛋打散备用。', image: '' },
      { order: 2, content: '锅中水烧开，倒入紫菜煮30秒。', image: '' },
      { order: 3, content: '缓缓倒入蛋液，用筷子轻轻划散形成蛋花。', image: '' },
      { order: 4, content: '加盐调味，滴几滴香油，撒葱花即可出锅。', image: '' }
    ],
    tips: '蛋液要等水沸腾后再倒，沿锅边缓缓倒入蛋花才会漂亮。',
    tags: ['快手菜', '汤'],
    isShared: true
  },
  {
    title: '蒜蓉西兰花',
    description: '清爽健康的素菜，蒜香浓郁',
    difficulty: 1,
    cookTime: 10,
    servings: 2,
    categoryName: '快手菜',
    ingredients: [
      { name: '西兰花', amount: '1朵' },
      { name: '大蒜', amount: '5瓣' },
      { name: '盐', amount: '适量' },
      { name: '蚝油', amount: '1勺' },
      { name: '食用油', amount: '适量' }
    ],
    steps: [
      { order: 1, content: '西兰花掰成小朵，洗净。大蒜切末。', image: '' },
      { order: 2, content: '烧一锅水，加少许盐和油，焯西兰花1分钟，捞出沥干。', image: '' },
      { order: 3, content: '热锅凉油，小火炒香蒜末，放入西兰花翻炒。', image: '' },
      { order: 4, content: '加蚝油和少许盐调味，翻炒均匀即可出锅。', image: '' }
    ],
    tips: '焯水时加盐和油可以保持西兰花翠绿。不要炒太久，保持脆嫩口感。',
    tags: ['素菜', '健康'],
    isShared: true
  },
  {
    title: '可乐鸡翅',
    description: '甜咸可口，小朋友的最爱',
    difficulty: 1,
    cookTime: 30,
    servings: 3,
    categoryName: '家常菜',
    ingredients: [
      { name: '鸡翅中', amount: '8个' },
      { name: '可乐', amount: '1罐(330ml)' },
      { name: '生姜', amount: '3片' },
      { name: '生抽', amount: '2勺' },
      { name: '老抽', amount: '半勺' },
      { name: '料酒', amount: '1勺' }
    ],
    steps: [
      { order: 1, content: '鸡翅两面划两刀方便入味，冷水下锅焯水后捞出。', image: '' },
      { order: 2, content: '锅中少许油，放入鸡翅煎至两面金黄。', image: '' },
      { order: 3, content: '加入姜片、生抽、老抽、料酒翻炒上色。', image: '' },
      { order: 4, content: '倒入可乐没过鸡翅，大火烧开后转中小火炖15分钟。', image: '' },
      { order: 5, content: '最后大火收汁至浓稠，汤汁裹满鸡翅即可。', image: '' }
    ],
    tips: '要用普通可乐，不要用无糖可乐。收汁不要太干，留一些汤汁更好吃。',
    tags: ['下饭', '待客'],
    isShared: true
  }
]

async function seed() {
  try {
    await mongoose.connect(config.mongodbUri)
    console.log('数据库连接成功')

    // 清除旧数据
    await Category.deleteMany({})
    await User.deleteMany({})
    await Recipe.deleteMany({})
    console.log('旧数据已清除')

    // 创建分类
    const createdCategories = await Category.insertMany(categories)
    console.log(`已创建 ${createdCategories.length} 个分类`)

    // 创建测试用户
    const user = await User.create({ nickname: '大厨' })
    console.log(`已创建测试用户: ${user.nickname}`)

    // 创建菜谱
    const categoryMap = {}
    createdCategories.forEach(c => { categoryMap[c.name] = c._id })

    const recipeDocs = recipes.map(r => ({
      ...r,
      categoryId: categoryMap[r.categoryName],
      createdBy: user._id,
      categoryName: undefined
    }))

    const createdRecipes = await Recipe.insertMany(recipeDocs)
    console.log(`已创建 ${createdRecipes.length} 道菜谱`)

    console.log('\n种子数据初始化完成！')
    console.log('测试用户: 大厨')
    console.log('可以用这个昵称登录 App')

    process.exit(0)
  } catch (err) {
    console.error('种子数据初始化失败:', err)
    process.exit(1)
  }
}

seed()
