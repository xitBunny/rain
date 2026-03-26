/* ========================================
   yokai.js — 妖怪数据与文本设定
   ======================================== */

const YokaiData = {
    rainWoman: {
        id: 'rainWoman',
        name: '雨女',
        subtitle: 'あめおんな',
        nameJP: 'あめおんな',
        sceneName: '黄昏公交站站台',
        dialogue: [
            "滴答……滴答……",
            "雨又下起来了呢。",
            "你要去哪里？为什么……不留下来陪我等这场雨停呢？",
            "让我看看……你能不能挡住这浸透骨髓的悲伤吧。"
        ],
        item: {
            name: '永湿之伞',
            desc: '一把透明的折叠伞，伞面永远挂着水珠。握住它时，能感觉到微弱却固执的暖意，似乎能挡下那些由悲伤化作的骤雨。',
            icon: '☂'
        },
        story: [
            "【等不到的末班车】",
            "雨女生前是一位普通的女子。",
            "在那个下着暴雨的黄昏，她在这个站台等待恋人的归来。然而末班车早已驶过，那个人却再也没有出现。",
            "日复一日，她的执念化作了落不完的雨滴，将这个站台永远困在了雨夜的黄昏中。",
            "她让无数路人陪她淋雨，其实，她只是在等有个人能为她撑起一把伞。",
            "『你看，这把伞就算在雨中也不会被淋湿了……因为它已经收集满了我所有的眼泪。』"
        ],
        taunt: "连这点雨滴都挡不住……你怎么挡住离别呢？",
        difficultyBase: 0.7,
        victoryDialogs: [
            { speaker: '雨女', text: "谢谢你……为我撑起了这把伞。" },
            { speaker: '雨女', text: "这场雨，似乎终于要停了。哪怕只是暂时的，我的心也暖和了一些。" },
            { speaker: '雨女', text: "虽然我依然会在这里等待，但现在，我有了这个（永湿之伞）。" }
        ],
        defeatDialogs: [
            { speaker: '雨女', text: "连这点雨滴都挡不住……你怎么挡住离别呢？" },
            { speaker: '雨女', text: "果然，没有人能永远为他人撑伞。你走吧，趁雨还没把你淹没。" }
        ],
        gameConfig: {
            duration: 45,
            umbrellaWidth: 80,
            umbrellaDurability: 5,
            rainBaseSpeed: 2.2,
            rainMaxSpeed: 4.5,
            rainInterval: 280,
            rainMinInterval: 120,
            tearInterval: 4000,
            thunderInterval: 8000
        }
    },
    
    lanternCat: {
        id: 'lanternCat',
        name: '提灯猫又',
        subtitle: 'ちょうちんねこまた',
        nameJP: 'ちょうちんねこまた',
        sceneName: '影之夜市',
        dialogue: [
            "喵呜……这里的游魂总是乱飘，我的灯都要被风吹灭了。",
            "本来还能给他们指指路的，可是天突然又下起了『怨念的骤雨』……",
            "如果……如果有一把不会被沾湿的伞就好了，就能护住这些脆弱的魂火了喵。",
            "你能帮我护住灯笼吗？"
        ],
        item: {
            name: '引路提灯',
            desc: '散发着暖橘色光芒的小纸灯笼。光芒微弱，却能驱散最深沉的阴霾，照亮被遗弃在暗处的秘密。',
            icon: '🏮'
        },
        story: [
            "【影子里的守夜人】",
            "这是一只生前被遗弃在夜市角落的小黑猫。",
            "它在漆黑的巷子里等待主人的投喂，直到生命尽头。化为猫又后，它的尾部分叉成了两团温暖的火焰。",
            "夜市里充满了迷茫游荡的灵魂，它便挑起灯笼，穿梭在狭窄的巷道里，为找不到回家的路的游魂引路。",
            "可它自己，却从未找到那条属于自己的归途。",
            "『谢谢你为我挡雨。这盏灯送给你吧，希望你在黑暗中，再也不会迷路喵。』"
        ],
        taunt: "魂火都淋湿了喵！手脚这么慢的话，可是会被夜色吞没的哦。",
        difficultyBase: 1.0,
        victoryDialogs: [
            { speaker: '提灯猫又', text: "喵！太棒了，这把伞真是个神奇的宝贝！" },
            { speaker: '提灯猫又', text: "那些怨念雨滴一次都没淋到我的魂火，游魂们都顺利进城了喵。" },
            { speaker: '提灯猫又', text: "这盏灯送给你。以后在漆黑的地方，它会帮你找到想找的东西。" }
        ],
        defeatDialogs: [
            { speaker: '提灯猫又', text: "喵呜……灯灭了……黑暗里的大家该怎么办才好……" },
            { speaker: '提灯猫又', text: "你的伞虽然好，但你握得不够紧喵。快走吧，这些怨念要烧过来了。" }
        ],
        gameConfig: {
            duration: 50,
            umbrellaWidth: 70,
            umbrellaDurability: 4,
            rainBaseSpeed: 2.8,
            rainMaxSpeed: 5.2,
            rainInterval: 240,
            rainMinInterval: 100,
            tearInterval: 3500,
            thunderInterval: 6000
        }
    },

    bookSpirit: {
        id: 'bookSpirit',
        name: '纸鱼书灵',
        subtitle: 'しぎょしょれい',
        nameJP: 'しぎょしょれい',
        sceneName: '忘忧书屋',
        dialogue: [
            "沙沙……沙沙……",
            "啊……书里的字，怎么都跑光了……",
            "主人去了好远的地方，把那首长诗忘了。文字们在黑暗里迷失了方向，变成了乱窜的『纸鱼』……",
            "这里的阴影太重了……要是有一盏能驱散迷惘的灯，我就能看清那些逃跑的诗句了。"
        ],
        item: {
            name: '忘却之页',
            desc: '一张泛黄的残页，上面写着半首未完的诗。带在身边时，能听到轻柔的书页翻动声，念诵它能奇迹般地抚平狂躁与不安。',
            icon: '📜'
        },
        story: [
            "【遗落在诗集里的书签】",
            "它原本只是一枚做工精美的书签，夹在一本厚厚的旧诗集中。",
            "主人曾在一盏暖灯下反复吟诵那首关于离别与放下的长诗。直到有一天，书被合上，再也没有被打开。",
            "岁月流转，书签吸收了诗句中的灵气化为书灵。但因为太久没有见到光，字迹开始剥落成游动的纸鱼。",
            "它拼命想找回那些拼凑记忆的词语，却发现，有些词语一旦散开，就再也组不成原来的句子了。",
            "『你看，这句诗终于完整了。我把它撕下来送给你，这是一种力量……一种能够随时选择忘记的力量。』"
        ],
        taunt: "字都认不全……你也是个不读书的粗心家伙呢，和主人一样。",
        difficultyBase: 1.3,
        victoryDialogs: [
            { speaker: '纸鱼书灵', text: "看哪……在提灯的光下，这些字都在微微发光呢。" },
            { speaker: '纸鱼书灵', text: "虽然诗集残破了，但至少我们找回了最美丽的那几句。" },
            { speaker: '纸鱼书灵', text: "这一页《忘却之诗》送给你，以后当你心绪不宁时，读读它吧。" }
        ],
        defeatDialogs: [
            { speaker: '纸鱼书灵', text: "书页……变成了枯萎的叶子，字迹再也找不回来了。" },
            { speaker: '纸鱼书灵', text: "也许这就是遗忘的代价吧。你也只是这万千过客中，最匆忙的一个。" }
        ],
        gameConfig: {
            duration: 55,
            umbrellaWidth: 60,
            umbrellaDurability: 3,
            rainBaseSpeed: 3.2,
            rainMaxSpeed: 6.0,
            rainInterval: 200,
            rainMinInterval: 80,
            tearInterval: 3000,
            thunderInterval: 5000
        }
    },

    trainDog: {
        id: 'trainDog',
        name: '踏切犬',
        subtitle: 'ふみきりいぬ',
        nameJP: 'ふみきりいぬ',
        sceneName: '午夜铁道',
        dialogue: [
            "汪！汪呜——（急促的狂吠）",
            "（巨大的火车轰鸣声在空无一人的道口回荡）",
            "叮！叮！叮！（红色信号灯闪烁，它焦躁地徘徊在铁轨旁）",
            "太吵了……好痛的记忆停不下来……好想忘记这让人发疯的声音……！"
        ],
        item: {
            name: '断裂的项圈',
            desc: '一条陈旧的皮质项圈，锁扣已经被强行扯断。它象征着挣脱与自由，羁绊虽然留存，但执念已经消散。',
            icon: '🐕'
        },
        story: [
            "【等待在红灯口的忠犬】",
            "这里是一处早已废弃多年的铁道岔口。",
            "十年前，一只猎犬挣脱了主人的牵引绳，冲上铁轨想要捡回滚落的皮球。那是它听到的最后一声刺耳的长鸣。",
            "它并不知道自己已经死去，它的灵魂依然被困在这个道口，每一次闪烁的红灯 and 幻听的轰鸣，都在重演那可怕的终结。",
            "它对着并不存在的火车狂吠，拒绝离开，满心焦躁与恐惧。直到那一首温柔的《忘却之诗》响起，安抚了它绷紧的神经。",
            "『呜……（它低下头，蹭了蹭你的手背。断裂的项圈滑落，它的身影化作漫天萤火，随风散去。）』"
        ],
        taunt: "汪呜！你连这节奏都跟不上，会被轰鸣声碾碎的！",
        difficultyBase: 1.6,
        victoryDialogs: [
            { speaker: '踏切犬', text: "（它的吠叫声平息了，原本竖起的毛发也塌了下来。）" },
            { speaker: '踏切犬', text: "（它望向铁轨的尽头。虽然那里依然漆黑一片，但火车再也不会开过来了。）" },
            { speaker: '踏切犬', text: "（项圈断开了。它终于明白，那个球……它不需要再去捡了。）" }
        ],
        defeatDialogs: [
            { speaker: '踏切犬', text: "汪！！（它发疯似地冲向并不存在的车轮，虚影再次破碎成哀号。）" },
            { speaker: '踏切犬', text: "（你念诵诗歌的声音太小了，根本盖不住那令人心碎的雷鸣。）" }
        ],
        gameConfig: {
            duration: 60,
            umbrellaWidth: 50,
            umbrellaDurability: 2,
            rainBaseSpeed: 3.5,
            rainMaxSpeed: 6.5,
            rainInterval: 180,
            rainMinInterval: 60,
            tearInterval: 2500,
            thunderInterval: 4000
        }
    }
};

window.YokaiData = YokaiData;
